"use client";

import { useState } from "react";
import { Edit3 } from "lucide-react";

// Ported from the reference prototype's EditableText. `editable` is computed
// server-side (from requirePermission/canEdit), not decided by this component —
// this is the click-to-edit affordance, not the permission check.
export function EditableText({
  value,
  onSave,
  placeholder = "—",
  className = "",
  inputClassName = "",
  editable = true,
}: {
  value: string | null | undefined;
  onSave: (value: string) => void | Promise<void>;
  placeholder?: string;
  className?: string;
  inputClassName?: string;
  editable?: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value ?? "");

  if (!editable) {
    return <span className={className}>{value || placeholder}</span>;
  }

  if (editing) {
    const commit = () => {
      onSave(draft.trim());
      setEditing(false);
    };
    return (
      <input
        autoFocus
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === "Enter") commit();
          if (e.key === "Escape") {
            setDraft(value ?? "");
            setEditing(false);
          }
        }}
        className={`rounded border border-accent-500 px-1.5 py-0.5 outline-none ${inputClassName || className}`}
      />
    );
  }

  return (
    <button
      type="button"
      onClick={() => {
        setDraft(value ?? "");
        setEditing(true);
      }}
      className={`group inline-flex items-center gap-1 text-left hover:bg-neutral-100 rounded px-0.5 -mx-0.5 ${className}`}
      title="Click to edit"
    >
      <span className={value ? "" : "text-slate-400 italic"}>{value || placeholder}</span>
      <Edit3 size={11} className="text-slate-300 opacity-0 group-hover:opacity-100 shrink-0" />
    </button>
  );
}
