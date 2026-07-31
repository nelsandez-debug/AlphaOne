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
- **Phase 1 — Core entities:** Suppliers, Contracts, Services. Everything else in the
  platform references these three.
- **Phase 2 — Front door:** Intake + the disposition workflow (creates real records in
  Phase 1 entities via real foreign keys, with a real audit trail).
- **Phase 3 — Transacting:** Vendor Management, Sourcing, Purchase Orders, Invoices.
- **Phase 4 — Value & delivery:** Projects, Value Tracking (both depend on Phase 1–3
  entities existing and being linkable).
- **Phase 5 — Oversight & reporting:** Budget, Forecast, Risk Management, Analytics —
  these aggregate across everything built so far, so they come after, not before.
- **Phase 6 — Meta/no-code layer:** Workflows, Configuration Studio, Administration
  (including the Ownership hub and Roles & Permissions management).

Update this section as phases complete or reorder if a dependency assumption turns out
wrong — treat it as a living plan, not a fixed contract.

## Tech stack

_(Proposed — swap freely, but keep this section updated as the source of truth once decided.)_

- **Frontend:** Next.js (App Router) + TypeScript + Tailwind CSS
- **Backend:** Next.js API routes or a separate service (tRPC or REST) — TypeScript throughout
- **Database:** Postgres, with a real schema and real foreign keys (Prisma or Drizzle as the ORM)
- **Auth:** Clerk or Auth.js — **server-enforced roles and permissions, not client-side only**
- **Hosting:** decide early; it shapes auth and schema choices
- **Testing:** Vitest/Jest + Playwright for critical flows (approval chains, permission
  boundaries, financial calculations, cross-module data integrity)

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

_(fill in as decided: file structure, naming, commit style, PR process)_

## Commands

_(fill in once scaffolded: dev server, migrations, test, lint, deploy)_
