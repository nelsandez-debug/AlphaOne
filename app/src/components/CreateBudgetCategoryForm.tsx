"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, X } from "lucide-react";

export function CreateBudgetCategoryForm() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState("");
  const [allocated, setAllocated] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 text-xs font-medium text-white bg-[#0B1220] hover:bg-slate-800 rounded-lg px-3 py-1.5"
      >
        <Plus size={13} /> New category
      </button>
    );
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const allocatedNum = Number(allocated);
    if (!category.trim() || !allocatedNum) return;
    setSubmitting(true);
    setError(null);
    const response = await fetch("/api/budget", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ category: category.trim(), allocated: allocatedNum }),
    });
    setSubmitting(false);
    if (response.ok) {
      setOpen(false);
      setCategory("");
      setAllocated("");
      router.refresh();
    } else {
      const data = await response.json().catch(() => ({}));
      setError(data.error ?? "Something went wrong");
    }
  };

  return (
    <form onSubmit={submit} className="flex flex-wrap items-center gap-2 rounded-lg border border-slate-200 bg-white p-3">
      <input
        autoFocus
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        placeholder="Category name"
        className="rounded border border-slate-200 px-2 py-1 text-xs outline-none focus:border-[#2563EB]"
      />
      <input
        value={allocated}
        onChange={(e) => setAllocated(e.target.value)}
        placeholder="Allocated ($)"
        type="number"
        className="rounded border border-slate-200 px-2 py-1 text-xs w-32 outline-none focus:border-[#2563EB]"
      />
      <button
        type="submit"
        disabled={submitting || !category.trim() || !allocated}
        className="text-xs font-medium rounded-lg px-3 py-1.5 text-white bg-[#0B1220] hover:bg-slate-800 disabled:bg-slate-300"
      >
        Create
      </button>
      <button type="button" onClick={() => setOpen(false)} className="text-slate-400 hover:text-slate-600">
        <X size={14} />
      </button>
      {error && <p className="text-xs text-red-600 w-full">{error}</p>}
    </form>
  );
}
