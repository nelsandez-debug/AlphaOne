"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { RISK_LEVEL_LABELS, riskBadgeClass } from "@/lib/labels";
import type { RiskFlag } from "@/generated/prisma/client";

type Flag = RiskFlag & { supplier: { id: string; name: string } };

export function RiskFlagRow({ flag, editable }: { flag: Flag; editable: boolean }) {
  const router = useRouter();

  const toggle = async () => {
    const response = await fetch(`/api/risk-flags/${flag.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ resolved: !flag.resolved }),
    });
    if (response.ok) router.refresh();
  };

  return (
    <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4">
      <div>
        <Link href={`/suppliers/${flag.supplier.id}`} className="text-sm font-medium text-slate-900 hover:text-[#2563EB]">{flag.supplier.name}</Link>
        <p className="text-xs text-slate-500 mt-0.5">{flag.detail}</p>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        <span className="text-xs text-slate-400">{flag.type}</span>
        <span className={`text-xs font-medium rounded-full border px-2.5 py-1 ${riskBadgeClass(flag.severity)}`}>{RISK_LEVEL_LABELS[flag.severity]}</span>
        {editable && (
          <button type="button" onClick={toggle} className="text-xs font-medium text-[#2563EB] hover:underline">
            {flag.resolved ? "Reopen" : "Resolve"}
          </button>
        )}
      </div>
    </div>
  );
}
