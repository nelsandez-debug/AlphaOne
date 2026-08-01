import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { guardPermission } from "@/lib/api-guard";

// Real many-to-many participation, replacing the reference's `invitedSuppliers:
// string[]` of names — each row here is a real FK to a Supplier with its own status.
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const guard = await guardPermission("sourcing", "edit");
  if (guard.response) return guard.response;
  const { user } = guard;

  const { id: sourcingEventId } = await params;
  const event = await prisma.sourcingEvent.findUnique({ where: { id: sourcingEventId } });
  if (!event) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await request.json();
  if (!body?.supplierId) {
    return NextResponse.json({ error: "supplierId is required" }, { status: 400 });
  }

  const supplier = await prisma.supplier.findUnique({ where: { id: body.supplierId } });
  if (!supplier) return NextResponse.json({ error: "Unknown supplierId" }, { status: 400 });

  const existing = await prisma.sourcingEventSupplier.findUnique({
    where: { sourcingEventId_supplierId: { sourcingEventId, supplierId: supplier.id } },
  });
  if (existing) return NextResponse.json({ error: "Supplier is already invited to this event" }, { status: 409 });

  const participant = await prisma.sourcingEventSupplier.create({
    data: { sourcingEventId, supplierId: supplier.id },
    include: { supplier: { select: { id: true, name: true } } },
  });

  await prisma.auditLogEntry.create({
    data: {
      recordType: "sourcing_event",
      recordId: sourcingEventId,
      actorId: user.id,
      action: `Invited supplier "${supplier.name}"`,
      createdRecordType: "supplier",
      createdRecordId: supplier.id,
    },
  });

  return NextResponse.json(participant, { status: 201 });
}
