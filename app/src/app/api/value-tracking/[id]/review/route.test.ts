import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { randomUUID } from "crypto";
import { prisma } from "@/lib/prisma";
import { Role } from "@/generated/prisma/enums";

const mockAuth = vi.fn();

vi.mock("@clerk/nextjs/server", () => ({
  auth: () => mockAuth(),
}));

const { POST } = await import("./route");

function review(id: string, body: unknown) {
  const request = new NextRequest(`http://localhost/api/value-tracking/${id}/review`, {
    method: "POST",
    body: JSON.stringify(body),
  });
  return POST(request, { params: Promise.resolve({ id }) });
}

describe("POST /api/value-tracking/[id]/review", () => {
  const buyerClerkId = `test-buyer-${randomUUID()}`;
  const financeClerkId = `test-finance-${randomUUID()}`;
  let supplierId: string;
  let itemId: string;

  beforeAll(async () => {
    const buyer = await prisma.user.create({
      data: { clerkId: buyerClerkId, email: `${buyerClerkId}@test.local`, name: "Test Buyer", role: Role.BUYER },
    });
    await prisma.user.create({
      data: { clerkId: financeClerkId, email: `${financeClerkId}@test.local`, name: "Test Finance", role: Role.FINANCE_ANALYST },
    });
    const supplier = await prisma.supplier.create({
      data: { name: "Value Review Test Supplier", category: "Test", tier: "TRANSACTIONAL", status: "APPROVED" },
    });
    supplierId = supplier.id;
    const item = await prisma.valueTrackingItem.create({
      data: {
        title: "Test savings item",
        type: "SAVINGS",
        amount: 5000,
        supplierId: supplier.id,
        submittedById: buyer.id,
        creditedToId: buyer.id,
      },
    });
    itemId = item.id;
  });

  afterAll(async () => {
    await prisma.auditLogEntry.deleteMany({ where: { recordType: "value_tracking_item", recordId: itemId } });
    await prisma.valueTrackingItem.deleteMany({ where: { id: itemId } });
    await prisma.supplier.deleteMany({ where: { id: supplierId } });
    await prisma.user.deleteMany({ where: { clerkId: { in: [buyerClerkId, financeClerkId] } } });
    await prisma.$disconnect();
  });

  it("rejects a role with only EDIT (not APPROVE) on value-tracking (403)", async () => {
    // Buyer has EDIT (can submit) but not APPROVE on Value Tracking in the seeded matrix.
    mockAuth.mockResolvedValue({ userId: buyerClerkId });

    const response = await review(itemId, { decision: "approve" });

    expect(response.status).toBe(403);
    const item = await prisma.valueTrackingItem.findUnique({ where: { id: itemId } });
    expect(item?.status).toBe("PENDING_FINANCE_APPROVAL");
  });

  it("approves the item when the role has APPROVE (200, real financeApproverId FK set)", async () => {
    mockAuth.mockResolvedValue({ userId: financeClerkId });

    const response = await review(itemId, { decision: "approve", note: "Verified against the invoice." });

    expect(response.status).toBe(200);
    const item = await prisma.valueTrackingItem.findUnique({ where: { id: itemId } });
    expect(item?.status).toBe("APPROVED");
    expect(item?.financeApproverId).not.toBeNull();
  });

  it("rejects reviewing an item that's already been reviewed (409)", async () => {
    mockAuth.mockResolvedValue({ userId: financeClerkId });

    const response = await review(itemId, { decision: "reject" });

    expect(response.status).toBe(409);
  });
});
