import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requirePageAccess } from "@/lib/page-guard";
import { NoAccess } from "@/components/NoAccess";
import { CreatePOForm } from "@/components/CreatePOForm";
import { PO_STATUS_LABELS, PO_TYPE_LABELS } from "@/lib/labels";

export default async function PurchaseOrdersPage({ searchParams }: { searchParams: Promise<{ supplierId?: string; projectId?: string }> }) {
  const access = await requirePageAccess("purchase-orders");
  if (!access.allowed) return <NoAccess moduleLabel="Purchase Orders" />;

  const { supplierId, projectId } = await searchParams;
  const [orders, suppliers, filteredSupplier, filteredProject] = await Promise.all([
    prisma.purchaseOrder.findMany({
      where: { supplierId, projectId },
      orderBy: { createdAt: "desc" },
      include: { supplier: { select: { id: true, name: true } } },
    }),
    prisma.supplier.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
    supplierId ? prisma.supplier.findUnique({ where: { id: supplierId }, select: { name: true } }) : null,
    projectId ? prisma.project.findUnique({ where: { id: projectId }, select: { name: true } }) : null,
  ]);
  const filterLabel = filteredSupplier?.name ?? filteredProject?.name;

  return (
    <div className="mx-auto w-full max-w-5xl p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Purchase Orders</h1>
          <p className="text-sm text-slate-500">
            {orders.length} POs
            {filterLabel && (
              <>
                {" "}for <span className="font-medium text-slate-700">{filterLabel}</span>
                {" · "}
                <Link href="/purchase-orders" className="text-accent-700 hover:underline">clear filter</Link>
              </>
            )}
          </p>
        </div>
        {access.editable && <CreatePOForm suppliers={suppliers} defaultSupplierId={supplierId} />}
      </div>

      <div className="glass overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 text-left text-xs uppercase tracking-wide text-slate-400">
              <th className="px-4 py-2.5 font-medium">PO</th>
              <th className="px-4 py-2.5 font-medium">Supplier</th>
              <th className="px-4 py-2.5 font-medium">Type</th>
              <th className="px-4 py-2.5 font-medium">Status</th>
              <th className="px-4 py-2.5 font-medium">Amount</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id} className="border-b border-slate-50 last:border-0 hover:bg-neutral-100">
                <td className="px-4 py-2.5">
                  <Link href={`/purchase-orders/${o.id}`} className="font-medium text-slate-900 hover:text-accent-700">
                    PO-{o.id.slice(-6).toUpperCase()}
                  </Link>
                </td>
                <td className="px-4 py-2.5">
                  <Link href={`/suppliers/${o.supplier.id}`} className="text-slate-600 hover:text-accent-700">{o.supplier.name}</Link>
                </td>
                <td className="px-4 py-2.5 text-slate-600">{PO_TYPE_LABELS[o.type]}</td>
                <td className="px-4 py-2.5 text-slate-600">{PO_STATUS_LABELS[o.status]}</td>
                <td className="px-4 py-2.5 text-slate-600">${o.amount.toLocaleString()}</td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-slate-400 italic">No purchase orders yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
