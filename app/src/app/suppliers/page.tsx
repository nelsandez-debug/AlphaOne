import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requirePageAccess } from "@/lib/page-guard";
import { NoAccess } from "@/components/NoAccess";
import { CreateSupplierForm } from "@/components/CreateSupplierForm";
import { RISK_LEVEL_LABELS, SUPPLIER_STATUS_LABELS, SUPPLIER_TIER_LABELS, riskBadgeClass } from "@/lib/labels";

export default async function SuppliersPage() {
  const access = await requirePageAccess("suppliers");
  if (!access.allowed) return <NoAccess moduleLabel="Suppliers" />;

  const suppliers = await prisma.supplier.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { contracts: true, services: true } } },
  });

  return (
    <div className="mx-auto w-full max-w-5xl p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Suppliers</h1>
          <p className="text-sm text-slate-500">{suppliers.length} suppliers</p>
        </div>
        {access.editable && <CreateSupplierForm />}
      </div>

      <div className="glass overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 text-left text-xs uppercase tracking-wide text-slate-400">
              <th className="px-4 py-2.5 font-medium">Name</th>
              <th className="px-4 py-2.5 font-medium">Category</th>
              <th className="px-4 py-2.5 font-medium">Tier</th>
              <th className="px-4 py-2.5 font-medium">Status</th>
              <th className="px-4 py-2.5 font-medium">Risk</th>
              <th className="px-4 py-2.5 font-medium">Contracts</th>
              <th className="px-4 py-2.5 font-medium">Services</th>
            </tr>
          </thead>
          <tbody>
            {suppliers.map((s) => (
              <tr key={s.id} className="border-b border-slate-50 last:border-0 hover:bg-neutral-100">
                <td className="px-4 py-2.5">
                  <Link href={`/suppliers/${s.id}`} className="font-medium text-slate-900 hover:text-accent-700">
                    {s.name}
                  </Link>
                </td>
                <td className="px-4 py-2.5 text-slate-600">{s.category}</td>
                <td className="px-4 py-2.5 text-slate-600">{SUPPLIER_TIER_LABELS[s.tier]}</td>
                <td className="px-4 py-2.5 text-slate-600">{SUPPLIER_STATUS_LABELS[s.status]}</td>
                <td className="px-4 py-2.5">
                  <span className={`inline-block rounded-full border px-2 py-0.5 text-xs ${riskBadgeClass(s.riskLevel)}`}>
                    {s.riskLevel ? RISK_LEVEL_LABELS[s.riskLevel] : "Not assessed"}
                  </span>
                </td>
                <td className="px-4 py-2.5 text-slate-600">{s._count.contracts}</td>
                <td className="px-4 py-2.5 text-slate-600">{s._count.services}</td>
              </tr>
            ))}
            {suppliers.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-slate-400 italic">
                  No suppliers yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
