// Copyright 2026 Kartikay Srivastava. SPDX-License-Identifier: Apache-2.0
import { Component, ElementRef, computed, inject, signal, viewChild } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DemoStore } from '../data/demo-store';
import { ApplicationStatus, money } from '../data/models';
import { productRule } from '../data/catalog';
import { IconComponent } from '../ui/icon';
import { tabKey } from '../ui/tab-keyboard';
@Component({
  selector: 'los-application-detail',
  imports: [RouterLink, DatePipe, FormsModule, IconComponent],
  templateUrl: './application-detail.html',
})
export class ApplicationDetailComponent {
  readonly store = inject(DemoStore);
  readonly route = inject(ActivatedRoute);
  readonly money = money;
  readonly params = toSignal(this.route.paramMap, { initialValue: this.route.snapshot.paramMap });
  readonly app = computed(() => this.store.findApplication(this.params().get('id') ?? ''));
  readonly documents = computed(() =>
    this.store.documents().filter((doc) => doc.applicationId === this.app()?.id),
  );
  readonly events = computed(() =>
    this.store.events().filter((event) => event.entity === this.app()?.id),
  );
  readonly noteText = signal('');
  readonly noteError = signal('');
  readonly notes = computed(() =>
    this.events().filter((event) => event.action === 'Reviewer note'),
  );
  readonly checklist = computed(() =>
    (productRule(this.app()?.product ?? '')?.evidence ?? []).map((type) => ({
      type,
      present: this.documents().some((doc) => doc.type === type),
      verified: this.documents().some((doc) => doc.type === type && doc.status === 'Verified'),
    })),
  );
  readonly linkedLoan = computed(() =>
    this.store.loans().find((loan) => loan.applicationId === this.app()?.id),
  );
  readonly nextStep = computed(
    () =>
      ({
        Draft: 'Complete your details and submit for review.',
        Submitted: 'Your application is waiting for a loan officer.',
        'Under review': 'A reviewer is evaluating the declared details and evidence.',
        Referred: 'Read the referral reason, update your application and resubmit.',
        Approved: 'Approved in the demo. A branch manager may simulate disbursement.',
        Rejected: 'Review the recorded decision reason below.',
        Disbursed: 'Your simulated loan account is ready to explore.',
      })[this.app()?.status ?? 'Draft'],
  );
  saveNote(): void {
    try {
      this.store.addNote(this.app()!.id, this.noteText());
      this.noteText.set('');
      this.noteError.set('');
    } catch (e) {
      this.noteError.set((e as Error).message);
    }
  }
  readonly tab = signal('Overview');
  readonly tabs = ['Overview', 'Documents', 'Review notes', 'Decision history'];
  readonly next = signal<ApplicationStatus>('Under review');
  readonly reason = signal('');
  readonly error = signal('');
  readonly dialog = viewChild<ElementRef<HTMLDialogElement>>('decisionDialog');
  readonly actions = computed<ApplicationStatus[]>(() => {
    const app = this.app();
    if (!app) return [];
    if (this.store.isCustomer() && ['Draft', 'Referred'].includes(app.status)) return ['Submitted'];
    if (this.store.canReview() && app.status === 'Submitted') return ['Under review'];
    if (this.store.canReview() && app.status === 'Under review')
      return this.store.canDecide() ? ['Referred', 'Rejected', 'Approved'] : ['Referred'];
    if (this.store.canDecide() && app.status === 'Approved') return ['Disbursed'];
    return [];
  });
  label(status: string): string {
    return (
      (
        {
          'Under review': 'Start review',
          Submitted: this.app()?.status === 'Referred' ? 'Resubmit' : 'Submit application',
          Referred: 'Request information',
          Rejected: 'Reject',
          Approved: 'Approve',
          Disbursed: 'Simulate disbursement',
        } as Record<string, string>
      )[status] ?? status
    );
  }
  open(next: ApplicationStatus): void {
    this.next.set(next);
    this.reason.set('');
    this.error.set('');
    this.dialog()?.nativeElement.showModal();
  }
  confirm(): void {
    try {
      const app = this.app();
      if (!app) return;
      this.store.transition(app.id, this.next(), this.reason());
      this.dialog()?.nativeElement.close();
    } catch (error) {
      this.error.set((error as Error).message);
    }
  }
  onTabKey(event: KeyboardEvent, index: number): void {
    const selected = tabKey(event, this.tabs, index);
    if (selected) this.tab.set(selected);
  }
}
