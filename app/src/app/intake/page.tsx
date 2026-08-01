import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requirePageAccess } from "@/lib/page-guard";
import { NoAccess } from "@/components/NoAccess";
import { CreateIntakeForm } from "@/components/CreateIntakeForm";
import { INTAKE_REQUEST_TYPE_LABELS, INTAKE_STAGE_LABELS, stageDotClass } from "@/lib/labels";
import type { IntakeStage } from "@/generated/prisma/enums";

const STAGES: IntakeStage[] = ["NEW", "TRIAGE", "ROUTED", "IN_PROGRESS", "CLOSED"];

export default async function IntakePage({ searchParams }: { searchParams: Promise<{ stage?: string }> }) {
  const access = await requirePageAccess("intake");
  if (!access.allowed) return <NoAccess moduleLabel="Intake" />;

  const { stage } = await searchParams;
  const requests = await prisma.intakeRequest.findMany({
    where: stage ? { stage: stage as IntakeStage } : undefined,
    orderBy: { createdAt: "desc" },
    include: { requester: { select: { name: true } } },
  });

  return (
    <div className="mx-auto w-full max-w-5xl p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Intake</h1>
          <p className="text-sm text-slate-500">{requests.length} requests</p>
        </div>
        {access.editable && <CreateIntakeForm />}
      </div>

      <div className="flex items-center gap-2 mb-4 text-xs">
        <Link href="/intake" className={`rounded-full border px-3 py-1 ${!stage ? "border-slate-900 text-slate-900 font-medium" : "border-slate-200 text-slate-500"}`}>
          All
        </Link>
        {STAGES.map((s) => (
          <Link
            key={s}
            href={`/intake?stage=${s}`}
            className={`rounded-full border px-3 py-1 flex items-center gap-1.5 ${stage === s ? "border-slate-900 text-slate-900 font-medium" : "border-slate-200 text-slate-500"}`}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${stageDotClass(s)}`} />
            {INTAKE_STAGE_LABELS[s]}
          </Link>
        ))}
      </div>

      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 text-left text-xs uppercase tracking-wide text-slate-400">
              <th className="px-4 py-2.5 font-medium">Title</th>
              <th className="px-4 py-2.5 font-medium">Type</th>
              <th className="px-4 py-2.5 font-medium">Requester</th>
              <th className="px-4 py-2.5 font-medium">Stage</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((r) => (
              <tr key={r.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50">
                <td className="px-4 py-2.5">
                  <Link href={`/intake/${r.id}`} className="font-medium text-slate-900 hover:text-[#2563EB]">
                    {r.title}
                  </Link>
                </td>
                <td className="px-4 py-2.5 text-slate-600">{INTAKE_REQUEST_TYPE_LABELS[r.type]}</td>
                <td className="px-4 py-2.5 text-slate-600">{r.requester.name}</td>
                <td className="px-4 py-2.5">
                  <span className="inline-flex items-center gap-1.5 text-slate-600">
                    <span className={`h-1.5 w-1.5 rounded-full ${stageDotClass(r.stage)}`} />
                    {INTAKE_STAGE_LABELS[r.stage]}
                  </span>
                </td>
              </tr>
            ))}
            {requests.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-slate-400 italic">
                  No requests yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
