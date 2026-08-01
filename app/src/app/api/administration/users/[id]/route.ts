import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { guardPermission } from "@/lib/api-guard";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const guard = await guardPermission("admin", "edit");
  if (guard.response) return guard.response;
  const { user } = guard;

  const { id } = await params;
  if (id === user.id) {
    return NextResponse.json({ error: "You can't change your own role" }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await request.json();
  if (!body?.role) {
    return NextResponse.json({ error: "role is required" }, { status: 400 });
  }

  const updated = await prisma.user.update({ where: { id }, data: { role: body.role } });

  await prisma.auditLogEntry.create({
    data: {
      recordType: "user",
      recordId: updated.id,
      actorId: user.id,
      action: `Changed ${updated.name}'s role from ${existing.role} to ${updated.role}`,
    },
  });

  return NextResponse.json(updated);
}
