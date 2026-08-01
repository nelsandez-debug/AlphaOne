import Link from "next/link";
import { UserButton } from "@clerk/nextjs";

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/intake", label: "Intake" },
  { href: "/suppliers", label: "Suppliers" },
  { href: "/contracts", label: "Contracts" },
  { href: "/services", label: "Services" },
];

// Minimal nav shell so Phase 1's three modules are reachable. Not a port of the
// reference's full app shell (sidebar, module switcher, notifications) — that's a
// later polish pass once more modules exist to navigate between.
export function NavBar() {
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-8 py-3">
        <nav className="flex items-center gap-5">
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
