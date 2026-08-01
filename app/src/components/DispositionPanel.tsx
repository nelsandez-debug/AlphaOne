"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { DISPOSITION_ACTIONS, canDisposition } from "@/lib/disposition";
import { CONTRACT_STATUS_LABELS, INTAKE_STAGE_LABELS, SERVICE_CRITICALITY_LABELS, SUPPLIER_STATUS_LABELS, SUPPLIER_TIER_LABELS, stageDotClass, toOptions } from "@/lib/labels";
import type { IntakeRequest } from "@/generated/prisma/client";

export function DispositionPanel({
  intakeRequest,
  suppliers,
  contracts,
}: {
  intakeRequest: IntakeRequest;
  suppliers: { id: string; name: string }[];
  contracts: { id: string; name: string; supplierId: string }[];
}) {
  const router = useRouter();
  const actions = DISPOSITION_ACTIONS[intakeRequest.type];
  const [actionId, setActionId] = useState(actions[0].id);
  const action = actions.find((a) => a.id === actionId)!;
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [supplierId, setSupplierId] = useState(suppliers[0]?.id ?? "");
  const [contractId, setContractId] = useState("");
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [tier, setTier] = useState(toOptions(SUPPLIER_TIER_LABELS)[0].value);
  const [supplierStatus, setSupplierStatus] = useState(toOptions(SUPPLIER_STATUS_LABELS)[0].value);
  const [contractType, setContractType] = useState("MSA");
  const [contractStatus, setContractStatus] = useState(toOptions(CONTRACT_STATUS_LABELS)[0].value);
  const [criticality, setCriticality] = useState(toOptions(SERVICE_CRITICALITY_LABELS)[0].value);

  const contractOptions = useMemo(() => contracts.filter((c) => c.supplierId === supplierId), [contracts, supplierId]);

  if (!canDisposition(intakeRequest.stage)) {
    return (
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-500">
        This request is in stage <strong>{INTAKE_STAGE_LABELS[intakeRequest.stage]}</strong> and has already been dispositioned.
      </div>
    );
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const body: Record<string, unknown> = { actionId, note: note.trim() || undefined };
    if (action.creates === "supplier") {
      body.supplier = { name, category, tier, status: supplierStatus };
    } else if (action.creates === "contract") {
      body.supplierId = supplierId;
      body.contract = { name, type: contractType, status: contractStatus };
    } else if (action.creates === "service") {
      body.supplierId = supplierId;
      body.contractId = contractId || undefined;
      body.service = { name, category, criticality };
    }

    const response = await fetch(`/api/intake/${intakeRequest.id}/disposition`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setSubmitting(false);
    if (response.ok) {
      router.refresh();
    } else {
      const data = await response.json().catch(() => ({}));
      setError(data.error ?? "Something went wrong");
    }
  };

  return (
    <form onSubmit={submit} className="rounded-xl border border-slate-200 bg-white p-5 space-y-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 flex items-center gap-1.5">
        <span className={`h-1.5 w-1.5 rounded-full ${stageDotClass(intakeRequest.stage)}`} /> Disposition
      </p>

      <select value={actionId} onChange={(e) => setActionId(e.target.value)} className="w-full rounded border border-slate-200 px-2 py-1.5 text-sm">
        {actions.map((a) => (
          <option key={a.id} value={a.id}>
            {a.label}
          </option>
        ))}
      </select>

      {action.creates === "supplier" && (
        <div className="grid grid-cols-2 gap-2">
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Supplier name" className="col-span-2 rounded border border-slate-200 px-2 py-1 text-xs" />
          <input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Category" className="rounded border border-slate-200 px-2 py-1 text-xs" />
          <select value={tier} onChange={(e) => setTier(e.target.value as typeof tier)} className="rounded border border-slate-200 px-2 py-1 text-xs">
            {toOptions(SUPPLIER_TIER_LABELS).map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
          <select value={supplierStatus} onChange={(e) => setSupplierStatus(e.target.value as typeof supplierStatus)} className="col-span-2 rounded border border-slate-200 px-2 py-1 text-xs">
            {toOptions(SUPPLIER_STATUS_LABELS).map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
      )}

      {action.creates === "contract" && (
        <div className="grid grid-cols-2 gap-2">
          <select value={supplierId} onChange={(e) => setSupplierId(e.target.value)} className="col-span-2 rounded border border-slate-200 px-2 py-1 text-xs">
            {suppliers.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Contract name" className="col-span-2 rounded border border-slate-200 px-2 py-1 text-xs" />
          <input value={contractType} onChange={(e) => setContractType(e.target.value)} placeholder="Type (MSA, NDA, ...)" className="rounded border border-slate-200 px-2 py-1 text-xs" />
          <select value={contractStatus} onChange={(e) => setContractStatus(e.target.value as typeof contractStatus)} className="rounded border border-slate-200 px-2 py-1 text-xs">
            {toOptions(CONTRACT_STATUS_LABELS).map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
      )}

      {action.creates === "service" && (
        <div className="grid grid-cols-2 gap-2">
          <select
            value={supplierId}
            onChange={(e) => {
              setSupplierId(e.target.value);
              setContractId("");
            }}
            className="col-span-2 rounded border border-slate-200 px-2 py-1 text-xs"
          >
            {suppliers.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
          <select value={contractId} onChange={(e) => setContractId(e.target.value)} className="col-span-2 rounded border border-slate-200 px-2 py-1 text-xs">
            <option value="">No governing contract yet</option>
            {contractOptions.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Service name" className="col-span-2 rounded border border-slate-200 px-2 py-1 text-xs" />
          <input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Category" className="rounded border border-slate-200 px-2 py-1 text-xs" />
          <select value={criticality} onChange={(e) => setCriticality(e.target.value as typeof criticality)} className="rounded border border-slate-200 px-2 py-1 text-xs">
            {toOptions(SERVICE_CRITICALITY_LABELS).map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
      )}

      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        rows={2}
        placeholder="Note (optional) — recorded on the audit trail"
        className="w-full rounded border border-slate-200 px-2 py-1.5 text-xs resize-none"
      />

      {error && <p className="text-xs text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="text-xs font-medium rounded-lg px-3 py-1.5 text-white bg-[#0B1220] hover:bg-slate-800 disabled:bg-slate-300"
      >
        Apply disposition
      </button>
    </form>
  );
}
