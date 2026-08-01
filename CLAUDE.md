# Paradigm P2P — Project Guide

## What this is

A commercial procurement / procure-to-pay (P2P) platform, being rebuilt from a validated
Claude.ai prototype (`/reference/p2p-platform.jsx` and `/reference/p2p-deploy/`). The
prototype proved out the UX, the workflows, and the data relationships across all 18
modules (Intake, Suppliers, Vendor Management, Contracts, Services, Sourcing, Projects,
Purchase Orders, Invoices, Value Tracking, Budget, Forecast, Risk, Workflows, Config,
Analytics, Administration).

**Product direction: full platform, not a narrow wedge.** The value proposition is the
collaborative, cross-module experience itself — a supplier record that connects live to
its contracts, services, spend, risk, and value tracking, not a single point solution.
That decision has been made deliberately; don't second-guess it mid-build.

**Treat the reference folder as a spec and a design system, not as code to reuse
directly.** The visual language, component patterns, and data shapes are worth porting.
The data layer, auth, and persistence are not — they were built under artifact-sandbox
constraints that don't apply here and should not survive into the real product.

## Build sequence (dependency-driven, not a market wedge)

Even building toward the full platform, modules must be built in dependency order —
Value Tracking can't be tested without Contracts existing; Vendor Management needs
Suppliers; Intake's disposition workflow needs the records it creates to already exist.
This sequence is about what's technically buildable in what order, not about narrowing
the product or picking a go-to-market cut. Internal milestones can (and should) still be
demoable/testable at the end of each phase, even before the full suite is live.

- **Phase 0 — Foundation (nothing user-facing yet, everything depends on this):**
  auth with server-side role/permission enforcement, the core schema for
  suppliers/contracts/services as real relational tables, and the shared
  infrastructure used by every module: document repository, notes, audit/disposition
  history, the module-link → filtered-list navigation mechanism, inline-editable fields.
  Build these as reusable systems once, exactly like the prototype did — that reuse is
  what makes the full-platform approach tractable at all.
  - ✅ Auth (Clerk) + server-enforced roles/permissions, with a test proving an
    unauthorized request is rejected (`src/app/api/modules/[key]/documents/route.test.ts`).
  - ✅ Shared `documents`/`notes`/`audit_log` tables as real migrations (polymorphic,
    `recordType`/`recordId`).
  - ⬜ Suppliers/Contracts/Services schema — deferred to Phase 1 (that's where they're
    scoped below); Phase 0 only needed the shared systems and permission model.
  - ⬜ Module-link → filtered-list navigation, inline-editable fields — deferred to
    Phase 1, once there's a real record type (Suppliers) to attach them to.
- **Phase 1 — Core entities:** Suppliers, Contracts, Services. Everything else in the
  platform references these three.
  - ✅ Supplier/Contract/Service tables with real foreign keys (`Contract.supplierId`,
    `Service.supplierId`/`contractId`), plus a shared polymorphic `Ownership` table
    (same `recordType`/`recordId` pattern as Document/Note) reused by all three.
  - ✅ Inline-editable fields (`EditableText`/`EditableSelect`, ported from the
    reference) and module-link → filtered-list navigation (`RelationshipCard`,
    `?supplierId=`/`?contractId=` query params on the Contracts/Services list pages)
    — built once in `src/components/`, reused across all three modules.
  - ✅ Document repository, notes, and ownership wired to every Supplier/Contract/
    Service detail page via the shared `/api/modules/[key]/{documents,notes,ownership}`
    routes from Phase 0 — no bespoke per-module implementation.
  - ✅ Tests: a role with VIEW-but-not-EDIT is rejected on `PATCH /api/suppliers/[id]`
    (`src/app/api/suppliers/[id]/route.test.ts`), and `POST /api/contracts` rejects a
    `supplierId` that isn't a real Supplier row (`src/app/api/contracts/route.test.ts`).
  - ⚠️ Known follow-up: Clerk's `createRouteMatcher`/`clerkMiddleware` path-based
    protection (`src/proxy.ts`) is deprecated in favor of resource-based checks —
    doesn't block anything since every page/route already re-checks auth+permission
    itself (`requirePageAccess`/`requirePermission`), but worth migrating per
    https://clerk.com/docs/guides/development/upgrading/upgrade-guides/migrate-from-create-route-matcher
    before Phase 1 goes live.
