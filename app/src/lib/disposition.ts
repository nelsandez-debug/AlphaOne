import type { IntakeRequestType, IntakeStage } from "@/generated/prisma/enums";

export type DispositionCreates = "supplier" | "contract" | "service" | null;

export type DispositionAction = {
  id: string;
  label: string;
  stage: IntakeStage;
  creates: DispositionCreates;
};

const DECLINE: DispositionAction = { id: "decline", label: "Decline", stage: "CLOSED", creates: null };

// What a disposition can do, per request type. Deliberately narrower than the reference
// prototype's DISPOSITION_ACTIONS: only actions that can create a REAL Phase 1 entity
// (Supplier/Contract/Service) are offered today. Sourcing/Projects routing options are
// listed but create nothing yet — Phase 3/4 will add the real FK once those tables exist.
export const DISPOSITION_ACTIONS: Record<IntakeRequestType, DispositionAction[]> = {
  NEW_VENDOR: [{ id: "onboard_supplier", label: "Onboard supplier", stage: "ROUTED", creates: "supplier" }, DECLINE],
  SERVICE_REQUEST: [{ id: "new_service", label: "Create service", stage: "ROUTED", creates: "service" }, DECLINE],
  CONTRACT_REQUEST: [{ id: "new_contract", label: "Create contract", stage: "ROUTED", creates: "contract" }, DECLINE],
  CONTRACT_CHANGE: [{ id: "new_contract", label: "Create contract", stage: "ROUTED", creates: "contract" }, DECLINE],
  PURCHASE_REQUEST: [{ id: "approve", label: "Approve", stage: "IN_PROGRESS", creates: null }, DECLINE],
  NEW_PROJECT: [{ id: "route", label: "Route to Projects (Phase 4 — not built yet)", stage: "ROUTED", creates: null }, DECLINE],
  SOURCING_EVENT: [{ id: "route", label: "Route to Sourcing (Phase 3 — not built yet)", stage: "ROUTED", creates: null }, DECLINE],
};

export function getDispositionAction(type: IntakeRequestType, actionId: string): DispositionAction | undefined {
  return DISPOSITION_ACTIONS[type].find((a) => a.id === actionId);
}

// A request can only be dispositioned once, mirroring the reference's "locked after
// disposition" behavior — implemented here as a stage gate rather than a separate
// mutable boolean, since the append-only AuditLogEntry trail already records history.
export function canDisposition(stage: IntakeStage): boolean {
  return stage === "NEW" || stage === "TRIAGE";
}
