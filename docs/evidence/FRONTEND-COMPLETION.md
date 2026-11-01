# Finandrome frontend completion evidence

Verified: 1 November 2026.

## Release boundary

A functional Angular frontend with synthetic data and browser-local persistence. Six personas share one store with scoped selectors and guarded workflow transitions. The fixture starts with 16 applications and 5 loan accounts. Four product definitions, four analytics perspectives and five scripted AI experiences are available. No backend or model credentials are needed.

## Delivered capabilities

- Keyboard command menu and role-scoped discovery, mobile navigation and contextual breadcrumbs.
- Product catalog, amount/tenure constraints, local availability configuration and customer profile prefilling.
- Four-step intake, validation, removable evidence metadata, draft persistence, unsaved-change confirmation and referred-application editing.
- Application next steps, evidence checklists, reviewer notes, reasons, referral/resubmission, approval/rejection and explicit simulated disbursement.
- Filtered evidence workspace, synthetic sample previews and local review states.
- Scripted intelligence with source context, service-error retry, no-evidence abstention and session feedback.
- Linked loan accounts, schedules, synthetic receipt history, CSV exports and empty-filter recovery.
- Defined portfolio metrics, scoped denominators, strict PAR thresholds and separate illustrative trend charts.
- Notification inbox with per-persona read persistence, preferences, reset and a built-in interview walkthrough.

## Verification results

- Angular type check: passed.
- ESLint: passed.
- Prettier product/routes check: passed.
- Unit tests: **92 passed across 11 files**.
- Production build: passed; initial bundle approximately 376.06 kB raw / 95.82 kB estimated transfer.
- Playwright: **25 passed**, including the optional desktop/mobile capture test.
- Browser coverage includes customer submission through officer review, manager approval and simulated loan creation; scoped access, refresh, drafts, referral/resubmission, document validation, AI error recovery, exports, notifications, catalog administration and 390px mobile layouts.
- Two existing inactive upstream component styles exceed their warning budgets; the production build succeeds. No new dependency or backend changes were required.

Checks ran on an isolated copy of committed baseline `024ec5b` plus the final frontend files because dependency reads in the workspace stalled. Verified source files were copied back to the repository byte-for-byte. Screenshot capture to the workspace timed out once; the complete suite passed with captures written to local temporary storage.

## Financial simulation invariants

The schedule applies a **12% flat charge over the entire term**, not a 12% annual interest rate. Principal and charge are allocated in integer paise, with rounding remainder in the final installment. Outstanding principal equals original principal minus principal in illustrative paid rows. Seeded receipt counts and next-due dates reconcile with each schedule.

PAR30 means outstanding principal on accounts **more than 30 days overdue**, divided by all scoped outstanding principal; PAR60/PAR90 likewise use strict thresholds. Approval rate is approved/disbursed cases divided by approved/disbursed plus rejected cases, excluding pending cases. Seeded delinquency is a fixed demonstration snapshot, not a live clock-driven servicing engine.

## Reproducible interview demonstration

1. Start the frontend and enter any persona. Open **Interview walkthrough**. Reset through Settings before a clean presentation; confirm the reset.
2. Enter as Customer. Use applicant **Interview Studio**, `interview@example.com`, purpose **Studio expansion**, product **Business growth**, amount **300000**, term **12**, monthly income **90000**, obligations **10000**.
3. Save a draft, reopen it and submit. Keep the application reference. Refresh to demonstrate persistence.
4. As Loan officer, open the same case, start review with a reason, add a note and inspect evidence. Optionally refer, switch to Customer, edit and resubmit, then restart review.
5. Demonstrate an application brief and its source context. Select a simulated service error and retry; select no matching evidence to show abstention.
6. As Branch manager, approve with a reason and explicitly confirm simulated disbursement. Open the linked loan.
7. Expected new account: **₹3,00,000 principal**, **₹28,000 × 12 installments**, **₹36,000 total charge**, **₹3,36,000 total scheduled payments**, **zero paid installments**. The initial outstanding principal remains **₹3,00,000**.
8. Show the portfolio update and export. Open a seeded loan to show synthetic payment history. Show notifications and mark them read.

## Limits and next system layer

Persona guards are demo UX, not a security boundary. Data is editable localStorage; activity is capped at 250 events. File selection stores metadata only, and synthetic previews are not uploaded-file contents. AI output is scripted; feedback lasts for the current view. Payment history is synthetic and there is no payment-posting integration. Historical chart series are labeled illustrations.

Real authentication, durable APIs/audit, private file storage, OCR, live models, Fineract servicing, real payments and production operations remain backend integration work. These tests validate simulation arithmetic and interactions, not bank-grade finance, AI accuracy or server authorization. No production deployment or formal accessibility certification is claimed by this evidence.
