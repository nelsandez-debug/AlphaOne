import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requirePageAccess } from "@/lib/page-guard";
import { NoAccess } from "@/components/NoAccess";
import { CreateValueItemForm } from "@/components/CreateValueItemForm";
import { VALUE_STATUS_LABELS, VALUE_TYPE_LABELS, valueStatusBadgeClass } from "@/lib/labels";

export default async function ValueTrackingPage() {
  const access = await requirePageAccess("value-tracking");
  if (!access.allowed) return <NoAccess moduleLabel="Value Tracking" />;

  const [items, suppliers, contracts, purchaseOrders] = await Promise.all([
    prisma.valueTrackingItem.findMany({
      orderBy: { createdAt: "desc" },
      include: { supplier: { select: { id: true, name: true } }, creditedTo: { select: { name: true } } },
    }),
    prisma.supplier.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
    prisma.contract.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true, supplierId: true } }),
    prisma.purchaseOrder.findMany({ orderBy: { createdAt: "desc" }, select: { id: true, supplierId: true, amount: true } }),
  ]);

  const totalApproved = items.filter((i) => i.status === "APPROVED").reduce((sum, i) => sum + i.amount, 0);

  return (
    <div className="mx-auto w-full max-w-5xl p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Value Tracking</h1>
          <p className="text-sm text-slate-500">{items.length} items · ${totalApproved.toLocaleString()} realized (approved)</p>
        </div>
        {access.editable && <CreateValueItemForm suppliers={suppliers} contracts={contracts} purchaseOrders={purchaseOrders} />}
      </div>

      <div className="glass overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 text-left text-xs uppercase tracking-wide text-slate-400">
              <th className="px-4 py-2.5 font-medium">Title</th>
              <th className="px-4 py-2.5 font-medium">Supplier</th>
              <th className="px-4 py-2.5 font-medium">Type</th>
              <th className="px-4 py-2.5 font-medium">Amount</th>
              <th className="px-4 py-2.5 font-medium">Credited to</th>
              <th className="px-4 py-2.5 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {items.map((i) => (
              <tr key={i.id} className="border-b border-slate-50 last:border-0 hover:bg-neutral-100">
                <td className="px-4 py-2.5">
                  <Link href={`/value-tracking/${i.id}`} className="font-medium text-slate-900 hover:text-accent-700">{i.title}</Link>
                </td>
                <td className="px-4 py-2.5">
                  <Link href={`/suppliers/${i.supplier.id}`} className="text-slate-600 hover:text-accent-700">{i.supplier.name}</Link>
                </td>
                <td className="px-4 py-2.5 text-slate-600">{VALUE_TYPE_LABELS[i.type]}</td>
                <td className="px-4 py-2.5 text-slate-600">${i.amount.toLocaleString()}</td>
                <td className="px-4 py-2.5 text-slate-600">{i.creditedTo.name}</td>
                <td className="px-4 py-2.5">
                  <span className={`inline-block rounded-full border px-2 py-0.5 text-xs ${valueStatusBadgeClass(i.status)}`}>{VALUE_STATUS_LABELS[i.status]}</span>
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-slate-400 italic">No value items submitted yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
