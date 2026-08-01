"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, X } from "lucide-react";

export function CreateSourcingEventForm() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [type, setType] = useState("RFP");
  const [submitting, setSubmitting] = useState(false);

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 text-xs font-medium text-white bg-[#0B1220] hover:bg-slate-800 rounded-lg px-3 py-1.5"
      >
        <Plus size={13} /> New sourcing event
      </button>
    );
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setSubmitting(true);
    const response = await fetch("/api/sourcing", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: title.trim(), type }),
    });
    setSubmitting(false);
    if (response.ok) {
      const created = await response.json();
      router.push(`/sourcing/${created.id}`);
    }
  };

  return (
    <form onSubmit={submit} className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white p-3">
      <input
        autoFocus
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Event title"
        className="rounded border border-slate-200 px-2 py-1 text-xs outline-none focus:border-[#2563EB]"
      />
      <input value={type} onChange={(e) => setType(e.target.value)} placeholder="Type (RFP, RFQ, RFI)" className="rounded border border-slate-200 px-2 py-1 text-xs w-32" />
      <button
        type="submit"
        disabled={submitting || !title.trim()}
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