- **Phase 2 — Front door:** Intake + the disposition workflow (creates real records in
  Phase 1 entities via real foreign keys, with a real audit trail).
  - ✅ `IntakeRequest` with a real `requesterId` FK to `User` — the reference prototype
    stored the requester as a plain name string; corrected here per principle 1.
  - ✅ Disposition workflow (`src/lib/disposition.ts` + `POST /api/intake/[id]/disposition`):
    onboarding a supplier, creating a contract, or creating a service from an intake
    request writes a real FK (`AuditLogEntry.createdRecordType`/`createdRecordId`), not
    a label. A request can only be dispositioned once (stage-gated); Sourcing/Projects
    routing options exist but create nothing yet since those tables don't exist until
    Phase 3/4.
  - ✅ Disposition history reuses the Phase 0 `AuditLogEntry` table instead of the
    reference's embedded `dispositions: []` array — same "shared systems stay shared"
    reasoning as Document/Note. Documents/notes on Intake also reuse the shared system
    (the reference didn't do this for Intake; corrected here per principle 6).
  - ✅ Added an "Intake" `Module`/`RolePermission` row set — the reference's demo
    `PERMISSIONS_MATRIX` left Intake completely ungated, which principle 2 doesn't allow.
  - ✅ Tests: a role without edit permission on Intake is rejected (403) on disposition;
    an already-dispositioned request is rejected (409); an unknown action for the
    request's type is rejected (400); onboarding a supplier via disposition creates a
    real `Supplier` row and links it through the audit trail
    (`src/app/api/intake/[id]/disposition/route.test.ts`).
- **Phase 3 — Transacting:** Vendor Management, Sourcing, Purchase Orders, Invoices.
  - ✅ `SourcingEvent` participation is a real `SourcingEventSupplier` join table with a
    per-supplier status (invited/responded/shortlisted/awarded/declined) — the reference
    stored this as a bare `invitedSuppliers: string[]` of names with an unrelated,
    independently-typed `suppliers` count.
  - ✅ `PurchaseOrder`/`Invoice`/`VendorSla`/`BusinessReview` all reference `Supplier` by
    real FK; `Invoice.purchaseOrderId` is a real FK to `PurchaseOrder` (validated to
    belong to the same supplier), replacing the reference's untyped `poId`/`supplier`
    name-string matching everywhere in this phase.
  - ✅ `PurchaseOrder` also gained two FKs the reference never had at all: `contractId`
    (optional) and `originIntakeRequestId` (replacing the reference's dead `req: "REQ-901"`
    string with a real link back to the `IntakeRequest` that produced the PO).
  - ✅ Invoice holds stay exactly where the reference put them — fields on `Invoice`
    (`onHold`/`holdReason`) — since Vendor Management only ever surfaced/aggregated that
    flag, never owned it; no redundant hold-tracking table was added.
  - ✅ Added "Purchase Orders" and "Vendor Management" `Module`/`RolePermission` rows —
    the reference had no permission module for either and piggybacked their UI gating on
    the Suppliers permission instead.
  - ✅ Tests: a role without edit permission on Sourcing is rejected (403); inviting a
    non-existent supplier to a sourcing event is rejected (400) and inviting the same
    supplier twice is rejected (409); an invoice's `purchaseOrderId` must belong to the
    same supplier as the invoice (400) — all real FK/permission checks, not reference
    behavior (the reference had none of these guards).
- **Phase 4 — Value & delivery:** Projects, Value Tracking (both depend on Phase 1–3
  entities existing and being linkable).
  - ✅ `Project` links to Contract/Service/PurchaseOrder/Invoice via a real,
    optional `projectId` FK on each of those four tables — the reference stored
    `package.{contractIds,serviceIds,poIds,invoiceIds}` as string-ID arrays in a
    JSON blob. `Project.supplierId`/`sourcingEventId`/`budgetCategoryId` are real
    FKs too, replacing loose `supplier`/`rfpId`/`budgetCategory` strings.
  - ✅ `ValueTrackingItem` has real FKs for `supplier`/`contract`/`purchaseOrder`
    (cross-validated to the same supplier) and for `submittedBy`/`creditedTo`/
    `financeApprover` (all real `User` FKs, replacing name strings). The
    submit → finance-approval workflow (`POST /api/value-tracking/[id]/review`)
    is stage-gated the same way Intake disposition is — reviewed once, and only
    by a role with `APPROVE` on Value Tracking.
  - ✅ Added "Projects" and "Value Tracking" `Module`/`RolePermission` rows —
    neither existed in the reference's demo matrix.
- **Phase 5 — Oversight & reporting:** Budget, Forecast, Risk Management, Analytics —
  these aggregate across everything built so far, so they come after, not before.
  - ✅ `BudgetCategory` stores only `allocated`; `committed`/`spent`
    (`src/lib/budget.ts`) are always computed live from real `PurchaseOrder`/
    `Invoice` amounts joined through `Supplier.category` — the reference stored
    both as hand-maintained static numbers that could silently drift from the
    real POs/invoices.
  - ✅ `RiskFlag` is a dedicated risk register with a real `supplierId` FK
    (replacing the reference's `supplier` name string), distinct from the
    `riskLevel`/`riskScore` fields already on Supplier/Contract/Service. The
    "risk index" (`src/lib/risk.ts`) is a transparent weighted-count heuristic,
    explicitly labeled as not a prediction — per principle 4, nothing here
    claims to be AI-driven.
  - ✅ Forecast and Analytics have no dedicated tables — both are 100% computed
    views (`src/lib/forecast.ts`, `src/lib/analytics.ts`) over real Invoice/
    ValueTrackingItem/RiskFlag/BudgetCategory data. The reference's KPIS/
    FORECAST_DATA/AGENTS arrays were fabricated demo numbers and unlabeled fake
    "AI agents" — neither is ported; every number shown is a real aggregation.
  - ✅ Added "Risk Management" and "Analytics" `Module`/`RolePermission` rows
    (Forecast is gated under Analytics, since it's the same read-only reporting
    concern with no data of its own); Budget reuses its existing module.
  - ✅ Tests: a role without `APPROVE` on Value Tracking is rejected (403) on
    review, and re-reviewing an already-reviewed item is rejected (409); a role
    with only `VIEW` on Budget is rejected (403) creating a category, and a
    duplicate category name is rejected (409).
- **Phase 6 — Meta/no-code layer:** Workflows, Configuration Studio, Administration
  (including the Ownership hub and Roles & Permissions management).
  - ✅ Administration → Roles & Permissions (`/administration/permissions`) is a real,
    editable Module × Role matrix over the `RolePermission` table — the actual
    replacement for hand-editing `prisma/seed.ts`, not a mockup. Every
    `requirePermission`/`requirePageAccess` call across the app reads this same table,
    so an edit here takes effect immediately, everywhere, no redeploy.
  - ✅ Administration → Users (`/administration/users`) lets an admin change a user's
    `Role`, which is what actually drives their permissions via the matrix above — a
    user can't change their own role (a 400, not a UI nicety, enforced server-side).
  - ✅ Administration → Ownership hub (`/administration/ownership`) is a real
    cross-module query over the shared, polymorphic `Ownership` table (leaderboard +
    full list), resolving each `recordType` against its own table for a display name —
    not a hardcoded leaderboard. `OwnershipField` usage was extended to
    Sourcing/PurchaseOrders/Invoices/Projects so the hub has more than the 4 record
    types Phase 1/2 originally wired it to (Value Tracking was deliberately skipped —
    its `creditedTo` field already serves that role, so a second "owner" would just be
    confusing).
  - ✅ `WorkflowConfig` (Workflows / Configuration Studio) is a real, persisted, audited
    on/off registry mirroring the reference's `CONFIG_ITEMS` — deliberately **not** a
    no-code visual builder, and toggling a row does not (yet) change behavior elsewhere
    in the app, since no rules engine reads these flags. Building an actual dynamic
    workflow engine is real, separate scope; this stays honest about what it is
    (principle 4's "say what you are" applies to more than just AI claims).
  - ✅ Added no new `Module` rows this phase — Roles & Permissions, Users, Ownership
    hub, and Workflows are all gated under the existing "Admin" module rather than
    proliferating near-identical back-office permission modules.
  - ✅ Tests: a role with only `VIEW` on Admin is rejected (403) editing a permission
    matrix cell; a role with `EDIT` on Admin can change it (200); a user can't change
    their own role (400); an admin can change another user's role (200).
  - ⚠️ Known follow-up: the nav (`src/components/NavBar.tsx`) is now a flat list of
    20 links across every module — the comment there has said a real sidebar/module
    switcher (per the reference's app shell) is due once the module count "settles
    down"; it has now settled (all 18 modules are built), so this is next up as a UI
    polish pass, not a hypothetical one.

Update this section as phases complete or reorder if a dependency assumption turns out
wrong — treat it as a living plan, not a fixed contract.

## Tech stack

_(Decided as of Phase 0. The app lives in `/app` at the repo root; `/reference` is the
prototype spec, not code we ship.)_

- **Frontend:** Next.js 16 (App Router) + TypeScript + Tailwind CSS, in `/app`.
- **Backend:** Next.js Route Handlers, TypeScript throughout. Every mutation re-checks
  permission server-side via `src/lib/require-permission.ts` — see principle 2 below.
- **Database:** Postgres. ORM is Prisma 7, using the `@prisma/adapter-pg` driver adapter
  (Prisma 7 requires an explicit adapter; no more `datasource.url` in the schema file —
  see `prisma.config.ts`). Local dev runs against a plain local Postgres 16 instance.
- **Auth:** Clerk (`@clerk/nextjs`), with roles synced into our own `User` table
  (`src/lib/current-user.ts`) so every FK (documents, notes, audit log) points at a real
  row, not a bare Clerk ID. Permission levels (`NONE`/`VIEW`/`EDIT`/`APPROVE` per
  role × module) live in the `Module`/`RolePermission` tables — the DB-backed equivalent
  of the reference's `PERMISSIONS_MATRIX`, editable later from Administration → Roles &
  Permissions (Phase 6) instead of hardcoded.
- **Hosting:** Cloudflare (Workers/Pages). Not wired yet — Phase 0 only needed a working
  local dev loop. Deploying will need an adapter for Next.js on Workers (e.g. OpenNext)
  and a driver-adapter-compatible Postgres path (e.g. Neon + Cloudflare Hyperdrive), since
  Prisma's default Node engine doesn't run in the Workers runtime as-is. Revisit before
  Phase 1 ships anything meant to go live.
- **Testing:** Vitest for unit/integration tests (see `src/**/*.test.ts`); Playwright for
  critical flows (approval chains, permission boundaries, financial calculations,
  cross-module data integrity) once there's UI worth driving end-to-end.

Note on Next.js 16: the `middleware.ts` convention was renamed to `proxy.ts`
(`src/proxy.ts` here). Per Next's own guidance, proxy/middleware is a first line of
defense only — every Server Function and Route Handler must re-check auth/permission
itself, since a matcher change could otherwise silently stop covering a route. That's
exactly principle 2 below; don't rely on `proxy.ts` alone for enforcement.

## Non-negotiable architecture principles

These come directly from real gaps identified in the prototype. Do not repeat them —
they matter more, not less, at full-platform scale:

1. **Real relations, not string matching.** The prototype linked records by matching
   `supplier: "Vantage Cloud Systems"` as a string across suppliers/contracts/services/etc.
   That's fine for 40 demo records; it silently corrupts data at real scale, and a
   full-platform product has far more cross-module references than a wedge would.
   Every relationship must be a real foreign key (`supplier_id`, `contract_id`, etc.).
2. **Permissions are enforced server-side, full stop.** The prototype's role-gating was
   cosmetic — a client-side `canEdit()` check anyone could bypass via dev tools. Every
   mutation must re-check permission on the server regardless of what the UI shows. This
   matters even more across 18 modules than it would for one, since the permission
   matrix itself is more complex.
3. **No client-only persistence for anything real.** No `localStorage`/`window.storage`
   as the system of record. Real database, real backups, real multi-user concurrency.
4. **AI features must say what they are.** If a feature claims to be "AI-reviewed" or
   "AI-suggested," it needs to actually call a model with real evaluation — not keyword
   pattern-matching dressed up as AI (which is what the prototype's "AI first reviewer"
   was, and it said so honestly in its own copy — keep that honesty bar).
5. **Every audit trail must be tamper-evident.** The disposition audit trail and
   documents/notes repositories were a good pattern in the prototype (append-only,
   attributed, linked). Keep the pattern; back it with a real database that can't be
   edited from the browser console.
6. **Shared systems stay shared.** The whole reason a full-platform build is tractable
   is that document repositories, notes, ownership, filtered navigation, and
   inline-editing were built once and reused across every module in the prototype. If a
   later module reimplements one of these bespoke instead of reusing the Phase 0
   system, that's a regression — flag it.

## Patterns worth keeping from the reference

- **Module-link → filtered list, record → exact record.** Clicking a related module's
  name/icon anywhere navigates to that module pre-filtered to the relevant records;
  clicking an individual record goes straight to it. Built once as a reusable mechanism
  (`navigateWithFilter` / `navigateWithFocus`) and reused everywhere — do the same here.
- **Inline editable fields** (click text/badge → edit in place) for low-friction record
  updates, gated by the same permission check as the rest of the page.
- **Document repository + notes, consistently, on every record type** — one shared
  component, not a bespoke implementation per module.
- **Disposition/audit history as an append-only array with links to what was created**,
  not an overwritten status string.
- **Ownership as a first-class, editable field on every record type**, with roll-ups
  (e.g., a leaderboard, a module-owner view) built on top of real data rather than
  hardcoded.

## Data model reference (from the prototype — adapt, don't copy verbatim)

Core entities and their real relationships (make these actual foreign keys):

- `suppliers` (tier, risk, account_owner, msa) → has many `services`, `contracts`,
  `purchase_orders`, `invoices`, `projects`; invited to many `sourcing_events`
- `services` → belongs to `supplier`, governed by one `contract`, has risk assessment
  (multi-category), compliance docs, SLAs
- `contracts` → belongs to `supplier`, optionally to one `service`; has type (MSA, NDA,
  Addendum, Order Form, License Agreement, etc.), status, risk, owner, document repository
- `projects` → belongs to `supplier` (optional); links to budget, sourcing event,
  contracts, services, POs, invoices via real join relationships, not ID arrays on a JSON blob
- `purchase_orders`, `invoices` → belong to `supplier`; invoices reference a matched PO
- `value_tracking_items` → reference a `contract` and/or `purchase_order`; have a
  submission → finance-approval workflow; credited to a business owner
- `intake_requests` → the front door; disposition creates the above records and should
  retain a real foreign key to what it created, not a label
- Cross-cutting: `documents`, `notes`, `ownership` should be modeled as their own
  polymorphic/shared tables (record_type + record_id) rather than duplicated per module,
  mirroring how the prototype built one component and reused it everywhere.

## Conventions

- **Repo layout:** `/reference` is the prototype (spec/design-system only, never
  imported from). `/app` is the real Next.js application — everything below runs
  from inside `/app` unless noted.
- **Path alias:** `@/*` → `app/src/*`.
- **Shared/server-only code** lives under `src/lib/` and is marked with the
  `"server-only"` import guard when it must never reach a Client Component bundle
  (e.g. `src/lib/current-user.ts`, `src/lib/permissions.ts`, `src/lib/require-permission.ts`).
- **Polymorphic shared tables** (`Document`, `Note`, `AuditLogEntry`) use
  `recordType`/`recordId` string columns per CLAUDE.md's data model reference — this is
  the deliberate exception to "real FK only," since one table serves every module.
  Domain relationships (e.g. `Contract.supplierId`) must still be real foreign keys.

## Commands

Run from `/app`:

- `npm run dev` — start the Next.js dev server (Turbopack).
- `npm run build` / `npm run start` — production build / run.
- `npm run lint` — ESLint.
- `npm run test` — Vitest (unit/integration tests, `src/**/*.test.ts`).
- `npm run db:migrate` — `prisma migrate dev`, applies schema changes to the local DB.
- `npm run db:seed` — `prisma db seed`, seeds `Module`/`RolePermission` rows from the
  reference's `PERMISSIONS_MATRIX` (see `prisma/seed.ts`).
- `npm run db:studio` — `prisma studio`, browse the local DB.

**Local DB setup (one-time):** Postgres 16 running locally, database `alphaone`, role
`alphaone`/`alphaone_dev` (see `.env.example`). Copy `.env.example` to `.env` and fill in
real Clerk keys from https://dashboard.clerk.com before running auth locally.
