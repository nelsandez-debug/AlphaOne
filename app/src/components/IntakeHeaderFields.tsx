"use client";

import { useRouter } from "next/navigation";
import { EditableText } from "@/components/EditableText";
import type { IntakeRequest } from "@/generated/prisma/client";

export function IntakeTitleField({ intakeRequest, editable }: { intakeRequest: IntakeRequest; editable: boolean }) {
  const router = useRouter();
  return (
    <EditableText
      value={intakeRequest.title}
      editable={editable}
      className="text-xl font-semibold text-slate-900"
      onSave={async (title) => {
        const response = await fetch(`/api/intake/${intakeRequest.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title }),
        });
        if (response.ok) router.refresh();
      }}
    />
  );
}

export function IntakeDetailFields({ intakeRequest, editable }: { intakeRequest: IntakeRequest; editable: boolean }) {
  const router = useRouter();

  const patch = async (data: Record<string, unknown>) => {
    const response = await fetch(`/api/intake/${intakeRequest.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (response.ok) router.refresh();
  };

  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
      <EditableText value={intakeRequest.category} editable={editable} placeholder="No category" className="text-slate-600" onSave={(category) => patch({ category: category || null })} />
      <span className="text-xs text-slate-400">Est. value</span>
      <EditableText
        value={intakeRequest.estimatedValue != null ? String(intakeRequest.estimatedValue) : null}
        editable={editable}
        placeholder="unset"
        onSave={(value) => patch({ estimatedValue: value ? Number(value) : null })}
      />
    </div>
  );
}
