import { prisma } from "@/lib/prisma";
import { requirePageAccess } from "@/lib/page-guard";
import { NoAccess } from "@/components/NoAccess";
import { UserRoleField } from "@/components/UserRoleField";

export default async function UsersPage() {
  const access = await requirePageAccess("admin");
  if (!access.allowed) return <NoAccess moduleLabel="Administration" />;

  const users = await prisma.user.findMany({ orderBy: { name: "asc" } });

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6 p-8">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Users</h1>
        <p className="text-sm text-slate-500">{users.length} users. Role changes take effect immediately via the Roles &amp; Permissions matrix.</p>
      </div>

      <div className="glass overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 text-left text-xs uppercase tracking-wide text-slate-400">
              <th className="px-4 py-2.5 font-medium">Name</th>
              <th className="px-4 py-2.5 font-medium">Email</th>
              <th className="px-4 py-2.5 font-medium">Role</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b border-slate-50 last:border-0 hover:bg-neutral-100">
                <td className="px-4 py-2.5 font-medium text-slate-900">{u.name}</td>
                <td className="px-4 py-2.5 text-slate-600">{u.email}</td>
                <td className="px-4 py-2.5">
                  <UserRoleField id={u.id} role={u.role} editable={access.editable} />
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan={3} className="px-4 py-8 text-center text-slate-400 italic">No users yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
