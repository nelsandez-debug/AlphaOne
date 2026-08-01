import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { guardPermission } from "@/lib/api-guard";

const EDITABLE_FIELDS = ["name", "category", "criticality", "governanceStatus", "riskScore", "riskAssessment", "lastReviewedAt"] as const;

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const guard = await guardPermission("services", "view");
  if (guard.response) return guard.response;

  const { id } = await params;
  const service = await prisma.service.findUnique({
    where: { id },
    include: { supplier: { select: { id: true, name: true } }, contract: { select: { id: true, name: true } } },
  });
  if (!service) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json(service);
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const guard = await guardPermission("services", "edit");
  if (guard.response) return guard.response;
  const { user } = guard;

  const { id } = await params;
  const existing = await prisma.service.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await request.json();
  const data: Record<string, unknown> = {};
  for (const field of EDITABLE_FIELDS) {
    if (field in body) {
      data[field] = field === "lastReviewedAt" ? (body[field] ? new Date(body[field]) : null) : body[field];
    }
  }
  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "No editable fields provided" }, { status: 400 });
  }

  const service = await prisma.service.update({ where: { id }, data });

  await prisma.auditLogEntry.create({
    data: {
      recordType: "service",
      recordId: service.id,
      actorId: user.id,
      action: `Updated ${Object.keys(data).join(", ")}`,
      metadata: data as never,
    },
  });

  return NextResponse.json(service);
}
