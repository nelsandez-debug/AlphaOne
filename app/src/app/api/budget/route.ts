import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { guardPermission } from "@/lib/api-guard";
import { computeBudgetRollup } from "@/lib/budget";

export async function GET() {
  const guard = await guardPermission("budget", "view");
  if (guard.response) return guard.response;

  const rollup = await computeBudgetRollup();
  return NextResponse.json(rollup);
}

export async function POST(request: NextRequest) {
  const guard = await guardPermission("budget", "edit");
  if (guard.response) return guard.response;
  const { user } = guard;

  const body = await request.json();
  if (!body?.category || !body?.allocated) {
    return NextResponse.json({ error: "category and allocated are required" }, { status: 400 });
  }

  const existing = await prisma.budgetCategory.findUnique({ where: { category: body.category } });
  if (existing) return NextResponse.json({ error: "A budget category with this name already exists" }, { status: 409 });

  const budgetCategory = await prisma.budgetCategory.create({
    data: { category: body.category, allocated: body.allocated },
  });

  await prisma.auditLogEntry.create({
    data: {
      recordType: "budget_category",
      recordId: budgetCategory.id,
      actorId: user.id,
      action: `Created budget category "${budgetCategory.category}" ($${budgetCategory.allocated.toLocaleString()} allocated)`,
    },
  });

  return NextResponse.json(budgetCategory, { status: 201 });
}
