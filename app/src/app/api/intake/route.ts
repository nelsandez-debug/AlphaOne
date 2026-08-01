import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { guardPermission } from "@/lib/api-guard";

export async function GET(request: NextRequest) {
  const guard = await guardPermission("intake", "view");
  if (guard.response) return guard.response;

  const { searchParams } = new URL(request.url);
  const stage = searchParams.get("stage") ?? undefined;

  const requests = await prisma.intakeRequest.findMany({
    where: { stage: stage as never },
    orderBy: { createdAt: "desc" },
    include: { requester: { select: { id: true, name: true } } },
  });

  return NextResponse.json(requests);
}

export async function POST(request: NextRequest) {
  const guard = await guardPermission("intake", "edit");
  if (guard.response) return guard.response;
  const { user } = guard;

  const body = await request.json();
  if (!body?.title || !body?.type) {
    return NextResponse.json({ error: "title and type are required" }, { status: 400 });
  }

  const intakeRequest = await prisma.intakeRequest.create({
    data: {
      title: body.title,
      type: body.type,
      category: body.category ?? null,
      description: body.description ?? null,
      estimatedValue: body.estimatedValue ?? null,
      neededBy: body.neededBy ? new Date(body.neededBy) : null,
      costCenter: body.costCenter ?? null,
      department: body.department ?? null,
      requesterId: user.id,
    },
  });

  await prisma.auditLogEntry.create({
    data: {
      recordType: "intake_request",
      recordId: intakeRequest.id,
      actorId: user.id,
      action: `Submitted request "${intakeRequest.title}"`,
    },
  });

  return NextResponse.json(intakeRequest, { status: 201 });
}
