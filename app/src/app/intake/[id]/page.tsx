import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requirePageAccess } from "@/lib/page-guard";
import { NoAccess } from "@/components/NoAccess";
import { RecordDocumentsNotes } from "@/components/RecordDocumentsNotes";
import { IntakeTitleField, IntakeDetailFields } from "@/components/IntakeHeaderFields";
import { DispositionPanel } from "@/components/DispositionPanel";
import { AuditHistory } from "@/components/AuditHistory";
import { INTAKE_REQUEST_TYPE_LABELS, INTAKE_STAGE_LABELS, stageDotClass } from "@/lib/labels";
import type { IntakeStage } from "@/generated/prisma/enums";

const STAGES: IntakeStage[] = ["NEW", "TRIAGE", "ROUTED", "IN_PROGRESS", "CLOSED"];

export default async function IntakeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const access = await requirePageAccess("intake");
  if (!access.allowed) return <NoAccess moduleLabel="Intake" />;

  const { id } = await params;
  const intakeRequest = await prisma.intakeRequest.findUnique({
    where: { id },
    include: { requester: { select: { name: true } } },
  });
  if (!intakeRequest) notFound();

  const recordType = "intake_request";
  const [documents, notes, auditEntries, suppliers, contracts] = await Promise.all([
    prisma.document.findMany({ where: { recordType, recordId: id }, include: { uploadedBy: { select: { name: true } } }, orderBy: { createdAt: "desc" } }),
    prisma.note.findMany({ where: { recordType, recordId: id }, include: { author: { select: { name: true } } }, orderBy: { createdAt: "desc" } }),
    prisma.auditLogEntry.findMany({ where: { recordType, recordId: id }, include: { actor: { select: { name: true } } }, orderBy: { createdAt: "desc" } }),
    prisma.supplier.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
    prisma.contract.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true, supplierId: true } }),
  ]);

  const currentStageIndex = STAGES.indexOf(intakeRequest.stage);

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6 p-8">
      <div>
        <p className="text-xs font-medium text-slate-400">{INTAKE_REQUEST_TYPE_LABELS[intakeRequest.type]} · {intakeRequest.requester.name}</p>
        <IntakeTitleField intakeRequest={intakeRequest} editable={access.editable} />
        {intakeRequest.description && <p className="mt-1 text-sm text-slate-600">{intakeRequest.description}</p>}
        <div className="mt-2">
          <IntakeDetailFields intakeRequest={intakeRequest} editable={access.editable} />
        </div>
      </div>

      <div className="flex items-center gap-2 glass px-5 py-4">
        {STAGES.map((s, i) => (
          <div key={s} className="flex items-center gap-2 flex-1">
            <div className="flex items-center gap-1.5">
              <span className={`h-2 w-2 rounded-full ${i <= currentStageIndex ? stageDotClass(intakeRequest.stage) : "bg-slate-200"}`} />
              <span className={`text-xs ${i === currentStageIndex ? "font-medium text-slate-900" : "text-slate-400"}`}>{INTAKE_STAGE_LABELS[s]}</span>
            </div>
            {i < STAGES.length - 1 && <div className="h-px flex-1 bg-slate-100" />}
          </div>
        ))}
      </div>

      {access.editable && <DispositionPanel intakeRequest={intakeRequest} suppliers={suppliers} contracts={contracts} />}

      <div className="glass p-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-3">Activity &amp; disposition history</p>
        <AuditHistory entries={auditEntries} />
      </div>

      <RecordDocumentsNotes
        moduleKey="intake"
        recordType={recordType}
        recordId={id}
        initialDocuments={documents.map((d) => ({ ...d, createdAt: d.createdAt.toISOString() }))}
        initialNotes={notes.map((n) => ({ ...n, createdAt: n.createdAt.toISOString() }))}
        editable={access.editable}
      />
    </div>
  );
}
