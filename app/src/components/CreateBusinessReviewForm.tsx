"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, X } from "lucide-react";
import { BUSINESS_REVIEW_TYPE_LABELS, toOptions } from "@/lib/labels";

export function CreateBusinessReviewForm({ suppliers }: { suppliers: { id: string; name: string }[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [supplierId, setSupplierId] = useState(suppliers[0]?.id ?? "");
  const [type, setType] = useState(toOptions(BUSINESS_REVIEW_TYPE_LABELS)[0].value);
  const [scheduledDate, setScheduledDate] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className="inline-flex items-center gap-1.5 text-xs font-medium text-[#2563EB] hover:underline">
        <Plus size={13} /> Schedule review
      </button>
    );
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supplierId || !scheduledDate) return;
    setSubmitting(true);
    const response = await fetch("/api/business-reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ supplierId, type, scheduledDate }),
    });
    setSubmitting(false);
    if (response.ok) {
      setOpen(false);
      setScheduledDate("");
      router.refresh();
    }
  };

  return (
    <form onSubmit={submit} className="flex flex-wrap items-center gap-2 rounded-lg border border-slate-200 bg-white p-3">
      <select value={supplierId} onChange={(e) => setSupplierId(e.target.value)} className="rounded border border-slate-200 px-2 py-1 text-xs">
        {suppliers.map((s) => (
          <option key={s.id} value={s.id}>{s.name}</option>
        ))}
      </select>
      <select value={type} onChange={(e) => setType(e.target.value as typeof type)} className="rounded border border-slate-200 px-2 py-1 text-xs">
        {toOptions(BUSINESS_REVIEW_TYPE_LABELS).map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      <input type="date" value={scheduledDate} onChange={(e) => setScheduledDate(e.target.value)} className="rounded border border-slate-200 px-2 py-1 text-xs" />
      <button type="submit" disabled={submitting} className="text-xs font-medium rounded-lg px-3 py-1.5 text-white bg-[#0B1220] hover:bg-slate-800 disabled:bg-slate-300">
        Create
      </button>
      <button type="button" onClick={() => setOpen(false)} className="text-slate-400 hover:text-slate-600">
        <X size={14} />
      </button>
    </form>
  );
}
