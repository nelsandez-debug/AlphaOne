"use client";

import { useRouter } from "next/navigation";
import { EditableText } from "@/components/EditableText";
import { EditableSelect } from "@/components/EditableSelect";
import { PO_STATUS_LABELS, PO_TYPE_LABELS, toOptions } from "@/lib/labels";
import type { PurchaseOrder } from "@/generated/prisma/client";

export function PODetailFields({ order, editable }: { order: PurchaseOrder; editable: boolean }) {
  const router = useRouter();

  const patch = async (data: Record<string, unknown>) => {
    const response = await fetch(`/api/purchase-orders/${order.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (response.ok) router.refresh();
  };

  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
      <EditableSelect
        value={order.type}
        editable={editable}
        options={toOptions(PO_TYPE_LABELS)}
        renderValue={(v) => <span className="rounded-full border border-neutral-200 bg-neutral-100 px-2 py-0.5 text-xs">{PO_TYPE_LABELS[v as keyof typeof PO_TYPE_LABELS]}</span>}
        onSave={(type) => patch({ type })}
      />
      <EditableSelect
        value={order.status}
        editable={editable}
        options={toOptions(PO_STATUS_LABELS)}
        renderValue={(v) => <span className="rounded-full border border-neutral-200 bg-neutral-100 px-2 py-0.5 text-xs">{PO_STATUS_LABELS[v as keyof typeof PO_STATUS_LABELS]}</span>}
        onSave={(status) => patch({ status })}
      />
      <span className="text-xs text-slate-400">Amount</span>
      <EditableText
        value={String(order.amount)}
        editable={editable}
        onSave={(value) => patch({ amount: Number(value) || 0 })}
      />
    </div>
  );
}
