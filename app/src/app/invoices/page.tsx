import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requirePageAccess } from "@/lib/page-guard";
import { NoAccess } from "@/components/NoAccess";
import { CreateInvoiceForm } from "@/components/CreateInvoiceForm";
import { INVOICE_STATUS_LABELS, invoiceStatusBadgeClass } from "@/lib/labels";

export default async function InvoicesPage({ searchParams }: { searchParams: Promise<{ supplierId?: string; onHold?: string }> }) {
  const access = await requirePageAccess("invoices");
  if (!access.allowed) return <NoAccess moduleLabel="Invoices" />;

  const { supplierId, onHold } = await searchParams;
  const [invoices, suppliers, purchaseOrders] = await Promise.all([
    prisma.invoice.findMany({
      where: { supplierId, onHold: onHold ? onHold === "true" : undefined },
      orderBy: { createdAt: "desc" },
      include: { supplier: { select: { id: true, name: true } }, purchaseOrder: { select: { id: true } } },
    }),
    prisma.supplier.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
    prisma.purchaseOrder.findMany({ orderBy: { createdAt: "desc" }, select: { id: true, supplierId: true, amount: true } }),
  ]);

  return (
    <div className="mx-auto w-full max-w-5xl p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Invoices</h1>
          <p className="text-sm text-slate-500">
            {invoices.length} invoices
            {onHold === "true" && (
              <>
                {" "}on hold ·{" "}
                <Link href="/invoices" className="text-[#2563EB] hover:underline">clear filter</Link>
              </>
            )}
          </p>
        </div>
        {access.editable && <CreateInvoiceForm suppliers={suppliers} purchaseOrders={purchaseOrders} defaultSupplierId={supplierId} />}
      </div>

      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 text-left text-xs uppercase tracking-wide text-slate-400">
              <th className="px-4 py-2.5 font-medium">Invoice</th>
              <th className="px-4 py-2.5 font-medium">Supplier</th>
              <th className="px-4 py-2.5 font-medium">Matched PO</th>
              <th className="px-4 py-2.5 font-medium">Status</th>
              <th className="px-4 py-2.5 font-medium">Amount</th>
              <th className="px-4 py-2.5 font-medium">Hold</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((i) => (
              <tr key={i.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50">
                <td className="px-4 py-2.5">
                  <Link href={`/invoices/${i.id}`} className="font-medium text-slate-900 hover:text-[#2563EB]">
                    INV-{i.id.slice(-6).toUpperCase()}
                  </Link>
                </td>
                <td className="px-4 py-2.5">
                  <Link href={`/suppliers/${i.supplier.id}`} className="text-slate-600 hover:text-[#2563EB]">{i.supplier.name}</Link>
                </td>
                <td className="px-4 py-2.5">
                  {i.purchaseOrder ? (
                    <Link href={`/purchase-orders/${i.purchaseOrder.id}`} className="text-slate-600 hover:text-[#2563EB]">
                      PO-{i.purchaseOrder.id.slice(-6).toUpperCase()}
                    </Link>
                  ) : (
                    <span className="text-slate-400 italic">None</span>
                  )}
                </td>
                <td className="px-4 py-2.5">
                  <span className={`inline-block rounded-full border px-2 py-0.5 text-xs ${invoiceStatusBadgeClass(i.status)}`}>{INVOICE_STATUS_LABELS[i.status]}</span>
                </td>
                <td className="px-4 py-2.5 text-slate-600">${i.amount.toLocaleString()}</td>
                <td className="px-4 py-2.5">{i.onHold && <span className="text-xs font-medium text-red-600">On hold</span>}</td>
              </tr>
            ))}
            {invoices.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-slate-400 italic">No invoices yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
