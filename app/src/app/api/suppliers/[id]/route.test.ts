import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { randomUUID } from "crypto";
import { prisma } from "@/lib/prisma";
import { Role } from "@/generated/prisma/enums";

const mockAuth = vi.fn();

vi.mock("@clerk/nextjs/server", () => ({
  auth: () => mockAuth(),
}));

const { PATCH } = await import("./route");

describe("PATCH /api/suppliers/[id]", () => {
  const buyerClerkId = `test-buyer-${randomUUID()}`;
  let supplierId: string;

  beforeAll(async () => {
    await prisma.user.create({
      data: { clerkId: buyerClerkId, email: `${buyerClerkId}@test.local`, name: "Test Buyer", role: Role.BUYER },
    });
    const supplier = await prisma.supplier.create({
      data: { name: "Test Supplier", category: "Test", tier: "TRANSACTIONAL", status: "APPROVED" },
    });
    supplierId = supplier.id;
  });

  afterAll(async () => {
    await prisma.supplier.deleteMany({ where: { id: supplierId } });
    await prisma.user.deleteMany({ where: { clerkId: buyerClerkId } });
    await prisma.$disconnect();
  });

  it("rejects a role with only VIEW permission on suppliers (403, no row changed)", async () => {
    // Buyer has VIEW (not EDIT) on Suppliers in the seeded PERMISSIONS_MATRIX.
    mockAuth.mockResolvedValue({ userId: buyerClerkId });

    const request = new NextRequest(`http://localhost/api/suppliers/${supplierId}`, {
      method: "PATCH",
      body: JSON.stringify({ name: "Renamed by an unauthorized request" }),
    });
    const response = await PATCH(request, { params: Promise.resolve({ id: supplierId }) });

    expect(response.status).toBe(403);
    const supplier = await prisma.supplier.findUnique({ where: { id: supplierId } });
    expect(supplier?.name).toBe("Test Supplier");
  });
});
