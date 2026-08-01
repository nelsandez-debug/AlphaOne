import "server-only";
import { prisma } from "@/lib/prisma";
import { computeBudgetRollup } from "@/lib/budget";
import { computeRiskIndex } from "@/lib/risk";

export type CategorySpend = { category: string; amount: number };

export type AnalyticsSummary = {
  totalSpend: number;
  touchlessInvoiceRate: number;
  categorySpend: CategorySpend[];
  realizedValue: number;
  pendingValue: number;
  openRiskFlags: number;
  riskIndex: number;
  budgetAllocated: number;
  budgetUsed: number;
};

// Every number here is a real aggregation over Prisma tables — no fabricated KPIs
// or unlabeled "AI insights" like the reference's KPIS/AGENTS arrays (principle 4).
export async function computeAnalyticsSummary(): Promise<AnalyticsSummary> {
  const [invoices, valueItems, openRiskFlags, riskIndex, budgetRollup] = await Promise.all([
    prisma.invoice.findMany({ select: { amount: true, status: true, supplier: { select: { category: true } } } }),
    prisma.valueTrackingItem.findMany({ select: { amount: true, status: true } }),
    prisma.riskFlag.count({ where: { resolved: false } }),
    computeRiskIndex(),
    computeBudgetRollup(),
  ]);

  const totalSpend = invoices.reduce((sum, i) => sum + i.amount, 0);
  const touchlessInvoiceRate = invoices.length ? Math.round((invoices.filter((i) => i.status === "MATCHED").length / invoices.length) * 100) : 0;

  const categoryTotals = new Map<string, number>();
  for (const invoice of invoices) {
    categoryTotals.set(invoice.supplier.category, (categoryTotals.get(invoice.supplier.category) ?? 0) + invoice.amount);
  }
  const categorySpend = Array.from(categoryTotals.entries())
    .map(([category, amount]) => ({ category, amount }))
    .sort((a, b) => b.amount - a.amount);

  const realizedValue = valueItems.filter((v) => v.status === "APPROVED").reduce((sum, v) => sum + v.amount, 0);
  const pendingValue = valueItems.filter((v) => v.status === "PENDING_FINANCE_APPROVAL").reduce((sum, v) => sum + v.amount, 0);

  const budgetAllocated = budgetRollup.reduce((sum, b) => sum + b.allocated, 0);
  const budgetUsed = budgetRollup.reduce((sum, b) => sum + b.committed + b.spent, 0);

  return {
    totalSpend,
    touchlessInvoiceRate,
    categorySpend,
    realizedValue,
    pendingValue,
    openRiskFlags,
    riskIndex,
    budgetAllocated,
    budgetUsed,
  };
}
