import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { guardPermission } from "@/lib/api-guard";

const EDITABLE_FIELDS = [
  "status",
  "onHold",
  "holdReason",
  "matchConfidence",
  "overageAmount",
  "overageApproved",
  "overageNote",
  "paymentTerms",
  "department",
  "category",
] as const;

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const guard = await guardPermission("invoices", "view");
  if (guard.response) return guard.response;

  const { id } = await params;
  const invoice = await prisma.invoice.findUnique({
    where: { id },
    include: { supplier: { select: { id: true, name: true } }, purchaseOrder: { select: { id: true, amount: true, status: true } } },
  });
  if (!invoice) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json(invoice);
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const guard = await guardPermission("invoices", "edit");
  if (guard.response) return guard.response;
  const { user } = guard;

  const { id } = await params;
  const existing = await prisma.invoice.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await request.json();
  const data: Record<string, unknown> = {};
  for (const field of EDITABLE_FIELDS) {
    if (field in body) data[field] = body[field];
  }
  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "No editable fields provided" }, { status: 400 });
  }

  const invoice = await prisma.invoice.update({ where: { id }, data });

  await prisma.auditLogEntry.create({
    data: {
      recordType: "invoice",
      recordId: invoice.id,
      actorId: user.id,
      action: `Updated ${Object.keys(data).join(", ")}`,
      metadata: data as never,
    },
  });

  return NextResponse.json(invoice);
}
