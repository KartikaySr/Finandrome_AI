// Copyright 2026 Kartikay Srivastava. SPDX-License-Identifier: Apache-2.0
import { DemoStore } from './demo-store';
import { Product } from './models';

describe('Finandrome synthetic workflow', () => {
  let store: DemoStore;
  const applicant = {
    name: 'Synthetic Applicant',
    email: 'synthetic@example.com',
    business: 'Demo studio',
    product: 'Business growth' as Product,
    amount: 300000,
    term: 12,
    income: 90000,
    obligations: 10000,
  };
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    vi.useFakeTimers();
    store = new DemoStore();
  });
  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
    localStorage.clear();
    sessionStorage.clear();
  });

  it('exposes no application, loan or evidence without a demo session', () => {
    expect(store.applications()).toHaveLength(0);
    expect(store.loans()).toHaveLength(0);
    expect(store.documents()).toHaveLength(0);
  });

  it('limits a customer view to owned records and related evidence', () => {
    store.enter('Customer');
    expect(store.applications()).toHaveLength(2);
    expect(store.applications().every((app) => app.owner === 'customer-demo')).toBe(true);
    expect(store.findApplication('FIN-2026-1047')).toBeUndefined();
    expect(store.loans()).toHaveLength(1);
    expect(store.documents().every((doc) => store.findApplication(doc.applicationId))).toBe(true);
  });

  it('limits review personas to North Branch and allows an auditor global read-only access', () => {
    store.enter('Loan officer');
    expect(store.applications().every((app) => app.office === 'North Branch')).toBe(true);
    store.enter('Auditor');
    expect(store.applications()).toHaveLength(16);
    expect(() => store.transition('FIN-2026-1048', 'Approved', 'Unauthorized')).toThrow();
  });

  it('rejects an invalid application before changing state', () => {
    store.enter('Customer');
    const before = store.state().applications.length;
    expect(() => store.createApplication({ ...applicant, amount: Number.NaN }, true)).toThrow();
    expect(() => store.createApplication({ ...applicant, email: 'invalid' }, true)).toThrow();
    expect(store.state().applications).toHaveLength(before);
  });

  it('does not allow an administrator to create or approve a loan by virtue of administration', () => {
    store.enter('Administrator');
    expect(() => store.createApplication(applicant, true)).toThrow();
    expect(() => store.transition('FIN-2026-1048', 'Approved', 'Admin bypass')).toThrow();
  });

  it('requires a reason and review before a manager can approve', () => {
    store.enter('Loan officer');
    const id = store.createApplication(applicant, true);
    store.enter('Branch manager');
    expect(() => store.transition(id, 'Approved', 'Skip review')).toThrow();
    expect(() => store.transition(id, 'Under review', '')).toThrow();
    expect(store.findApplication(id)?.status).toBe('Submitted');
  });

  it('allows the intake-to-disbursement demo and prevents a duplicate loan', () => {
    store.enter('Customer');
    const id = store.createApplication(applicant, true);
    store.enter('Loan officer');
    store.transition(id, 'Under review', 'Review started');
    expect(() => store.transition(id, 'Approved', 'Officer approval')).toThrow();
    store.enter('Branch manager');
    store.transition(id, 'Approved', 'Evidence reviewed');
    store.transition(id, 'Disbursed', 'Sandbox simulation');
    expect(store.findApplication(id)?.status).toBe('Disbursed');
    expect(store.state().loans.filter((loan) => loan.applicationId === id)).toHaveLength(1);
    expect(() => store.transition(id, 'Disbursed', 'Repeat request')).toThrow();
    expect(store.state().loans.filter((loan) => loan.applicationId === id)).toHaveLength(1);
    expect(
      store.events().some((event) => event.entity === id && event.action.includes('disbursed')),
    ).toBe(true);
  });

  it('allows a referred customer to resubmit but not approve', () => {
    store.enter('Customer');
    const id = store.createApplication(applicant, true);
    store.enter('Loan officer');
    store.transition(id, 'Under review', 'Check');
    store.transition(id, 'Referred', 'Clarify details');
    store.enter('Customer');
    expect(() => store.transition(id, 'Approved', 'Bypass')).toThrow();
    store.transition(id, 'Submitted', 'Clarified');
    expect(store.findApplication(id)?.status).toBe('Submitted');
  });

  it('rejects unsupported/empty files and stores only allowed document metadata', () => {
    store.enter('Customer');
    const id = store.createApplication(applicant, true);
    expect(() =>
      store.addDocument(new File(['code'], 'bad.js', { type: 'text/javascript' }), id, 'Income'),
    ).toThrow();
    expect(() =>
      store.addDocument(new File([], 'empty.pdf', { type: 'application/pdf' }), id, 'Income'),
    ).toThrow();
    store.addDocument(
      new File(['synthetic'], 'demo.pdf', { type: 'application/pdf' }),
      id,
      'Income',
    );
    const record = store.documents().find((doc) => doc.applicationId === id);
    expect(record?.localOnly).toBe(true);
    expect(record?.name).toBe('demo.pdf');
    expect(JSON.stringify(store.state())).not.toContain('synthetic"');
  });

  it('does not let a customer simulate verification or inspect another customer document', () => {
    store.enter('Customer');
    expect(() => store.reviewDocument('DOC-0-1', 'Verified')).toThrow();
    expect(() =>
      store.addDocument(
        new File(['x'], 'x.pdf', { type: 'application/pdf' }),
        'FIN-2026-1047',
        'Income',
      ),
    ).toThrow();
  });

  it('persists mutations and restores the active demo persona', () => {
    store.enter('Customer');
    const id = store.createApplication(applicant, false);
    const restored = new DemoStore();
    expect(restored.role()).toBe('Customer');
    expect(restored.findApplication(id)?.status).toBe('Draft');
  });

  it('resets the fixture without changing the selected persona', () => {
    store.enter('Customer');
    store.createApplication(applicant, true);
    store.reset();
    expect(store.role()).toBe('Customer');
    expect(store.state().applications).toHaveLength(16);
    expect(store.applications()).toHaveLength(2);
  });

  it('updates an owned draft without duplicating it and locks submitted versions', () => {
    store.enter('Customer');
    const id = store.createApplication(applicant, false);
    const count = store.state().applications.length;
    store.createApplication({ ...applicant, amount: 450000 }, false, id);
    expect(store.findApplication(id)?.amount).toBe(450000);
    expect(store.state().applications).toHaveLength(count);
    store.createApplication({ ...applicant, amount: 450000 }, true, id);
    expect(() => store.createApplication({ ...applicant, amount: 500000 }, false, id)).toThrow();
    expect(store.findApplication(id)?.amount).toBe(450000);
  });

  it('recovers from invalid stored JSON and invalid demo persona', () => {
    localStorage.setItem('finandrome.demo.v1', '{broken');
    sessionStorage.setItem('finandrome.demo.role', 'owner-of-everything');
    const restored = new DemoStore();
    expect(restored.role()).toBeNull();
    expect(restored.state().applications).toHaveLength(16);
  });

  it('reports unavailable storage without losing the in-memory change', () => {
    store.enter('Customer');
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('quota');
    });
    const id = store.createApplication(applicant, true);
    expect(store.findApplication(id)).toBeDefined();
    expect(store.storageAvailable()).toBe(false);
    vi.restoreAllMocks();
  });
});
