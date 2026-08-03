"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Layers } from "lucide-react";

// Icons are pre-rendered server-side (see AppShell) rather than passed as raw
// LucideIcon component references: this Next.js version's RSC boundary rejects
// passing component-reference props (only plain-serializable values/elements
// are allowed) from a Server Component to a "use client" one.
export type RenderedNavItem = { href: string; label: string; icon: React.ReactNode };
export type RenderedNavSection = { label: string; items: RenderedNavItem[] };

function isActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Sidebar({ sections }: { sections: RenderedNavSection[] }) {
  const pathname = usePathname();

  return (
    <aside className="glass m-3.5 mr-0 hidden w-[250px] shrink-0 flex-col pb-6 md:flex">
      <div className="flex items-center gap-2 px-4 py-5">
        <Layers size={20} className="text-accent-700" strokeWidth={1.5} />
        <span className="font-heading text-[19px] tracking-wide">
          PARADIGM <span className="font-sans text-xs font-normal opacity-50">P2P</span>
        </span>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-1.5">
        {sections.map((section) => (
          <div key={section.label}>
            <p className="px-3.5 pt-4 pb-1 text-[10px] font-medium tracking-[0.12em] text-neutral-600 uppercase opacity-70">
              {section.label}
            </p>
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const active = isActive(pathname, item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 rounded-2xl px-3.5 py-2.5 text-[13px] transition-colors ${
                      active
                        ? "bg-white/75 font-semibold text-accent-900 shadow-[0_2px_10px_rgba(30,40,60,0.06)]"
                        : "text-neutral-800 hover:bg-white/50"
                    }`}
                  >
                    <span className="shrink-0">{item.icon}</span>
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
