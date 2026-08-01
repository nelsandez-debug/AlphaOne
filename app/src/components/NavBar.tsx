import Link from "next/link";
import { UserButton } from "@clerk/nextjs";

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/intake", label: "Intake" },
  { href: "/suppliers", label: "Suppliers" },
  { href: "/contracts", label: "Contracts" },
  { href: "/services", label: "Services" },
  { href: "/sourcing", label: "Sourcing" },
  { href: "/purchase-orders", label: "Purchase Orders" },
  { href: "/invoices", label: "Invoices" },
  { href: "/vendor-management", label: "Vendor Management" },
];

// Minimal nav shell so every module is reachable. Not a port of the reference's
// full app shell (sidebar, module switcher, notifications) — that's a later
// polish pass once the module count settles down.
export function NavBar() {
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-y-2 px-8 py-3">
        <nav className="flex flex-wrap items-center gap-x-4 gap-y-1">
          <span className="text-sm font-semibold text-slate-900">Paradigm P2P</span>
          {LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="text-sm text-slate-500 hover:text-slate-900">
              {link.label}
            </Link>
          ))}
        </nav>
        <UserButton />
      </div>
    </header>
  );
}
