"use client";

import { useRouter } from "next/navigation";
import { EditableText } from "@/components/EditableText";
import type { Supplier } from "@/generated/prisma/client";

export function SupplierNameField({ supplier, editable }: { supplier: Supplier; editable: boolean }) {
  const router = useRouter();

  return (
    <EditableText
      value={supplier.name}
      editable={editable}
      className="text-xl font-semibold text-slate-900"
      onSave={async (name) => {
        const response = await fetch(`/api/suppliers/${supplier.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name }),
        });
        if (response.ok) router.refresh();
      }}
    />
  );
}
