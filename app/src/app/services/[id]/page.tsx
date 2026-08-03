import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requirePageAccess } from "@/lib/page-guard";
import { NoAccess } from "@/components/NoAccess";
import { RecordDocumentsNotes } from "@/components/RecordDocumentsNotes";
import { OwnershipField } from "@/components/OwnershipField";
import { ServiceNameField, ServiceHeaderFields, ServiceRiskAssessment } from "@/components/ServiceDetailFields";

export default async function ServiceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const access = await requirePageAccess("services");
  if (!access.allowed) return <NoAccess moduleLabel="Services" />;

  const { id } = await params;
  const service = await prisma.service.findUnique({
    where: { id },
    include: {
      supplier: { select: { id: true, name: true } },
      contract: { select: { id: true, name: true } },
    },
  });
  if (!service) notFound();

  const recordType = "service";
  const [documents, notes, ownership] = await Promise.all([
    prisma.document.findMany({ where: { recordType, recordId: id }, include: { uploadedBy: { select: { name: true } } }, orderBy: { createdAt: "desc" } }),
    prisma.note.findMany({ where: { recordType, recordId: id }, include: { author: { select: { name: true } } }, orderBy: { createdAt: "desc" } }),
    prisma.ownership.findUnique({ where: { recordType_recordId: { recordType, recordId: id } }, include: { owner: { select: { id: true, name: true } } } }),
  ]);

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6 p-8">
      <div>
        <div className="flex items-center gap-2 text-xs font-medium">
          <Link href={`/suppliers/${service.supplier.id}`} className="text-accent-700 hover:underline">
            {service.supplier.name}
          </Link>
          {service.contract && (
            <>
              <span className="text-slate-300">·</span>
              <Link href={`/contracts/${service.contract.id}`} className="text-accent-700 hover:underline">
                {service.contract.name}
              </Link>
            </>
          )}
        </div>
        <ServiceNameField service={service} editable={access.editable} />
        <div className="mt-2 flex flex-wrap items-center gap-4">
          <ServiceHeaderFields service={service} editable={access.editable} />
          <span className="text-slate-300">·</span>
          <OwnershipField
            moduleKey="services"
            recordType={recordType}
            recordId={id}
            initialOwner={ownership?.owner ?? null}
            editable={access.editable}
          />
        </div>
      </div>

      <div className="glass p-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-3">Risk assessment (multi-category)</p>
        <ServiceRiskAssessment riskAssessment={service.riskAssessment} />
      </div>

      <RecordDocumentsNotes
        moduleKey="services"
        recordType={recordType}
        recordId={id}
        initialDocuments={documents.map((d) => ({ ...d, createdAt: d.createdAt.toISOString() }))}
        initialNotes={notes.map((n) => ({ ...n, createdAt: n.createdAt.toISOString() }))}
        editable={access.editable}
      />
    </div>
  );
}
