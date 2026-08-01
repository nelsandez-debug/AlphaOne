import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { guardPermission } from "@/lib/api-guard";

export async function GET(request: NextRequest) {
  const guard = await guardPermission("contracts", "view");
  if (guard.response) return guard.response;

  const { searchParams } = new URL(request.url);
  const supplierId = searchParams.get("supplierId") ?? undefined;

  const contracts = await prisma.contract.findMany({
    where: { supplierId },
    orderBy: { createdAt: "desc" },
    include: { supplier: { select: { id: true, name: true } } },
  });

  return NextResponse.json(contracts);
}

export async function POST(request: NextRequest) {
  const guard = await guardPermission("contracts", "edit");
  if (guard.response) return guard.response;
  const { user } = guard;

  const body = await request.json();
  if (!body?.supplierId || !body?.name || !body?.type || !body?.status) {
    return NextResponse.json({ error: "supplierId, name, type, and status are required" }, { status: 400 });
  }

  const supplier = await prisma.supplier.findUnique({ where: { id: body.supplierId } });
  if (!supplier) {
    return NextResponse.json({ error: "Unknown supplierId" }, { status: 400 });
  }

  const contract = await prisma.contract.create({
    data: {
      supplierId: supplier.id,
      name: body.name,
      type: body.type,
      status: body.status,
    },
  });

  await prisma.auditLogEntry.create({
    data: {
      recordType: "contract",
      recordId: contract.id,
      actorId: user.id,
      action: `Created contract "${contract.name}" for supplier "${supplier.name}"`,
      createdRecordType: "contract",
      createdRecordId: contract.id,
    },
  });

  return NextResponse.json(contract, { status: 201 });
}
