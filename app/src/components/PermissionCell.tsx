"use client";

import { useRouter } from "next/navigation";
import { EditableSelect } from "@/components/EditableSelect";
import { PERMISSION_LEVEL_LABELS, permissionLevelBadgeClass, toOptions } from "@/lib/labels";
import type { PermissionLevel } from "@/generated/prisma/enums";

export function PermissionCell({ id, level, editable }: { id: string; level: PermissionLevel; editable: boolean }) {
  const router = useRouter();

  return (
    <EditableSelect
      value={level}
      editable={editable}
      options={toOptions(PERMISSION_LEVEL_LABELS)}
      renderValue={(v) => (
        <span className={`inline-block rounded-full border px-2 py-0.5 text-xs ${permissionLevelBadgeClass(v as PermissionLevel)}`}>
          {PERMISSION_LEVEL_LABELS[v as PermissionLevel]}
        </span>
      )}
      onSave={async (newLevel) => {
        const response = await fetch(`/api/administration/permissions/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ level: newLevel }),
        });
        if (response.ok) router.refresh();
      }}
    />
  );
}
