"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, Plus } from "lucide-react";
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
    <header className="glass mx-3.5 mt-3.5 flex items-center justify-between px-5 py-3">
      <div>
        <p className="font-heading text-base">{currentLabel(pathname)}</p>
        {userName && (
          <p className="text-xs text-neutral-600">
            Signed in as {userName} {userRole ? `(${userRole})` : ""}
          </p>
        )}
      </div>
      <div className="flex items-center gap-3">
        <input
          type="text"
          placeholder="Search…"
          className="hidden w-56 rounded-full border border-black/[0.06] bg-white/60 px-4 py-2 text-sm outline-none placeholder:text-neutral-500 focus-visible:border-accent-500 sm:block"
        />
        <button
          type="button"
          aria-label="Notifications"
          className="flex h-9 w-9 items-center justify-center rounded-full border border-black/[0.06] bg-white/50 text-accent-700 hover:bg-white/70"
        >
          <Bell size={16} strokeWidth={1.5} />
        </button>
        <Link
          href="/intake"
          className="flex items-center gap-1.5 rounded-full bg-accent-600 px-4 py-2 text-sm font-medium text-white hover:bg-accent-700"
        >
          <Plus size={14} />
          New Requisition
        </Link>
        <UserButton />
      </div>
    </header>
  );
}
