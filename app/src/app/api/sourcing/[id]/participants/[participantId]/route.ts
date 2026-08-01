import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { guardPermission } from "@/lib/api-guard";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string; participantId: string }> }) {
  const guard = await guardPermission("sourcing", "edit");
  if (guard.response) return guard.response;
  const { user } = guard;

  const { id: sourcingEventId, participantId } = await params;
  const existing = await prisma.sourcingEventSupplier.findUnique({
    where: { id: participantId },
    include: { supplier: { select: { name: true } } },
  });
  if (!existing || existing.sourcingEventId !== sourcingEventId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = await request.json();
  if (!body?.status) {
    return NextResponse.json({ error: "status is required" }, { status: 400 });
  }

  const participant = await prisma.sourcingEventSupplier.update({
    where: { id: participantId },
    data: { status: body.status },
    include: { supplier: { select: { id: true, name: true } } },
  });

  await prisma.auditLogEntry.create({
    data: {
      recordType: "sourcing_event",
      recordId: sourcingEventId,
      actorId: user.id,
      action: `Marked "${existing.supplier.name}" as ${body.status}`,
    },
  });

  return NextResponse.json(participant);
}
