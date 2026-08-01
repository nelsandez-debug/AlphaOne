import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requirePageAccess } from "@/lib/page-guard";
import { NoAccess } from "@/components/NoAccess";
import { CreateVendorSlaForm } from "@/components/CreateVendorSlaForm";
import { CreateBusinessReviewForm } from "@/components/CreateBusinessReviewForm";
import { BUSINESS_REVIEW_STATUS_LABELS, BUSINESS_REVIEW_TYPE_LABELS, VENDOR_SLA_STATUS_LABELS, vendorSlaStatusBadgeClass } from "@/lib/labels";

// Vendor Management is a governance layer over Suppliers/Invoices, same as the
// reference — but every rollup here is a real query against FK'd tables
// (VendorSla.supplierId, Invoice.onHold, BusinessReview.supplierId), not
// `supplier === s.name` string matching.
export default async function VendorManagementPage() {
  const access = await requirePageAccess("vendor-management");
  if (!access.allowed) return <NoAccess moduleLabel="Vendor Management" />;

  const [suppliers, slas, reviews] = await Promise.all([
    prisma.supplier.findMany({
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        _count: {
          select: {
            vendorSlas: { where: { status: { in: ["AT_RISK", "BREACHED"] } } },
            invoices: { where: { onHold: true } },
          },
        },
        businessReviews: { where: { status: "SCHEDULED" }, orderBy: { scheduledDate: "asc" }, take: 1 },
      },
    }),
    prisma.vendorSla.findMany({ orderBy: { createdAt: "desc" }, include: { supplier: { select: { id: true, name: true } } } }),
    prisma.businessReview.findMany({ orderBy: { scheduledDate: "asc" }, include: { supplier: { select: { id: true, name: true } } } }),
  ]);

  return (
    <div className="mx-auto w-full max-w-5xl space-y-8 p-8">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Vendor Management</h1>
        <p className="text-sm text-slate-500">Governance rollup across Suppliers, SLAs, held invoices, and business reviews.</p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 text-left text-xs uppercase tracking-wide text-slate-400">
              <th className="px-4 py-2.5 font-medium">Supplier</th>
              <th className="px-4 py-2.5 font-medium">SLA issues</th>
              <th className="px-4 py-2.5 font-medium">Held invoices</th>
              <th className="px-4 py-2.5 font-medium">Next review</th>
            </tr>
          </thead>
          <tbody>
            {suppliers.map((s) => (
              <tr key={s.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50">
                <td className="px-4 py-2.5">
                  <Link href={`/suppliers/${s.id}`} className="font-medium text-slate-900 hover:text-[#2563EB]">{s.name}</Link>
                </td>
                <td className="px-4 py-2.5">
                  {s._count.vendorSlas > 0 ? <span className="text-amber-600 font-medium">{s._count.vendorSlas}</span> : <span className="text-slate-400">0</span>}
                </td>
                <td className="px-4 py-2.5">
                  {s._count.invoices > 0 ? (
                    <Link href={`/invoices?supplierId=${s.id}&onHold=true`} className="text-red-600 font-medium hover:underline">{s._count.invoices}</Link>
                  ) : (
                    <span className="text-slate-400">0</span>
                  )}
                </td>
                <td className="px-4 py-2.5 text-slate-600">
                  {s.businessReviews[0] ? new Date(s.businessReviews[0].scheduledDate).toLocaleDateString() : <span className="text-slate-400 italic">None scheduled</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Vendor SLAs</p>
          {access.editable && <CreateVendorSlaForm suppliers={suppliers} />}
        </div>
        <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-left text-xs uppercase tracking-wide text-slate-400">
                <th className="px-4 py-2.5 font-medium">Supplier</th>
                <th className="px-4 py-2.5 font-medium">Metric</th>
                <th className="px-4 py-2.5 font-medium">Target</th>
                <th className="px-4 py-2.5 font-medium">Actual</th>
                <th className="px-4 py-2.5 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {slas.map((sla) => (
                <tr key={sla.id} className="border-b border-slate-50 last:border-0">
                  <td className="px-4 py-2.5"><Link href={`/suppliers/${sla.supplier.id}`} className="text-slate-700 hover:text-[#2563EB]">{sla.supplier.name}</Link></td>
                  <td className="px-4 py-2.5 text-slate-600">{sla.metric}</td>
                  <td className="px-4 py-2.5 text-slate-600">{sla.target}</td>
                  <td className="px-4 py-2.5 text-slate-600">{sla.actual ?? "—"}</td>
                  <td className="px-4 py-2.5">
                    <span className={`inline-block rounded-full border px-2 py-0.5 text-xs ${vendorSlaStatusBadgeClass(sla.status)}`}>{VENDOR_SLA_STATUS_LABELS[sla.status]}</span>
                  </td>
                </tr>
              ))}
              {slas.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-6 text-center text-slate-400 italic">No SLAs established yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Business reviews</p>
          {access.editable && <CreateBusinessReviewForm suppliers={suppliers} />}
        </div>
        <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-left text-xs uppercase tracking-wide text-slate-400">
                <th className="px-4 py-2.5 font-medium">Supplier</th>
                <th className="px-4 py-2.5 font-medium">Type</th>
                <th className="px-4 py-2.5 font-medium">Scheduled</th>
                <th className="px-4 py-2.5 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {reviews.map((r) => (
                <tr key={r.id} className="border-b border-slate-50 last:border-0">
                  <td className="px-4 py-2.5"><Link href={`/suppliers/${r.supplier.id}`} className="text-slate-700 hover:text-[#2563EB]">{r.supplier.name}</Link></td>
                  <td className="px-4 py-2.5 text-slate-600">{BUSINESS_REVIEW_TYPE_LABELS[r.type]}</td>
                  <td className="px-4 py-2.5 text-slate-600">{new Date(r.scheduledDate).toLocaleDateString()}</td>
                  <td className="px-4 py-2.5 text-slate-600">{BUSINESS_REVIEW_STATUS_LABELS[r.status]}</td>
                </tr>
              ))}
              {reviews.length === 0 && (
                <tr><td colSpan={4} className="px-4 py-6 text-center text-slate-400 italic">No business reviews scheduled yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
