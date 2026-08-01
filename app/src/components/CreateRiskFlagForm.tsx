"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, X } from "lucide-react";
import { RISK_LEVEL_LABELS, toOptions } from "@/lib/labels";

export function CreateRiskFlagForm({ suppliers }: { suppliers: { id: string; name: string }[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [supplierId, setSupplierId] = useState(suppliers[0]?.id ?? "");
  const [type, setType] = useState("");
  const [severity, setSeverity] = useState(toOptions(RISK_LEVEL_LABELS)[0].value);
  const [detail, setDetail] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        disabled={suppliers.length === 0}
        className="inline-flex items-center gap-1.5 text-xs font-medium text-white bg-[#0B1220] hover:bg-slate-800 disabled:bg-slate-300 rounded-lg px-3 py-1.5"
      >
        <Plus size={13} /> Flag a risk
      </button>
    );
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supplierId || !type.trim() || !detail.trim()) return;
    setSubmitting(true);
    const response = await fetch("/api/risk-flags", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ supplierId, type: type.trim(), severity, detail: detail.trim() }),
    });
    setSubmitting(false);
    if (response.ok) {
      setOpen(false);
      setType("");
      setDetail("");
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
      <input value={type} onChange={(e) => setType(e.target.value)} placeholder="Type (Compliance, Financial, ...)" className="rounded border border-slate-200 px-2 py-1 text-xs w-48" />
      <select value={severity} onChange={(e) => setSeverity(e.target.value as typeof severity)} className="rounded border border-slate-200 px-2 py-1 text-xs">
        {toOptions(RISK_LEVEL_LABELS).map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      <input value={detail} onChange={(e) => setDetail(e.target.value)} placeholder="Detail" className="rounded border border-slate-200 px-2 py-1 text-xs flex-1 min-w-48" />
      <button
        type="submit"
        disabled={submitting || !type.trim() || !detail.trim()}
        className="text-xs font-medium rounded-lg px-3 py-1.5 text-white bg-[#0B1220] hover:bg-slate-800 disabled:bg-slate-300"
      >
        Flag
      </button>
      <button type="button" onClick={() => setOpen(false)} className="text-slate-400 hover:text-slate-600">
        <X size={14} />
      </button>
    </form>
  );
}
