"use client";

import { useRouter } from "next/navigation";
import { EditableText } from "@/components/EditableText";
import { EditableSelect } from "@/components/EditableSelect";
import { PROJECT_STATUS_LABELS, RISK_LEVEL_LABELS, projectStatusBadgeClass, riskBadgeClass, toOptions } from "@/lib/labels";
import type { Project } from "@/generated/prisma/client";

export function ProjectNameField({ project, editable }: { project: Project; editable: boolean }) {
  const router = useRouter();
  return (
    <EditableText
      value={project.name}
      editable={editable}
      className="text-xl font-semibold text-slate-900"
      onSave={async (name) => {
        const response = await fetch(`/api/projects/${project.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name }),
        });
        if (response.ok) router.refresh();
      }}
    />
  );
}

export function ProjectDetailFields({ project, editable }: { project: Project; editable: boolean }) {
  const router = useRouter();

  const patch = async (data: Record<string, unknown>) => {
    const response = await fetch(`/api/projects/${project.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (response.ok) router.refresh();
  };

  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
      <EditableSelect
        value={project.status}
        editable={editable}
        options={toOptions(PROJECT_STATUS_LABELS)}
        renderValue={(v) => <span className={`inline-block rounded-full border px-2 py-0.5 text-xs ${projectStatusBadgeClass(v as Project["status"])}`}>{PROJECT_STATUS_LABELS[v as keyof typeof PROJECT_STATUS_LABELS]}</span>}
        onSave={(status) => patch({ status })}
      />
      <EditableSelect
        value={project.riskLevel}
        editable={editable}
        allowClear
        clearLabel="Not assessed"
        options={toOptions(RISK_LEVEL_LABELS)}
        renderValue={(v) => (
          <span className={`inline-block rounded-full border px-2 py-0.5 text-xs ${riskBadgeClass(v as Project["riskLevel"])}`}>
            {v ? RISK_LEVEL_LABELS[v as keyof typeof RISK_LEVEL_LABELS] : "Not assessed"}
          </span>
        )}
        onSave={(riskLevel) => patch({ riskLevel })}
      />
      <span className="text-xs text-slate-400">Progress</span>
      <EditableText value={String(project.progress)} editable={editable} onSave={(value) => patch({ progress: Math.min(100, Math.max(0, Number(value) || 0)) })} />
      <span className="text-xs text-slate-400">%</span>
      <span className="text-xs text-slate-400">· Budget</span>
      <EditableText
        value={project.budgetAmount != null ? String(project.budgetAmount) : null}
        editable={editable}
        placeholder="unset"
        onSave={(value) => patch({ budgetAmount: value ? Number(value) : null })}
      />
    </div>
  );
}
