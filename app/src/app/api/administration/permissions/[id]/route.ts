import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { guardPermission } from "@/lib/api-guard";

// Real, editable version of the reference's PERMISSIONS_MATRIX — this is the
// Administration -> Roles & Permissions screen CLAUDE.md calls out as replacing
// hand-editing prisma/seed.ts. Every other module's requirePermission()/
// requirePageAccess() call reads straight from this table, so an edit here takes
// effect immediately, everywhere.
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const guard = await guardPermission("admin", "edit");
  if (guard.response) return guard.response;
  const { user } = guard;

  const { id } = await params;
  const existing = await prisma.rolePermission.findUnique({ where: { id }, include: { module: true } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await request.json();
  if (!body?.level) {
    return NextResponse.json({ error: "level is required" }, { status: 400 });
  }

  const rolePermission = await prisma.rolePermission.update({ where: { id }, data: { level: body.level } });

  await prisma.auditLogEntry.create({
    data: {
      recordType: "role_permission",
      recordId: rolePermission.id,
      actorId: user.id,
      action: `Set ${existing.role} permission on "${existing.module.label}" to ${body.level}`,
    },
  });

  return NextResponse.json(rolePermission);
}
