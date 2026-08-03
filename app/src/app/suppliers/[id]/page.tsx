import { notFound } from "next/navigation";
import Link from "next/link";
import { FileText, Layers } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requirePageAccess } from "@/lib/page-guard";
import { NoAccess } from "@/components/NoAccess";
import { RelationshipCard } from "@/components/RelationshipCard";
import { RecordDocumentsNotes } from "@/components/RecordDocumentsNotes";
import { OwnershipField } from "@/components/OwnershipField";
import { SupplierNameField } from "@/components/SupplierNameField";
import { SupplierHeaderFields } from "@/components/SupplierHeaderFields";
import { CONTRACT_STATUS_LABELS } from "@/lib/labels";

export default async function SupplierDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const access = await requirePageAccess("suppliers");
  if (!access.allowed) return <NoAccess moduleLabel="Suppliers" />;

  const { id } = await params;
  const supplier = await prisma.supplier.findUnique({
    where: { id },
    include: {
      contracts: { orderBy: { createdAt: "desc" }, take: 5 },
      services: { orderBy: { createdAt: "desc" }, take: 5 },
    },
  });
  if (!supplier) notFound();

  const recordType = "supplier";
  const [documents, notes, ownership] = await Promise.all([
    prisma.document.findMany({ where: { recordType, recordId: id }, include: { uploadedBy: { select: { name: true } } }, orderBy: { createdAt: "desc" } }),
    prisma.note.findMany({ where: { recordType, recordId: id }, include: { author: { select: { name: true } } }, orderBy: { createdAt: "desc" } }),
    prisma.ownership.findUnique({ where: { recordType_recordId: { recordType, recordId: id } }, include: { owner: { select: { id: true, name: true } } } }),
  ]);

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6 p-8">
      <div>
        <SupplierNameField supplier={supplier} editable={access.editable} />
        <div className="mt-2 flex flex-wrap items-center gap-4">
          <SupplierHeaderFields supplier={supplier} editable={access.editable} />
          <span className="text-slate-300">·</span>
          <OwnershipField
            moduleKey="suppliers"
            recordType={recordType}
            recordId={id}
            initialOwner={ownership?.owner ?? null}
            editable={access.editable}
          />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-5">
        <RelationshipCard icon={FileText} title="Contracts" count={supplier.contracts.length} href={`/contracts?supplierId=${id}`}>
          <div className="space-y-2">
            {supplier.contracts.map((c) => (
              <Link key={c.id} href={`/contracts/${c.id}`} className="block rounded-lg bg-neutral-100 border border-neutral-200 px-3 py-2 hover:border-accent-500">
                <p className="text-xs font-medium text-slate-700">{c.name}</p>
                <p className="text-[11px] text-slate-400">{c.type} · {CONTRACT_STATUS_LABELS[c.status]}</p>
              </Link>
            ))}
          </div>
        </RelationshipCard>

        <RelationshipCard icon={Layers} title="Services" count={supplier.services.length} href={`/services?supplierId=${id}`}>
          <div className="space-y-2">
            {supplier.services.map((s) => (
              <Link key={s.id} href={`/services/${s.id}`} className="block rounded-lg bg-neutral-100 border border-neutral-200 px-3 py-2 hover:border-accent-500">
                <p className="text-xs font-medium text-slate-700">{s.name}</p>
                <p className="text-[11px] text-slate-400">{s.category}</p>
              </Link>
            ))}
          </div>
        </RelationshipCard>
      </div>

      <RecordDocumentsNotes
        moduleKey="suppliers"
        recordType={recordType}
        recordId={id}
        initialDocuments={documents.map((d) => ({ ...d, createdAt: d.createdAt.toISOString() }))}
        initialNotes={notes.map((n) => ({ ...n, createdAt: n.createdAt.toISOString() }))}
        editable={access.editable}
      />
    </div>
  );
}
