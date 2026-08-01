import { notFound } from "next/navigation";
import Link from "next/link";
import { FileText, Layers, Receipt, ShoppingCart } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requirePageAccess } from "@/lib/page-guard";
import { NoAccess } from "@/components/NoAccess";
import { RelationshipCard } from "@/components/RelationshipCard";
import { RecordDocumentsNotes } from "@/components/RecordDocumentsNotes";
import { ProjectNameField, ProjectDetailFields } from "@/components/ProjectDetailFields";

export default async function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const access = await requirePageAccess("projects");
  if (!access.allowed) return <NoAccess moduleLabel="Projects" />;

  const { id } = await params;
  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      supplier: { select: { id: true, name: true } },
      budgetCategory: { select: { id: true, category: true } },
      sourcingEvent: { select: { id: true, title: true } },
      contracts: { select: { id: true, name: true } },
      services: { select: { id: true, name: true } },
      purchaseOrders: { select: { id: true, amount: true } },
      invoices: { select: { id: true, amount: true } },
    },
  });
  if (!project) notFound();

  const recordType = "project";
  const [documents, notes] = await Promise.all([
    prisma.document.findMany({ where: { recordType, recordId: id }, include: { uploadedBy: { select: { name: true } } }, orderBy: { createdAt: "desc" } }),
    prisma.note.findMany({ where: { recordType, recordId: id }, include: { author: { select: { name: true } } }, orderBy: { createdAt: "desc" } }),
  ]);

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6 p-8">
      <div>
        <div className="flex items-center gap-2 text-xs font-medium">
          {project.supplier && (
            <Link href={`/suppliers/${project.supplier.id}`} className="text-[#2563EB] hover:underline">{project.supplier.name}</Link>
          )}
          {project.sourcingEvent && (
            <>
              {project.supplier && <span className="text-slate-300">·</span>}
              <Link href={`/sourcing/${project.sourcingEvent.id}`} className="text-[#2563EB] hover:underline">{project.sourcingEvent.title}</Link>
            </>
          )}
        </div>
        <ProjectNameField project={project} editable={access.editable} />
        <div className="mt-2">
          <ProjectDetailFields project={project} editable={access.editable} />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-5">
        <RelationshipCard icon={FileText} title="Contracts" count={project.contracts.length} href={`/contracts?projectId=${id}`}>
          <div className="space-y-2">
            {project.contracts.map((c) => (
              <Link key={c.id} href={`/contracts/${c.id}`} className="block rounded-lg bg-slate-50 border border-slate-200 px-3 py-2 hover:border-[#2563EB]">
                <p className="text-xs font-medium text-slate-700">{c.name}</p>
              </Link>
            ))}
          </div>
        </RelationshipCard>

        <RelationshipCard icon={Layers} title="Services" count={project.services.length} href={`/services?projectId=${id}`}>
          <div className="space-y-2">
            {project.services.map((s) => (
              <Link key={s.id} href={`/services/${s.id}`} className="block rounded-lg bg-slate-50 border border-slate-200 px-3 py-2 hover:border-[#2563EB]">
                <p className="text-xs font-medium text-slate-700">{s.name}</p>
              </Link>
            ))}
          </div>
        </RelationshipCard>

        <RelationshipCard icon={ShoppingCart} title="Purchase Orders" count={project.purchaseOrders.length} href={`/purchase-orders?projectId=${id}`}>
          <div className="space-y-2">
            {project.purchaseOrders.map((po) => (
              <Link key={po.id} href={`/purchase-orders/${po.id}`} className="block rounded-lg bg-slate-50 border border-slate-200 px-3 py-2 hover:border-[#2563EB]">
                <p className="text-xs font-medium text-slate-700">PO-{po.id.slice(-6).toUpperCase()} · ${po.amount.toLocaleString()}</p>
              </Link>
            ))}
          </div>
        </RelationshipCard>

        <RelationshipCard icon={Receipt} title="Invoices" count={project.invoices.length} href={`/invoices?projectId=${id}`}>
          <div className="space-y-2">
            {project.invoices.map((inv) => (
              <Link key={inv.id} href={`/invoices/${inv.id}`} className="block rounded-lg bg-slate-50 border border-slate-200 px-3 py-2 hover:border-[#2563EB]">
                <p className="text-xs font-medium text-slate-700">INV-{inv.id.slice(-6).toUpperCase()} · ${inv.amount.toLocaleString()}</p>
              </Link>
            ))}
          </div>
        </RelationshipCard>
      </div>

      <RecordDocumentsNotes
        moduleKey="projects"
        recordType={recordType}
        recordId={id}
        initialDocuments={documents.map((d) => ({ ...d, createdAt: d.createdAt.toISOString() }))}
        initialNotes={notes.map((n) => ({ ...n, createdAt: n.createdAt.toISOString() }))}
        editable={access.editable}
      />
    </div>
  );
}
