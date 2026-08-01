"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, X } from "lucide-react";
import { SERVICE_CRITICALITY_LABELS, toOptions } from "@/lib/labels";

export function CreateServiceForm({
  suppliers,
  contracts,
  defaultSupplierId,
  defaultContractId,
}: {
  suppliers: { id: string; name: string }[];
  contracts: { id: string; name: string; supplierId: string }[];
  defaultSupplierId?: string;
  defaultContractId?: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [supplierId, setSupplierId] = useState(defaultSupplierId ?? suppliers[0]?.id ?? "");
  const [contractId, setContractId] = useState(defaultContractId ?? "");
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [criticality, setCriticality] = useState(toOptions(SERVICE_CRITICALITY_LABELS)[0].value);
  const [submitting, setSubmitting] = useState(false);

  const contractOptions = useMemo(() => contracts.filter((c) => c.supplierId === supplierId), [contracts, supplierId]);

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        disabled={suppliers.length === 0}
        className="inline-flex items-center gap-1.5 text-xs font-medium text-white bg-[#0B1220] hover:bg-slate-800 disabled:bg-slate-300 rounded-lg px-3 py-1.5"
      >
        <Plus size={13} /> New service
      </button>
    );
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !category.trim() || !supplierId) return;
    setSubmitting(true);
    const response = await fetch("/api/services", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ supplierId, contractId: contractId || null, name: name.trim(), category: category.trim(), criticality }),
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
      <select
        value={supplierId}
        onChange={(e) => {
          setSupplierId(e.target.value);
          setContractId("");
        }}
        className="rounded border border-slate-200 px-2 py-1 text-xs"
      >
        {suppliers.map((s) => (
          <option key={s.id} value={s.id}>
            {s.name}
          </option>
        ))}
      </select>
      <select value={contractId} onChange={(e) => setContractId(e.target.value)} className="rounded border border-slate-200 px-2 py-1 text-xs">
        <option value="">No governing contract yet</option>
        {contractOptions.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>
      <input
        autoFocus
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Service name"
        className="rounded border border-slate-200 px-2 py-1 text-xs outline-none focus:border-[#2563EB]"
      />
      <input
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        placeholder="Category"
        className="rounded border border-slate-200 px-2 py-1 text-xs outline-none focus:border-[#2563EB]"
      />
      <select value={criticality} onChange={(e) => setCriticality(e.target.value as typeof criticality)} className="rounded border border-slate-200 px-2 py-1 text-xs">
        {toOptions(SERVICE_CRITICALITY_LABELS).map((o) => (
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
