// Copyright 2026 Kartikay Srivastava. SPDX-License-Identifier: Apache-2.0
import { Loan } from './models';
// Synthetic flat 12% total charge, not an annual rate or a banking calculation.
// Allocate integer paise and put the rounding remainder into the final installment.
export function installmentParts(principal: number, term: number, index: number) {
  const p = Math.round(principal * 100),
    fee = Math.round(p * 0.12);
  const part = (value: number) =>
    index === term - 1 ? value - Math.floor(value / term) * (term - 1) : Math.floor(value / term);
  return { principal: part(p) / 100, charge: part(fee) / 100, total: (part(p) + part(fee)) / 100 };
}
export function remainingPrincipal(principal: number, term: number, paid: number) {
  const total = Math.round(principal * 100);
  return paid >= term ? 0 : (total - Math.floor(total / term) * paid) / 100;
}
export function scheduleFor(loan: Loan) {
  const next = new Date(loan.nextDue + 'T00:00:00Z');
  return Array.from({ length: loan.term }, (_, i) => {
    const target = new Date(Date.UTC(next.getUTCFullYear(), next.getUTCMonth() + i - loan.paid, 1));
    const day = Math.min(
      next.getUTCDate(),
      new Date(Date.UTC(target.getUTCFullYear(), target.getUTCMonth() + 1, 0)).getUTCDate(),
    );
    target.setUTCDate(day);
    return {
      number: i + 1,
      due: target,
      ...installmentParts(loan.principal, loan.term, i),
      status: i < loan.paid ? 'Illustrative paid' : 'Scheduled',
    };
  });
}
