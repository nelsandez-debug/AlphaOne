"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { ValueTrackingItem } from "@/generated/prisma/client";

export function ValueReviewPanel({ item }: { item: ValueTrackingItem }) {
  const router = useRouter();
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (item.status !== "PENDING_FINANCE_APPROVAL") return null;

  const review = async (decision: "approve" | "reject") => {
    setSubmitting(true);
    const response = await fetch(`/api/value-tracking/${item.id}/review`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ decision, note: note.trim() || undefined }),
    });
    setSubmitting(false);
    if (response.ok) router.refresh();
  };

  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50 p-5 space-y-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">Finance approval needed</p>
      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        rows={2}
        placeholder="Note (optional) — recorded on the audit trail"
        className="w-full rounded border border-amber-200 px-2 py-1.5 text-xs resize-none bg-white"
      />
      <div className="flex gap-2">
        <button
          type="button"
          disabled={submitting}
          onClick={() => review("approve")}
          className="text-xs font-medium rounded-lg px-3 py-1.5 text-white bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300"
        >
          Approve
        </button>
        <button
          type="button"
          disabled={submitting}
          onClick={() => review("reject")}
          className="text-xs font-medium rounded-lg px-3 py-1.5 text-white bg-red-600 hover:bg-red-700 disabled:bg-slate-300"
        >
          Reject
        </button>
      </div>
    </div>
  );
}
