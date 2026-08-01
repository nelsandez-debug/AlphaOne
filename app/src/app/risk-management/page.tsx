import { ShieldAlert } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requirePageAccess } from "@/lib/page-guard";
import { NoAccess } from "@/components/NoAccess";
import { computeRiskIndex } from "@/lib/risk";
import { CreateRiskFlagForm } from "@/components/CreateRiskFlagForm";
import { RiskFlagRow } from "@/components/RiskFlagRow";

export default async function RiskManagementPage() {
  const access = await requirePageAccess("risk-management");
  if (!access.allowed) return <NoAccess moduleLabel="Risk Management" />;

  const [flags, suppliers, riskIndex] = await Promise.all([
    prisma.riskFlag.findMany({ where: { resolved: false }, orderBy: { createdAt: "desc" }, include: { supplier: { select: { id: true, name: true } } } }),
    prisma.supplier.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
    computeRiskIndex(),
  ]);

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6 p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Risk Management</h1>
          <p className="text-sm text-slate-500">Open flags and a live risk index — not a prediction, just a transparent weighted count.</p>
        </div>
        {access.editable && <CreateRiskFlagForm suppliers={suppliers} />}
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-5 flex items-center gap-3">
        <div className="h-10 w-10 rounded-lg bg-rose-50 flex items-center justify-center">
          <ShieldAlert size={18} className="text-rose-500" />
        </div>
        <div>
          <p className="font-mono text-2xl font-semibold text-slate-900">{riskIndex}</p>
          <p className="text-xs text-slate-500">current risk index (0–100) · {flags.length} open flags</p>
        </div>
      </div>

      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-3">Open flags</p>
        <div className="space-y-3">
          {flags.map((f) => (
            <RiskFlagRow key={f.id} flag={f} editable={access.editable} />
          ))}
          {flags.length === 0 && <p className="text-sm text-slate-400 italic">No open risk flags.</p>}
        </div>
      </div>
    </div>
  );
}
