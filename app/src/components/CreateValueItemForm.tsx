"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, X } from "lucide-react";
import { VALUE_TYPE_LABELS, toOptions } from "@/lib/labels";

export function CreateValueItemForm({
  suppliers,
  contracts,
  purchaseOrders,
}: {
  suppliers: { id: string; name: string }[];
  contracts: { id: string; name: string; supplierId: string }[];
  purchaseOrders: { id: string; supplierId: string; amount: number }[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [type, setType] = useState(toOptions(VALUE_TYPE_LABELS)[0].value);
  const [amount, setAmount] = useState("");
  const [supplierId, setSupplierId] = useState(suppliers[0]?.id ?? "");
  const [contractId, setContractId] = useState("");
  const [purchaseOrderId, setPurchaseOrderId] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const contractOptions = useMemo(() => contracts.filter((c) => c.supplierId === supplierId), [contracts, supplierId]);
  const poOptions = useMemo(() => purchaseOrders.filter((p) => p.supplierId === supplierId), [purchaseOrders, supplierId]);

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        disabled={suppliers.length === 0}
        className="inline-flex items-center gap-1.5 text-xs font-medium text-white bg-accent-600 hover:bg-accent-700 disabled:bg-neutral-300 rounded-full px-3 py-1.5"
      >
        <Plus size={13} /> Submit value item
      </button>
    );
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = Number(amount);
    if (!title.trim() || !amountNum || !supplierId) return;
    setSubmitting(true);
    const response = await fetch("/api/value-tracking", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: title.trim(),
        type,
        amount: amountNum,
        supplierId,
        contractId: contractId || null,
        purchaseOrderId: purchaseOrderId || null,
      }),
    });
    setSubmitting(false);
    if (response.ok) {
      const created = await response.json();
      router.push(`/value-tracking/${created.id}`);
    }
  };

  return (
    <form onSubmit={submit} className="flex flex-wrap items-center gap-2 glass p-3">
      <input
        autoFocus
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="What did you achieve?"
        className="rounded border border-neutral-200 px-2 py-1 text-xs outline-none focus:border-accent-500 w-64"
      />
      <select value={type} onChange={(e) => setType(e.target.value as typeof type)} className="rounded border border-neutral-200 px-2 py-1 text-xs">
        {toOptions(VALUE_TYPE_LABELS).map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      <input
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        placeholder="Amount ($)"
        type="number"
        className="rounded border border-neutral-200 px-2 py-1 text-xs w-28 outline-none focus:border-accent-500"
      />
      <select
        value={supplierId}
        onChange={(e) => {
          setSupplierId(e.target.value);
          setContractId("");
          setPurchaseOrderId("");
        }}
        className="rounded border border-neutral-200 px-2 py-1 text-xs"
      >
        {suppliers.map((s) => (
          <option key={s.id} value={s.id}>{s.name}</option>
        ))}
      </select>
      <select value={contractId} onChange={(e) => setContractId(e.target.value)} className="rounded border border-neutral-200 px-2 py-1 text-xs">
        <option value="">No contract</option>
        {contractOptions.map((c) => (
          <option key={c.id} value={c.id}>{c.name}</option>
        ))}
      </select>
      <select value={purchaseOrderId} onChange={(e) => setPurchaseOrderId(e.target.value)} className="rounded border border-neutral-200 px-2 py-1 text-xs">
        <option value="">No PO</option>
        {poOptions.map((p) => (
          <option key={p.id} value={p.id}>PO-{p.id.slice(-6).toUpperCase()}</option>
        ))}
      </select>
      <button
        type="submit"
        disabled={submitting || !title.trim() || !amount}
        className="text-xs font-medium rounded-full px-3 py-1.5 text-white bg-accent-600 hover:bg-accent-700 disabled:bg-neutral-300"
      >
        Submit
      </button>
      <button type="button" onClick={() => setOpen(false)} className="text-slate-400 hover:text-slate-600">
        <X size={14} />
      </button>
    </form>
  );
}
