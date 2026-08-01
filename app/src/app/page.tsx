import Link from "next/link";
import { FileText, Layers, Truck } from "lucide-react";
import { getCurrentUser } from "@/lib/current-user";

const MODULES = [
  { href: "/suppliers", label: "Suppliers", icon: Truck, description: "Tier, risk, account ownership" },
  { href: "/contracts", label: "Contracts", icon: FileText, description: "MSAs, NDAs, addenda, DPAs" },
  { href: "/services", label: "Services", icon: Layers, description: "Governance and multi-category risk" },
];

export default async function Home() {
  const user = await getCurrentUser();

  return (
    <div className="mx-auto w-full max-w-3xl flex flex-1 flex-col gap-8 p-16">
      {user && (
        <p className="text-sm text-slate-500">
          Signed in as <span className="font-medium text-slate-700">{user.name}</span> ({user.role})
        </p>
      )}
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Paradigm P2P</h1>
        <p className="mt-1 text-sm text-slate-500">
          Phase 1 core entities — everything else in the platform will reference these by real foreign key.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        {MODULES.map((m) => (
          <Link
            key={m.href}
            href={m.href}
            className="rounded-xl border border-slate-200 bg-white p-5 hover:border-[#2563EB] hover:shadow-sm"
          >
            <m.icon size={18} className="text-slate-400" />
            <p className="mt-3 text-sm font-medium text-slate-900">{m.label}</p>
            <p className="mt-1 text-xs text-slate-500">{m.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
