import "server-only";
import { prisma } from "@/lib/prisma";

export type MonthlySpend = { month: string; amount: number };

export type ForecastSummary = {
  monthly: MonthlySpend[];
  totalToDate: number;
  monthsWithData: number;
  // A simple run-rate projection (totalToDate / monthsWithData * 12) — explicitly
  // labeled as such in the UI. Not a trend model or AI prediction (principle 4):
  // there isn't enough historical data yet for anything more sophisticated to be
  // honest, so this stays a plain, transparent arithmetic projection.
  projectedAnnualRunRate: number;
};

export async function computeForecastSummary(): Promise<ForecastSummary> {
  const invoices = await prisma.invoice.findMany({
    where: { invoiceDate: { not: null } },
    select: { amount: true, invoiceDate: true },
  });

  const byMonth = new Map<string, number>();
  for (const invoice of invoices) {
    const month = invoice.invoiceDate!.toISOString().slice(0, 7); // YYYY-MM
    byMonth.set(month, (byMonth.get(month) ?? 0) + invoice.amount);
  }

  const monthly = Array.from(byMonth.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, amount]) => ({ month, amount }));

  const totalToDate = monthly.reduce((sum, m) => sum + m.amount, 0);
  const monthsWithData = monthly.length;
  const projectedAnnualRunRate = monthsWithData > 0 ? Math.round((totalToDate / monthsWithData) * 12) : 0;

  return { monthly, totalToDate, monthsWithData, projectedAnnualRunRate };
}
