import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { guardPermission } from "@/lib/api-guard";

const EDITABLE_FIELDS = ["name", "status", "progress", "riskLevel", "budgetAmount"] as const;

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const guard = await guardPermission("projects", "view");
  if (guard.response) return guard.response;

  const { id } = await params;
  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      supplier: { select: { id: true, name: true } },
      contracts: { select: { id: true, name: true } },
      services: { select: { id: true, name: true } },
      purchaseOrders: { select: { id: true, amount: true } },
      invoices: { select: { id: true, amount: true } },
    },
  });
  if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json(project);
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const guard = await guardPermission("projects", "edit");
  if (guard.response) return guard.response;
  const { user } = guard;

  const { id } = await params;
  const existing = await prisma.project.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await request.json();
  const data: Record<string, unknown> = {};
  for (const field of EDITABLE_FIELDS) {
    if (field in body) data[field] = body[field];
  }
  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "No editable fields provided" }, { status: 400 });
  }

  const project = await prisma.project.update({ where: { id }, data });

  await prisma.auditLogEntry.create({
    data: {
      recordType: "project",
      recordId: project.id,
      actorId: user.id,
      action: `Updated ${Object.keys(data).join(", ")}`,
      metadata: data as never,
    },
  });

  return NextResponse.json(project);
}
