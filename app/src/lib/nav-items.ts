import { FileText, Inbox, Layers, LayoutDashboard, type LucideIcon, Receipt, ShoppingCart, TrendingUp, Truck } from "lucide-react";

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  // Module key checked against the permission matrix; omitted for items every
  // signed-in user can see regardless of role (just Home today).
  moduleKey?: string;
};

export type NavSection = {
  label: string;
  items: NavItem[];
};

// AlphaTwo-reduced-scope test build (7 modules) — see CLAUDE.md. The full
// 18-module nav is preserved on the `alphatwo` branch/tag.
export const NAV_SECTIONS: NavSection[] = [
  {
    label: "Overview",
    items: [{ href: "/", label: "Control Tower", icon: LayoutDashboard }],
  },
  {
    label: "Source to pay",
    items: [
      { href: "/intake", label: "Intake", icon: Inbox, moduleKey: "intake" },
      { href: "/suppliers", label: "Suppliers", icon: Truck, moduleKey: "suppliers" },
      { href: "/contracts", label: "Contracts", icon: FileText, moduleKey: "contracts" },
      { href: "/services", label: "Services", icon: Layers, moduleKey: "services" },
      { href: "/purchase-orders", label: "Purchase Orders", icon: ShoppingCart, moduleKey: "purchase-orders" },
      { href: "/invoices", label: "Invoices", icon: Receipt, moduleKey: "invoices" },
      { href: "/projects", label: "Projects", icon: TrendingUp, moduleKey: "projects" },
    ],
  },
];
