import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { randomUUID } from "crypto";
import { prisma } from "@/lib/prisma";
import { Role } from "@/generated/prisma/enums";

const mockAuth = vi.fn();

vi.mock("@clerk/nextjs/server", () => ({
  clerkClient: async () => ({
    authenticateRequest: async () => {
      const authResult = await mockAuth();
      return { toAuth: () => authResult };
    },
    users: { getUser: async () => ({ publicMetadata: {}, emailAddresses: [], firstName: null, lastName: null }) },
  }),
}));

const { POST } = await import("./route");

function postDocument(moduleKey: string, recordId: string) {
  const request = new NextRequest(`http://localhost/api/modules/${moduleKey}/documents`, {
    method: "POST",
    body: JSON.stringify({ recordType: moduleKey, recordId, name: "msa.pdf" }),
  });
  return POST(request, { params: Promise.resolve({ key: moduleKey }) });
}

describe("POST /api/modules/[key]/documents", () => {
  const buyerClerkId = `test-buyer-${randomUUID()}`;
  const leaderClerkId = `test-leader-${randomUUID()}`;

  beforeAll(async () => {
    await prisma.user.create({
      data: { clerkId: buyerClerkId, email: `${buyerClerkId}@test.local`, name: "Test Buyer", role: Role.BUYER },
    });
    await prisma.user.create({
      data: {
        clerkId: leaderClerkId,
        email: `${leaderClerkId}@test.local`,
        name: "Test Procurement Leader",
        role: Role.PROCUREMENT_LEADER,
      },
    });
  });

  afterAll(async () => {
    await prisma.auditLogEntry.deleteMany({ where: { actor: { clerkId: { in: [buyerClerkId, leaderClerkId] } } } });
    await prisma.document.deleteMany({ where: { uploadedBy: { clerkId: { in: [buyerClerkId, leaderClerkId] } } } });
    await prisma.user.deleteMany({ where: { clerkId: { in: [buyerClerkId, leaderClerkId] } } });
    await prisma.$disconnect();
  });

  it("rejects a role with no edit permission on the module (403, no row written)", async () => {
    mockAuth.mockResolvedValue({ userId: buyerClerkId });
    const recordId = randomUUID();

    // Buyer has NONE on Contracts in the seeded PERMISSIONS_MATRIX.
    const response = await postDocument("contracts", recordId);

    expect(response.status).toBe(403);
    const count = await prisma.document.count({ where: { recordType: "contracts", recordId } });
    expect(count).toBe(0);
  });

  it("rejects an unauthenticated request (401)", async () => {
    mockAuth.mockResolvedValue({ userId: null });

    const response = await postDocument("suppliers", randomUUID());

    expect(response.status).toBe(401);
  });

  it("allows a role with edit permission on the module (201, row written)", async () => {
    mockAuth.mockResolvedValue({ userId: leaderClerkId });
    const recordId = randomUUID();

    // Procurement Leader has EDIT on Suppliers in the seeded PERMISSIONS_MATRIX.
    const response = await postDocument("suppliers", recordId);

    expect(response.status).toBe(201);
    const count = await prisma.document.count({ where: { recordType: "suppliers", recordId } });
    expect(count).toBe(1);
  });
});
