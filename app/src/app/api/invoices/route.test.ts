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

function postInvoice(body: unknown) {
  const request = new NextRequest("http://localhost/api/invoices", { method: "POST", body: JSON.stringify(body) });
  return POST(request);
}

describe("POST /api/invoices", () => {
  const financeClerkId = `test-finance-${randomUUID()}`;
  let supplierAId: string;
  let supplierBId: string;
  let poForSupplierAId: string;

  beforeAll(async () => {
    await prisma.user.create({
      data: { clerkId: financeClerkId, email: `${financeClerkId}@test.local`, name: "Test Finance", role: Role.FINANCE_ANALYST },
    });
    const supplierA = await prisma.supplier.create({
      data: { name: "Invoice Test Supplier A", category: "Test", tier: "TRANSACTIONAL", status: "APPROVED" },
    });
    const supplierB = await prisma.supplier.create({
      data: { name: "Invoice Test Supplier B", category: "Test", tier: "TRANSACTIONAL", status: "APPROVED" },
    });
    supplierAId = supplierA.id;
    supplierBId = supplierB.id;
    const po = await prisma.purchaseOrder.create({
      data: { supplierId: supplierAId, type: "STANDARD", amount: 1000 },
    });
    poForSupplierAId = po.id;
    mockAuth.mockResolvedValue({ userId: financeClerkId });
  });

  afterAll(async () => {
    await prisma.auditLogEntry.deleteMany({ where: { recordType: "invoice" } });
    await prisma.invoice.deleteMany({ where: { supplierId: { in: [supplierAId, supplierBId] } } });
    await prisma.purchaseOrder.deleteMany({ where: { id: poForSupplierAId } });
    await prisma.supplier.deleteMany({ where: { id: { in: [supplierAId, supplierBId] } } });
    await prisma.user.deleteMany({ where: { clerkId: financeClerkId } });
    await prisma.$disconnect();
  });

  it("rejects a purchaseOrderId that belongs to a different supplier (400, no row written)", async () => {
    const response = await postInvoice({ supplierId: supplierBId, purchaseOrderId: poForSupplierAId, amount: 1000 });

    expect(response.status).toBe(400);
    const count = await prisma.invoice.count({ where: { supplierId: supplierBId } });
    expect(count).toBe(0);
  });

  it("creates the invoice when the PO belongs to the same supplier (201, real FK set)", async () => {
    const response = await postInvoice({ supplierId: supplierAId, purchaseOrderId: poForSupplierAId, amount: 1000 });

    expect(response.status).toBe(201);
    const invoice = await prisma.invoice.findFirst({ where: { supplierId: supplierAId } });
    expect(invoice?.purchaseOrderId).toBe(poForSupplierAId);
  });
});
