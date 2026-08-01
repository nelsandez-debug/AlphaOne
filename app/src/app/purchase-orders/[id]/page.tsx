import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requirePageAccess } from "@/lib/page-guard";
import { NoAccess } from "@/components/NoAccess";
import { RecordDocumentsNotes } from "@/components/RecordDocumentsNotes";
import { OwnershipField } from "@/components/OwnershipField";
import { PODetailFields } from "@/components/PODetailFields";

export default async function PurchaseOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const access = await requirePageAccess("purchase-orders");
  if (!access.allowed) return <NoAccess moduleLabel="Purchase Orders" />;

  const { id } = await params;
  const order = await prisma.purchaseOrder.findUnique({
    where: { id },
    include: {
      supplier: { select: { id: true, name: true } },
      contract: { select: { id: true, name: true } },
      originIntakeRequest: { select: { id: true, title: true } },
    },
  });
  if (!order) notFound();

  const recordType = "purchase_order";
  const [documents, notes, ownership] = await Promise.all([
    prisma.document.findMany({ where: { recordType, recordId: id }, include: { uploadedBy: { select: { name: true } } }, orderBy: { createdAt: "desc" } }),
    prisma.note.findMany({ where: { recordType, recordId: id }, include: { author: { select: { name: true } } }, orderBy: { createdAt: "desc" } }),
    prisma.ownership.findUnique({ where: { recordType_recordId: { recordType, recordId: id } }, include: { owner: { select: { id: true, name: true } } } }),
  ]);

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6 p-8">
      <div>
        <div className="flex items-center gap-2 text-xs font-medium">
          <Link href={`/suppliers/${order.supplier.id}`} className="text-[#2563EB] hover:underline">{order.supplier.name}</Link>
          {order.contract && (
            <>
              <span className="text-slate-300">·</span>
              <Link href={`/contracts/${order.contract.id}`} className="text-[#2563EB] hover:underline">{order.contract.name}</Link>
            </>
          )}
          {order.originIntakeRequest && (
            <>
              <span className="text-slate-300">·</span>
              <Link href={`/intake/${order.originIntakeRequest.id}`} className="text-[#2563EB] hover:underline">from intake: {order.originIntakeRequest.title}</Link>
            </>
          )}
        </div>
        <h1 className="text-xl font-semibold text-slate-900">PO-{order.id.slice(-6).toUpperCase()}</h1>
        <div className="mt-2 flex flex-wrap items-center gap-4">
          <PODetailFields order={order} editable={access.editable} />
          <span className="text-slate-300">·</span>
          <OwnershipField moduleKey="purchase-orders" recordType={recordType} recordId={id} initialOwner={ownership?.owner ?? null} editable={access.editable} />
        </div>
      </div>

      <RecordDocumentsNotes
        moduleKey="purchase-orders"
        recordType={recordType}
        recordId={id}
        initialDocuments={documents.map((d) => ({ ...d, createdAt: d.createdAt.toISOString() }))}
        initialNotes={notes.map((n) => ({ ...n, createdAt: n.createdAt.toISOString() }))}
        editable={access.editable}
      />
    </div>
  );
}
