import Link from "next/link";
import { Shield, Users } from "lucide-react";
import { requirePageAccess } from "@/lib/page-guard";
import { NoAccess } from "@/components/NoAccess";

const SECTIONS = [
  { href: "/administration/permissions", label: "Roles & Permissions", icon: Shield, description: "The real, editable Module x Role permission matrix" },
  { href: "/administration/users", label: "Users", icon: Users, description: "View every signed-in user and change their role" },
  { href: "/administration/ownership", label: "Ownership hub", icon: Users, description: "A leaderboard and full list across every owned record type" },
];

export default async function AdministrationPage() {
  const access = await requirePageAccess("admin");
  if (!access.allowed) return <NoAccess moduleLabel="Administration" />;

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6 p-8">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Administration</h1>
        <p className="text-sm text-slate-500">
          The meta layer: permissions, users, and ownership — all backed by real data, not hardcoded config.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {SECTIONS.map((s) => (
          <Link key={s.href} href={s.href} className="rounded-xl border border-slate-200 bg-white p-5 hover:border-[#2563EB] hover:shadow-sm">
            <s.icon size={18} className="text-slate-400" />
            <p className="mt-3 text-sm font-medium text-slate-900">{s.label}</p>
            <p className="mt-1 text-xs text-slate-500">{s.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
