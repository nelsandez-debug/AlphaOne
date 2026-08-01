"use client";

import { useRouter } from "next/navigation";
import { EditableSelect } from "@/components/EditableSelect";
import { ROLE_LABELS, toOptions } from "@/lib/labels";
import type { Role } from "@/generated/prisma/enums";

export function UserRoleField({ id, role, editable }: { id: string; role: Role; editable: boolean }) {
  const router = useRouter();

  return (
    <EditableSelect
      value={role}
      editable={editable}
      options={toOptions(ROLE_LABELS)}
      renderValue={(v) => <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs">{ROLE_LABELS[v as Role]}</span>}
      onSave={async (newRole) => {
        const response = await fetch(`/api/administration/users/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ role: newRole }),
        });
        if (response.ok) router.refresh();
      }}
    />
  );
}
