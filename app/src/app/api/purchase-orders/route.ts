import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { guardPermission } from "@/lib/api-guard";

export async function GET(request: NextRequest) {
  const guard = await guardPermission("purchase-orders", "view");
  if (guard.response) return guard.response;

  const { searchParams } = new URL(request.url);
  const supplierId = searchParams.get("supplierId") ?? undefined;

  const orders = await prisma.purchaseOrder.findMany({
    where: { supplierId },
    orderBy: { createdAt: "desc" },
    include: { supplier: { select: { id: true, name: true } }, contract: { select: { id: true, name: true } } },
  });

  return NextResponse.json(orders);
}

export async function POST(request: NextRequest) {
  const guard = await guardPermission("purchase-orders", "edit");
  if (guard.response) return guard.response;
  const { user } = guard;

  const body = await request.json();
  if (!body?.supplierId || !body?.type || !body?.amount) {
    return NextResponse.json({ error: "supplierId, type, and amount are required" }, { status: 400 });
  }

  const supplier = await prisma.supplier.findUnique({ where: { id: body.supplierId } });
  if (!supplier) return NextResponse.json({ error: "Unknown supplierId" }, { status: 400 });

  if (body.contractId) {
    const contract = await prisma.contract.findUnique({ where: { id: body.contractId } });
    if (!contract || contract.supplierId !== supplier.id) {
      return NextResponse.json({ error: "contractId must belong to the same supplier" }, { status: 400 });
    }
  }

  if (body.originIntakeRequestId) {
    const intakeRequest = await prisma.intakeRequest.findUnique({ where: { id: body.originIntakeRequestId } });
    if (!intakeRequest) return NextResponse.json({ error: "Unknown originIntakeRequestId" }, { status: 400 });
  }

  const order = await prisma.purchaseOrder.create({
    data: {
      supplierId: supplier.id,
      contractId: body.contractId ?? null,
      originIntakeRequestId: body.originIntakeRequestId ?? null,
      type: body.type,
      amount: body.amount,
    },
  });

  await prisma.auditLogEntry.create({
    data: {
      recordType: "purchase_order",
      recordId: order.id,
      actorId: user.id,
      action: `Created PO for supplier "${supplier.name}"`,
    },
  });

  return NextResponse.json(order, { status: 201 });
}
