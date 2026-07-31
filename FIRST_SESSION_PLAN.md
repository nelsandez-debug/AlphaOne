# First Claude Code Session — Kickoff Plan

Sessions work best focused and short. This is the sequence across the first several
sessions, following the Phase 0 → Phase 6 build sequence in `CLAUDE.md`. Full-platform
is the product goal — that doesn't change how any single session should be scoped.

## Before you open Claude Code at all

1. **Confirm the tech stack** (see `CLAUDE.md`'s proposal) so Session 1 scaffolds
   against a real decision instead of a placeholder.
2. **Staff and timeline check-in.** Building all 18 modules to commercial quality is a
   genuinely large effort even with everything reusable. Worth deciding now, honestly,
   whether "several months" means "a strong core across several phases" or whether the
   timeline/team needs revisiting — better to calibrate that now than discover it later.
   This doesn't have to change the plan below; it just shapes how many phases you expect
   to clear in that window.
3. Fill in the "Conventions" section of `CLAUDE.md` if you have preferences already
   (file structure, commit style) — otherwise Claude Code will propose sensible
   defaults in Session 1 and you can correct them.

## Session 1 goal: Phase 0 — foundation, not UI

Do NOT try to port any screens yet, and don't start on Suppliers/Contracts/Services data
yet either. Session 1 is purely the foundation every later phase depends on: auth,
permissions, and the shared systems (documents, notes, audit trail, filtered navigation,
inline editing) that get reused across all 18 modules.

**Suggested opening prompt to Claude Code:**

> Read `/reference/p2p-platform.jsx` (skim, it's large — focus on: the shared components
> `RecordDocumentsNotes`, `RelationshipCard`/`PackageCard` with `onHeaderClick`,
> `usePendingFilter`/`navigateWithFilter`, `EditableText`/`EditableSelect`, and the
> `PERMISSIONS_MATRIX`/`canEdit`/`canApprove`/`canView` permission model) and
> `CLAUDE.md` in this repo. We're building the full platform, not a single module —
> see the Phase 0–6 build sequence in `CLAUDE.md`.
>
> For this session: scaffold the project with [stack from CLAUDE.md], set up
> authentication with server-side role/permission checks modeled on the reference's
> permission matrix (but enforced server-side, not client-side), and set up the shared
> polymorphic `documents`, `notes`, and `audit_log` tables that every future module will
> attach to. Don't build any module-specific UI or schema yet — that starts in Phase 1.
> Ask me before making stack choices I haven't already specified.

**Session 1 success criteria:**
- Repo scaffolded, runs locally
- Auth works, with roles matching the reference's permission matrix, enforced server-side
- At least one API route demonstrably rejects an unauthorized request — write and run a
  test that proves it, don't take Claude Code's word for it
- Shared `documents` / `notes` / `audit_log` tables exist as real migrations, designed to
  attach to any future record type (polymorphic association or equivalent)
- `CLAUDE.md`'s "Commands" section filled in with the real dev/test/migrate commands

## Session 2+: follow the Phase 1–6 sequence in CLAUDE.md

Each session, one focused target within the current phase, e.g.:

- **Phase 1:** "Build the Suppliers schema + API + list/detail UI, using the shared
  documents/notes system from Phase 0. Include the account-owner field and tier."
- **Phase 1:** "Build Contracts, referencing Suppliers by real foreign key. Include the
  document repository (this is where MSAs/NDAs/etc. actually live) and the risk field."
- **Phase 2:** "Build Intake + disposition. When a disposition creates a Contract or
  Supplier, store a real foreign key to it in the audit log, not a text label."
- **Phase 3:** "Build Vendor Management — SLAs, business reviews, invoice holds — as a
  governance layer over the existing Suppliers/Invoices tables."
- **Phase 4:** "Build Value Tracking with the submit → finance-approval workflow,
  referencing real Contract/PO rows."

Each session: start fresh, paste a one-paragraph summary of what's done and what's next,
and keep scope to what fits in a focused sitting. Resist the urge to let one session
sprawl across phases just because the end goal is the full suite — the phases exist so
each session has a clean, testable stopping point.

## Recurring checks, every few sessions

- Re-verify the permission boundary hasn't regressed — new modules are the most common
  place this slips, and there are a lot of new modules coming.
- Check for any place a relationship is being matched by name/string instead of a real
  foreign key, especially if a session leaned heavily on the reference file.
- Check that a new module reused the Phase 0 shared systems (documents/notes/audit/
  filtered-nav/inline-edit) instead of quietly reimplementing its own version — this is
  the specific regression that would erode the "why full-platform is tractable" premise.
- Keep `CLAUDE.md`'s phase list current — mark phases done, adjust the sequence if a
  dependency turns out different than expected once you're actually building it.
