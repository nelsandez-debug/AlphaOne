import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { guardPermission } from "@/lib/api-guard";

export async function GET(request: NextRequest) {
  const guard = await guardPermission("services", "view");
  if (guard.response) return guard.response;

  const { searchParams } = new URL(request.url);
  const supplierId = searchParams.get("supplierId") ?? undefined;
  const contractId = searchParams.get("contractId") ?? undefined;

  const services = await prisma.service.findMany({
    where: { supplierId, contractId },
    orderBy: { createdAt: "desc" },
    include: { supplier: { select: { id: true, name: true } }, contract: { select: { id: true, name: true } } },
  });

  return NextResponse.json(services);
}

export async function POST(request: NextRequest) {
  const guard = await guardPermission("services", "edit");
  if (guard.response) return guard.response;
  const { user } = guard;

  const body = await request.json();
  if (!body?.supplierId || !body?.name || !body?.category || !body?.criticality) {
    return NextResponse.json({ error: "supplierId, name, category, and criticality are required" }, { status: 400 });
  }

  const supplier = await prisma.supplier.findUnique({ where: { id: body.supplierId } });
  if (!supplier) {
    return NextResponse.json({ error: "Unknown supplierId" }, { status: 400 });
  }

  if (body.contractId) {
    const contract = await prisma.contract.findUnique({ where: { id: body.contractId } });
    if (!contract || contract.supplierId !== supplier.id) {
      return NextResponse.json({ error: "contractId must belong to the same supplier" }, { status: 400 });
    }
  }

  const service = await prisma.service.create({
    data: {
      supplierId: supplier.id,
      contractId: body.contractId ?? null,
      name: body.name,
      category: body.category,
      criticality: body.criticality,
    },
  });

  await prisma.auditLogEntry.create({
    data: {
      recordType: "service",
      recordId: service.id,
      actorId: user.id,
      action: `Created service "${service.name}" for supplier "${supplier.name}"`,
      createdRecordType: "service",
      createdRecordId: service.id,
    },
  });

  return NextResponse.json(service, { status: 201 });
}
