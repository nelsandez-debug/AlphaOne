import { requirePageAccess } from "@/lib/page-guard";
import { NoAccess } from "@/components/NoAccess";
import { computeBudgetRollup } from "@/lib/budget";
import { CreateBudgetCategoryForm } from "@/components/CreateBudgetCategoryForm";
import { BudgetAllocatedField } from "@/components/BudgetAllocatedField";

// Budget: allocated is the only editable, stored number. Committed/spent are
// always computed live from real PurchaseOrder/Invoice amounts (see
// src/lib/budget.ts) — the reference stored both as static numbers that could
// drift from the actual PO/Invoice data.
export default async function BudgetPage() {
  const access = await requirePageAccess("budget");
  if (!access.allowed) return <NoAccess moduleLabel="Budget" />;

  const rollup = await computeBudgetRollup();
  const totals = rollup.reduce(
    (acc, r) => ({ allocated: acc.allocated + r.allocated, committed: acc.committed + r.committed, spent: acc.spent + r.spent }),
    { allocated: 0, committed: 0, spent: 0 }
  );

  return (
    <div className="mx-auto w-full max-w-5xl p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Budget</h1>
          <p className="text-sm text-slate-500">
            ${totals.allocated.toLocaleString()} allocated · ${totals.committed.toLocaleString()} committed · ${totals.spent.toLocaleString()} spent
          </p>
        </div>
        {access.editable && <CreateBudgetCategoryForm />}
      </div>

      <div className="glass overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 text-left text-xs uppercase tracking-wide text-slate-400">
              <th className="px-4 py-2.5 font-medium">Category</th>
              <th className="px-4 py-2.5 font-medium">Allocated</th>
              <th className="px-4 py-2.5 font-medium">Committed</th>
              <th className="px-4 py-2.5 font-medium">Spent</th>
              <th className="px-4 py-2.5 font-medium">Remaining</th>
            </tr>
          </thead>
          <tbody>
            {rollup.map((r) => {
              const remaining = r.allocated - r.committed - r.spent;
              return (
                <tr key={r.id} className="border-b border-slate-50 last:border-0 hover:bg-neutral-100">
                  <td className="px-4 py-2.5 font-medium text-slate-900">{r.category}</td>
                  <td className="px-4 py-2.5 text-slate-600">
                    $<BudgetAllocatedField id={r.id} allocated={r.allocated} editable={access.editable} />
                  </td>
                  <td className="px-4 py-2.5 text-slate-600">${r.committed.toLocaleString()}</td>
                  <td className="px-4 py-2.5 text-slate-600">${r.spent.toLocaleString()}</td>
                  <td className={`px-4 py-2.5 font-medium ${remaining < 0 ? "text-red-600" : "text-slate-600"}`}>${remaining.toLocaleString()}</td>
                </tr>
              );
            })}
            {rollup.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-slate-400 italic">No budget categories yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
