import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { guardPermission } from "@/lib/api-guard";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const guard = await guardPermission("admin", "edit");
  if (guard.response) return guard.response;
  const { user } = guard;

  const { id } = await params;
  const existing = await prisma.workflowConfig.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await request.json();
  if (!("enabled" in body)) {
    return NextResponse.json({ error: "enabled is required" }, { status: 400 });
  }

  const workflow = await prisma.workflowConfig.update({ where: { id }, data: { enabled: body.enabled } });

  await prisma.auditLogEntry.create({
    data: {
      recordType: "workflow_config",
      recordId: workflow.id,
      actorId: user.id,
      action: workflow.enabled ? `Enabled "${workflow.name}"` : `Disabled "${workflow.name}"`,
    },
  });

  return NextResponse.json(workflow);
}
