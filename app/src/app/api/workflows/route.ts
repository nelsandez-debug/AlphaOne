import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { guardPermission } from "@/lib/api-guard";

// A real, persisted settings registry — see the WorkflowConfig model comment in
// schema.prisma for why this stays a plain on/off registry rather than the
// reference's fabricated drag-and-drop no-code builder.
export async function GET() {
  const guard = await guardPermission("admin", "view");
  if (guard.response) return guard.response;

  const workflows = await prisma.workflowConfig.findMany({ orderBy: { name: "asc" } });
  return NextResponse.json(workflows);
}

export async function POST(request: NextRequest) {
  const guard = await guardPermission("admin", "edit");
  if (guard.response) return guard.response;
  const { user } = guard;

  const body = await request.json();
  if (!body?.name) {
    return NextResponse.json({ error: "name is required" }, { status: 400 });
  }

  const existing = await prisma.workflowConfig.findUnique({ where: { name: body.name } });
  if (existing) return NextResponse.json({ error: "A workflow with this name already exists" }, { status: 409 });

  const workflow = await prisma.workflowConfig.create({
    data: { name: body.name, description: body.description ?? null, category: body.category ?? null },
  });

  await prisma.auditLogEntry.create({
    data: {
      recordType: "workflow_config",
      recordId: workflow.id,
      actorId: user.id,
      action: `Created workflow config "${workflow.name}"`,
    },
  });

  return NextResponse.json(workflow, { status: 201 });
}
