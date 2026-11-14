// Copyright 2026 Kartikay Srivastava. SPDX-License-Identifier: Apache-2.0
import { Injectable, computed, signal } from '@angular/core';
import {
  Application,
  ApplicationStatus,
  AuditEvent,
  DemoState,
  DocumentRecord,
  Loan,
  Preferences,
  Role,
  initials,
} from './models';
import { installmentParts, remainingPrincipal } from './servicing';
import { validateTerms } from './catalog';
import { seedState } from './seed';

const STATE_KEY = 'finandrome.demo.v1';
const SESSION_KEY = 'finandrome.demo.role';
const ALLOWED_ROLES: Role[] = [
  'Branch manager',
  'Loan officer',
  'Credit reviewer',
  'Customer',
  'Auditor',
  'Administrator',
];

@Injectable({ providedIn: 'root' })
export class DemoStore {
  readonly storageAvailable = signal(true);
  readonly state = signal<DemoState>(this.loadState());
  readonly role = signal<Role | null>(this.loadRole());
  readonly toast = signal('');
  readonly canReview = computed(() =>
    ['Loan officer', 'Credit reviewer', 'Branch manager'].includes(this.role() ?? ''),
  );
  readonly canDecide = computed(() => this.role() === 'Branch manager');
  readonly canAdmin = computed(() => this.role() === 'Administrator');
  readonly isCustomer = computed(() => this.role() === 'Customer');
  readonly canCreate = computed(() => this.isCustomer() || this.role() === 'Loan officer');
  readonly applications = computed(() =>
    this.state().applications.filter((item) => this.visible(item)),
  );
  readonly loans = computed(() =>
    this.state().loans.filter((loan) =>
      this.applications().some((app) => app.id === loan.applicationId),
    ),
  );
  readonly documents = computed(() =>
    this.state().documents.filter((doc) =>
      this.applications().some((app) => app.id === doc.applicationId),
    ),
  );
  readonly events = computed(() =>
    this.state().events.filter(
      (event) =>
        this.applications().some((app) => app.id === event.entity) ||
        (this.canAdmin() && event.entity === 'WORKSPACE'),
    ),
  );
  readonly portfolio = computed(() =>
    this.loans().reduce((sum, loan) => sum + loan.outstanding, 0),
  );
  readonly par30 = computed(() =>
    this.portfolio()
      ? (this.loans()
          .filter((loan) => loan.overdue > 30)
          .reduce((sum, loan) => sum + loan.outstanding, 0) /
          this.portfolio()) *
        100
      : 0,
  );
  readonly reviewQueue = computed(() =>
    this.applications().filter((app) =>
      ['Submitted', 'Under review', 'Referred'].includes(app.status),
    ),
  );
  private toastTimer?: ReturnType<typeof setTimeout>;

  enter(role: Role): void {
    if (!ALLOWED_ROLES.includes(role)) return;
    this.role.set(role);
    try {
      sessionStorage.setItem(SESSION_KEY, role);
    } catch {
      this.storageAvailable.set(false);
    }
  }

  logout(): void {
    this.role.set(null);
    try {
      sessionStorage.removeItem(SESSION_KEY);
    } catch {
      this.storageAvailable.set(false);
    }
  }

