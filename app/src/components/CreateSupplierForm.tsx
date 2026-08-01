"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, X } from "lucide-react";
import { SUPPLIER_STATUS_LABELS, SUPPLIER_TIER_LABELS, toOptions } from "@/lib/labels";

export function CreateSupplierForm() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [tier, setTier] = useState(toOptions(SUPPLIER_TIER_LABELS)[0].value);
  const [status, setStatus] = useState(toOptions(SUPPLIER_STATUS_LABELS)[0].value);
  const [submitting, setSubmitting] = useState(false);

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 text-xs font-medium text-white bg-[#0B1220] hover:bg-slate-800 rounded-lg px-3 py-1.5"
      >
        <Plus size={13} /> New supplier
      </button>
    );
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !category.trim()) return;
    setSubmitting(true);
    const response = await fetch("/api/suppliers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name.trim(), category: category.trim(), tier, status }),
    });
    setSubmitting(false);
    if (response.ok) {
      setOpen(false);
      setName("");
      setCategory("");
      router.refresh();
    }
  };

  return (
    <form onSubmit={submit} className="flex flex-wrap items-center gap-2 rounded-lg border border-slate-200 bg-white p-3">
      <input
        autoFocus
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Supplier name"
        className="rounded border border-slate-200 px-2 py-1 text-xs outline-none focus:border-[#2563EB]"
      />
      <input
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        placeholder="Category"
        className="rounded border border-slate-200 px-2 py-1 text-xs outline-none focus:border-[#2563EB]"
      />
      <select value={tier} onChange={(e) => setTier(e.target.value as typeof tier)} className="rounded border border-slate-200 px-2 py-1 text-xs">
        {toOptions(SUPPLIER_TIER_LABELS).map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <select value={status} onChange={(e) => setStatus(e.target.value as typeof status)} className="rounded border border-slate-200 px-2 py-1 text-xs">
        {toOptions(SUPPLIER_STATUS_LABELS).map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <button
        type="submit"
        disabled={submitting || !name.trim() || !category.trim()}
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
