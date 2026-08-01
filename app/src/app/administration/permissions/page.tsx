import { prisma } from "@/lib/prisma";
import { requirePageAccess } from "@/lib/page-guard";
import { NoAccess } from "@/components/NoAccess";
import { PermissionCell } from "@/components/PermissionCell";
import { ROLE_LABELS } from "@/lib/labels";
import { Role } from "@/generated/prisma/enums";

const ROLES = Object.values(Role);

// The real, editable equivalent of the reference's PERMISSIONS_MATRIX — every
// requirePermission()/requirePageAccess() call across the app reads this table
// live, so an edit here takes effect everywhere immediately, no redeploy needed.
export default async function PermissionsPage() {
  const access = await requirePageAccess("admin");
  if (!access.allowed) return <NoAccess moduleLabel="Administration" />;

  const [modules, rolePermissions] = await Promise.all([
    prisma.module.findMany({ orderBy: { label: "asc" } }),
    prisma.rolePermission.findMany(),
  ]);

  const cellFor = (moduleId: string, role: Role) => rolePermissions.find((rp) => rp.moduleId === moduleId && rp.role === role);

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 p-8">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Roles &amp; Permissions</h1>
        <p className="text-sm text-slate-500">
          {access.editable ? "Click a level to change it — takes effect immediately, everywhere." : "Read-only view of the current permission matrix."}
        </p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 text-left text-xs uppercase tracking-wide text-slate-400">
              <th className="px-4 py-2.5 font-medium sticky left-0 bg-white">Module</th>
              {ROLES.map((role) => (
                <th key={role} className="px-3 py-2.5 font-medium whitespace-nowrap">{ROLE_LABELS[role]}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {modules.map((m) => (
              <tr key={m.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50">
                <td className="px-4 py-2.5 font-medium text-slate-900 sticky left-0 bg-white">{m.label}</td>
                {ROLES.map((role) => {
                  const cell = cellFor(m.id, role);
                  if (!cell) return <td key={role} className="px-3 py-2.5 text-slate-300">—</td>;
                  return (
                    <td key={role} className="px-3 py-2.5">
                      <PermissionCell id={cell.id} level={cell.level} editable={access.editable} />
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
