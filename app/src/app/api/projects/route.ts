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
      budgetCategory: { select: { id: true, category: true } },
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
  if (body.budgetCategoryId) {
    const category = await prisma.budgetCategory.findUnique({ where: { id: body.budgetCategoryId } });
    if (!category) return NextResponse.json({ error: "Unknown budgetCategoryId" }, { status: 400 });
  }
  if (body.sourcingEventId) {
    const event = await prisma.sourcingEvent.findUnique({ where: { id: body.sourcingEventId } });
    if (!event) return NextResponse.json({ error: "Unknown sourcingEventId" }, { status: 400 });
  }

  const project = await prisma.project.create({
    data: {
      name: body.name,
      supplierId: body.supplierId ?? null,
      budgetCategoryId: body.budgetCategoryId ?? null,
      budgetAmount: body.budgetAmount ?? null,
      sourcingEventId: body.sourcingEventId ?? null,
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
