import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { guardPermission } from "@/lib/api-guard";

export async function GET() {
  const guard = await guardPermission("projects", "view");
  if (guard.response) return guard.response;

  const projects = await prisma.project.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      supplier: { select: { id: true, name: true } },
      _count: { select: { contracts: true, services: true, purchaseOrders: true, invoices: true } },
    },
  });

  return NextResponse.json(projects);
}

export async function POST(request: NextRequest) {
  const guard = await guardPermission("projects", "edit");
  if (guard.response) return guard.response;
  const { user } = guard;

  const body = await request.json();
  if (!body?.name) {
    return NextResponse.json({ error: "name is required" }, { status: 400 });
  }

  if (body.supplierId) {
    const supplier = await prisma.supplier.findUnique({ where: { id: body.supplierId } });
    if (!supplier) return NextResponse.json({ error: "Unknown supplierId" }, { status: 400 });
  }
  const project = await prisma.project.create({
    data: {
      name: body.name,
      supplierId: body.supplierId ?? null,
      budgetAmount: body.budgetAmount ?? null,
    },
  });

  await prisma.auditLogEntry.create({
    data: {
      recordType: "project",
      recordId: project.id,
      actorId: user.id,
      action: `Created project "${project.name}"`,
    },
  });

  return NextResponse.json(project, { status: 201 });
}
