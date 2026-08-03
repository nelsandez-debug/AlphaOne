"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, X } from "lucide-react";

export function CreateInvoiceForm({
  suppliers,
  purchaseOrders,
  defaultSupplierId,
}: {
  suppliers: { id: string; name: string }[];
  purchaseOrders: { id: string; supplierId: string; amount: number }[];
  defaultSupplierId?: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [supplierId, setSupplierId] = useState(defaultSupplierId ?? suppliers[0]?.id ?? "");
  const [purchaseOrderId, setPurchaseOrderId] = useState("");
  const [amount, setAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const poOptions = useMemo(() => purchaseOrders.filter((p) => p.supplierId === supplierId), [purchaseOrders, supplierId]);

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        disabled={suppliers.length === 0}
        className="inline-flex items-center gap-1.5 text-xs font-medium text-white bg-accent-600 hover:bg-accent-700 disabled:bg-neutral-300 rounded-full px-3 py-1.5"
      >
        <Plus size={13} /> New invoice
      </button>
    );
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = Number(amount);
    if (!supplierId || !amountNum) return;
    setSubmitting(true);
    const response = await fetch("/api/invoices", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ supplierId, purchaseOrderId: purchaseOrderId || null, amount: amountNum }),
    });
    setSubmitting(false);
    if (response.ok) {
      setOpen(false);
      setAmount("");
      router.refresh();
    }
  };

  return (
    <form onSubmit={submit} className="flex flex-wrap items-center gap-2 glass p-3">
      <select
        value={supplierId}
        onChange={(e) => {
          setSupplierId(e.target.value);
          setPurchaseOrderId("");
        }}
        className="rounded border border-neutral-200 px-2 py-1 text-xs"
      >
        {suppliers.map((s) => (
          <option key={s.id} value={s.id}>{s.name}</option>
        ))}
      </select>
      <select value={purchaseOrderId} onChange={(e) => setPurchaseOrderId(e.target.value)} className="rounded border border-neutral-200 px-2 py-1 text-xs">
        <option value="">No matching PO</option>
        {poOptions.map((p) => (
          <option key={p.id} value={p.id}>PO-{p.id.slice(-6).toUpperCase()} (${p.amount.toLocaleString()})</option>
        ))}
      </select>
      <input
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        placeholder="Amount ($)"
        type="number"
        className="rounded border border-neutral-200 px-2 py-1 text-xs w-28 outline-none focus:border-accent-500"
      />
      <button
        type="submit"
        disabled={submitting || !amount}
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
