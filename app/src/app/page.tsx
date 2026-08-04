import { getCurrentUser } from "@/lib/current-user";
import { computeAnalyticsSummary } from "@/lib/analytics";
import { computeForecastSummary } from "@/lib/forecast";
import { riskIndexColor } from "@/lib/labels";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { SpendTrendChart } from "@/components/dashboard/SpendTrendChart";
import { CategorySpendChart } from "@/components/dashboard/CategorySpendChart";

// TEMP: "/" unconditionally queries the DB (see below), which 500s while the
// Hyperdrive->Neon connectivity bug (CLAUDE.md's Hosting section) is open. An
// earlier version of this page unconditionally redirect()-ed to /sign-in
// instead of catching the error -- that redirect ran before Clerk's own
// post-sign-in redirect target (also "/", by default) had a chance to see an
// authenticated session, so a signed-in visitor bounced / -> /sign-in ->
// (already signed in) -> / -> /sign-in forever (ERR_TOO_MANY_REDIRECTS).
// Catching the DB failure here instead lets a signed-in visitor land on "/"
// without looping, at the cost of a plain fallback message instead of the
// dashboard. Revert this once the Hyperdrive bug is fixed; the dashboard
// code below is unchanged.
export default async function Home() {
  let user, analytics, forecast;
  try {
    user = await getCurrentUser();
    [analytics, forecast] = await Promise.all([computeAnalyticsSummary(), computeForecastSummary()]);
  } catch {
    return (
      <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-center justify-center gap-3 p-4 text-center">
        <h1 className="text-2xl">Dashboard temporarily unavailable</h1>
        <p className="text-sm text-neutral-600">
          We&apos;re unable to reach the database right now. The rest of the app that needs it will be unavailable
          too until this is resolved — sign-in/sign-up still work.
        </p>
      </div>
    );
  }

  const budgetUtilization = analytics.budgetAllocated > 0 ? (analytics.budgetUsed / analytics.budgetAllocated) * 100 : 0;
  const valueTotal = analytics.realizedValue + analytics.pendingValue;
  const valueRealizedShare = valueTotal > 0 ? (analytics.realizedValue / valueTotal) * 100 : 0;
  const avgMonthlyRunRate = forecast.projectedAnnualRunRate / 12;

  return (
    <div className="mx-auto w-full max-w-6xl flex flex-1 flex-col gap-6 p-4">
      <div>
        <h1 className="text-2xl">{user ? `Good morning, ${user?.name.split(" ")[0]}` : "Control Tower"}</h1>
        <p className="mt-1 text-sm text-neutral-600">
          Every number below is a live aggregation over real Supplier/Contract/Invoice/PO data — nothing here is a
          fabricated demo metric.
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
        <div className="glass p-5">
          <h2 className="font-heading text-base">Monthly spend</h2>
          <p className="text-xs text-neutral-600">Actual invoiced spend by month, vs. the average monthly run-rate</p>
          <div className="mt-4">
            {forecast.monthly.length > 0 ? (
              <SpendTrendChart monthly={forecast.monthly} avgMonthlyRunRate={avgMonthlyRunRate} />
            ) : (
              <p className="py-12 text-center text-sm text-neutral-500">No dated invoices yet</p>
            )}
          </div>
        </div>

        <div className="glass p-5">
          <h2 className="font-heading text-base">Spend by category</h2>
          <p className="text-xs text-neutral-600">Total invoiced spend, grouped by supplier category</p>
          <div className="mt-4">
            {analytics.categorySpend.length > 0 ? (
              <CategorySpendChart categorySpend={analytics.categorySpend} />
            ) : (
              <p className="py-12 text-center text-sm text-neutral-500">No invoiced spend yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
