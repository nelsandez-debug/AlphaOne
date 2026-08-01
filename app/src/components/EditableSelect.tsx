"use client";

import { useState } from "react";
import { Edit3 } from "lucide-react";

// Ported from the reference prototype's EditableSelect — used for tier, status,
// risk rating, criticality, etc. `options` are {value,label} so DB enum values
// (e.g. "UNDER_REVIEW") can render a friendlier label ("Under Review").
export function EditableSelect({
  value,
  options,
  onSave,
  renderValue,
  editable = true,
  allowClear = false,
  clearLabel = "Not assessed",
}: {
  value: string | null | undefined;
  options: { value: string; label: string }[];
  onSave: (value: string | null) => void | Promise<void>;
  renderValue?: (value: string | null | undefined) => React.ReactNode;
  editable?: boolean;
  allowClear?: boolean;
  clearLabel?: string;
}) {
  const [editing, setEditing] = useState(false);

  if (!editable) {
    return <>{renderValue ? renderValue(value) : <span>{value || clearLabel}</span>}</>;
  }

  if (editing) {
    return (
      <select
        autoFocus
        value={value ?? ""}
        onChange={(e) => {
          onSave(e.target.value || null);
          setEditing(false);
        }}
        onBlur={() => setEditing(false)}
        className="rounded border border-[#2563EB] px-1.5 py-0.5 text-xs outline-none bg-white"
      >
        {allowClear && <option value="">{clearLabel}</option>}
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setEditing(true)}
      className="group inline-flex items-center gap-1 hover:opacity-80"
      title="Click to edit"
    >
      {renderValue ? renderValue(value) : <span>{value || clearLabel}</span>}
      <Edit3 size={10} className="text-slate-300 opacity-0 group-hover:opacity-100 shrink-0" />
    </button>
  );
}
