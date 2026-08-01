import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { guardPermission } from "@/lib/api-guard";

const EDITABLE_FIELDS = ["title", "type", "stage", "estimatedSavings"] as const;

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const guard = await guardPermission("sourcing", "view");
  if (guard.response) return guard.response;

  const { id } = await params;
  const event = await prisma.sourcingEvent.findUnique({
    where: { id },
    include: { participants: { include: { supplier: { select: { id: true, name: true } } }, orderBy: { createdAt: "asc" } } },
  });
  if (!event) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json(event);
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const guard = await guardPermission("sourcing", "edit");
  if (guard.response) return guard.response;
  const { user } = guard;

  const { id } = await params;
  const existing = await prisma.sourcingEvent.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await request.json();
  const data: Record<string, unknown> = {};
  for (const field of EDITABLE_FIELDS) {
    if (field in body) data[field] = body[field];
  }
  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "No editable fields provided" }, { status: 400 });
  }

  const event = await prisma.sourcingEvent.update({ where: { id }, data });

  await prisma.auditLogEntry.create({
    data: {
      recordType: "sourcing_event",
      recordId: event.id,
      actorId: user.id,
      action: `Updated ${Object.keys(data).join(", ")}`,
      metadata: data as never,
    },
  });

  return NextResponse.json(event);
}
