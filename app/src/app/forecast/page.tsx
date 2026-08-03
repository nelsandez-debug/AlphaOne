import { requirePageAccess } from "@/lib/page-guard";
import { NoAccess } from "@/components/NoAccess";
import { computeForecastSummary } from "@/lib/forecast";

export default async function ForecastPage() {
  const access = await requirePageAccess("analytics");
  if (!access.allowed) return <NoAccess moduleLabel="Forecast" />;

  const summary = await computeForecastSummary();

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6 p-8">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Forecast</h1>
        <p className="text-sm text-slate-500">
          Actual spend by month from real invoice data, plus a simple run-rate projection — not a
          trend model or AI prediction, just totalToDate ÷ monthsWithData × 12.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="glass p-5">
          <p className="text-xs text-slate-500">Spend to date</p>
          <p className="mt-1 text-xl font-semibold text-slate-900">${summary.totalToDate.toLocaleString()}</p>
        </div>
        <div className="glass p-5">
          <p className="text-xs text-slate-500">Months with invoice data</p>
          <p className="mt-1 text-xl font-semibold text-slate-900">{summary.monthsWithData}</p>
        </div>
        <div className="glass p-5">
          <p className="text-xs text-slate-500">Projected annual run rate</p>
          <p className="mt-1 text-xl font-semibold text-slate-900">${summary.projectedAnnualRunRate.toLocaleString()}</p>
        </div>
      </div>

      <div className="glass overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 text-left text-xs uppercase tracking-wide text-slate-400">
              <th className="px-4 py-2.5 font-medium">Month</th>
              <th className="px-4 py-2.5 font-medium">Actual spend</th>
            </tr>
          </thead>
          <tbody>
            {summary.monthly.map((m) => (
              <tr key={m.month} className="border-b border-slate-50 last:border-0">
                <td className="px-4 py-2.5 text-slate-900">{m.month}</td>
                <td className="px-4 py-2.5 text-slate-600">${m.amount.toLocaleString()}</td>
              </tr>
            ))}
            {summary.monthly.length === 0 && (
              <tr>
                <td colSpan={2} className="px-4 py-8 text-center text-slate-400 italic">No dated invoices yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
