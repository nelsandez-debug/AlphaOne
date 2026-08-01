"use client";

import { useRouter } from "next/navigation";
import { EditableText } from "@/components/EditableText";

export function BudgetAllocatedField({ id, allocated, editable }: { id: string; allocated: number; editable: boolean }) {
  const router = useRouter();
  return (
    <EditableText
      value={String(allocated)}
      editable={editable}
      onSave={async (value) => {
        const response = await fetch(`/api/budget/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ allocated: Number(value) || 0 }),
        });
        if (response.ok) router.refresh();
      }}
    />
  );
}
