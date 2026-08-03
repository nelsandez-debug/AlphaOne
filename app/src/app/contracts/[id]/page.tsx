import { notFound } from "next/navigation";
import Link from "next/link";
import { Layers } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requirePageAccess } from "@/lib/page-guard";
import { NoAccess } from "@/components/NoAccess";
import { RelationshipCard } from "@/components/RelationshipCard";
import { RecordDocumentsNotes } from "@/components/RecordDocumentsNotes";
import { OwnershipField } from "@/components/OwnershipField";
import { ContractNameField, ContractHeaderFields } from "@/components/ContractDetailFields";

export default async function ContractDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const access = await requirePageAccess("contracts");
  if (!access.allowed) return <NoAccess moduleLabel="Contracts" />;

  const { id } = await params;
  const contract = await prisma.contract.findUnique({
    where: { id },
    include: {
      supplier: { select: { id: true, name: true } },
      services: { orderBy: { createdAt: "desc" }, take: 5 },
    },
  });
  if (!contract) notFound();

  const recordType = "contract";
  const [documents, notes, ownership] = await Promise.all([
    prisma.document.findMany({ where: { recordType, recordId: id }, include: { uploadedBy: { select: { name: true } } }, orderBy: { createdAt: "desc" } }),
    prisma.note.findMany({ where: { recordType, recordId: id }, include: { author: { select: { name: true } } }, orderBy: { createdAt: "desc" } }),
    prisma.ownership.findUnique({ where: { recordType_recordId: { recordType, recordId: id } }, include: { owner: { select: { id: true, name: true } } } }),
  ]);

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6 p-8">
      <div>
        <Link href={`/suppliers/${contract.supplier.id}`} className="text-xs font-medium text-accent-700 hover:underline">
          {contract.supplier.name}
        </Link>
        <ContractNameField contract={contract} editable={access.editable} />
        <div className="mt-2 flex flex-wrap items-center gap-4">
          <ContractHeaderFields contract={contract} editable={access.editable} />
          <span className="text-slate-300">·</span>
          <OwnershipField
            moduleKey="contracts"
            recordType={recordType}
            recordId={id}
            initialOwner={ownership?.owner ?? null}
            editable={access.editable}
          />
        </div>
      </div>

      <RelationshipCard icon={Layers} title="Services governed" count={contract.services.length} href={`/services?contractId=${id}`}>
        <div className="space-y-2">
          {contract.services.map((s) => (
            <Link key={s.id} href={`/services/${s.id}`} className="block rounded-lg bg-neutral-100 border border-neutral-200 px-3 py-2 hover:border-accent-500">
              <p className="text-xs font-medium text-slate-700">{s.name}</p>
              <p className="text-[11px] text-slate-400">{s.category}</p>
            </Link>
          ))}
        </div>
      </RelationshipCard>

      <RecordDocumentsNotes
        moduleKey="contracts"
        recordType={recordType}
        recordId={id}
        initialDocuments={documents.map((d) => ({ ...d, createdAt: d.createdAt.toISOString() }))}
        initialNotes={notes.map((n) => ({ ...n, createdAt: n.createdAt.toISOString() }))}
        editable={access.editable}
      />
    </div>
  );
}
