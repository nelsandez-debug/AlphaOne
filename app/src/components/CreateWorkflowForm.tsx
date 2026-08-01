"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, X } from "lucide-react";

export function CreateWorkflowForm() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 text-xs font-medium text-white bg-[#0B1220] hover:bg-slate-800 rounded-lg px-3 py-1.5"
      >
        <Plus size={13} /> New workflow config
      </button>
    );
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSubmitting(true);
    setError(null);
    const response = await fetch("/api/workflows", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name.trim(), category: category.trim() || null, description: description.trim() || null }),
    });
    setSubmitting(false);
    if (response.ok) {
      setOpen(false);
      setName("");
      setCategory("");
      setDescription("");
      router.refresh();
    } else {
      const data = await response.json().catch(() => ({}));
      setError(data.error ?? "Something went wrong");
    }
  };

  return (
    <form onSubmit={submit} className="flex flex-col gap-2 rounded-lg border border-slate-200 bg-white p-3 max-w-md">
      <input
        autoFocus
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Name"
        className="rounded border border-slate-200 px-2 py-1 text-xs outline-none focus:border-[#2563EB]"
      />
      <input
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        placeholder="Category (optional)"
        className="rounded border border-slate-200 px-2 py-1 text-xs outline-none focus:border-[#2563EB]"
      />
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        rows={2}
        placeholder="Description (optional)"
        className="rounded border border-slate-200 px-2 py-1 text-xs outline-none focus:border-[#2563EB] resize-none"
      />
      <div className="flex items-center gap-2">
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
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </form>
  );
}
