"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, X } from "lucide-react";

export function CreateVendorSlaForm({ suppliers }: { suppliers: { id: string; name: string }[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [supplierId, setSupplierId] = useState(suppliers[0]?.id ?? "");
  const [metric, setMetric] = useState("");
  const [target, setTarget] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className="inline-flex items-center gap-1.5 text-xs font-medium text-[#2563EB] hover:underline">
        <Plus size={13} /> Establish SLA
      </button>
    );
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supplierId || !metric.trim() || !target.trim()) return;
    setSubmitting(true);
    const response = await fetch("/api/vendor-slas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ supplierId, metric: metric.trim(), target: target.trim() }),
    });
    setSubmitting(false);
    if (response.ok) {
      setOpen(false);
      setMetric("");
      setTarget("");
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
      <input value={metric} onChange={(e) => setMetric(e.target.value)} placeholder="Metric (e.g. Uptime)" className="rounded border border-slate-200 px-2 py-1 text-xs" />
      <input value={target} onChange={(e) => setTarget(e.target.value)} placeholder="Target (e.g. 99.9%)" className="rounded border border-slate-200 px-2 py-1 text-xs w-28" />
      <button type="submit" disabled={submitting} className="text-xs font-medium rounded-lg px-3 py-1.5 text-white bg-[#0B1220] hover:bg-slate-800 disabled:bg-slate-300">
        Create
      </button>
      <button type="button" onClick={() => setOpen(false)} className="text-slate-400 hover:text-slate-600">
        <X size={14} />
      </button>
    </form>
  );
}
