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

function postContract(body: unknown) {
  const request = new NextRequest("http://localhost/api/contracts", {
    method: "POST",
    body: JSON.stringify(body),
  });
  return POST(request);
}

describe("POST /api/contracts", () => {
  const leaderClerkId = `test-leader-${randomUUID()}`;
  let supplierId: string;

  beforeAll(async () => {
    await prisma.user.create({
      data: { clerkId: leaderClerkId, email: `${leaderClerkId}@test.local`, name: "Test Leader", role: Role.PROCUREMENT_LEADER },
    });
    const supplier = await prisma.supplier.create({
      data: { name: "Real Supplier", category: "Test", tier: "STRATEGIC", status: "APPROVED" },
    });
    supplierId = supplier.id;
    mockAuth.mockResolvedValue({ userId: leaderClerkId });
  });

  afterAll(async () => {
    await prisma.contract.deleteMany({ where: { supplierId } });
    await prisma.supplier.deleteMany({ where: { id: supplierId } });
    await prisma.user.deleteMany({ where: { clerkId: leaderClerkId } });
    await prisma.$disconnect();
  });

  it("rejects a supplierId that doesn't exist as a real Supplier row (400, no row written)", async () => {
    const response = await postContract({ supplierId: randomUUID(), name: "Ghost MSA", type: "MSA", status: "DRAFT" });

    expect(response.status).toBe(400);
    const count = await prisma.contract.count({ where: { name: "Ghost MSA" } });
    expect(count).toBe(0);
  });

  it("creates the contract when supplierId references a real Supplier (201, real FK set)", async () => {
    const response = await postContract({ supplierId, name: "Real MSA", type: "MSA", status: "DRAFT" });

    expect(response.status).toBe(201);
    const contract = await prisma.contract.findFirst({ where: { name: "Real MSA" } });
    expect(contract?.supplierId).toBe(supplierId);
  });
});
