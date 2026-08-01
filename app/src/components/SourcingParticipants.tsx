"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { UserPlus } from "lucide-react";
import { SOURCING_PARTICIPANT_STATUS_LABELS, toOptions } from "@/lib/labels";
import type { SourcingParticipantStatus } from "@/generated/prisma/enums";

type Participant = {
  id: string;
  status: SourcingParticipantStatus;
  supplier: { id: string; name: string };
};

export function SourcingParticipants({
  sourcingEventId,
  initialParticipants,
  suppliers,
  editable,
}: {
  sourcingEventId: string;
  initialParticipants: Participant[];
  suppliers: { id: string; name: string }[];
  editable: boolean;
}) {
  const [participants, setParticipants] = useState(initialParticipants);
  const [inviteSupplierId, setInviteSupplierId] = useState("");

  const availableSuppliers = useMemo(
    () => suppliers.filter((s) => !participants.some((p) => p.supplier.id === s.id)),
    [suppliers, participants]
  );

  const invite = async () => {
    if (!inviteSupplierId) return;
    const response = await fetch(`/api/sourcing/${sourcingEventId}/participants`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ supplierId: inviteSupplierId }),
    });
    if (response.ok) {
      const participant = await response.json();
      setParticipants((prev) => [...prev, participant]);
      setInviteSupplierId("");
    }
  };

  const updateStatus = async (participantId: string, status: string) => {
    const response = await fetch(`/api/sourcing/${sourcingEventId}/participants/${participantId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (response.ok) {
      const updated = await response.json();
      setParticipants((prev) => prev.map((p) => (p.id === participantId ? updated : p)));
    }
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Participating suppliers ({participants.length})</p>
        {editable && availableSuppliers.length > 0 && (
          <div className="flex items-center gap-1.5">
            <select value={inviteSupplierId} onChange={(e) => setInviteSupplierId(e.target.value)} className="rounded border border-slate-200 px-2 py-1 text-xs">
              <option value="">Invite a supplier…</option>
              {availableSuppliers.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
            <button type="button" onClick={invite} disabled={!inviteSupplierId} className="text-[#2563EB] disabled:text-slate-300">
              <UserPlus size={16} />
            </button>
          </div>
        )}
      </div>

      {participants.length === 0 ? (
        <p className="text-xs text-slate-400 italic">No suppliers invited yet.</p>
      ) : (
        <div className="space-y-2">
          {participants.map((p) => (
            <div key={p.id} className="flex items-center justify-between rounded-lg bg-slate-50 border border-slate-200 px-3 py-2">
              <Link href={`/suppliers/${p.supplier.id}`} className="text-xs font-medium text-slate-700 hover:text-[#2563EB]">
                {p.supplier.name}
              </Link>
              {editable ? (
                <select value={p.status} onChange={(e) => updateStatus(p.id, e.target.value)} className="rounded border border-slate-200 px-1.5 py-0.5 text-xs bg-white">
                  {toOptions(SOURCING_PARTICIPANT_STATUS_LABELS).map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              ) : (
                <span className="text-xs text-slate-500">{SOURCING_PARTICIPANT_STATUS_LABELS[p.status]}</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
