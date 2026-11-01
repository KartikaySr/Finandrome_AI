// Copyright 2026 Kartikay Srivastava. SPDX-License-Identifier: Apache-2.0
import { installmentParts, remainingPrincipal, scheduleFor } from './servicing';
import { seedState } from './seed';
import { validateTerms } from './catalog';
describe('Synthetic financial consistency', () => {
  it('allocates every paise exactly, including a final rounding remainder', () => {
    const p = 10001.01,
      term = 17;
    const rows = Array.from({ length: term }, (_, i) => installmentParts(p, term, i));
    expect(Math.round(rows.reduce((s, r) => s + r.principal, 0) * 100)).toBe(Math.round(p * 100));
    expect(Math.round(rows.reduce((s, r) => s + r.charge, 0) * 100)).toBe(
      Math.round(p * 100 * 0.12),
    );
    expect(remainingPrincipal(p, term, term)).toBe(0);
  });
  it('reconciles seeded receipts and balances for every account', () => {
    for (const loan of seedState().loans) {
      const paid = scheduleFor(loan).filter((r) => r.number <= loan.paid);
      expect(Math.round((paid.reduce((s, r) => s + r.principal, 0) + loan.outstanding) * 100)).toBe(
        Math.round(loan.principal * 100),
      );
      expect(scheduleFor(loan)[loan.paid].due.toISOString().slice(0, 10)).toBe(loan.nextDue);
    }
  });
  it('matches the interview example exactly', () => {
    expect(installmentParts(300000, 12, 0).total).toBe(28000);
    expect(remainingPrincipal(300000, 12, 0)).toBe(300000);
  });
  it('rejects fractional tenures, unknown products and out-of-product amounts', () => {
    expect(validateTerms('Personal credit', 1500000, 24)).toBeTruthy();
    expect(validateTerms('Education', 300000, 6)).toBeTruthy();
    expect(validateTerms('Business growth', 300000, 12.5)).toBeTruthy();
    expect(validateTerms('Unknown', 300000, 12)).toBeTruthy();
    expect(validateTerms('Business growth', 300000, 12)).toBeNull();
  });
  it('keeps every seeded application inside its product terms', () => {
    for (const app of seedState().applications)
      expect(validateTerms(app.product, app.amount, app.term)).toBeNull();
  });
});
