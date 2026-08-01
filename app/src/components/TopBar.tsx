"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Plus } from "lucide-react";
import { UserButton } from "@clerk/nextjs";
import { NAV_SECTIONS } from "@/lib/nav-items";

const ALL_ITEMS = NAV_SECTIONS.flatMap((s) => s.items);

function currentLabel(pathname: string): string {
  const match = ALL_ITEMS.filter((item) => pathname === item.href || pathname.startsWith(`${item.href}/`)).sort(
    (a, b) => b.href.length - a.href.length,
  )[0];
  return match?.label ?? "Paradigm P2P";
}

export function TopBar({ userName, userRole }: { userName?: string; userRole?: string }) {
  const pathname = usePathname();

  return (
    <header className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-3">
      <div>
        <p className="text-sm font-semibold text-slate-900">{currentLabel(pathname)}</p>
        {userName && (
          <p className="text-xs text-slate-500">
            Signed in as {userName} {userRole ? `(${userRole})` : ""}
          </p>
        )}
      </div>
      <div className="flex items-center gap-3">
        <Link
          href="/intake"
          className="flex items-center gap-1.5 rounded-lg bg-[#0B1220] px-3 py-2 text-sm font-medium text-white hover:bg-slate-800"
        >
          <Plus size={14} />
          New intake
        </Link>
        <UserButton />
      </div>
    </header>
  );
}
