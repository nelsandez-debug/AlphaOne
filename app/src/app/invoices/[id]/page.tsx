import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requirePageAccess } from "@/lib/page-guard";
import { NoAccess } from "@/components/NoAccess";
import { RecordDocumentsNotes } from "@/components/RecordDocumentsNotes";
import { OwnershipField } from "@/components/OwnershipField";
import { InvoiceDetailFields } from "@/components/InvoiceDetailFields";

export default async function InvoiceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const access = await requirePageAccess("invoices");
  if (!access.allowed) return <NoAccess moduleLabel="Invoices" />;

  const { id } = await params;
  const invoice = await prisma.invoice.findUnique({
    where: { id },
    include: { supplier: { select: { id: true, name: true } }, purchaseOrder: { select: { id: true, amount: true, status: true } } },
  });
  if (!invoice) notFound();

  const variance = invoice.purchaseOrder ? invoice.amount - invoice.purchaseOrder.amount : null;

  const recordType = "invoice";
  const [documents, notes, ownership] = await Promise.all([
    prisma.document.findMany({ where: { recordType, recordId: id }, include: { uploadedBy: { select: { name: true } } }, orderBy: { createdAt: "desc" } }),
    prisma.note.findMany({ where: { recordType, recordId: id }, include: { author: { select: { name: true } } }, orderBy: { createdAt: "desc" } }),
    prisma.ownership.findUnique({ where: { recordType_recordId: { recordType, recordId: id } }, include: { owner: { select: { id: true, name: true } } } }),
  ]);

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6 p-8">
      <div>
        <Link href={`/suppliers/${invoice.supplier.id}`} className="text-xs font-medium text-[#2563EB] hover:underline">
          {invoice.supplier.name}
        </Link>
        <h1 className="text-xl font-semibold text-slate-900">INV-{invoice.id.slice(-6).toUpperCase()} · ${invoice.amount.toLocaleString()}</h1>
        <div className="mt-2">
          <InvoiceDetailFields invoice={invoice} editable={access.editable} />
        </div>
        <div className="mt-2">
          <OwnershipField moduleKey="invoices" recordType={recordType} recordId={id} initialOwner={ownership?.owner ?? null} editable={access.editable} />
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-3">PO matching</p>
        {invoice.purchaseOrder ? (
          <div className="text-sm text-slate-600">
            <p>
              Matched to{" "}
              <Link href={`/purchase-orders/${invoice.purchaseOrder.id}`} className="text-[#2563EB] hover:underline">
                PO-{invoice.purchaseOrder.id.slice(-6).toUpperCase()}
              </Link>{" "}
              (${invoice.purchaseOrder.amount.toLocaleString()})
            </p>
            {variance !== null && (
              <p className={`mt-1 text-xs ${variance > 0 ? "text-red-600" : "text-slate-400"}`}>
                {variance === 0 ? "Amount matches the PO exactly." : variance > 0 ? `Invoice exceeds the PO by $${variance.toLocaleString()}.` : `Invoice is $${Math.abs(variance).toLocaleString()} under the PO.`}
              </p>
            )}
          </div>
        ) : (
          <p className="text-xs text-slate-400 italic">No matching PO on file.</p>
        )}
      </div>

      <RecordDocumentsNotes
        moduleKey="invoices"
        recordType={recordType}
        recordId={id}
        initialDocuments={documents.map((d) => ({ ...d, createdAt: d.createdAt.toISOString() }))}
        initialNotes={notes.map((n) => ({ ...n, createdAt: n.createdAt.toISOString() }))}
        editable={access.editable}
      />
    </div>
  );
}
