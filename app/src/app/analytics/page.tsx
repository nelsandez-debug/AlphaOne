import { requirePageAccess } from "@/lib/page-guard";
import { NoAccess } from "@/components/NoAccess";
import { computeAnalyticsSummary } from "@/lib/analytics";

// Every KPI below is a real, live aggregation over Suppliers/Invoices/Value
// Tracking/Risk/Budget — the reference's KPIS/AGENTS arrays were fabricated demo
// numbers and unlabeled fake "AI agents"; neither is ported here (principle 4).
export default async function AnalyticsPage() {
  const access = await requirePageAccess("analytics");
  if (!access.allowed) return <NoAccess moduleLabel="Analytics" />;

  const s = await computeAnalyticsSummary();
  const budgetUtilization = s.budgetAllocated > 0 ? Math.round((s.budgetUsed / s.budgetAllocated) * 100) : 0;

  const kpis = [
    { label: "Total invoiced spend", value: `$${s.totalSpend.toLocaleString()}` },
    { label: "Touchless invoice rate", value: `${s.touchlessInvoiceRate}%` },
    { label: "Realized value", value: `$${s.realizedValue.toLocaleString()}` },
    { label: "Pending value (awaiting finance)", value: `$${s.pendingValue.toLocaleString()}` },
    { label: "Open risk flags", value: String(s.openRiskFlags) },
    { label: "Risk index (0–100)", value: String(s.riskIndex) },
    { label: "Budget utilization", value: `${budgetUtilization}%` },
  ];

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6 p-8">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Analytics</h1>
        <p className="text-sm text-slate-500">Real-time aggregation across Suppliers, Invoices, Value Tracking, Risk, and Budget.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((k) => (
          <div key={k.label} className="rounded-xl border border-slate-200 bg-white p-5">
            <p className="text-xs text-slate-500">{k.label}</p>
            <p className="mt-1 text-xl font-semibold text-slate-900">{k.value}</p>
          </div>
        ))}
      </div>

      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-3">Spend by category (from invoices)</p>
        <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-left text-xs uppercase tracking-wide text-slate-400">
                <th className="px-4 py-2.5 font-medium">Category</th>
                <th className="px-4 py-2.5 font-medium">Spend</th>
              </tr>
            </thead>
            <tbody>
              {s.categorySpend.map((c) => (
                <tr key={c.category} className="border-b border-slate-50 last:border-0">
                  <td className="px-4 py-2.5 text-slate-900">{c.category}</td>
                  <td className="px-4 py-2.5 text-slate-600">${c.amount.toLocaleString()}</td>
                </tr>
              ))}
              {s.categorySpend.length === 0 && (
                <tr>
                  <td colSpan={2} className="px-4 py-8 text-center text-slate-400 italic">No invoice data yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
