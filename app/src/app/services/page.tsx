import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requirePageAccess } from "@/lib/page-guard";
import { NoAccess } from "@/components/NoAccess";
import { CreateServiceForm } from "@/components/CreateServiceForm";
import { SERVICE_CRITICALITY_LABELS } from "@/lib/labels";

export default async function ServicesPage({
  searchParams,
}: {
  searchParams: Promise<{ supplierId?: string; contractId?: string; projectId?: string }>;
}) {
  const access = await requirePageAccess("services");
  if (!access.allowed) return <NoAccess moduleLabel="Services" />;

  const { supplierId, contractId, projectId } = await searchParams;

  const [services, suppliers, contracts, filteredSupplier, filteredContract, filteredProject] = await Promise.all([
    prisma.service.findMany({
      where: { supplierId, contractId, projectId },
      orderBy: { createdAt: "desc" },
      include: { supplier: { select: { id: true, name: true } }, contract: { select: { id: true, name: true } } },
    }),
    prisma.supplier.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
    prisma.contract.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true, supplierId: true } }),
    supplierId ? prisma.supplier.findUnique({ where: { id: supplierId }, select: { name: true } }) : null,
    contractId ? prisma.contract.findUnique({ where: { id: contractId }, select: { name: true } }) : null,
    projectId ? prisma.project.findUnique({ where: { id: projectId }, select: { name: true } }) : null,
  ]);

  const filterLabel = filteredSupplier?.name ?? filteredContract?.name ?? filteredProject?.name;

  return (
    <div className="mx-auto w-full max-w-5xl p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Services</h1>
          <p className="text-sm text-slate-500">
            {services.length} services
            {filterLabel && (
              <>
                {" "}
                for <span className="font-medium text-slate-700">{filterLabel}</span>
                {" · "}
                <Link href="/services" className="text-[#2563EB] hover:underline">
                  clear filter
                </Link>
              </>
            )}
          </p>
        </div>
        {access.editable && (
          <CreateServiceForm suppliers={suppliers} contracts={contracts} defaultSupplierId={supplierId} defaultContractId={contractId} />
        )}
      </div>

      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 text-left text-xs uppercase tracking-wide text-slate-400">
              <th className="px-4 py-2.5 font-medium">Name</th>
              <th className="px-4 py-2.5 font-medium">Supplier</th>
              <th className="px-4 py-2.5 font-medium">Contract</th>
              <th className="px-4 py-2.5 font-medium">Category</th>
              <th className="px-4 py-2.5 font-medium">Criticality</th>
            </tr>
          </thead>
          <tbody>
            {services.map((s) => (
              <tr key={s.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50">
                <td className="px-4 py-2.5">
                  <Link href={`/services/${s.id}`} className="font-medium text-slate-900 hover:text-[#2563EB]">
                    {s.name}
                  </Link>
                </td>
                <td className="px-4 py-2.5">
                  <Link href={`/suppliers/${s.supplier.id}`} className="text-slate-600 hover:text-[#2563EB]">
                    {s.supplier.name}
                  </Link>
                </td>
                <td className="px-4 py-2.5">
                  {s.contract ? (
                    <Link href={`/contracts/${s.contract.id}`} className="text-slate-600 hover:text-[#2563EB]">
                      {s.contract.name}
                    </Link>
                  ) : (
                    <span className="text-slate-400 italic">None</span>
                  )}
                </td>
                <td className="px-4 py-2.5 text-slate-600">{s.category}</td>
                <td className="px-4 py-2.5 text-slate-600">{SERVICE_CRITICALITY_LABELS[s.criticality]}</td>
              </tr>
            ))}
            {services.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-slate-400 italic">
                  No services yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
