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

const { PATCH } = await import("./route");

function patchPermission(id: string, body: unknown) {
  const request = new NextRequest(`http://localhost/api/administration/permissions/${id}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
  return PATCH(request, { params: Promise.resolve({ id }) });
}

describe("PATCH /api/administration/permissions/[id]", () => {
  const leaderClerkId = `test-leader-${randomUUID()}`;
  const itAdminClerkId = `test-itadmin-${randomUUID()}`;
  let moduleId: string;
  let rolePermissionId: string;

  beforeAll(async () => {
    await prisma.user.create({
      data: { clerkId: leaderClerkId, email: `${leaderClerkId}@test.local`, name: "Test Leader", role: Role.PROCUREMENT_LEADER },
    });
    await prisma.user.create({
      data: { clerkId: itAdminClerkId, email: `${itAdminClerkId}@test.local`, name: "Test IT Admin", role: Role.IT_ADMINISTRATOR },
    });
    // An isolated throwaway module + cell so this test never touches the real,
    // shared seeded matrix other tests rely on.
    const testModule = await prisma.module.create({ data: { key: `test-module-${randomUUID()}`, label: "Test Module" } });
    moduleId = testModule.id;
    const rolePermission = await prisma.rolePermission.create({
      data: { role: Role.BUYER, moduleId: testModule.id, level: "VIEW" },
    });
    rolePermissionId = rolePermission.id;
  });

  afterAll(async () => {
    await prisma.auditLogEntry.deleteMany({ where: { recordType: "role_permission", recordId: rolePermissionId } });
    await prisma.rolePermission.deleteMany({ where: { id: rolePermissionId } });
    await prisma.module.deleteMany({ where: { id: moduleId } });
    await prisma.user.deleteMany({ where: { clerkId: { in: [leaderClerkId, itAdminClerkId] } } });
    await prisma.$disconnect();
  });

  it("rejects a role with only VIEW permission on admin (403, level unchanged)", async () => {
    // Procurement Leader has VIEW (not EDIT) on Admin in the seeded matrix.
    mockAuth.mockResolvedValue({ userId: leaderClerkId });

    const response = await patchPermission(rolePermissionId, { level: "NONE" });

    expect(response.status).toBe(403);
    const unchanged = await prisma.rolePermission.findUnique({ where: { id: rolePermissionId } });
    expect(unchanged?.level).toBe("VIEW");
  });

  it("updates the level for a role with EDIT permission on admin (200, real matrix cell changed)", async () => {
    mockAuth.mockResolvedValue({ userId: itAdminClerkId });

    const response = await patchPermission(rolePermissionId, { level: "APPROVE" });

    expect(response.status).toBe(200);
    const updated = await prisma.rolePermission.findUnique({ where: { id: rolePermissionId } });
    expect(updated?.level).toBe("APPROVE");
  });
});
