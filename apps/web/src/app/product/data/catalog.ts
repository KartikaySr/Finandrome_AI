// Copyright 2026 Kartikay Srivastava. SPDX-License-Identifier: Apache-2.0
import { Product } from './models';
export const CATALOG: {
  name: Product;
  description: string;
  min: number;
  max: number;
  minTerm: number;
  maxTerm: number;
  evidence: string[];
  eligibility: string;
}[] = [
  {
    name: 'Business growth',
    description: 'Room for the next chapter of your business.',
    min: 10000,
    max: 5000000,
    minTerm: 6,
    maxTerm: 60,
    evidence: ['Income statement', 'Bank statement'],
    eligibility:
      'Illustrative: established business with declared income and a stated expansion purpose.',
  },
  {
    name: 'Personal credit',
    description: 'A considered plan for personal milestones.',
    min: 10000,
    max: 1000000,
    minTerm: 6,
    maxTerm: 48,
    evidence: ['Income statement', 'Bank statement'],
    eligibility:
      'Illustrative: applicant with regular declared income and existing obligations disclosed.',
  },
  {
    name: 'Education',
    description: 'Invest in a new perspective.',
    min: 10000,
    max: 3000000,
    minTerm: 12,
    maxTerm: 60,
    evidence: ['Income statement', 'Admission letter'],
    eligibility: 'Illustrative: a named course, institution and documented education purpose.',
  },
  {
    name: 'Equipment finance',
    description: 'Tools that move your work forward.',
    min: 50000,
    max: 5000000,
    minTerm: 6,
    maxTerm: 60,
    evidence: ['Bank statement', 'Equipment quotation'],
    eligibility: 'Illustrative: equipment purpose with a supporting supplier quotation.',
  },
];
export function productRule(name: string) {
  return CATALOG.find((item) => item.name === name);
}
export function validateTerms(product: string, amount: number, term: number): string | null {
  const rule = productRule(product);
  if (!rule) return 'Choose a listed loan product.';
  if (!Number.isFinite(amount) || amount < rule.min || amount > rule.max)
    return `Requested amount must be between ₹${rule.min.toLocaleString('en-IN')} and ₹${rule.max.toLocaleString('en-IN')} for ${product}.`;
  if (!Number.isInteger(term) || term < rule.minTerm || term > rule.maxTerm)
    return `Term must be a whole number between ${rule.minTerm} and ${rule.maxTerm} months for ${product}.`;
  return null;
}
