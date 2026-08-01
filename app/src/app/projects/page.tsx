import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requirePageAccess } from "@/lib/page-guard";
import { NoAccess } from "@/components/NoAccess";
import { CreateProjectForm } from "@/components/CreateProjectForm";
import { PROJECT_STATUS_LABELS, projectStatusBadgeClass } from "@/lib/labels";

export default async function ProjectsPage() {
  const access = await requirePageAccess("projects");
  if (!access.allowed) return <NoAccess moduleLabel="Projects" />;

  const [projects, suppliers] = await Promise.all([
    prisma.project.findMany({
      orderBy: { createdAt: "desc" },
      include: { supplier: { select: { id: true, name: true } } },
    }),
    prisma.supplier.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
  ]);

  return (
    <div className="mx-auto w-full max-w-5xl p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Projects</h1>
          <p className="text-sm text-slate-500">{projects.length} projects</p>
        </div>
        {access.editable && <CreateProjectForm suppliers={suppliers} />}
      </div>

      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 text-left text-xs uppercase tracking-wide text-slate-400">
              <th className="px-4 py-2.5 font-medium">Name</th>
              <th className="px-4 py-2.5 font-medium">Supplier</th>
              <th className="px-4 py-2.5 font-medium">Budget amount</th>
              <th className="px-4 py-2.5 font-medium">Status</th>
              <th className="px-4 py-2.5 font-medium">Progress</th>
            </tr>
          </thead>
          <tbody>
            {projects.map((p) => (
              <tr key={p.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50">
                <td className="px-4 py-2.5">
                  <Link href={`/projects/${p.id}`} className="font-medium text-slate-900 hover:text-[#2563EB]">{p.name}</Link>
                </td>
                <td className="px-4 py-2.5">
                  {p.supplier ? (
                    <Link href={`/suppliers/${p.supplier.id}`} className="text-slate-600 hover:text-[#2563EB]">{p.supplier.name}</Link>
                  ) : (
                    <span className="text-slate-400 italic">None</span>
                  )}
                </td>
                <td className="px-4 py-2.5 text-slate-600">{p.budgetAmount != null ? `$${p.budgetAmount.toLocaleString()}` : "—"}</td>
                <td className="px-4 py-2.5">
                  <span className={`inline-block rounded-full border px-2 py-0.5 text-xs ${projectStatusBadgeClass(p.status)}`}>{PROJECT_STATUS_LABELS[p.status]}</span>
                </td>
                <td className="px-4 py-2.5 text-slate-600">{p.progress}%</td>
              </tr>
            ))}
            {projects.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-slate-400 italic">No projects yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
