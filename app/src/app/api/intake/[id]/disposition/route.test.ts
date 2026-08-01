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

function disposition(id: string, body: unknown) {
  const request = new NextRequest(`http://localhost/api/intake/${id}/disposition`, {
    method: "POST",
    body: JSON.stringify(body),
  });
  return POST(request, { params: Promise.resolve({ id }) });
}

describe("POST /api/intake/[id]/disposition", () => {
  const apClerkId = `test-ap-${randomUUID()}`;
  const leaderClerkId = `test-leader-${randomUUID()}`;
  const requesterClerkId = `test-requester-${randomUUID()}`;
  const supplierIds: string[] = [];
  const intakeIds: string[] = [];

  beforeAll(async () => {
    await prisma.user.create({
      data: { clerkId: apClerkId, email: `${apClerkId}@test.local`, name: "Test AP", role: Role.ACCOUNTS_PAYABLE },
    });
    await prisma.user.create({
      data: { clerkId: leaderClerkId, email: `${leaderClerkId}@test.local`, name: "Test Leader", role: Role.PROCUREMENT_LEADER },
    });
    const requester = await prisma.user.create({
      data: { clerkId: requesterClerkId, email: `${requesterClerkId}@test.local`, name: "Test Requester", role: Role.BUYER },
    });

    for (let i = 0; i < 2; i++) {
      const req = await prisma.intakeRequest.create({
        data: { title: "Onboard a new packaging vendor", type: "NEW_VENDOR", requesterId: requester.id },
      });
      intakeIds.push(req.id);
    }
  });

  afterAll(async () => {
    await prisma.auditLogEntry.deleteMany({ where: { recordType: "intake_request", recordId: { in: intakeIds } } });
    await prisma.intakeRequest.deleteMany({ where: { id: { in: intakeIds } } });
    await prisma.supplier.deleteMany({ where: { id: { in: supplierIds } } });
    await prisma.user.deleteMany({ where: { clerkId: { in: [apClerkId, leaderClerkId, requesterClerkId] } } });
    await prisma.$disconnect();
  });

  it("rejects a role with no edit permission on intake (403, stage unchanged)", async () => {
    mockAuth.mockResolvedValue({ userId: apClerkId });

    const response = await disposition(intakeIds[0], { actionId: "onboard_supplier", supplier: { name: "x", category: "x", tier: "PARTNER", status: "APPROVED" } });

    expect(response.status).toBe(403);
    const updated = await prisma.intakeRequest.findUnique({ where: { id: intakeIds[0] } });
    expect(updated?.stage).toBe("NEW");
  });

  it("onboarding a supplier creates a real Supplier row and links it via the audit trail (not a label)", async () => {
    mockAuth.mockResolvedValue({ userId: leaderClerkId });

    const response = await disposition(intakeIds[0], {
      actionId: "onboard_supplier",
      note: "Qualified during triage call",
      supplier: { name: "New Packaging Co", category: "Raw Materials", tier: "TRANSACTIONAL", status: "PENDING_ONBOARDING" },
    });

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.createdRecordType).toBe("supplier");
    supplierIds.push(body.createdRecordId);

    const supplier = await prisma.supplier.findUnique({ where: { id: body.createdRecordId } });
    expect(supplier?.name).toBe("New Packaging Co");

    const updatedRequest = await prisma.intakeRequest.findUnique({ where: { id: intakeIds[0] } });
    expect(updatedRequest?.stage).toBe("ROUTED");
    expect(updatedRequest?.dispositionedAt).not.toBeNull();

    const auditEntry = await prisma.auditLogEntry.findFirst({
      where: { recordType: "intake_request", recordId: intakeIds[0], createdRecordType: "supplier" },
    });
    expect(auditEntry?.createdRecordId).toBe(supplier?.id);
  });

  it("rejects dispositioning a request that's already been dispositioned (409)", async () => {
    mockAuth.mockResolvedValue({ userId: leaderClerkId });

    const response = await disposition(intakeIds[0], {
      actionId: "onboard_supplier",
      supplier: { name: "Second Attempt Co", category: "x", tier: "PARTNER", status: "APPROVED" },
    });

    expect(response.status).toBe(409);
  });

  it("rejects an unknown action for the request's type (400)", async () => {
    mockAuth.mockResolvedValue({ userId: leaderClerkId });

    const response = await disposition(intakeIds[1], { actionId: "new_contract" });

    expect(response.status).toBe(400);
  });
});
