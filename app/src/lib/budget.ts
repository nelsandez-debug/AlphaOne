import "server-only";
import { prisma } from "@/lib/prisma";

export type BudgetRollup = {
  id: string;
  category: string;
  allocated: number;
  committed: number;
  spent: number;
};

// The reference stored `committed`/`spent` as hand-maintained, static numbers next
// to `allocated` — they drift from reality the moment a PO or invoice changes. Here
// they're always computed live from real PurchaseOrder/Invoice amounts, joined
// through Supplier.category, so they can never go stale.
export async function computeBudgetRollup(): Promise<BudgetRollup[]> {
  const [categories, purchaseOrders, invoices] = await Promise.all([
    prisma.budgetCategory.findMany({ orderBy: { category: "asc" } }),
    prisma.purchaseOrder.findMany({
      where: { status: { in: ["PENDING_APPROVAL", "ISSUED", "RECEIVED"] } },
      select: { amount: true, supplier: { select: { category: true } } },
    }),
    prisma.invoice.findMany({ select: { amount: true, supplier: { select: { category: true } } } }),
  ]);

  const committedByCategory = new Map<string, number>();
  for (const po of purchaseOrders) {
    committedByCategory.set(po.supplier.category, (committedByCategory.get(po.supplier.category) ?? 0) + po.amount);
  }
  const spentByCategory = new Map<string, number>();
  for (const invoice of invoices) {
    spentByCategory.set(invoice.supplier.category, (spentByCategory.get(invoice.supplier.category) ?? 0) + invoice.amount);
  }

  return categories.map((c) => ({
    id: c.id,
    category: c.category,
    allocated: c.allocated,
    committed: committedByCategory.get(c.category) ?? 0,
    spent: spentByCategory.get(c.category) ?? 0,
  }));
}
