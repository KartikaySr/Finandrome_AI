# Finandrome frontend verification

Date: 22 October 2026. Scope: the new synthetic Finandrome Angular frontend, not the Java backend, warehouse, real Fineract, real authentication or a live LLM.

## Environment

- macOS arm64; Node.js 22.23.2.
- Angular framework/compiler 22.2.3; Angular build/CLI 22.2.2.
- Vitest 4.1.12 and Playwright 1.64.1.
- Browser checks use the isolated full Chromium 156.0.8078.4 distribution, not the user's existing browser profile.
- Optimized production SPA served by the local static preview utility on loopback.

## Recorded results

- Production Angular build: passed, including template/type compilation. Initial JS/CSS reported by the final toolchain was approximately 366.43 kB raw / 93.66 kB estimated transfer, with additional lazy-loaded feature chunks. These are build-tool estimates, not network performance or Lighthouse results.
- Unit tests: **83 passed across 10 files**. This includes 68 inherited frontend tests and 15 new Finandrome store/workflow tests.
- Browser suite: **15 passed**, comprising 14 interaction/regression scenarios and one optional visual-capture scenario when its output directory is configured.
- Frontend lint and formatting: checked as part of the local verification workflow. See command list below; final source must retain passing checks in CI.
- Production dependency audit after Angular upgrade: **0 reported vulnerabilities** for `npm audit --omit=dev`. This is a point-in-time package audit, not a complete application security assessment or a scan of the imported backend/analytics dependencies.
- Desktop screenshots: public landing, workspace overview and intelligence interface.
- Mobile screenshot and viewport test: 390 × 844, navigation and applications view.

Two inherited, inactive component styles exceed the upstream 4 kB warning budget (approximately 4.74 kB and 7.73 kB) but remain below its error budget. These are warnings, not failed builds. They are not justification to relax all style budgets.

## Meaningful scenarios covered

1. Landing entry and open-source attribution navigation.
2. Session restoration, direct route refresh and unauthenticated demo-route guard.
3. Customer application intake, persistence, staff review, manager approval and simulated disbursement to a local loan.
4. Application filtering, scoped search and empty-state recovery.
5. Customer record scope and direct-navigation denial for staff-only views.
6. Switching all four analytics perspectives and applying office filters.
7. Running five scripted AI scenarios, inspecting source context and rejecting unsupported free-form prompts.
8. Document metadata addition, unsupported-file rejection and simulated reviewer verification.
9. Persisting preferences and resetting the fixture with confirmation.
10. Administrator persona catalog and downloadable activity CSV.
11. Mobile navigation open/close and document-width overflow prevention.
12. Rendering staff views without browser runtime errors.
13. Visual captures of desktop and mobile layouts.
14. Editing an owned draft without duplicating the application or allowing submitted data to be edited.
15. Keyboard arrow/End navigation across analytics tabs.

Unit tests additionally cover forbidden transitions, role limitations, missing reasons, duplicate-demo-loan prevention, referred resubmission, file metadata validation, corrupt stored JSON and unavailable browser storage.

## Reproduce

From `apps/web`:

```bash
npm ci
npm run typecheck
npm run lint
npm run format:check
npm test -- --watch=false
npm run build
npx playwright install chromium
npm run test:e2e
npm audit --omit=dev
```

The browser suite expects a production build and starts the local preview utility automatically if needed. Set `FINANDROME_CAPTURE_DIR` to an absolute writable directory to enable the optional screenshot scenario; otherwise it is explicitly skipped. The full Chromium channel is selected because the downloaded headless-shell bundle failed to locate its ICU resources on this local toolchain.

Angular's persistent cache was disabled after a reproducible native LMDB memory-management crash on this macOS environment. Type compilation, production optimization and tests remain enabled.

## Limits

- No backend startup or integration suite was performed in this frontend-first milestone.
- No real document extraction, generative AI inference, model evaluation, lending decision or payment occurred.
- No claim of 95% model accuracy/grounding is established by scripted previews.
- No API load benchmark, 10,000-customer scale fixture or production uptime result was measured.
- Client role checks/local history do not establish secure multi-tenancy or tamper-proof audit logging.
- Browser checks used one Chromium engine. Other browsers and complete manual accessibility review remain future verification work.
- No Lighthouse score, blanket WCAG compliance or pixel-perfect cross-browser result is claimed.
- The custom-domain deployment and Vercel account/DNS state are independent of these local results.
