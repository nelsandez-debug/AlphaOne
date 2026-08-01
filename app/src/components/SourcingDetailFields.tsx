"use client";

import { useRouter } from "next/navigation";
import { EditableText } from "@/components/EditableText";
import { EditableSelect } from "@/components/EditableSelect";
import { SOURCING_STAGE_LABELS, toOptions } from "@/lib/labels";
import type { SourcingEvent } from "@/generated/prisma/client";

export function SourcingTitleField({ event, editable }: { event: SourcingEvent; editable: boolean }) {
  const router = useRouter();
  return (
    <EditableText
      value={event.title}
      editable={editable}
      className="text-xl font-semibold text-slate-900"
      onSave={async (title) => {
        const response = await fetch(`/api/sourcing/${event.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title }),
        });
        if (response.ok) router.refresh();
      }}
    />
  );
}

export function SourcingDetailFields({ event, editable }: { event: SourcingEvent; editable: boolean }) {
  const router = useRouter();

  const patch = async (data: Record<string, unknown>) => {
    const response = await fetch(`/api/sourcing/${event.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (response.ok) router.refresh();
  };

  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
      <EditableText value={event.type} editable={editable} placeholder="No type" className="text-slate-600" onSave={(type) => patch({ type: type || null })} />
      <EditableSelect
        value={event.stage}
        editable={editable}
        options={toOptions(SOURCING_STAGE_LABELS)}
        renderValue={(v) => <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs">{SOURCING_STAGE_LABELS[v as keyof typeof SOURCING_STAGE_LABELS]}</span>}
        onSave={(stage) => patch({ stage })}
      />
      <span className="text-xs text-slate-400">Est. savings</span>
      <EditableText
        value={event.estimatedSavings != null ? String(event.estimatedSavings) : null}
        editable={editable}
        placeholder="unset"
        onSave={(value) => patch({ estimatedSavings: value ? Number(value) : null })}
      />
    </div>
  );
}
