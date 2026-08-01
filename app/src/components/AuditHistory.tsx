import Link from "next/link";

type AuditEntry = {
  id: string;
  action: string;
  createdAt: Date;
  actor: { name: string } | null;
  createdRecordType: string | null;
  createdRecordId: string | null;
};

const RECORD_TYPE_PATH: Record<string, string> = {
  supplier: "/suppliers",
  contract: "/contracts",
  service: "/services",
};

export function AuditHistory({ entries }: { entries: AuditEntry[] }) {
  if (entries.length === 0) {
    return <p className="text-xs text-slate-400 italic">No activity yet.</p>;
  }

  return (
    <div className="space-y-2.5">
      {entries.map((e) => {
        const path = e.createdRecordType ? RECORD_TYPE_PATH[e.createdRecordType] : null;
        return (
          <div key={e.id} className="pb-2.5 border-b border-slate-100 last:border-0 last:pb-0">
            <p className="text-xs text-slate-700">{e.action}</p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {e.actor?.name ?? "System"} · {new Date(e.createdAt).toLocaleString()}
              {path && e.createdRecordId && (
                <>
                  {" · "}
                  <Link href={`${path}/${e.createdRecordId}`} className="text-[#2563EB] hover:underline">
                    View {e.createdRecordType}
                  </Link>
                </>
              )}
            </p>
          </div>
        );
      })}
    </div>
  );
}
