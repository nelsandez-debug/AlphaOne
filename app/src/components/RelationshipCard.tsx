import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { ChevronRight } from "lucide-react";

// Module-link -> filtered-list navigation (ported from the reference's
// RelationshipCard/onHeaderClick pattern): the header links to the related module's
// list page pre-filtered via query params; nothing here decides permissions, the
// linked page re-checks view access itself.
export function RelationshipCard({
  icon: Icon,
  title,
  count,
  href,
  children,
  empty,
}: {
  icon: LucideIcon;
  title: string;
  count: number;
  href: string;
  children?: React.ReactNode;
  empty?: string;
}) {
  return (
    <div className="glass p-5">
      <Link href={href} className="flex items-center justify-between mb-3 group">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 flex items-center gap-1.5 group-hover:text-slate-600">
          <Icon size={14} className="text-slate-400" /> {title} ({count})
        </p>
        <ChevronRight size={14} className="text-slate-300 group-hover:text-slate-500" />
      </Link>
      {count === 0 ? <p className="text-xs text-slate-400 italic">{empty ?? "None yet."}</p> : children}
    </div>
  );
}
