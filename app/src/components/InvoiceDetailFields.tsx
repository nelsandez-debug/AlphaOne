"use client";

import { useRouter } from "next/navigation";
import { EditableText } from "@/components/EditableText";
import { EditableSelect } from "@/components/EditableSelect";
import { INVOICE_STATUS_LABELS, invoiceStatusBadgeClass, toOptions } from "@/lib/labels";
import type { Invoice } from "@/generated/prisma/client";

export function InvoiceDetailFields({ invoice, editable }: { invoice: Invoice; editable: boolean }) {
  const router = useRouter();

  const patch = async (data: Record<string, unknown>) => {
    const response = await fetch(`/api/invoices/${invoice.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (response.ok) router.refresh();
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
        <EditableSelect
          value={invoice.status}
          editable={editable}
          options={toOptions(INVOICE_STATUS_LABELS)}
          renderValue={(v) => (
            <span className={`inline-block rounded-full border px-2 py-0.5 text-xs ${invoiceStatusBadgeClass(v as Invoice["status"])}`}>
              {INVOICE_STATUS_LABELS[v as keyof typeof INVOICE_STATUS_LABELS]}
            </span>
          )}
          onSave={(status) => patch({ status })}
        />
        {invoice.matchConfidence != null && <span className="text-xs text-slate-500">{invoice.matchConfidence}% match confidence</span>}
      </div>

      <div className="flex items-center gap-2">
        {editable ? (
          <button
            type="button"
            onClick={() => patch({ onHold: !invoice.onHold, holdReason: invoice.onHold ? null : invoice.holdReason })}
            className={`text-xs font-medium rounded-lg px-3 py-1.5 ${invoice.onHold ? "bg-red-600 text-white hover:bg-red-700" : "border border-slate-200 text-slate-600 hover:bg-slate-50"}`}
          >
            {invoice.onHold ? "Release hold" : "Place on hold"}
          </button>
        ) : (
          invoice.onHold && <span className="text-xs font-medium text-red-600">On hold</span>
        )}
        {invoice.onHold && (
          <EditableText
            value={invoice.holdReason}
            editable={editable}
            placeholder="Hold reason"
            className="text-xs text-slate-500"
            onSave={(holdReason) => patch({ holdReason: holdReason || null })}
          />
        )}
      </div>
    </div>
  );
}
