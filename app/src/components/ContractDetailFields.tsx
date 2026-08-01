"use client";

import { useRouter } from "next/navigation";
import { EditableText } from "@/components/EditableText";
import { EditableSelect } from "@/components/EditableSelect";
import { CONTRACT_STATUS_LABELS, RISK_LEVEL_LABELS, riskBadgeClass, toOptions } from "@/lib/labels";
import type { Contract } from "@/generated/prisma/client";

function formatDate(value: Date | null): string {
  return value ? value.toISOString().slice(0, 10) : "";
}

export function ContractNameField({ contract, editable }: { contract: Contract; editable: boolean }) {
  const router = useRouter();
  return (
    <EditableText
      value={contract.name}
      editable={editable}
      className="text-xl font-semibold text-slate-900"
      onSave={async (name) => {
        const response = await fetch(`/api/contracts/${contract.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name }),
        });
        if (response.ok) router.refresh();
      }}
    />
  );
}

export function ContractHeaderFields({ contract, editable }: { contract: Contract; editable: boolean }) {
  const router = useRouter();

  const patch = async (data: Record<string, unknown>) => {
    const response = await fetch(`/api/contracts/${contract.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (response.ok) router.refresh();
  };

  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
      <EditableText value={contract.type} editable={editable} className="text-slate-600" onSave={(type) => patch({ type })} />
      <EditableSelect
        value={contract.status}
        editable={editable}
        options={toOptions(CONTRACT_STATUS_LABELS)}
        renderValue={(v) => <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs">{CONTRACT_STATUS_LABELS[v as keyof typeof CONTRACT_STATUS_LABELS]}</span>}
        onSave={(status) => patch({ status })}
      />
      <EditableSelect
        value={contract.riskLevel}
        editable={editable}
        allowClear
        clearLabel="Not assessed"
        options={toOptions(RISK_LEVEL_LABELS)}
        renderValue={(v) => (
          <span className={`inline-block rounded-full border px-2 py-0.5 text-xs ${riskBadgeClass(v as Contract["riskLevel"])}`}>
            {v ? RISK_LEVEL_LABELS[v as keyof typeof RISK_LEVEL_LABELS] : "Not assessed"}
          </span>
        )}
        onSave={(riskLevel) => patch({ riskLevel })}
      />
      <span className="text-slate-300">·</span>
      <span className="text-xs text-slate-400">Effective</span>
      <EditableText value={formatDate(contract.effectiveDate)} editable={editable} placeholder="unset" onSave={(effectiveDate) => patch({ effectiveDate: effectiveDate || null })} />
      <span className="text-xs text-slate-400">Expires</span>
      <EditableText value={formatDate(contract.expirationDate)} editable={editable} placeholder="unset" onSave={(expirationDate) => patch({ expirationDate: expirationDate || null })} />
    </div>
  );
}
