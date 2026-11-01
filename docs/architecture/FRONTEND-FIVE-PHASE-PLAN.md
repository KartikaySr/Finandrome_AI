# Finandrome — Five-phase frontend completion plan

Date: 31 October 2026

## Scope and release contract

Complete the five core product modules as a coherent, responsive Angular experience before backend integration. Existing browser workflows remain usable throughout. Synthetic data, local persistence, scripted assistance and illustrative schedules remain clearly labeled. Frontend completion does not imply real authentication, secure storage, document extraction, payment processing or connected Fineract services.

Every feature must define its happy path, empty/error/permission states, keyboard behavior, mobile layout and source of data. Keep the existing charcoal/lime design language. Avoid adding charts or decorative screens that do not help complete the lending journey.

## Phase 1 — Workspace foundation and navigation

- Role-aware navigation and accurate route breadcrumbs.
- A command menu for pages, scoped applications and loans; Ctrl/Cmd+K, arrow navigation, Enter and Escape.
- Focus containment/restoration and route-change focus management.
- Customer-safe activity navigation and consistent selected-page state.
- Mobile navigation, search and overlay checks.
- Shared rules for empty, loading, forbidden, stale and error states, implemented where applicable rather than artificial spinners over local data.

Acceptance: each persona can discover its permitted pages and records; no hidden staff destinations leak through search; keyboard and small-screen interactions pass browser tests. Native dialogs restore focus. Route changes close transient panels.

Delivered: command menu, contextual breadcrumbs, focus handling, scoped navigation and mobile regression coverage.

## Phase 2 — Customer, products and application intake

- Product catalog with clear illustrative eligibility, amount/tenure constraints and selection.
- Customer profile editing with useful validation and local persistence.
- Refined four-step intake with accessible field errors and a complete review summary.
- Save/resume drafts, edit existing drafts without duplicates, unsaved-change handling.
- Customer application detail with stage tracker, next action and referral reason.
- Product/term consistency and boundaries validated in both UI and demo adapter.

Acceptance: a customer completes, saves, resumes, edits and submits a valid application; invalid fields and conflicting terms cannot silently pass. Refresh and navigation behavior are tested.

## Phase 3 — Documents, intelligence and staff review

- Evidence checklist with application linkage and missing-document states.
- Deliberate document preview/storage design: synthetic samples by default; any local-only file retention is explicit and erasable.
- Review queue, contextual notes, referral, decisions and chronological case history.
- Distinct officer/reviewer/manager interactions with required reasons.
- AI job/result/evidence components that support loading, unsupported, failed, empty and completed results.
- Scripted demo answers remain labeled; no claim of OCR on file metadata.

Acceptance: a reviewer can inspect a case, record a reason, refer it, inspect resubmission and hand it to the manager. Evidence links resolve within scope; AI previews cannot masquerade as live extraction.

## Phase 4 — Servicing and portfolio analytics

- Clear application-to-loan linkage and disbursement confirmation UX.
- Account detail, schedule, overdue context and a separately labeled synthetic transaction-history view.
- Loan and analytic filters, scoped exports and useful no-results recovery.
- Five or six headline metrics with definitions and denominators; four existing analytics perspectives retained where useful.
- Consistent delinquency thresholds across overview, charts, AI previews and exports.
- Separate illustrative historical charts from calculated fixture metrics.

Acceptance: the approved case appears as a simulated loan; schedule/history explain their source; every displayed metric can be reconciled to permitted fixture records and its stated formula.

## Phase 5 — Administration, release polish and evidence

- Role/catalog and configuration screens with truthful demo capabilities.
- Notifications, read states and preference handling where supported.
- Final responsive, keyboard, contrast, zoom and reduced-motion review.
- Browser regression coverage for the complete customer → officer → manager → portfolio journey.
- Build, lint, type checks and test suite; document limits and verified evidence.
- Updated screenshots, README and Vercel frontend configuration verification.

Acceptance: no dead controls in the supported demo journey, no unhandled runtime errors in tested routes, passing automated checks and documented manual verification. Backend-dependent functions show an explicit state instead of a false success.

## Delivery status — 1 November 2026

All five phases are implemented for the browser-local frontend simulation described in this plan. This is not completion of the full backend/system roadmap.

1. **Workspace foundation:** role-scoped navigation and command search, keyboard handling, contextual breadcrumbs and responsive shell.
2. **Customer intake:** four-product catalog and constraints, persistent customer profile, draft and referred-case editing, unsaved-change protection and next-step guidance.
3. **Staff review:** evidence checklists, synthetic sample previews, review notes, referral/resubmission and scripted AI success/error/abstention flows.
4. **Servicing and analytics:** linked simulated loans, reconciled schedules and synthetic receipts, exports, metric definitions and consistent PAR thresholds.
5. **Release demonstration:** notification read states, administrator product availability, six-step interview guide and automated regression coverage.

Verification: production build, type check, lint and formatting passed; 92 unit tests and 25 Playwright tests passed, including desktop/mobile captures. See [completion evidence](../evidence/FRONTEND-COMPLETION.md) for the measured boundary and remaining integration work. Automated keyboard and responsive checks do not constitute a formal WCAG audit.