  notify(message: string): void {
    this.toast.set(message);
    if (this.toastTimer) clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => this.toast.set(''), 5000);
  }

  findApplication(id: string): Application | undefined {
    return this.applications().find((item) => item.id === id);
  }
  findLoan(id: string): Loan | undefined {
    return this.loans().find((item) => item.id === id);
  }

  createApplication(
    input: Pick<
      Application,
      'name' | 'email' | 'business' | 'product' | 'amount' | 'term' | 'income' | 'obligations'
    >,
    submit: boolean,
    existingId?: string,
  ): string {
    if (!this.canCreate()) throw new Error('This demo role cannot create applications.');
    const existing = existingId ? this.findApplication(existingId) : undefined;
    if (existingId && (!existing || !['Draft', 'Referred'].includes(existing.status)))
      throw new Error('Only an available draft or referred application can be edited.');
    if (!input.name.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email))
      throw new Error('Enter a name and valid email.');
    if (
      ![input.amount, input.term, input.income, input.obligations].every(Number.isFinite) ||
      input.amount < 10000 ||
      input.amount > 5000000 ||
      input.term < 6 ||
      input.term > 60 ||
      !Number.isInteger(input.term) ||
      input.income <= 0 ||
      input.obligations < 0
    )
      throw new Error(
        'Check amount (₹10,000–₹50,00,000), term (6–60 months), income and obligations.',
      );
    const termsError = validateTerms(input.product, input.amount, input.term);
    if (termsError) throw new Error(termsError);
    if (submit && this.state().pausedProducts?.includes(input.product))
      throw new Error(
        'This product is paused for new submissions. Save a draft or select another product.',
      );
    if (!input.business.trim() || input.business.length > 100 || input.name.trim().length > 80)
      throw new Error('Enter a purpose (up to 100 characters) and name (up to 80 characters).');
    const id = existingId ?? `FIN-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
    const timestamp = new Date().toISOString();
    const app: Application = {
      ...input,
      name: input.name.trim(),
      id,
      initials: initials(input.name),
      status: submit ? 'Submitted' : existing?.status === 'Referred' ? 'Referred' : 'Draft',
      score: 0,
      created: existing?.created ?? timestamp,
      updated: timestamp,
      owner: existing?.owner ?? 'customer-demo',
      office: existing?.office ?? 'North Branch',
      note: existing?.note ?? '',
    };
    this.update({
      ...this.state(),
      applications: existing
        ? this.state().applications.map((item) => (item.id === id ? app : item))
        : [app, ...this.state().applications],
    });
    this.record(
      submit ? 'Application submitted' : existing ? 'Draft updated' : 'Draft created',
      id,
      'Created in browser demo; no banking API called.',
    );
    return id;
  }

  transition(id: string, next: ApplicationStatus, reason: string): void {
    const app = this.findApplication(id);
    if (!app) throw new Error('Application unavailable for this role.');
    if (!reason.trim()) throw new Error('Add a decision reason to continue.');
    const permitted =
      (this.role() === 'Customer' &&
        ((app.status === 'Draft' && next === 'Submitted') ||
          (app.status === 'Referred' && next === 'Submitted'))) ||
      (this.canReview() && app.status === 'Submitted' && next === 'Under review') ||
      (this.canReview() && app.status === 'Under review' && next === 'Referred') ||
      (this.canDecide() &&
        app.status === 'Under review' &&
        ['Approved', 'Rejected'].includes(next)) ||
      (this.canDecide() && app.status === 'Approved' && next === 'Disbursed');
    if (!permitted)
      throw new Error(
        'This transition is not available for the current role and application state.',
      );
    if (next === 'Submitted') {
      const invalid = validateTerms(app.product, app.amount, app.term);
      if (invalid) throw new Error(invalid);
      if (this.state().pausedProducts?.includes(app.product))
        throw new Error('This product is paused for submissions.');
    }
    const score =
      next === 'Under review' && !app.score
        ? Math.max(35, Math.min(95, Math.round(90 - (app.obligations / app.income) * 50)))
        : app.score;
    let loans = this.state().loans;
    if (next === 'Disbursed') {
      if (loans.some((loan) => loan.applicationId === id))
        throw new Error('A demo loan already exists for this application.');
      loans = [
        {
          id: `LN-${crypto.randomUUID().slice(0, 8).toUpperCase()}`,
          applicationId: id,
          name: app.name,
          product: app.product,
          principal: app.amount,
          outstanding: app.amount,
          installment: installmentParts(app.amount, app.term, 0).total,
          term: app.term,
          paid: 0,
          overdue: 0,
          office: app.office,
          nextDue: new Date(Date.UTC(new Date().getUTCFullYear(), new Date().getUTCMonth() + 1, 5))
            .toISOString()
            .slice(0, 10),
        },
        ...loans,
      ];
    }
    this.update({
      ...this.state(),
      loans,
      applications: this.state().applications.map((item) =>
        item.id === id
          ? { ...item, status: next, note: reason.trim(), score, updated: new Date().toISOString() }
          : item,
      ),
    });
    this.record(
      `Application ${next.toLowerCase()}`,
      id,
      `${reason.trim()} · Browser simulation only.`,
    );
    this.notify(`Demo updated: ${next.toLowerCase()}. No real financial action occurred.`);
  }

  addDocument(file: File, applicationId: string, type: string): void {
    if (!this.findApplication(applicationId) || !(this.canCreate() || this.canReview()))
      throw new Error('Document action not permitted.');
    if (
      !['application/pdf', 'image/jpeg', 'image/png'].includes(file.type) ||
      file.size > 10 * 1024 * 1024 ||
      file.size === 0
    )
      throw new Error('Choose a nonempty PDF, JPEG or PNG under 10 MB.');
    const doc: DocumentRecord = {
      id: `DOC-${crypto.randomUUID().slice(0, 8)}`,
      applicationId,
      name: file.name,
      type,
      size: `${Math.ceil(file.size / 1024)} KB`,
      status: 'Needs review',
      date: new Date().toISOString(),
      localOnly: true,
    };
    this.update({ ...this.state(), documents: [doc, ...this.state().documents] });
    this.record(
      'Document metadata added',
      applicationId,
      'Only metadata saved locally. File bytes are not uploaded, stored or analyzed.',
    );
    this.notify('Metadata added locally. File contents were not uploaded or analyzed.');
  }

  reviewDocument(id: string, status: DocumentRecord['status']): void {
    if (!this.canReview()) throw new Error('Only review roles may update document review state.');
    const doc = this.documents().find((item) => item.id === id);
    if (!doc) throw new Error('Document not available.');
    this.update({
      ...this.state(),
      documents: this.state().documents.map((item) =>
        item.id === id ? { ...item, status } : item,
      ),
    });
    this.record(
      `Document ${status.toLowerCase()}`,
      doc.applicationId,
      `${doc.name} · Simulated review, not document verification.`,
    );
  }

  readonly unreadEvents = computed(() => {
    const read = this.state().readEvents?.[this.role() ?? 'Customer'] ?? [];
    return this.events().filter((event) => !read.includes(event.id));
  });
  markRead(ids: string[]): void {
    const role = this.role();
    if (!role) return;
    const allowed = new Set(this.events().map((event) => event.id));
    const read = [
      ...new Set([
        ...(this.state().readEvents?.[role] ?? []),
        ...ids.filter((id) => allowed.has(id)),
      ]),
    ].slice(-500);
    this.update({ ...this.state(), readEvents: { ...this.state().readEvents, [role]: read } });
  }
  addNote(id: string, text: string): void {
    if (!this.canReview() || !this.findApplication(id))
      throw new Error('Only scoped reviewers may add a note.');
    if (!text.trim() || text.trim().length > 1000)
      throw new Error('Enter a note of 1–1000 characters.');
    this.record('Reviewer note', id, text.trim());
    this.notify('Reviewer note saved locally.');
  }
  saveCustomerProfile(profile: NonNullable<DemoState['customerProfile']>): void {
    if (!this.isCustomer()) throw new Error('Switch to Customer to edit the applicant profile.');
    if (
      !profile.name.trim() ||
      profile.name.length > 80 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.email) ||
      !/^[0-9+ ()-]{7,20}$/.test(profile.phone) ||
      !profile.city.trim() ||
      !profile.employment.trim()
    )
      throw new Error('Enter a valid name, email, phone, city and employment description.');
    this.update({ ...this.state(), customerProfile: { ...profile } });
    this.notify('Synthetic customer profile saved locally.');
  }
  setProductPaused(product: import('./models').Product, paused: boolean): void {
    if (!this.canAdmin())
      throw new Error('Only Administrator may change demo product availability.');
    const products = new Set(this.state().pausedProducts ?? []);
    if (paused) products.add(product);
    else products.delete(product);
    this.update({ ...this.state(), pausedProducts: [...products] });
    this.record(
      paused ? 'Product paused' : 'Product enabled',
      'WORKSPACE',
      product + ' · Browser configuration only.',
    );
  }
  savePreferences(preferences: Preferences): void {
    if (
      !preferences.displayName.trim() ||
      preferences.displayName.length > 80 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(preferences.email)
    )
      throw new Error('Enter a valid display name and email.');
    this.update({ ...this.state(), preferences });
    this.notify('Preferences saved to this browser.');
  }

  reset(): void {
    this.update(seedState());
    this.notify('Synthetic workspace reset to the original fixture.');
  }

  downloadCsv(filename: string, headers: string[], rows: (string | number)[][]): void {
    const cell = (value: string | number) => {
      let text = String(value);
      if (/^[=+\-@\t\r]/.test(text)) text = `'${text}`;
      return `"${text.replaceAll('"', '""')}"`;
    };
    const csv = [headers, ...rows].map((row) => row.map(cell).join(',')).join('\r\n');
    const url = URL.createObjectURL(new Blob(['\ufeff', csv], { type: 'text/csv;charset=utf-8;' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  private visible(app: Application): boolean {
    if (!this.role()) return false;
    if (this.isCustomer()) return app.owner === 'customer-demo';
    if (['Loan officer', 'Credit reviewer', 'Branch manager'].includes(this.role() ?? ''))
      return app.office === 'North Branch';
    return true;
  }

  private record(action: string, entity: string, detail: string): void {
    const event: AuditEvent = {
      id: `EVT-${crypto.randomUUID().slice(0, 8)}`,
      action,
      entity,
      detail,
      actor: this.state().preferences.displayName,
      role: this.role() ?? 'Customer',
      date: new Date().toISOString(),
    };
    this.update({ ...this.state(), events: [event, ...this.state().events].slice(0, 250) });
  }

  private update(state: DemoState): void {
    this.state.set(state);
    try {
      localStorage.setItem(STATE_KEY, JSON.stringify(state));
    } catch {
      this.storageAvailable.set(false);
    }
  }

  private loadRole(): Role | null {
    try {
      const role = sessionStorage.getItem(SESSION_KEY) as Role;
      return ALLOWED_ROLES.includes(role) ? role : null;
    } catch {
      this.storageAvailable.set(false);
      return null;
    }
  }

  private loadState(): DemoState {
    try {
      const value = JSON.parse(localStorage.getItem(STATE_KEY) ?? 'null');
      if (
        value?.version === 1 &&
        Array.isArray(value.applications) &&
        Array.isArray(value.loans) &&
        Array.isArray(value.documents) &&
        Array.isArray(value.events) &&
        value.preferences
      )
        return {
          ...value,
          loans: value.loans.map((loan: Loan) => ({
            ...loan,
            outstanding: remainingPrincipal(loan.principal, loan.term, loan.paid),
            installment: installmentParts(loan.principal, loan.term, 0).total,
          })),
        } as DemoState;
    } catch {
      this.storageAvailable.set(false);
    }
    return seedState();
  }
}
