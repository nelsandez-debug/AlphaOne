import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { guardPermission } from "@/lib/api-guard";

// Shared, polymorphic Notes — same pattern as the Document repository.

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

  const notes = await prisma.note.findMany({
    where: { recordType, recordId },
    include: { author: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(notes);
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ key: string }> }) {
  const { key: moduleKey } = await params;
  const guard = await guardPermission(moduleKey, "edit");
  if (guard.response) return guard.response;
  const { user } = guard;

  const body = await request.json();
  if (!body?.recordType || !body?.recordId || !body?.text?.trim()) {
    return NextResponse.json({ error: "recordType, recordId, and text are required" }, { status: 400 });
  }

  const note = await prisma.note.create({
    data: {
      recordType: body.recordType,
      recordId: body.recordId,
      text: body.text.trim(),
      authorId: user.id,
    },
  });

  await prisma.auditLogEntry.create({
    data: {
      recordType: body.recordType,
      recordId: body.recordId,
      actorId: user.id,
      action: "Added a note",
    },
  });

  return NextResponse.json(note, { status: 201 });
}
