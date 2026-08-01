"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, X } from "lucide-react";

export function CreateProjectForm({ suppliers }: { suppliers: { id: string; name: string }[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [supplierId, setSupplierId] = useState("");
  const [budgetAmount, setBudgetAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 text-xs font-medium text-white bg-[#0B1220] hover:bg-slate-800 rounded-lg px-3 py-1.5"
      >
        <Plus size={13} /> New project
      </button>
    );
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSubmitting(true);
    const response = await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: name.trim(),
        supplierId: supplierId || null,
        budgetAmount: budgetAmount ? Number(budgetAmount) : null,
      }),
    });
    setSubmitting(false);
    if (response.ok) {
      const created = await response.json();
      router.push(`/projects/${created.id}`);
    }
  };

  return (
    <form onSubmit={submit} className="flex flex-wrap items-center gap-2 rounded-lg border border-slate-200 bg-white p-3">
      <input
        autoFocus
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Project name"
        className="rounded border border-slate-200 px-2 py-1 text-xs outline-none focus:border-[#2563EB]"
      />
      <select value={supplierId} onChange={(e) => setSupplierId(e.target.value)} className="rounded border border-slate-200 px-2 py-1 text-xs">
        <option value="">No supplier</option>
        {suppliers.map((s) => (
          <option key={s.id} value={s.id}>{s.name}</option>
        ))}
      </select>
      <input
        value={budgetAmount}
        onChange={(e) => setBudgetAmount(e.target.value)}
        placeholder="Budget ($)"
        type="number"
        className="rounded border border-slate-200 px-2 py-1 text-xs w-28 outline-none focus:border-[#2563EB]"
      />
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
