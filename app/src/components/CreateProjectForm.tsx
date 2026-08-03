"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, X } from "lucide-react";

export function CreateProjectForm({
  suppliers,
  budgetCategories,
}: {
  suppliers: { id: string; name: string }[];
  budgetCategories: { id: string; category: string }[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [supplierId, setSupplierId] = useState("");
  const [budgetCategoryId, setBudgetCategoryId] = useState("");
  const [budgetAmount, setBudgetAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 text-xs font-medium text-white bg-accent-600 hover:bg-accent-700 rounded-full px-3 py-1.5"
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
        budgetCategoryId: budgetCategoryId || null,
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
    <form onSubmit={submit} className="flex flex-wrap items-center gap-2 glass p-3">
      <input
        autoFocus
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Project name"
        className="rounded border border-neutral-200 px-2 py-1 text-xs outline-none focus:border-accent-500"
      />
      <select value={supplierId} onChange={(e) => setSupplierId(e.target.value)} className="rounded border border-neutral-200 px-2 py-1 text-xs">
        <option value="">No supplier</option>
        {suppliers.map((s) => (
          <option key={s.id} value={s.id}>{s.name}</option>
        ))}
      </select>
      <select value={budgetCategoryId} onChange={(e) => setBudgetCategoryId(e.target.value)} className="rounded border border-neutral-200 px-2 py-1 text-xs">
        <option value="">No budget category</option>
        {budgetCategories.map((b) => (
          <option key={b.id} value={b.id}>{b.category}</option>
        ))}
      </select>
      <input
        value={budgetAmount}
        onChange={(e) => setBudgetAmount(e.target.value)}
        placeholder="Budget ($)"
        type="number"
        className="rounded border border-neutral-200 px-2 py-1 text-xs w-28 outline-none focus:border-accent-500"
      />
      <button
        type="submit"
        disabled={submitting || !name.trim()}
        className="text-xs font-medium rounded-full px-3 py-1.5 text-white bg-accent-600 hover:bg-accent-700 disabled:bg-neutral-300"
      >
        Create
      </button>
      <button type="button" onClick={() => setOpen(false)} className="text-slate-400 hover:text-slate-600">
        <X size={14} />
      </button>
    </form>
  );
}
