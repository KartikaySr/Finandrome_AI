# Upstream provenance

Finandrome integrates and extends the following owner-supplied source archives. No Git history was present inside those archives; archive comments identify the supplied snapshots. Remote repositories may have changed since these snapshots.

## Loan origination

- Upstream project identity: [Apache Fineract Loan Origination](https://github.com/apache/fineract-loan-origination).
- Archive: `fineract-loan-origination-main.zip`.
- Archive comment: `8b45445d729087ac4c7202653eefddadd957f600`.
- Backend and original documentation imported into `services/lending-api/`.
- Frontend imported into `apps/web/`; inherited modules remain, while the active Finandrome experience lives in `src/app/product/`.
- Inherited `.github` organization workflows, `.asf.yaml` and upstream agent instructions were not installed as Finandrome operational policies.
- Original license headers and the upstream license file are retained. New product code uses an explicit Finandrome owner copyright and Apache-2.0 SPDX identifier.

## Business intelligence

- Upstream project identity: [Apache Fineract Business Intelligence](https://github.com/apache/fineract-business-intelligence).
- Archive: `fineract-business-intelligence-main.zip`.
- Archive comment: `765aacc14ebfd566e361ec764c542f4207c412df`.
- Pipeline, warehouse, dbt models, dashboard definitions and source documentation imported into `analytics/`.
- Inherited `.github` organization workflows and `.asf.yaml` were not installed as Finandrome operational policies.
- Original license headers and upstream license file are retained.

## Initial Finandrome changes

- A new product-branded, frontend-first Angular route tree and shared visual system.
- Typed synthetic data/store, persona scope, simulated workflow and browser persistence.
- New landing, intake, review, portfolio, analytics, document, AI-preview, activity and preferences screens.
- Explicit separation of scripted AI previews from planned live-model functionality.
- New frontend tests, production preview utility, Vercel configuration and frontend CI.
- A detailed README and full architecture/feature/11-phase blueprint.
- Backend and BI imports remain staged foundations, not integrated runtime services in this milestone.

Retain this file when moving source. Update it when replacing or materially modifying an inherited component. Do not remove original attribution simply because the product is rebranded.
