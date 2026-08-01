"use client";

import { useState } from "react";
import { Edit3, User as UserIcon } from "lucide-react";

type UserOption = { id: string; name: string; role: string };

// Ownership as a first-class, editable field, backed by the shared polymorphic
// Ownership table (Phase 1) via /api/modules/[moduleKey]/ownership.
export function OwnershipField({
  moduleKey,
  recordType,
  recordId,
  initialOwner,
  editable = true,
}: {
  moduleKey: string;
  recordType: string;
  recordId: string;
  initialOwner: { id: string; name: string } | null;
  editable?: boolean;
}) {
  const [owner, setOwner] = useState(initialOwner);
  const [editing, setEditing] = useState(false);
  const [options, setOptions] = useState<UserOption[] | null>(null);

  const startEditing = async () => {
    setEditing(true);
    if (!options) {
      const response = await fetch("/api/users");
      if (response.ok) setOptions(await response.json());
    }
  };

  const assign = async (ownerId: string) => {
    setEditing(false);
    if (!ownerId) return;
    const response = await fetch(`/api/modules/${moduleKey}/ownership`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ recordType, recordId, ownerId }),
    });
    if (response.ok) {
      const ownership = await response.json();
      setOwner(ownership.owner);
    }
  };

  if (!editable) {
    return (
      <span className="inline-flex items-center gap-1 text-sm text-slate-700">
        <UserIcon size={12} className="text-slate-400" />
        {owner?.name ?? "Unassigned"}
      </span>
    );
  }

  if (editing) {
    return (
      <select
        autoFocus
        value={owner?.id ?? ""}
        onChange={(e) => assign(e.target.value)}
        onBlur={() => setEditing(false)}
        className="rounded border border-[#2563EB] px-1.5 py-0.5 text-xs outline-none bg-white"
      >
        <option value="" disabled>
          {options ? "Select owner…" : "Loading…"}
        </option>
        {options?.map((o) => (
          <option key={o.id} value={o.id}>
            {o.name} ({o.role})
          </option>
        ))}
      </select>
    );
  }

  return (
    <button
      type="button"
      onClick={startEditing}
      className="group inline-flex items-center gap-1 text-sm text-slate-700 hover:opacity-80"
      title="Click to reassign"
    >
      <UserIcon size={12} className="text-slate-400" />
      {owner?.name ?? <span className="italic text-slate-400">Unassigned</span>}
      <Edit3 size={10} className="text-slate-300 opacity-0 group-hover:opacity-100 shrink-0" />
    </button>
  );
}
