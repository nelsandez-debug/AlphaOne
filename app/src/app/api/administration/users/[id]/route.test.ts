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

function patchUser(id: string, body: unknown) {
  const request = new NextRequest(`http://localhost/api/administration/users/${id}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
  return PATCH(request, { params: Promise.resolve({ id }) });
}

describe("PATCH /api/administration/users/[id]", () => {
  const itAdminClerkId = `test-itadmin-${randomUUID()}`;
  const buyerClerkId = `test-buyer-${randomUUID()}`;
  let itAdminId: string;
  let buyerId: string;

  beforeAll(async () => {
    const itAdmin = await prisma.user.create({
      data: { clerkId: itAdminClerkId, email: `${itAdminClerkId}@test.local`, name: "Test IT Admin", role: Role.IT_ADMINISTRATOR },
    });
    itAdminId = itAdmin.id;
    const buyer = await prisma.user.create({
      data: { clerkId: buyerClerkId, email: `${buyerClerkId}@test.local`, name: "Test Buyer", role: Role.BUYER },
    });
    buyerId = buyer.id;
    mockAuth.mockResolvedValue({ userId: itAdminClerkId });
  });

  afterAll(async () => {
    await prisma.auditLogEntry.deleteMany({ where: { recordType: "user", recordId: { in: [itAdminId, buyerId] } } });
    await prisma.user.deleteMany({ where: { clerkId: { in: [itAdminClerkId, buyerClerkId] } } });
    await prisma.$disconnect();
  });

  it("rejects changing your own role (400)", async () => {
    const response = await patchUser(itAdminId, { role: "EXECUTIVE" });

    expect(response.status).toBe(400);
    const unchanged = await prisma.user.findUnique({ where: { id: itAdminId } });
    expect(unchanged?.role).toBe("IT_ADMINISTRATOR");
  });

  it("changes another user's role for a role with EDIT on admin (200, real row updated)", async () => {
    const response = await patchUser(buyerId, { role: "CATEGORY_MANAGER" });

    expect(response.status).toBe(200);
    const updated = await prisma.user.findUnique({ where: { id: buyerId } });
    expect(updated?.role).toBe("CATEGORY_MANAGER");
  });
});
