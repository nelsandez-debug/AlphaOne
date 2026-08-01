import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { guardPermission } from "@/lib/api-guard";

// Finance-approval workflow: only a role with APPROVE on value-tracking (Finance
// Analyst / Approver in the seeded matrix) can move a submitted item to
// Approved/Rejected, and only while it's still pending — mirrors the reference's
// submittedBy -> financeApprover flow, but with real FKs on both ends.
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const guard = await guardPermission("value-tracking", "approve");
  if (guard.response) return guard.response;
  const { user } = guard;

  const { id } = await params;
  const item = await prisma.valueTrackingItem.findUnique({ where: { id } });
  if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (item.status !== "PENDING_FINANCE_APPROVAL") {
    return NextResponse.json({ error: `Item is already ${item.status} and can't be reviewed again` }, { status: 409 });
  }

  const body = await request.json();
  if (body?.decision !== "approve" && body?.decision !== "reject") {
    return NextResponse.json({ error: 'decision must be "approve" or "reject"' }, { status: 400 });
  }

  const updated = await prisma.valueTrackingItem.update({
    where: { id },
    data: {
      status: body.decision === "approve" ? "APPROVED" : "REJECTED",
      financeApproverId: user.id,
      note: body.note ?? item.note,
    },
  });

  await prisma.auditLogEntry.create({
    data: {
      recordType: "value_tracking_item",
      recordId: id,
      actorId: user.id,
      action: body.decision === "approve" ? `Approved value item "${item.title}"` : `Rejected value item "${item.title}"`,
    },
  });

  return NextResponse.json(updated);
}
