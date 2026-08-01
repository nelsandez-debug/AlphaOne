import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { guardPermission } from "@/lib/api-guard";

export async function GET() {
  const guard = await guardPermission("suppliers", "view");
  if (guard.response) return guard.response;

  const suppliers = await prisma.supplier.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { contracts: true, services: true } } },
  });

  return NextResponse.json(suppliers);
}

export async function POST(request: NextRequest) {
  const guard = await guardPermission("suppliers", "edit");
  if (guard.response) return guard.response;
  const { user } = guard;

  const body = await request.json();
  if (!body?.name || !body?.category || !body?.tier || !body?.status) {
    return NextResponse.json({ error: "name, category, tier, and status are required" }, { status: 400 });
  }

  const supplier = await prisma.supplier.create({
    data: {
      name: body.name,
      category: body.category,
      tier: body.tier,
      status: body.status,
    },
  });

  await prisma.auditLogEntry.create({
    data: {
      recordType: "supplier",
      recordId: supplier.id,
      actorId: user.id,
      action: `Created supplier "${supplier.name}"`,
      createdRecordType: "supplier",
      createdRecordId: supplier.id,
    },
  });

  return NextResponse.json(supplier, { status: 201 });
}
