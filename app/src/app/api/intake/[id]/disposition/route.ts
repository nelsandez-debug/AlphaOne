import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { guardPermission } from "@/lib/api-guard";
import { canDisposition, getDispositionAction } from "@/lib/disposition";

// The disposition workflow: creates a real Supplier/Contract/Service (with a real FK,
// never a text label) when the chosen action calls for it, transitions the request's
// stage, and writes an AuditLogEntry recording what happened and what it created —
// reusing the Phase 0 shared audit system instead of an embedded "dispositions" array.
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const guard = await guardPermission("intake", "edit");
  if (guard.response) return guard.response;
  const { user } = guard;

  const { id } = await params;
  const intakeRequest = await prisma.intakeRequest.findUnique({ where: { id } });
  if (!intakeRequest) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (!canDisposition(intakeRequest.stage)) {
    return NextResponse.json({ error: `Request is already in stage ${intakeRequest.stage} and can't be dispositioned again` }, { status: 409 });
  }

  const body = await request.json();
  if (!body?.actionId) {
    return NextResponse.json({ error: "actionId is required" }, { status: 400 });
  }

  const action = getDispositionAction(intakeRequest.type, body.actionId);
  if (!action) {
    return NextResponse.json({ error: `Unknown action "${body.actionId}" for request type ${intakeRequest.type}` }, { status: 400 });
  }

  let createdRecordType: string | null = null;
  let createdRecordId: string | null = null;

  if (action.creates === "supplier") {
    const s = body.supplier;
    if (!s?.name || !s?.category || !s?.tier || !s?.status) {
      return NextResponse.json({ error: "supplier.name, category, tier, and status are required for this action" }, { status: 400 });
    }
    const supplier = await prisma.supplier.create({
      data: { name: s.name, category: s.category, tier: s.tier, status: s.status },
    });
    createdRecordType = "supplier";
    createdRecordId = supplier.id;
  } else if (action.creates === "contract") {
    const c = body.contract;
    if (!body.supplierId || !c?.name || !c?.type || !c?.status) {
      return NextResponse.json({ error: "supplierId, contract.name, type, and status are required for this action" }, { status: 400 });
    }
    const supplier = await prisma.supplier.findUnique({ where: { id: body.supplierId } });
    if (!supplier) return NextResponse.json({ error: "Unknown supplierId" }, { status: 400 });

    const contract = await prisma.contract.create({
      data: { supplierId: supplier.id, name: c.name, type: c.type, status: c.status },
    });
    createdRecordType = "contract";
    createdRecordId = contract.id;
  } else if (action.creates === "service") {
    const svc = body.service;
    if (!body.supplierId || !svc?.name || !svc?.category || !svc?.criticality) {
      return NextResponse.json({ error: "supplierId, service.name, category, and criticality are required for this action" }, { status: 400 });
    }
    const supplier = await prisma.supplier.findUnique({ where: { id: body.supplierId } });
    if (!supplier) return NextResponse.json({ error: "Unknown supplierId" }, { status: 400 });

    if (body.contractId) {
      const contract = await prisma.contract.findUnique({ where: { id: body.contractId } });
      if (!contract || contract.supplierId !== supplier.id) {
        return NextResponse.json({ error: "contractId must belong to the same supplier" }, { status: 400 });
      }
    }

    const service = await prisma.service.create({
      data: {
        supplierId: supplier.id,
        contractId: body.contractId ?? null,
        name: svc.name,
        category: svc.category,
        criticality: svc.criticality,
      },
    });
    createdRecordType = "service";
    createdRecordId = service.id;
  }

  const updated = await prisma.intakeRequest.update({
    where: { id },
    data: { stage: action.stage, dispositionedAt: new Date() },
  });

  await prisma.auditLogEntry.create({
    data: {
      recordType: "intake_request",
      recordId: id,
      actorId: user.id,
      action: body.note ? `${action.label}: ${body.note}` : action.label,
      createdRecordType,
      createdRecordId,
    },
  });

  return NextResponse.json({ intakeRequest: updated, createdRecordType, createdRecordId });
}
