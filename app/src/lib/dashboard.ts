import "server-only";
import { prisma } from "@/lib/prisma";

export type CategorySpend = { category: string; amount: number };
export type MonthlySpend = { month: string; amount: number };

export type DashboardSummary = {
  totalSpend: number;
  touchlessInvoiceRate: number;
  categorySpend: CategorySpend[];
  monthly: MonthlySpend[];
  avgMonthlyRunRate: number;
  openIntakeCount: number;
  totalIntakeCount: number;
  poIssuedAmount: number;
  poPendingAmount: number;
  activeProjectCount: number;
  totalProjectCount: number;
  avgProjectProgress: number;
};

// AlphaTwo-reduced-scope test build (7 modules) — replaces the full app's
// analytics.ts/forecast.ts/budget.ts/risk.ts, which depended on models cut
// from this schema. Every number here is still a real aggregation over
// Invoice/IntakeRequest/PurchaseOrder/Project — no fabricated KPIs (CLAUDE.md
// principle 4). The full-scope versions are preserved on the `alphatwo`
// branch/tag.
export async function computeDashboardSummary(): Promise<DashboardSummary> {
  const [invoices, intakeRequests, purchaseOrders, projects] = await Promise.all([
    prisma.invoice.findMany({
      select: { amount: true, status: true, invoiceDate: true, supplier: { select: { category: true } } },
    }),
    prisma.intakeRequest.findMany({ select: { stage: true } }),
    prisma.purchaseOrder.findMany({ select: { amount: true, status: true } }),
    prisma.project.findMany({ select: { status: true, progress: true } }),
  ]);

  const totalSpend = invoices.reduce((sum, i) => sum + i.amount, 0);
  const touchlessInvoiceRate = invoices.length
    ? Math.round((invoices.filter((i) => i.status === "MATCHED").length / invoices.length) * 100)
    : 0;

  const categoryTotals = new Map<string, number>();
  for (const invoice of invoices) {
    categoryTotals.set(invoice.supplier.category, (categoryTotals.get(invoice.supplier.category) ?? 0) + invoice.amount);
  }
  const categorySpend = Array.from(categoryTotals.entries())
    .map(([category, amount]) => ({ category, amount }))
    .sort((a, b) => b.amount - a.amount);

  const monthTotals = new Map<string, number>();
  for (const invoice of invoices) {
    if (!invoice.invoiceDate) continue;
    const month = invoice.invoiceDate.toISOString().slice(0, 7);
    monthTotals.set(month, (monthTotals.get(month) ?? 0) + invoice.amount);
  }
  const monthly = Array.from(monthTotals.entries())
    .map(([month, amount]) => ({ month, amount }))
    .sort((a, b) => a.month.localeCompare(b.month));
  const avgMonthlyRunRate = monthly.length ? monthly.reduce((sum, m) => sum + m.amount, 0) / monthly.length : 0;

  const openIntakeCount = intakeRequests.filter((r) => r.stage !== "CLOSED").length;

  const poIssuedAmount = purchaseOrders
    .filter((po) => po.status === "ISSUED" || po.status === "RECEIVED" || po.status === "CLOSED")
    .reduce((sum, po) => sum + po.amount, 0);
  const poPendingAmount = purchaseOrders
    .filter((po) => po.status === "DRAFT" || po.status === "PENDING_APPROVAL")
    .reduce((sum, po) => sum + po.amount, 0);

  const activeProjects = projects.filter((p) => p.status !== "COMPLETED" && p.status !== "CANCELLED");
  const avgProjectProgress = activeProjects.length
    ? Math.round(activeProjects.reduce((sum, p) => sum + p.progress, 0) / activeProjects.length)
    : 0;

  return {
    totalSpend,
    touchlessInvoiceRate,
    categorySpend,
    monthly,
    avgMonthlyRunRate,
    openIntakeCount,
    totalIntakeCount: intakeRequests.length,
    poIssuedAmount,
    poPendingAmount,
    activeProjectCount: activeProjects.length,
    totalProjectCount: projects.length,
    avgProjectProgress,
  };
}
