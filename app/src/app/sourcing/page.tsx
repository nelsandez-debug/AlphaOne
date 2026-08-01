import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requirePageAccess } from "@/lib/page-guard";
import { NoAccess } from "@/components/NoAccess";
import { CreateSourcingEventForm } from "@/components/CreateSourcingEventForm";
import { SOURCING_STAGE_LABELS } from "@/lib/labels";

export default async function SourcingPage() {
  const access = await requirePageAccess("sourcing");
  if (!access.allowed) return <NoAccess moduleLabel="Sourcing" />;

  const events = await prisma.sourcingEvent.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { participants: true } } },
  });

  return (
    <div className="mx-auto w-full max-w-5xl p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Sourcing</h1>
          <p className="text-sm text-slate-500">{events.length} events</p>
        </div>
        {access.editable && <CreateSourcingEventForm />}
      </div>

      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 text-left text-xs uppercase tracking-wide text-slate-400">
              <th className="px-4 py-2.5 font-medium">Title</th>
              <th className="px-4 py-2.5 font-medium">Type</th>
              <th className="px-4 py-2.5 font-medium">Stage</th>
              <th className="px-4 py-2.5 font-medium">Participants</th>
              <th className="px-4 py-2.5 font-medium">Est. savings</th>
            </tr>
          </thead>
          <tbody>
            {events.map((e) => (
              <tr key={e.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50">
                <td className="px-4 py-2.5">
                  <Link href={`/sourcing/${e.id}`} className="font-medium text-slate-900 hover:text-[#2563EB]">
                    {e.title}
                  </Link>
                </td>
                <td className="px-4 py-2.5 text-slate-600">{e.type ?? "—"}</td>
                <td className="px-4 py-2.5 text-slate-600">{SOURCING_STAGE_LABELS[e.stage]}</td>
                <td className="px-4 py-2.5 text-slate-600">{e._count.participants}</td>
                <td className="px-4 py-2.5 text-slate-600">{e.estimatedSavings != null ? `$${e.estimatedSavings.toLocaleString()}` : "—"}</td>
              </tr>
            ))}
            {events.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-slate-400 italic">
                  No sourcing events yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
