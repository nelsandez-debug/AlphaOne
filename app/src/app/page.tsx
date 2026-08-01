import { getCurrentUser } from "@/lib/current-user";
import { computeDashboardSummary } from "@/lib/dashboard";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { SpendTrendChart } from "@/components/dashboard/SpendTrendChart";
import { CategorySpendChart } from "@/components/dashboard/CategorySpendChart";

export default async function Home() {
  const user = await getCurrentUser();
  const summary = await computeDashboardSummary();

  const intakeResolutionRate = summary.totalIntakeCount > 0
    ? ((summary.totalIntakeCount - summary.openIntakeCount) / summary.totalIntakeCount) * 100
    : 0;
  const poIssuedShare = summary.poIssuedAmount + summary.poPendingAmount > 0
    ? (summary.poIssuedAmount / (summary.poIssuedAmount + summary.poPendingAmount)) * 100
    : 0;

  return (
    <div className="mx-auto w-full max-w-6xl flex flex-1 flex-col gap-6 p-8">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Control Tower</h1>
        <p className="mt-1 text-sm text-slate-500">
          {user ? `Welcome back, ${user.name}.` : "Welcome."} Every number below is a live aggregation over real
          Intake/Supplier/Contract/PO/Invoice/Project data — nothing here is a fabricated demo metric.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          label="Total invoiced spend"
          value={`$${summary.totalSpend.toLocaleString()}`}
          sublabel={`${summary.touchlessInvoiceRate}% matched with no manual review`}
          progress={summary.touchlessInvoiceRate}
        />
        <KpiCard
          label="Open intake requests"
          value={String(summary.openIntakeCount)}
          sublabel={`of ${summary.totalIntakeCount} total requests`}
          progress={intakeResolutionRate}
        />
        <KpiCard
          label="PO spend issued"
          value={`$${summary.poIssuedAmount.toLocaleString()}`}
          sublabel={`$${summary.poPendingAmount.toLocaleString()} pending approval`}
          progress={poIssuedShare}
        />
        <KpiCard
          label="Active projects"
          value={String(summary.activeProjectCount)}
          sublabel={`avg. ${summary.avgProjectProgress}% progress · ${summary.totalProjectCount} total`}
          progress={summary.avgProjectProgress}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="text-sm font-semibold text-slate-900">Monthly spend</h2>
          <p className="text-xs text-slate-500">Actual invoiced spend by month, vs. the average monthly run-rate</p>
          <div className="mt-4">
            {summary.monthly.length > 0 ? (
              <SpendTrendChart monthly={summary.monthly} avgMonthlyRunRate={summary.avgMonthlyRunRate} />
            ) : (
              <p className="py-12 text-center text-sm text-slate-400">No dated invoices yet</p>
            )}
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="text-sm font-semibold text-slate-900">Spend by category</h2>
          <p className="text-xs text-slate-500">Total invoiced spend, grouped by supplier category</p>
          <div className="mt-4">
            {summary.categorySpend.length > 0 ? (
              <CategorySpendChart categorySpend={summary.categorySpend} />
            ) : (
              <p className="py-12 text-center text-sm text-slate-400">No invoiced spend yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
