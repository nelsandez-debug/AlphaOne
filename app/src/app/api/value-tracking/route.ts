import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { guardPermission } from "@/lib/api-guard";

export async function GET() {
  const guard = await guardPermission("value-tracking", "view");
  if (guard.response) return guard.response;

  const items = await prisma.valueTrackingItem.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      supplier: { select: { id: true, name: true } },
      submittedBy: { select: { name: true } },
      creditedTo: { select: { name: true } },
    },
  });

  return NextResponse.json(items);
}

export async function POST(request: NextRequest) {
  const guard = await guardPermission("value-tracking", "edit");
  if (guard.response) return guard.response;
  const { user } = guard;

  const body = await request.json();
  if (!body?.title || !body?.type || !body?.amount || !body?.supplierId) {
    return NextResponse.json({ error: "title, type, amount, and supplierId are required" }, { status: 400 });
  }

  const supplier = await prisma.supplier.findUnique({ where: { id: body.supplierId } });
  if (!supplier) return NextResponse.json({ error: "Unknown supplierId" }, { status: 400 });

  if (body.contractId) {
    const contract = await prisma.contract.findUnique({ where: { id: body.contractId } });
    if (!contract || contract.supplierId !== supplier.id) {
      return NextResponse.json({ error: "contractId must belong to the same supplier" }, { status: 400 });
    }
  }
  if (body.purchaseOrderId) {
    const po = await prisma.purchaseOrder.findUnique({ where: { id: body.purchaseOrderId } });
    if (!po || po.supplierId !== supplier.id) {
      return NextResponse.json({ error: "purchaseOrderId must belong to the same supplier" }, { status: 400 });
    }
  }

  const item = await prisma.valueTrackingItem.create({
    data: {
      title: body.title,
      type: body.type,
      amount: body.amount,
      supplierId: supplier.id,
      contractId: body.contractId ?? null,
      purchaseOrderId: body.purchaseOrderId ?? null,
      submittedById: user.id,
      creditedToId: body.creditedToId ?? user.id,
      note: body.note ?? null,
    },
  });

  await prisma.auditLogEntry.create({
    data: {
      recordType: "value_tracking_item",
      recordId: item.id,
      actorId: user.id,
      action: `Submitted value item "${item.title}" for finance approval`,
    },
  });

  return NextResponse.json(item, { status: 201 });
}
