import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { guardPermission } from "@/lib/api-guard";

export async function GET() {
  const guard = await guardPermission("vendor-management", "view");
  if (guard.response) return guard.response;

  const reviews = await prisma.businessReview.findMany({
    orderBy: { scheduledDate: "asc" },
    include: { supplier: { select: { id: true, name: true } } },
  });

  return NextResponse.json(reviews);
}

export async function POST(request: NextRequest) {
  const guard = await guardPermission("vendor-management", "edit");
  if (guard.response) return guard.response;
  const { user } = guard;

  const body = await request.json();
  if (!body?.supplierId || !body?.type || !body?.scheduledDate) {
    return NextResponse.json({ error: "supplierId, type, and scheduledDate are required" }, { status: 400 });
  }

  const supplier = await prisma.supplier.findUnique({ where: { id: body.supplierId } });
  if (!supplier) return NextResponse.json({ error: "Unknown supplierId" }, { status: 400 });

  const review = await prisma.businessReview.create({
    data: { supplierId: supplier.id, type: body.type, scheduledDate: new Date(body.scheduledDate) },
  });

  await prisma.auditLogEntry.create({
    data: {
      recordType: "business_review",
      recordId: review.id,
      actorId: user.id,
      action: `Scheduled ${body.type} for supplier "${supplier.name}"`,
    },
  });

  return NextResponse.json(review, { status: 201 });
}
