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

function invite(eventId: string, body: unknown) {
  const request = new NextRequest(`http://localhost/api/sourcing/${eventId}/participants`, {
    method: "POST",
    body: JSON.stringify(body),
  });
  return POST(request, { params: Promise.resolve({ id: eventId }) });
}

describe("POST /api/sourcing/[id]/participants", () => {
  const buyerClerkId = `test-buyer-${randomUUID()}`;
  const leaderClerkId = `test-leader-${randomUUID()}`;
  let eventId: string;
  let supplierId: string;

  beforeAll(async () => {
    await prisma.user.create({
      data: { clerkId: buyerClerkId, email: `${buyerClerkId}@test.local`, name: "Test Buyer", role: Role.BUYER },
    });
    await prisma.user.create({
      data: { clerkId: leaderClerkId, email: `${leaderClerkId}@test.local`, name: "Test Leader", role: Role.PROCUREMENT_LEADER },
    });
    const event = await prisma.sourcingEvent.create({ data: { title: "Test RFP" } });
    eventId = event.id;
    const supplier = await prisma.supplier.create({
      data: { name: "Test Sourcing Supplier", category: "Test", tier: "TRANSACTIONAL", status: "APPROVED" },
    });
    supplierId = supplier.id;
  });

  afterAll(async () => {
    await prisma.auditLogEntry.deleteMany({ where: { recordType: "sourcing_event", recordId: eventId } });
    await prisma.sourcingEventSupplier.deleteMany({ where: { sourcingEventId: eventId } });
    await prisma.sourcingEvent.deleteMany({ where: { id: eventId } });
    await prisma.supplier.deleteMany({ where: { id: supplierId } });
    await prisma.user.deleteMany({ where: { clerkId: { in: [buyerClerkId, leaderClerkId] } } });
    await prisma.$disconnect();
  });

  it("rejects a role without edit permission on sourcing (403)", async () => {
    // Buyer has VIEW (not EDIT) on Sourcing in the seeded PERMISSIONS_MATRIX.
    mockAuth.mockResolvedValue({ userId: buyerClerkId });

    const response = await invite(eventId, { supplierId });

    expect(response.status).toBe(403);
  });

  it("rejects a supplierId that isn't a real Supplier row (400)", async () => {
    mockAuth.mockResolvedValue({ userId: leaderClerkId });

    const response = await invite(eventId, { supplierId: randomUUID() });

    expect(response.status).toBe(400);
    const count = await prisma.sourcingEventSupplier.count({ where: { sourcingEventId: eventId } });
    expect(count).toBe(0);
  });

  it("invites a real supplier, creating a real join row (not a name string)", async () => {
    mockAuth.mockResolvedValue({ userId: leaderClerkId });

    const response = await invite(eventId, { supplierId });

    expect(response.status).toBe(201);
    const participant = await prisma.sourcingEventSupplier.findFirst({ where: { sourcingEventId: eventId, supplierId } });
    expect(participant?.status).toBe("INVITED");
  });

  it("rejects inviting the same supplier twice (409)", async () => {
    mockAuth.mockResolvedValue({ userId: leaderClerkId });

    const response = await invite(eventId, { supplierId });

    expect(response.status).toBe(409);
  });
});
