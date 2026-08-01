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

function postCategory(body: unknown) {
  const request = new NextRequest("http://localhost/api/budget", { method: "POST", body: JSON.stringify(body) });
  return POST(request);
}

describe("POST /api/budget", () => {
  const auditorClerkId = `test-auditor-${randomUUID()}`;
  const leaderClerkId = `test-leader-${randomUUID()}`;
  const categoryName = `Test Category ${randomUUID().slice(0, 8)}`;
  let categoryId: string;

  beforeAll(async () => {
    await prisma.user.create({
      data: { clerkId: auditorClerkId, email: `${auditorClerkId}@test.local`, name: "Test Auditor", role: Role.AUDITOR },
    });
    await prisma.user.create({
      data: { clerkId: leaderClerkId, email: `${leaderClerkId}@test.local`, name: "Test Leader", role: Role.PROCUREMENT_LEADER },
    });
  });

  afterAll(async () => {
    await prisma.auditLogEntry.deleteMany({ where: { recordType: "budget_category" } });
    await prisma.budgetCategory.deleteMany({ where: { category: categoryName } });
    await prisma.user.deleteMany({ where: { clerkId: { in: [auditorClerkId, leaderClerkId] } } });
    await prisma.$disconnect();
  });

  it("rejects a role with only VIEW permission on budget (403, no row written)", async () => {
    // Auditor has VIEW (not EDIT) on Budget in the seeded PERMISSIONS_MATRIX.
    mockAuth.mockResolvedValue({ userId: auditorClerkId });

    const response = await postCategory({ category: categoryName, allocated: 100000 });

    expect(response.status).toBe(403);
    const count = await prisma.budgetCategory.count({ where: { category: categoryName } });
    expect(count).toBe(0);
  });

  it("creates the category for a role with EDIT permission (201)", async () => {
    mockAuth.mockResolvedValue({ userId: leaderClerkId });

    const response = await postCategory({ category: categoryName, allocated: 100000 });

    expect(response.status).toBe(201);
    const category = await prisma.budgetCategory.findUnique({ where: { category: categoryName } });
    expect(category?.allocated).toBe(100000);
    categoryId = category!.id;
  });

  it("rejects creating a duplicate category (409, no second row written)", async () => {
    mockAuth.mockResolvedValue({ userId: leaderClerkId });

    const response = await postCategory({ category: categoryName, allocated: 50000 });

    expect(response.status).toBe(409);
    const count = await prisma.budgetCategory.count({ where: { category: categoryName } });
    expect(count).toBe(1);
    expect(categoryId).toBeTruthy();
  });
});
