"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, X } from "lucide-react";
import { INTAKE_REQUEST_TYPE_LABELS, toOptions } from "@/lib/labels";

export function CreateIntakeForm() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [type, setType] = useState(toOptions(INTAKE_REQUEST_TYPE_LABELS)[0].value);
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 text-xs font-medium text-white bg-accent-600 hover:bg-accent-700 rounded-full px-3 py-1.5"
      >
        <Plus size={13} /> New request
      </button>
    );
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setSubmitting(true);
    const response = await fetch("/api/intake", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: title.trim(), type, category: category.trim() || null, description: description.trim() || null }),
    });
    setSubmitting(false);
    if (response.ok) {
      const created = await response.json();
      router.push(`/intake/${created.id}`);
    }
  };

  return (
    <form onSubmit={submit} className="flex flex-col gap-2 glass p-3 w-full max-w-md">
      <input
        autoFocus
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="What do you need?"
        className="rounded border border-neutral-200 px-2 py-1 text-xs outline-none focus:border-accent-500"
      />
      <div className="flex gap-2">
        <select value={type} onChange={(e) => setType(e.target.value as typeof type)} className="rounded border border-neutral-200 px-2 py-1 text-xs flex-1">
          {toOptions(INTAKE_REQUEST_TYPE_LABELS).map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <input
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          placeholder="Category"
          className="rounded border border-neutral-200 px-2 py-1 text-xs flex-1 outline-none focus:border-accent-500"
        />
      </div>
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        rows={2}
        placeholder="Description / business justification"
        className="rounded border border-neutral-200 px-2 py-1 text-xs outline-none focus:border-accent-500 resize-none"
      />
      <div className="flex items-center gap-2">
        <button
          type="submit"
          disabled={submitting || !title.trim()}
          className="text-xs font-medium rounded-full px-3 py-1.5 text-white bg-accent-600 hover:bg-accent-700 disabled:bg-neutral-300"
        >
          Submit request
        </button>
        <button type="button" onClick={() => setOpen(false)} className="text-slate-400 hover:text-slate-600">
          <X size={14} />
        </button>
      </div>
    </form>
  );
}
