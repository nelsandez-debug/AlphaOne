import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { guardPermission } from "@/lib/api-guard";

export async function GET() {
  const guard = await guardPermission("vendor-management", "view");
  if (guard.response) return guard.response;

  const slas = await prisma.vendorSla.findMany({
    orderBy: { createdAt: "desc" },
    include: { supplier: { select: { id: true, name: true } } },
  });

  return NextResponse.json(slas);
}

export async function POST(request: NextRequest) {
  const guard = await guardPermission("vendor-management", "edit");
  if (guard.response) return guard.response;
  const { user } = guard;

  const body = await request.json();
  if (!body?.supplierId || !body?.metric || !body?.target) {
    return NextResponse.json({ error: "supplierId, metric, and target are required" }, { status: 400 });
  }

  const supplier = await prisma.supplier.findUnique({ where: { id: body.supplierId } });
  if (!supplier) return NextResponse.json({ error: "Unknown supplierId" }, { status: 400 });

  const sla = await prisma.vendorSla.create({
    data: { supplierId: supplier.id, metric: body.metric, target: body.target, actual: body.actual ?? null },
  });

  await prisma.auditLogEntry.create({
    data: {
      recordType: "vendor_sla",
      recordId: sla.id,
      actorId: user.id,
      action: `Established SLA "${sla.metric}" for supplier "${supplier.name}"`,
    },
  });

  return NextResponse.json(sla, { status: 201 });
}
