import {
  BarChart3,
  Coins,
  FileText,
  Gavel,
  Inbox,
  Layers,
  LayoutDashboard,
  LineChart,
  type LucideIcon,
  PieChart,
  Receipt,
  Settings,
  Shield,
  ShieldAlert,
  ShieldCheck,
  ShoppingBag,
  ShoppingCart,
  TrendingUp,
  Truck,
} from "lucide-react";

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

export const NAV_SECTIONS: NavSection[] = [
  {
    label: "Overview",
    items: [{ href: "/", label: "Control Tower", icon: LayoutDashboard }],
  },
  {
    label: "Source to pay",
    items: [
      // Labels renamed to match the P2P V2 design handoff (Intake -> Requisitions,
      // Sourcing -> RFx); href/moduleKey deliberately left as-is for now — schema
      // and routing changes to match are deferred to a follow-up pass.
      { href: "/intake", label: "Requisitions", icon: Inbox, moduleKey: "intake" },
      { href: "/suppliers", label: "Suppliers", icon: Truck, moduleKey: "suppliers" },
      { href: "/contracts", label: "Contracts", icon: FileText, moduleKey: "contracts" },
      { href: "/services", label: "Services", icon: Layers, moduleKey: "services" },
      { href: "/sourcing", label: "RFx", icon: Gavel, moduleKey: "sourcing" },
      // No schema/permission module yet — styling-only addition per design handoff;
      // visible to all signed-in users until a real Guided Buying module exists.
      { href: "/guided-buying", label: "Guided Buying", icon: ShoppingBag },
      { href: "/purchase-orders", label: "Purchase Orders", icon: ShoppingCart, moduleKey: "purchase-orders" },
      { href: "/invoices", label: "Invoices", icon: Receipt, moduleKey: "invoices" },
      { href: "/vendor-management", label: "Vendor Management", icon: ShieldCheck, moduleKey: "vendor-management" },
      { href: "/projects", label: "Projects", icon: TrendingUp, moduleKey: "projects" },
      { href: "/value-tracking", label: "Value Tracking", icon: Coins, moduleKey: "value-tracking" },
    ],
  },
  {
    label: "Insights",
    items: [
      { href: "/budget", label: "Budget", icon: BarChart3, moduleKey: "budget" },
      { href: "/forecast", label: "Forecast", icon: LineChart, moduleKey: "analytics" },
      { href: "/risk-management", label: "Risk Management", icon: ShieldAlert, moduleKey: "risk-management" },
      { href: "/analytics", label: "Analytics", icon: PieChart, moduleKey: "analytics" },
    ],
  },
  {
    label: "Admin",
    items: [
      { href: "/workflows", label: "Workflows", icon: Settings, moduleKey: "admin" },
      { href: "/administration", label: "Administration", icon: Shield, moduleKey: "admin" },
    ],
  },
];
