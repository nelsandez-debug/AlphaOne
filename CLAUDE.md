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
  - ✅ Known follow-up resolved (differently than planned): `src/proxy.ts`
    (Clerk's `createRouteMatcher`/`clerkMiddleware`) is removed outright rather
    than migrated to resource-based checks. Cause: deploying to Cloudflare
    Workers via OpenNext (see Hosting below) requires Edge-runtime middleware,
    but Next.js 16 hard-codes `proxy.ts` to the Node.js runtime and throws if
    you try to set `runtime` in it — so Node-runtime middleware and
    Workers-via-OpenNext are currently incompatible outright, not just a
    deprecation to migrate away from. Since every page/route already
    re-checks auth+permission itself (`requirePageAccess`/`requirePermission`
    — principle 2), removing the file changes nothing about what's actually
    enforced; the only behavioral difference is an unauthenticated page visit
    now redirects from inside the page's own `requirePageAccess()` call
    instead of one layer earlier.
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
  - ✅ Known follow-up resolved: the flat `NavBar` (20 links) is replaced by a real
    sidebar app shell (`src/components/AppShell.tsx` + `Sidebar.tsx` + `TopBar.tsx`),
    styled from the user's Claude Design mockup ("P2P V1 UI concept") — a dark
    `#0B1220` sidebar grouped into Overview/Source to pay/Insights/Admin sections,
    active-route highlighting, and each item gated by the same `canView` permission
    check every page already re-checks server-side (a signed-out visitor — reachable
    only at `/sign-in`/`/sign-up` per `src/proxy.ts` — gets no sidebar at all, not an
    empty one).
  - ✅ Home (`src/app/page.tsx`) is now a real "Control Tower" dashboard, not a grid of
    module tiles: 4 KPI cards and 2 charts (`src/components/dashboard/`), every number
    a live aggregation over `computeAnalyticsSummary`/`computeForecastSummary` — no
    number on this page is a fabricated demo metric (principle 4). Two mockup ideas
    were deliberately not ported as-is because the `dataviz` skill's methodology flags
    them: a "Procurement automation" KPI wasn't kept (nothing in this codebase computes
    that honestly), and "Spend by category" is a sorted single-hue horizontal bar
    instead of the mockup's donut, since a donut/pie is a documented anti-pattern for
    comparing close values — the bar reads more accurately and is still part-to-whole
    at a glance. Chart colors are the `dataviz` skill's validated reference palette
    (categorical slot 1 blue, status colors reserved for the risk-index bar), confirmed
    colorblind-safe via `scripts/validate_palette.js` rather than eyeballed.

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
- **Hosting:** Cloudflare Workers, via `@opennextjs/cloudflare` (`wrangler.jsonc`,
  `open-next.config.ts`; `npm run deploy` builds and deploys). Postgres is Neon,
  reached through a Hyperdrive binding (`HYPERDRIVE` in `wrangler.jsonc`) rather than a
  `DATABASE_URL` env var — `src/lib/prisma.ts` resolves the connection string from
  `DATABASE_URL` when present (local dev/tests) or from `getCloudflareContext().env.HYPERDRIVE`
  when not (deployed), so the same `PrismaPg` adapter/schema works in both places
  without a second code path. `CLERK_SECRET_KEY` is a Wrangler secret, not a repo file.
  ⚠️ Known blocker: the compiled Worker is ~3.76 MiB gzipped, over the Workers **Free**
  plan's 3 MiB cap (Paid raises it to 10 MiB, which comfortably fits — no code changes
  needed there). The one large lever available — Prisma 7's smaller `query_compiler_small`
  WASM variant instead of the default `query_compiler_fast` (~770 KiB gzip savings, ~40%
  of the bundle) — was tried and reverted: it broke real query serialization (an
  `undefined` landed in an `in: [...]` filter, failing all 26 tests), so it's not a safe
  swap. Everything else in the bundle is core Next.js/Prisma/Clerk framework weight with
  no unnecessary chunk left to cut. Neon (schema migrated + seeded) and the Hyperdrive
  config both work end-to-end and were verified independently of this; deploying for real
  needs either the Paid plan or a materially different approach to the query engine.
  ✅ Resolved: also tested cutting the module count in half (7 modules) as an alternative
  lever — real but insufficient savings (3760 → 3523 KiB gzipped, still 451 KiB over),
  since ~8 MiB of the bundle is fixed Next.js/Prisma/Clerk/WASM cost that doesn't shrink
  with module count. That experiment was reverted (full scope restored from the
  `alphatwo` branch/tag, DB re-migrated/reseeded on both local Postgres and Neon) in favor
  of upgrading to the Workers Paid plan, which needs no further code changes.
  ✅ **Durable, checked-in build fixes** — deploying to Workers requires patching both
  `node_modules` and OpenNext's generated build output, for two independent reasons that
  have nothing to do with app code: (1) this Next.js/Prisma version still has real,
  load-bearing top-level `require("path")`/`require("os")`/etc. calls in compiled
  internals that OpenNext's AST patches don't eliminate, which esbuild turns into a
  runtime helper that always throws in Workers (no ambient `require`); and (2) Prisma's
  generated client decodes its query-compiler WASM from a base64 string and calls `new
  WebAssembly.Module(bytes)` at runtime, which Workers disallows (only build-time `.wasm`
  imports are allowed). None of this is a one-off manual hack anymore — a fresh clone +
  `npm install` + `npm run deploy` reproduces the working state with zero manual steps:
  - `patches/*.patch` (via `patch-package`, run from `postinstall`) fixes the `node_modules`
    half: `next+16.2.12.patch` and `@prisma+client+7.9.1.patch` wrap the offending
    `require()` calls in try/catch or lazy closures so they degrade gracefully instead of
    throwing at module-load time; `pg-cloudflare+1.4.0.patch` fixes an unrelated but real
    bug where `pg-cloudflare`'s conditional `exports` field (gated on a `"workerd"`
    condition) resolves to a different file depending on which tool is asking — Next's own
    build-time file tracer uses only default `exports` conditions (no `workerd`), so it
    only copies the empty stub (`dist/empty.js`) into OpenNext's staged bundle, while the
    later Wrangler/esbuild pass resolves with `workerd` and expects the real
    `dist/index.js` — a nondeterministic, sometimes-hard-fails-at-build-time bug, fixed by
    removing the `workerd` gate so every resolver lands on the same file (safe: outside an
    actual Worker, `pg`'s own `isCloudflareRuntime()` check means this code path is never
    executed anyway, only resolved). Note: this fix did **not** resolve the still-open
    Hyperdrive/Neon "proxy request failed" bug below — confirmed by testing before/after —
    so it's a real, separate, worthwhile bundling-determinism fix, not a fix for that bug.
  - `scripts/materialize-prisma-wasm.mjs` (run from `postinstall`) decodes Prisma's
    base64-only WASM payload into a real `.wasm` file on disk, since Prisma ships no such
    file and Wrangler's bundler only compiles real `.wasm` file imports at build time.
  - `scripts/postbuild-cloudflare-patches.mjs` (run between `opennextjs-cloudflare build`
    and `deploy`/`preview` in the `npm run deploy`/`preview` scripts) patches OpenNext's
    build *output* (`.open-next/`), which is regenerated by every build and therefore
    can't be fixed by a `node_modules` patch: it rewrites the compiled WASM-loader call in
    `handler.mjs` to `import` the real `.wasm` file instead of decoding base64 at runtime,
    and inserts real `node:*` static imports plus a global `require()` shim into
    `worker.js` so the try/catch-wrapped `require()` calls from the `node_modules` patches
    above resolve instead of throwing. `postinstall` also runs `prisma generate`, since
    `src/generated/prisma` is gitignored and doesn't exist on a fresh clone.
  - None of this fixes the separate, still-open Hyperdrive→Neon connectivity bug
    documented next — that one is upstream, filed, and unrelated to any of these three
    mechanisms.
  ⚠️ **Known open bug (not caused by this app, not fixable here):** a deployed Worker's
  Hyperdrive-bound `pg`/`@prisma/adapter-pg` connection fails on the first real query with
  `Error: proxy request failed, cannot connect to the specified address`. Isolated (via a
  from-scratch minimal Worker bound to the same Hyperdrive config, using Cloudflare's own
  documented `pg.Client` pattern with no other build tool involved — it connects and
  queries fine) to something specific about how `@opennextjs/cloudflare`'s esbuild pass
  bundles `pg`'s socket-opening code before Wrangler's own bundling pass runs; Hyperdrive
  config, Neon, credentials, DNS, `nodejs_compat_v2`, RLS, and indexing have all been
  ruled out. Filed with Cloudflare support (case #02263865) and
  `opennextjs/opennextjs-cloudflare` (GitHub issue #1322); not resolved by the
  `pg-cloudflare` exports fix above (tested explicitly). The diagnostic Worker
  (`hyperdrive-mintest`) must stay deployed until this is resolved — it's the reproduction
  proving the bug is upstream, not in this app.
- **Testing:** Vitest for unit/integration tests (see `src/**/*.test.ts`); Playwright for
  critical flows (approval chains, permission boundaries, financial calculations,
  cross-module data integrity) once there's UI worth driving end-to-end.

Note on Next.js 16 / `proxy.ts`: the `middleware.ts` convention was renamed to `proxy.ts`,
and there is no `src/proxy.ts` in this app anymore — it was added in Phase 0, then
removed when wiring up Cloudflare deployment (see Hosting above) because Next 16 hard-codes
`proxy.ts` to the Node.js runtime (setting `runtime` in it throws) and OpenNext's Cloudflare
adapter doesn't support Node-runtime middleware. This was a safe removal, not a
regression: proxy/middleware was always documented here as a first line of defense only,
and principle 2 already requires every Server Function and Route Handler to re-check
auth/permission itself independent of it.

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
