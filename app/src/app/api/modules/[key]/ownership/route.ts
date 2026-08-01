import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { guardPermission } from "@/lib/api-guard";

// Shared, polymorphic Ownership: one row per (recordType, recordId), reassigned via
// upsert. Kept as its own table (like Document/Note) so a future cross-module
// ownership leaderboard queries real data instead of per-table owner columns.

export async function GET(request: NextRequest, { params }: { params: Promise<{ key: string }> }) {
  const { key: moduleKey } = await params;
  const guard = await guardPermission(moduleKey, "view");
  if (guard.response) return guard.response;

  const { searchParams } = new URL(request.url);
  const recordType = searchParams.get("recordType");
  const recordId = searchParams.get("recordId");
  if (!recordType || !recordId) {
    return NextResponse.json({ error: "recordType and recordId are required" }, { status: 400 });
  }

  const ownership = await prisma.ownership.findUnique({
    where: { recordType_recordId: { recordType, recordId } },
    include: { owner: { select: { id: true, name: true } } },
  });

  return NextResponse.json(ownership);
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ key: string }> }) {
  const { key: moduleKey } = await params;
  const guard = await guardPermission(moduleKey, "edit");
  if (guard.response) return guard.response;
  const { user } = guard;

  const body = await request.json();
  if (!body?.recordType || !body?.recordId || !body?.ownerId) {
    return NextResponse.json({ error: "recordType, recordId, and ownerId are required" }, { status: 400 });
  }

  const newOwner = await prisma.user.findUnique({ where: { id: body.ownerId } });
  if (!newOwner) {
    return NextResponse.json({ error: "Unknown ownerId" }, { status: 400 });
  }

  const ownership = await prisma.ownership.upsert({
    where: { recordType_recordId: { recordType: body.recordType, recordId: body.recordId } },
    update: { ownerId: newOwner.id, assignedAt: new Date() },
    create: { recordType: body.recordType, recordId: body.recordId, ownerId: newOwner.id },
    include: { owner: { select: { id: true, name: true } } },
  });

  await prisma.auditLogEntry.create({
    data: {
      recordType: body.recordType,
      recordId: body.recordId,
      actorId: user.id,
      action: `Assigned owner to ${newOwner.name}`,
    },
  });

  return NextResponse.json(ownership);
}
