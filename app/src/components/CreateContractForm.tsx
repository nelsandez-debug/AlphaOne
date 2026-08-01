"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, X } from "lucide-react";
import { CONTRACT_STATUS_LABELS, toOptions } from "@/lib/labels";

export function CreateContractForm({
  suppliers,
  defaultSupplierId,
}: {
  suppliers: { id: string; name: string }[];
  defaultSupplierId?: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [supplierId, setSupplierId] = useState(defaultSupplierId ?? suppliers[0]?.id ?? "");
  const [name, setName] = useState("");
  const [type, setType] = useState("MSA");
  const [status, setStatus] = useState(toOptions(CONTRACT_STATUS_LABELS)[0].value);
  const [submitting, setSubmitting] = useState(false);

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        disabled={suppliers.length === 0}
        className="inline-flex items-center gap-1.5 text-xs font-medium text-white bg-[#0B1220] hover:bg-slate-800 disabled:bg-slate-300 rounded-lg px-3 py-1.5"
      >
        <Plus size={13} /> New contract
      </button>
    );
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !supplierId) return;
    setSubmitting(true);
    const response = await fetch("/api/contracts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ supplierId, name: name.trim(), type, status }),
    });
    setSubmitting(false);
    if (response.ok) {
      setOpen(false);
      setName("");
      router.refresh();
    }
  };

  return (
    <form onSubmit={submit} className="flex flex-wrap items-center gap-2 rounded-lg border border-slate-200 bg-white p-3">
      <select value={supplierId} onChange={(e) => setSupplierId(e.target.value)} className="rounded border border-slate-200 px-2 py-1 text-xs">
        {suppliers.map((s) => (
          <option key={s.id} value={s.id}>
            {s.name}
          </option>
        ))}
      </select>
      <input
        autoFocus
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Contract name"
        className="rounded border border-slate-200 px-2 py-1 text-xs outline-none focus:border-[#2563EB]"
      />
      <input
        value={type}
        onChange={(e) => setType(e.target.value)}
        placeholder="Type (MSA, NDA, DPA, ...)"
        className="rounded border border-slate-200 px-2 py-1 text-xs outline-none focus:border-[#2563EB]"
      />
      <select value={status} onChange={(e) => setStatus(e.target.value as typeof status)} className="rounded border border-slate-200 px-2 py-1 text-xs">
        {toOptions(CONTRACT_STATUS_LABELS).map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <button
        type="submit"
        disabled={submitting || !name.trim()}
        className="text-xs font-medium rounded-lg px-3 py-1.5 text-white bg-[#0B1220] hover:bg-slate-800 disabled:bg-slate-300"
      >
        Create
      </button>
      <button type="button" onClick={() => setOpen(false)} className="text-slate-400 hover:text-slate-600">
        <X size={14} />
      </button>
    </form>
  );
}
