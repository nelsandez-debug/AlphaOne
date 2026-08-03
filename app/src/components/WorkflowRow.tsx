"use client";

import { useRouter } from "next/navigation";
import type { WorkflowConfig } from "@/generated/prisma/client";

export function WorkflowRow({ workflow, editable }: { workflow: WorkflowConfig; editable: boolean }) {
  const router = useRouter();

  const toggle = async () => {
    const response = await fetch(`/api/workflows/${workflow.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ enabled: !workflow.enabled }),
    });
    if (response.ok) router.refresh();
  };

  return (
    <div className="flex items-center justify-between glass p-4">
      <div>
        <p className="text-sm font-medium text-slate-900">{workflow.name}</p>
        {workflow.description && <p className="text-xs text-slate-500 mt-0.5">{workflow.description}</p>}
      </div>
      <div className="flex items-center gap-3 shrink-0">
        {workflow.category && <span className="text-xs text-slate-400">{workflow.category}</span>}
        <button
          type="button"
          onClick={editable ? toggle : undefined}
          disabled={!editable}
          className={`relative h-5 w-9 rounded-full transition-colors ${workflow.enabled ? "bg-emerald-500" : "bg-slate-200"} ${editable ? "cursor-pointer" : "cursor-default"}`}
        >
          <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform ${workflow.enabled ? "translate-x-4" : "translate-x-0.5"}`} />
        </button>
      </div>
    </div>
  );
}
