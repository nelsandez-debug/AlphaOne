import Link from "next/link";
import {
  BarChart3,
  Coins,
  FileText,
  Gavel,
  Inbox,
  Layers,
  LineChart,
  PieChart,
  Receipt,
  ShieldAlert,
  ShieldCheck,
  ShoppingCart,
  TrendingUp,
  Truck,
} from "lucide-react";
import { getCurrentUser } from "@/lib/current-user";

const MODULES = [
  { href: "/intake", label: "Intake", icon: Inbox, description: "The front door — submit and disposition requests" },
  { href: "/suppliers", label: "Suppliers", icon: Truck, description: "Tier, risk, account ownership" },
  { href: "/contracts", label: "Contracts", icon: FileText, description: "MSAs, NDAs, addenda, DPAs" },
  { href: "/services", label: "Services", icon: Layers, description: "Governance and multi-category risk" },
  { href: "/sourcing", label: "Sourcing", icon: Gavel, description: "RFx events with real per-supplier participation" },
  { href: "/purchase-orders", label: "Purchase Orders", icon: ShoppingCart, description: "Issued against a supplier, contract, or intake request" },
  { href: "/invoices", label: "Invoices", icon: Receipt, description: "PO matching, holds, and exceptions" },
  { href: "/vendor-management", label: "Vendor Management", icon: ShieldCheck, description: "SLAs, business reviews, held-invoice rollups" },
  { href: "/projects", label: "Projects", icon: TrendingUp, description: "Real links to contracts, services, POs, invoices" },
  { href: "/value-tracking", label: "Value Tracking", icon: Coins, description: "Savings/avoidance items with a finance-approval workflow" },
  { href: "/budget", label: "Budget", icon: BarChart3, description: "Allocated budget vs. live committed/spent" },
  { href: "/forecast", label: "Forecast", icon: LineChart, description: "Actual spend by month plus a simple run-rate projection" },
  { href: "/risk-management", label: "Risk Management", icon: ShieldAlert, description: "A live risk register, not a fabricated score" },
  { href: "/analytics", label: "Analytics", icon: PieChart, description: "Real KPIs aggregated across every module" },
];

export default async function Home() {
  const user = await getCurrentUser();

  return (
    <div className="mx-auto w-full max-w-5xl flex flex-1 flex-col gap-8 p-16">
      {user && (
        <p className="text-sm text-slate-500">
          Signed in as <span className="font-medium text-slate-700">{user.name}</span> ({user.role})
        </p>
      )}
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Paradigm P2P</h1>
        <p className="mt-1 text-sm text-slate-500">
          Phases 0–5: foundation, core entities, intake, transacting, value & delivery, and
          oversight/reporting — every module linked by real foreign key, all the way through.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
