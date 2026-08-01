import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { guardPermission } from "@/lib/api-guard";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const guard = await guardPermission("risk-management", "edit");
  if (guard.response) return guard.response;
  const { user } = guard;

  const { id } = await params;
  const existing = await prisma.riskFlag.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await request.json();
  if (!("resolved" in body)) {
    return NextResponse.json({ error: "resolved is required" }, { status: 400 });
  }

  const flag = await prisma.riskFlag.update({ where: { id }, data: { resolved: body.resolved } });

  await prisma.auditLogEntry.create({
    data: {
      recordType: "risk_flag",
      recordId: flag.id,
      actorId: user.id,
      action: flag.resolved ? "Marked risk flag resolved" : "Reopened risk flag",
    },
  });

  return NextResponse.json(flag);
}
