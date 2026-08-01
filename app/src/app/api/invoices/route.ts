import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { guardPermission } from "@/lib/api-guard";

export async function GET(request: NextRequest) {
  const guard = await guardPermission("invoices", "view");
  if (guard.response) return guard.response;

  const { searchParams } = new URL(request.url);
  const supplierId = searchParams.get("supplierId") ?? undefined;
  const onHold = searchParams.get("onHold");

  const invoices = await prisma.invoice.findMany({
    where: { supplierId, onHold: onHold ? onHold === "true" : undefined },
    orderBy: { createdAt: "desc" },
    include: { supplier: { select: { id: true, name: true } }, purchaseOrder: { select: { id: true, amount: true } } },
  });

  return NextResponse.json(invoices);
}

export async function POST(request: NextRequest) {
  const guard = await guardPermission("invoices", "edit");
  if (guard.response) return guard.response;
  const { user } = guard;

  const body = await request.json();
  if (!body?.supplierId || !body?.amount) {
    return NextResponse.json({ error: "supplierId and amount are required" }, { status: 400 });
  }

  const supplier = await prisma.supplier.findUnique({ where: { id: body.supplierId } });
  if (!supplier) return NextResponse.json({ error: "Unknown supplierId" }, { status: 400 });

  if (body.purchaseOrderId) {
    const po = await prisma.purchaseOrder.findUnique({ where: { id: body.purchaseOrderId } });
    if (!po || po.supplierId !== supplier.id) {
      return NextResponse.json({ error: "purchaseOrderId must belong to the same supplier" }, { status: 400 });
    }
  }

  const invoice = await prisma.invoice.create({
    data: {
      supplierId: supplier.id,
      purchaseOrderId: body.purchaseOrderId ?? null,
      amount: body.amount,
      department: body.department ?? null,
      category: body.category ?? null,
    },
  });

  await prisma.auditLogEntry.create({
    data: {
      recordType: "invoice",
      recordId: invoice.id,
      actorId: user.id,
      action: `Submitted invoice for supplier "${supplier.name}"`,
    },
  });

  return NextResponse.json(invoice, { status: 201 });
}
