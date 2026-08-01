import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { guardPermission } from "@/lib/api-guard";

const EDITABLE_FIELDS = ["title", "note"] as const;

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const guard = await guardPermission("value-tracking", "view");
  if (guard.response) return guard.response;

  const { id } = await params;
  const item = await prisma.valueTrackingItem.findUnique({
    where: { id },
    include: {
      supplier: { select: { id: true, name: true } },
      contract: { select: { id: true, name: true } },
      purchaseOrder: { select: { id: true, amount: true } },
      submittedBy: { select: { id: true, name: true } },
      creditedTo: { select: { id: true, name: true } },
      financeApprover: { select: { id: true, name: true } },
    },
  });
  if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json(item);
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const guard = await guardPermission("value-tracking", "edit");
  if (guard.response) return guard.response;
  const { user } = guard;

  const { id } = await params;
  const existing = await prisma.valueTrackingItem.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (existing.status !== "PENDING_FINANCE_APPROVAL") {
    return NextResponse.json({ error: "Only pending items can be edited" }, { status: 409 });
  }

  const body = await request.json();
  const data: Record<string, unknown> = {};
  for (const field of EDITABLE_FIELDS) {
    if (field in body) data[field] = body[field];
  }
  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "No editable fields provided" }, { status: 400 });
  }

  const item = await prisma.valueTrackingItem.update({ where: { id }, data });

  await prisma.auditLogEntry.create({
    data: {
      recordType: "value_tracking_item",
      recordId: item.id,
      actorId: user.id,
      action: `Updated ${Object.keys(data).join(", ")}`,
      metadata: data as never,
    },
  });

  return NextResponse.json(item);
}
