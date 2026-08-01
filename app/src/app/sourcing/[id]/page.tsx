import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requirePageAccess } from "@/lib/page-guard";
import { NoAccess } from "@/components/NoAccess";
import { RecordDocumentsNotes } from "@/components/RecordDocumentsNotes";
import { SourcingTitleField, SourcingDetailFields } from "@/components/SourcingDetailFields";
import { SourcingParticipants } from "@/components/SourcingParticipants";

export default async function SourcingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const access = await requirePageAccess("sourcing");
  if (!access.allowed) return <NoAccess moduleLabel="Sourcing" />;

  const { id } = await params;
  const event = await prisma.sourcingEvent.findUnique({
    where: { id },
    include: { participants: { include: { supplier: { select: { id: true, name: true } } }, orderBy: { createdAt: "asc" } } },
  });
  if (!event) notFound();

  const recordType = "sourcing_event";
  const [documents, notes, suppliers] = await Promise.all([
    prisma.document.findMany({ where: { recordType, recordId: id }, include: { uploadedBy: { select: { name: true } } }, orderBy: { createdAt: "desc" } }),
    prisma.note.findMany({ where: { recordType, recordId: id }, include: { author: { select: { name: true } } }, orderBy: { createdAt: "desc" } }),
    prisma.supplier.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
  ]);

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6 p-8">
      <div>
        <SourcingTitleField event={event} editable={access.editable} />
        <div className="mt-2">
          <SourcingDetailFields event={event} editable={access.editable} />
        </div>
      </div>

      <SourcingParticipants sourcingEventId={id} initialParticipants={event.participants} suppliers={suppliers} editable={access.editable} />

      <RecordDocumentsNotes
        moduleKey="sourcing"
        recordType={recordType}
        recordId={id}
        initialDocuments={documents.map((d) => ({ ...d, createdAt: d.createdAt.toISOString() }))}
        initialNotes={notes.map((n) => ({ ...n, createdAt: n.createdAt.toISOString() }))}
        editable={access.editable}
      />
    </div>
  );
}
