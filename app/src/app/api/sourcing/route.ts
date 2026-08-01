import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { guardPermission } from "@/lib/api-guard";

export async function GET() {
  const guard = await guardPermission("sourcing", "view");
  if (guard.response) return guard.response;

  const events = await prisma.sourcingEvent.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { participants: true } } },
  });

  return NextResponse.json(events);
}

export async function POST(request: NextRequest) {
  const guard = await guardPermission("sourcing", "edit");
  if (guard.response) return guard.response;
  const { user } = guard;

  const body = await request.json();
  if (!body?.title) {
    return NextResponse.json({ error: "title is required" }, { status: 400 });
  }

  const event = await prisma.sourcingEvent.create({
    data: { title: body.title, type: body.type ?? null, estimatedSavings: body.estimatedSavings ?? null },
  });

  await prisma.auditLogEntry.create({
    data: {
      recordType: "sourcing_event",
      recordId: event.id,
      actorId: user.id,
      action: `Created sourcing event "${event.title}"`,
    },
  });

  return NextResponse.json(event, { status: 201 });
}
