import { getCurrentUser } from "@/lib/current-user";
import { computeAnalyticsSummary } from "@/lib/analytics";
import { computeForecastSummary } from "@/lib/forecast";
import { riskIndexColor } from "@/lib/labels";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { SpendTrendChart } from "@/components/dashboard/SpendTrendChart";
import { CategorySpendChart } from "@/components/dashboard/CategorySpendChart";

export default async function Home() {
  const user = await getCurrentUser();
  const [analytics, forecast] = await Promise.all([computeAnalyticsSummary(), computeForecastSummary()]);

  const budgetUtilization = analytics.budgetAllocated > 0 ? (analytics.budgetUsed / analytics.budgetAllocated) * 100 : 0;
  const valueTotal = analytics.realizedValue + analytics.pendingValue;
  const valueRealizedShare = valueTotal > 0 ? (analytics.realizedValue / valueTotal) * 100 : 0;
  const avgMonthlyRunRate = forecast.projectedAnnualRunRate / 12;

  return (
    <div className="mx-auto w-full max-w-6xl flex flex-1 flex-col gap-6 p-8">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Control Tower</h1>
        <p className="mt-1 text-sm text-slate-500">
          {user ? `Welcome back, ${user.name}.` : "Welcome."} Every number below is a live aggregation over real
          Supplier/Contract/Invoice/PO data — nothing here is a fabricated demo metric.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          label="Total spend"
          value={`$${analytics.totalSpend.toLocaleString()}`}
          sublabel={`${Math.round(budgetUtilization)}% of $${analytics.budgetAllocated.toLocaleString()} allocated budget`}
          progress={budgetUtilization}
        />
        <KpiCard
          label="Touchless invoice rate"
          value={`${analytics.touchlessInvoiceRate}%`}
          sublabel="Share of invoices matched with no manual review"
          progress={analytics.touchlessInvoiceRate}
        />
        <KpiCard
          label="Value tracked"
          value={`$${analytics.realizedValue.toLocaleString()}`}
          sublabel={`$${analytics.pendingValue.toLocaleString()} pending finance approval`}
          progress={valueRealizedShare}
        />
        <KpiCard
          label="Open risk flags"
          value={String(analytics.openRiskFlags)}
          sublabel={`Risk index ${analytics.riskIndex}/100 (weighted heuristic, not a prediction)`}
          progress={analytics.riskIndex}
          progressColor={riskIndexColor(analytics.riskIndex)}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="text-sm font-semibold text-slate-900">Monthly spend</h2>
          <p className="text-xs text-slate-500">Actual invoiced spend by month, vs. the average monthly run-rate</p>
          <div className="mt-4">
            {forecast.monthly.length > 0 ? (
              <SpendTrendChart monthly={forecast.monthly} avgMonthlyRunRate={avgMonthlyRunRate} />
            ) : (
              <p className="py-12 text-center text-sm text-slate-400">No dated invoices yet</p>
            )}
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="text-sm font-semibold text-slate-900">Spend by category</h2>
          <p className="text-xs text-slate-500">Total invoiced spend, grouped by supplier category</p>
          <div className="mt-4">
            {analytics.categorySpend.length > 0 ? (
              <CategorySpendChart categorySpend={analytics.categorySpend} />
            ) : (
              <p className="py-12 text-center text-sm text-slate-400">No invoiced spend yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
