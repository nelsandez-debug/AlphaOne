"use client";

import { useRouter } from "next/navigation";
import { EditableText } from "@/components/EditableText";
import { EditableSelect } from "@/components/EditableSelect";
import { RISK_LEVEL_LABELS, SUPPLIER_STATUS_LABELS, SUPPLIER_TIER_LABELS, riskBadgeClass, toOptions } from "@/lib/labels";
import type { Supplier } from "@/generated/prisma/client";

export function SupplierHeaderFields({ supplier, editable }: { supplier: Supplier; editable: boolean }) {
  const router = useRouter();

  const patch = async (data: Partial<Supplier>) => {
    const response = await fetch(`/api/suppliers/${supplier.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (response.ok) router.refresh();
  };

  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
      <EditableText
        value={supplier.category}
        editable={editable}
        className="text-slate-600"
        onSave={(category) => patch({ category })}
      />
      <EditableSelect
        value={supplier.tier}
        editable={editable}
        options={toOptions(SUPPLIER_TIER_LABELS)}
        renderValue={(v) => <span className="rounded-full border border-neutral-200 bg-neutral-100 px-2 py-0.5 text-xs">{SUPPLIER_TIER_LABELS[v as keyof typeof SUPPLIER_TIER_LABELS]}</span>}
        onSave={(tier) => patch({ tier: tier as Supplier["tier"] })}
      />
      <EditableSelect
        value={supplier.status}
        editable={editable}
        options={toOptions(SUPPLIER_STATUS_LABELS)}
        renderValue={(v) => <span className="rounded-full border border-neutral-200 bg-neutral-100 px-2 py-0.5 text-xs">{SUPPLIER_STATUS_LABELS[v as keyof typeof SUPPLIER_STATUS_LABELS]}</span>}
        onSave={(status) => patch({ status: status as Supplier["status"] })}
      />
      <EditableSelect
        value={supplier.riskLevel}
        editable={editable}
        allowClear
        clearLabel="Not assessed"
        options={toOptions(RISK_LEVEL_LABELS)}
        renderValue={(v) => (
          <span className={`inline-block rounded-full border px-2 py-0.5 text-xs ${riskBadgeClass(v as Supplier["riskLevel"])}`}>
            {v ? RISK_LEVEL_LABELS[v as keyof typeof RISK_LEVEL_LABELS] : "Not assessed"}
          </span>
        )}
        onSave={(riskLevel) => patch({ riskLevel: riskLevel as Supplier["riskLevel"] })}
      />
    </div>
  );
}
