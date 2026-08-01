import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { guardPermission } from "@/lib/api-guard";

export async function GET(request: NextRequest) {
  const guard = await guardPermission("risk-management", "view");
  if (guard.response) return guard.response;

  const { searchParams } = new URL(request.url);
  const resolved = searchParams.get("resolved");

  const flags = await prisma.riskFlag.findMany({
    where: { resolved: resolved ? resolved === "true" : undefined },
    orderBy: { createdAt: "desc" },
    include: { supplier: { select: { id: true, name: true } } },
  });

  return NextResponse.json(flags);
}

export async function POST(request: NextRequest) {
  const guard = await guardPermission("risk-management", "edit");
  if (guard.response) return guard.response;
  const { user } = guard;

  const body = await request.json();
  if (!body?.supplierId || !body?.type || !body?.severity || !body?.detail) {
    return NextResponse.json({ error: "supplierId, type, severity, and detail are required" }, { status: 400 });
  }

  const supplier = await prisma.supplier.findUnique({ where: { id: body.supplierId } });
  if (!supplier) return NextResponse.json({ error: "Unknown supplierId" }, { status: 400 });

  const flag = await prisma.riskFlag.create({
    data: { supplierId: supplier.id, type: body.type, severity: body.severity, detail: body.detail },
  });

  await prisma.auditLogEntry.create({
    data: {
      recordType: "risk_flag",
      recordId: flag.id,
      actorId: user.id,
      action: `Flagged risk for supplier "${supplier.name}": ${flag.detail}`,
    },
  });

  return NextResponse.json(flag, { status: 201 });
}
