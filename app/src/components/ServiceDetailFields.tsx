"use client";

import { useRouter } from "next/navigation";
import { EditableText } from "@/components/EditableText";
import { EditableSelect } from "@/components/EditableSelect";
import { SERVICE_CRITICALITY_LABELS, toOptions } from "@/lib/labels";
import type { Service } from "@/generated/prisma/client";

export function ServiceNameField({ service, editable }: { service: Service; editable: boolean }) {
  const router = useRouter();
  return (
    <EditableText
      value={service.name}
      editable={editable}
      className="text-xl font-semibold text-slate-900"
      onSave={async (name) => {
        const response = await fetch(`/api/services/${service.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name }),
        });
        if (response.ok) router.refresh();
      }}
    />
  );
}

export function ServiceHeaderFields({ service, editable }: { service: Service; editable: boolean }) {
  const router = useRouter();

  const patch = async (data: Record<string, unknown>) => {
    const response = await fetch(`/api/services/${service.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (response.ok) router.refresh();
  };

  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
      <EditableText value={service.category} editable={editable} className="text-slate-600" onSave={(category) => patch({ category })} />
      <EditableSelect
        value={service.criticality}
        editable={editable}
        options={toOptions(SERVICE_CRITICALITY_LABELS)}
        renderValue={(v) => (
          <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs">
            {SERVICE_CRITICALITY_LABELS[v as keyof typeof SERVICE_CRITICALITY_LABELS]}
          </span>
        )}
        onSave={(criticality) => patch({ criticality })}
      />
      <span className="text-xs text-slate-400">Governance</span>
      <EditableText
        value={service.governanceStatus}
        editable={editable}
        placeholder="unset"
        onSave={(governanceStatus) => patch({ governanceStatus: governanceStatus || null })}
      />
    </div>
  );
}

const RISK_RATING_CLASS: Record<string, string> = {
  High: "bg-red-50 text-red-700 border-red-200",
  Medium: "bg-amber-50 text-amber-700 border-amber-200",
  Low: "bg-emerald-50 text-emerald-700 border-emerald-200",
};

export function ServiceRiskAssessment({ riskAssessment }: { riskAssessment: unknown }) {
  if (!riskAssessment || typeof riskAssessment !== "object") {
    return <p className="text-xs text-slate-400 italic">No multi-category risk assessment on file.</p>;
  }

  const entries = Object.entries(riskAssessment as Record<string, { rating?: string; note?: string }>);
  if (entries.length === 0) {
    return <p className="text-xs text-slate-400 italic">No multi-category risk assessment on file.</p>;
  }

  return (
    <div className="space-y-2">
      {entries.map(([category, detail]) => (
        <div key={category} className="flex items-start justify-between gap-3 rounded-lg bg-slate-50 border border-slate-200 px-3 py-2">
          <div>
            <p className="text-xs font-medium text-slate-700">{category}</p>
            {detail?.note && <p className="text-[11px] text-slate-400">{detail.note}</p>}
          </div>
          {detail?.rating && (
            <span className={`shrink-0 inline-block rounded-full border px-2 py-0.5 text-xs ${RISK_RATING_CLASS[detail.rating] ?? "bg-slate-100 text-slate-600 border-slate-200"}`}>
              {detail.rating}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}
