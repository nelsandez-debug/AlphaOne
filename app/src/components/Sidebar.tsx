"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { NavSection } from "@/lib/nav-items";

function isActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Sidebar({ sections }: { sections: NavSection[] }) {
  const pathname = usePathname();

  return (
    <aside className="hidden w-60 shrink-0 flex-col bg-[#0B1220] md:flex">
      <div className="flex items-center gap-2 px-5 py-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#2563EB] text-sm font-semibold text-white">
          P
        </div>
        <span className="text-sm font-semibold text-white">Paradigm P2P</span>
      </div>

      <nav className="flex-1 space-y-5 overflow-y-auto px-3 pb-6">
        {sections.map((section) => (
          <div key={section.label}>
            <p className="px-3 pb-1.5 text-[11px] font-medium uppercase tracking-wide text-slate-500">
              {section.label}
            </p>
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const active = isActive(pathname, item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors ${
                      active
                        ? "bg-white/10 font-medium text-white"
                        : "text-slate-400 hover:bg-white/5 hover:text-slate-100"
                    }`}
                  >
                    <item.icon size={16} className="shrink-0" />
                    <span className="truncate">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
    </aside>
  );
}
