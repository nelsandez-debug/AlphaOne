import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requirePageAccess } from "@/lib/page-guard";
import { NoAccess } from "@/components/NoAccess";
import { CreateContractForm } from "@/components/CreateContractForm";
import { CONTRACT_STATUS_LABELS, RISK_LEVEL_LABELS, riskBadgeClass } from "@/lib/labels";

export default async function ContractsPage({ searchParams }: { searchParams: Promise<{ supplierId?: string; projectId?: string }> }) {
  const access = await requirePageAccess("contracts");
  if (!access.allowed) return <NoAccess moduleLabel="Contracts" />;

  const { supplierId, projectId } = await searchParams;

  const [contracts, suppliers, filteredSupplier, filteredProject] = await Promise.all([
    prisma.contract.findMany({
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
          <h1 className="text-xl font-semibold text-slate-900">Contracts</h1>
          <p className="text-sm text-slate-500">
            {contracts.length} contracts
            {filterLabel && (
              <>
                {" "}
                for <span className="font-medium text-slate-700">{filterLabel}</span>
                {" · "}
                <Link href="/contracts" className="text-accent-700 hover:underline">
                  clear filter
                </Link>
              </>
            )}
          </p>
        </div>
        {access.editable && <CreateContractForm suppliers={suppliers} defaultSupplierId={supplierId} />}
      </div>

      <div className="glass overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 text-left text-xs uppercase tracking-wide text-slate-400">
              <th className="px-4 py-2.5 font-medium">Name</th>
              <th className="px-4 py-2.5 font-medium">Supplier</th>
              <th className="px-4 py-2.5 font-medium">Type</th>
              <th className="px-4 py-2.5 font-medium">Status</th>
              <th className="px-4 py-2.5 font-medium">Risk</th>
            </tr>
          </thead>
          <tbody>
            {contracts.map((c) => (
              <tr key={c.id} className="border-b border-slate-50 last:border-0 hover:bg-neutral-100">
                <td className="px-4 py-2.5">
                  <Link href={`/contracts/${c.id}`} className="font-medium text-slate-900 hover:text-accent-700">
                    {c.name}
                  </Link>
                </td>
                <td className="px-4 py-2.5">
                  <Link href={`/suppliers/${c.supplier.id}`} className="text-slate-600 hover:text-accent-700">
                    {c.supplier.name}
                  </Link>
                </td>
                <td className="px-4 py-2.5 text-slate-600">{c.type}</td>
                <td className="px-4 py-2.5 text-slate-600">{CONTRACT_STATUS_LABELS[c.status]}</td>
                <td className="px-4 py-2.5">
                  <span className={`inline-block rounded-full border px-2 py-0.5 text-xs ${riskBadgeClass(c.riskLevel)}`}>
                    {c.riskLevel ? RISK_LEVEL_LABELS[c.riskLevel] : "Not assessed"}
                  </span>
                </td>
              </tr>
            ))}
            {contracts.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-slate-400 italic">
                  No contracts yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
