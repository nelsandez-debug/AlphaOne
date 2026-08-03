import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requirePageAccess } from "@/lib/page-guard";
import { NoAccess } from "@/components/NoAccess";
import { RecordDocumentsNotes } from "@/components/RecordDocumentsNotes";
import { ValueReviewPanel } from "@/components/ValueReviewPanel";
import { VALUE_STATUS_LABELS, VALUE_TYPE_LABELS, valueStatusBadgeClass } from "@/lib/labels";

export default async function ValueTrackingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const access = await requirePageAccess("value-tracking");
  if (!access.allowed) return <NoAccess moduleLabel="Value Tracking" />;

  const { id } = await params;
  const item = await prisma.valueTrackingItem.findUnique({
    where: { id },
    include: {
      supplier: { select: { id: true, name: true } },
      contract: { select: { id: true, name: true } },
      purchaseOrder: { select: { id: true } },
      submittedBy: { select: { name: true } },
      creditedTo: { select: { name: true } },
      financeApprover: { select: { name: true } },
    },
  });
  if (!item) notFound();

  const recordType = "value_tracking_item";
  const [documents, notes] = await Promise.all([
    prisma.document.findMany({ where: { recordType, recordId: id }, include: { uploadedBy: { select: { name: true } } }, orderBy: { createdAt: "desc" } }),
    prisma.note.findMany({ where: { recordType, recordId: id }, include: { author: { select: { name: true } } }, orderBy: { createdAt: "desc" } }),
  ]);

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6 p-8">
      <div>
        <Link href={`/suppliers/${item.supplier.id}`} className="text-xs font-medium text-accent-700 hover:underline">{item.supplier.name}</Link>
        <h1 className="text-xl font-semibold text-slate-900">{item.title}</h1>
        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
          <span className="text-slate-600">{VALUE_TYPE_LABELS[item.type]}</span>
          <span className="font-medium text-slate-900">${item.amount.toLocaleString()}</span>
          <span className={`inline-block rounded-full border px-2 py-0.5 text-xs ${valueStatusBadgeClass(item.status)}`}>{VALUE_STATUS_LABELS[item.status]}</span>
        </div>
        {item.note && <p className="mt-2 text-sm text-slate-600">{item.note}</p>}
        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
          <span>Submitted by {item.submittedBy.name}</span>
          <span>Credited to {item.creditedTo.name}</span>
          {item.financeApprover && <span>Reviewed by {item.financeApprover.name}</span>}
          {item.contract && (
            <Link href={`/contracts/${item.contract.id}`} className="text-accent-700 hover:underline">{item.contract.name}</Link>
          )}
          {item.purchaseOrder && (
            <Link href={`/purchase-orders/${item.purchaseOrder.id}`} className="text-accent-700 hover:underline">PO-{item.purchaseOrder.id.slice(-6).toUpperCase()}</Link>
          )}
        </div>
      </div>

      {access.canApprove && <ValueReviewPanel item={item} />}

      <RecordDocumentsNotes
        moduleKey="value-tracking"
        recordType={recordType}
        recordId={id}
        initialDocuments={documents.map((d) => ({ ...d, createdAt: d.createdAt.toISOString() }))}
        initialNotes={notes.map((n) => ({ ...n, createdAt: n.createdAt.toISOString() }))}
        editable={access.editable}
      />
    </div>
  );
}
