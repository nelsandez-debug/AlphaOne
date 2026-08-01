import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requirePageAccess } from "@/lib/page-guard";
import { NoAccess } from "@/components/NoAccess";
import { resolveOwnershipRecords } from "@/lib/ownership";

// Cross-module rollup over the shared, polymorphic Ownership table — a real
// query across every record type that uses OwnershipField, not a hardcoded
// leaderboard. This is the "Ownership hub" CLAUDE.md calls out under
// Administration.
export default async function OwnershipHubPage() {
  const access = await requirePageAccess("admin");
  if (!access.allowed) return <NoAccess moduleLabel="Administration" />;

  const ownerships = await prisma.ownership.findMany({
    orderBy: { assignedAt: "desc" },
    include: { owner: { select: { id: true, name: true } } },
  });

  const resolved = await resolveOwnershipRecords(ownerships);

  const leaderboard = new Map<string, { name: string; count: number }>();
  for (const o of ownerships) {
    const entry = leaderboard.get(o.ownerId) ?? { name: o.owner.name, count: 0 };
    entry.count += 1;
    leaderboard.set(o.ownerId, entry);
  }
  const leaderboardRows = Array.from(leaderboard.values()).sort((a, b) => b.count - a.count);

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6 p-8">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Ownership</h1>
        <p className="text-sm text-slate-500">{ownerships.length} owned records across every module.</p>
      </div>

      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-3">Leaderboard</p>
        <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-left text-xs uppercase tracking-wide text-slate-400">
                <th className="px-4 py-2.5 font-medium">Owner</th>
                <th className="px-4 py-2.5 font-medium">Records owned</th>
              </tr>
            </thead>
            <tbody>
              {leaderboardRows.map((row) => (
                <tr key={row.name} className="border-b border-slate-50 last:border-0">
                  <td className="px-4 py-2.5 font-medium text-slate-900">{row.name}</td>
                  <td className="px-4 py-2.5 text-slate-600">{row.count}</td>
                </tr>
              ))}
              {leaderboardRows.length === 0 && (
                <tr>
                  <td colSpan={2} className="px-4 py-8 text-center text-slate-400 italic">No ownership assigned yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-3">All owned records</p>
        <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-left text-xs uppercase tracking-wide text-slate-400">
                <th className="px-4 py-2.5 font-medium">Record</th>
                <th className="px-4 py-2.5 font-medium">Type</th>
                <th className="px-4 py-2.5 font-medium">Owner</th>
                <th className="px-4 py-2.5 font-medium">Assigned</th>
              </tr>
            </thead>
            <tbody>
              {ownerships.map((o) => {
                const record = resolved.get(`${o.recordType}:${o.recordId}`);
                return (
                  <tr key={o.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50">
                    <td className="px-4 py-2.5">
                      {record ? (
                        <Link href={record.href} className="font-medium text-slate-900 hover:text-[#2563EB]">{record.label}</Link>
                      ) : (
                        <span className="text-slate-400 italic">{o.recordId}</span>
                      )}
                    </td>
                    <td className="px-4 py-2.5 text-slate-600">{o.recordType.replace(/_/g, " ")}</td>
                    <td className="px-4 py-2.5 text-slate-600">{o.owner.name}</td>
                    <td className="px-4 py-2.5 text-slate-600">{new Date(o.assignedAt).toLocaleDateString()}</td>
                  </tr>
                );
              })}
              {ownerships.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-slate-400 italic">No ownership assigned yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
