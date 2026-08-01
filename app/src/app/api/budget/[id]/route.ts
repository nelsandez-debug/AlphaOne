import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { guardPermission } from "@/lib/api-guard";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const guard = await guardPermission("budget", "edit");
  if (guard.response) return guard.response;
  const { user } = guard;

  const { id } = await params;
  const existing = await prisma.budgetCategory.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await request.json();
  if (!("allocated" in body)) {
    return NextResponse.json({ error: "allocated is required" }, { status: 400 });
  }

  const budgetCategory = await prisma.budgetCategory.update({ where: { id }, data: { allocated: body.allocated } });

  await prisma.auditLogEntry.create({
    data: {
      recordType: "budget_category",
      recordId: budgetCategory.id,
      actorId: user.id,
      action: `Updated allocated budget to $${budgetCategory.allocated.toLocaleString()}`,
    },
  });

  return NextResponse.json(budgetCategory);
}
