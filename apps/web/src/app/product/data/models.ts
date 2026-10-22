// Copyright 2026 Kartikay Srivastava. SPDX-License-Identifier: Apache-2.0
export type Role =
  'Branch manager' | 'Loan officer' | 'Credit reviewer' | 'Customer' | 'Auditor' | 'Administrator';
export type ApplicationStatus =
  'Draft' | 'Submitted' | 'Under review' | 'Referred' | 'Approved' | 'Rejected' | 'Disbursed';
export type Product = 'Business growth' | 'Personal credit' | 'Education' | 'Equipment finance';
export type Office = 'North Branch' | 'South Branch' | 'Head Office';
export interface Application {
  id: string;
  name: string;
  initials: string;
  email: string;
  business: string;
  product: Product;
  amount: number;
  term: number;
  income: number;
  obligations: number;
  office: Office;
  status: ApplicationStatus;
  score: number;
  created: string;
  updated: string;
  owner: string;
  note: string;
}
export interface Loan {
  id: string;
  applicationId: string;
  name: string;
  product: Product;
  principal: number;
  outstanding: number;
  installment: number;
  term: number;
  paid: number;
  overdue: number;
  office: Office;
  nextDue: string;
}
export interface DocumentRecord {
  id: string;
  applicationId: string;
  name: string;
  type: string;
  size: string;
  status: 'Needs review' | 'Verified' | 'Rejected';
  date: string;
  localOnly?: boolean;
}
export interface AuditEvent {
  id: string;
  action: string;
  entity: string;
  actor: string;
  role: Role;
  date: string;
  detail: string;
}
export interface Preferences {
  displayName: string;
  email: string;
  notifications: boolean;
  compact: boolean;
  reducedMotion: boolean;
}
export interface DemoState {
  version: 1;
  applications: Application[];
  loans: Loan[];
  documents: DocumentRecord[];
  events: AuditEvent[];
  preferences: Preferences;
}
export const ROLES: Role[] = [
  'Branch manager',
  'Loan officer',
  'Credit reviewer',
  'Customer',
  'Auditor',
  'Administrator',
];
export const PRODUCTS: Product[] = [
  'Business growth',
  'Personal credit',
  'Education',
  'Equipment finance',
];
export const STATUSES: ApplicationStatus[] = [
  'Draft',
  'Submitted',
  'Under review',
  'Referred',
  'Approved',
  'Rejected',
  'Disbursed',
];
export const OFFICES: Office[] = ['North Branch', 'South Branch', 'Head Office'];
export const money = (value: number) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value);
export const compactMoney = (value: number) =>
  value >= 10000000
    ? `₹${(value / 10000000).toFixed(2)}Cr`
    : value >= 100000
      ? `₹${(value / 100000).toFixed(2)}L`
      : money(value);
export const initials = (name: string) =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
