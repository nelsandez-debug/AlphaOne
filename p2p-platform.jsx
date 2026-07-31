import React, { useState, useMemo, useEffect } from "react";
import {
  LayoutGrid, Users, Gavel, FileText, ShoppingCart, Receipt, BarChart3,
  Sparkles, Bot, X, Send, Search, Bell, ChevronRight, TrendingUp, TrendingDown,
  ShieldAlert, Clock, CheckCircle2, AlertTriangle, Zap, ArrowUpRight, Plus,
  Inbox, Briefcase, Building2, GitBranch, Star, MessageSquare, PlayCircle,
  PauseCircle, ArrowRight, Workflow as WorkflowIcon, ClipboardList,
  SlidersHorizontal, ToggleLeft, ToggleRight, GripVertical, Radar,
  Wallet, CalendarRange, LineChart as LineChartIcon, Flag, Layers, ShieldCheck,
  Settings, Database, Palette, Mail, Smartphone, ArrowLeft, RefreshCw, XCircle, Edit3,
  FolderOpen, FileCheck2, UserCircle, Package, Lock, CalendarCheck, Unlock, Handshake, Upload,
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar,
  CartesianGrid, PieChart, Pie, Cell, LineChart, Line,
} from "recharts";

/* ---------------------------------- data ---------------------------------- */

const NAV = [
  { id: "dashboard", label: "Control Tower", icon: LayoutGrid },
  { id: "intake", label: "Intake", icon: Inbox },
  { id: "sourcing", label: "Sourcing & RFX", icon: Gavel },
  { id: "suppliers", label: "Suppliers", icon: Users },
  { id: "vendors", label: "Vendor Management", icon: Building2 },
  { id: "contracts", label: "Contracts", icon: FileText },
  { id: "services", label: "Services", icon: Layers },
  { id: "projects", label: "Project Management", icon: CalendarRange },
  { id: "buying", label: "Guided Buying", icon: ShoppingCart },
  { id: "pos", label: "Purchase Orders", icon: ClipboardList },
  { id: "invoices", label: "Invoices", icon: Receipt },
  { id: "value", label: "Value Tracking", icon: TrendingUp },
  { id: "budget", label: "Budget", icon: Wallet },
  { id: "forecast", label: "Forecast", icon: LineChartIcon },
  { id: "risk", label: "Risk Management", icon: ShieldAlert },
  { id: "workflows", label: "Workflows", icon: GitBranch },
  { id: "config", label: "Configuration Studio", icon: SlidersHorizontal },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
  { id: "admin", label: "Administration", icon: Settings },
];

const KPIS = [
  { label: "Procurement automation", value: 87, target: 85, unit: "%", trend: "up" },
  { label: "Touchless invoices", value: 91, target: 90, unit: "%", trend: "up" },
  { label: "Contract compliance", value: 96, target: 98, unit: "%", trend: "down" },
  { label: "Approval cycle time", value: 1.4, target: 1.6, unit: "d", trend: "up" },
];

const SPEND_TREND = [
  { m: "Feb", planned: 42, actual: 40 }, { m: "Mar", planned: 44, actual: 43 },
  { m: "Apr", planned: 45, actual: 47 }, { m: "May", planned: 46, actual: 44 },
  { m: "Jun", planned: 48, actual: 46 }, { m: "Jul", planned: 49, actual: 45 },
];

const CATEGORY_SPEND = [
  { name: "IT & Software", value: 18.2 }, { name: "Logistics", value: 12.4 },
  { name: "MRO", value: 9.1 }, { name: "Professional Svcs", value: 8.6 },
  { name: "Marketing", value: 5.3 }, { name: "Facilities", value: 4.9 },
];
const PIE_COLORS = ["#16A34A", "#2563EB", "#6B8F94", "#8C6B3F", "#4A7377", "#A9762E"];

const AGENTS = [
  { name: "Supplier Agent", status: "active", detail: "Flagged 3 vendors with lapsing certs of insurance", icon: Users },
  { name: "Contract Agent", status: "active", detail: "12 renewals due in 60 days, 2 with price escalation clauses", icon: FileText },
  { name: "Spend Agent", status: "attention", detail: "Maverick spend up 4.2% in Facilities this month", icon: TrendingUp },
  { name: "Invoice Agent", status: "active", detail: "1,204 invoices matched touchless overnight", icon: Receipt },
  { name: "Category Intelligence", status: "idle", detail: "Next benchmark refresh scheduled for Aug 1", icon: Zap },
  { name: "Procurement Advisor", status: "active", detail: "Weekly exec brief generated — 3 savings plays identified", icon: Sparkles },
];

const SUPPLIERS = [
  { id: "SUP-01", name: "Meridian Steel Co.", category: "Raw Materials", risk: "Low", risk_score: 18, spend: "$4.2M", status: "Preferred", tier: "Strategic",
    accountOwner: "Priya Shah",
    documents: [], notes: [],
    msa: { name: "Meridian Steel — Master Supply Agreement", expires: "89 days" } },
  { id: "SUP-02", name: "Northwind Logistics", category: "Logistics", risk: "Medium", risk_score: 46, spend: "$3.1M", status: "Approved", tier: "Preferred",
    accountOwner: "Elena Ruiz",
    documents: [], notes: [],
    msa: { name: "Northwind Logistics — Master Services Agreement", expires: "210 days" } },
  { id: "SUP-03", name: "Vantage Cloud Systems", category: "IT & Software", risk: "Low", risk_score: 12, spend: "$2.8M", status: "Preferred", tier: "Partner",
    accountOwner: "Dana Kim",
    documents: [], notes: [],
    msa: { name: "Vantage Cloud — Master Services Agreement", expires: "18 days", flag: "Auto-renews, no negotiation window" } },
  { id: "SUP-04", name: "Halcyon Facilities Group", category: "Facilities", risk: "High", risk_score: 78, spend: "$1.1M", status: "Under Review", tier: "Unmanaged",
    accountOwner: "Marcus Webb",
    documents: [], notes: [],
    msa: { name: "Halcyon Facilities — Master Agreement", expires: "52 days", flag: "Pending counter-signature" } },
  { id: "SUP-05", name: "Orbital Marketing Partners", category: "Marketing", risk: "Medium", risk_score: 39, spend: "$0.9M", status: "Approved", tier: "Transactional",
    accountOwner: "Sam Okafor",
    documents: [], notes: [],
    msa: null },
  { id: "SUP-06", name: "Crescent Analytics", category: "Professional Services", risk: null, risk_score: null, spend: "$0.2M", status: "Pending Onboarding", tier: "Transactional",
    accountOwner: "Priya Shah",
    documents: [], notes: [],
    msa: null },
  {
      "id": "SUP-07",
      "name": "Cobalt Technologies",
      "category": "Raw Materials",
      "risk": null,
      "risk_score": null,
      "spend": "$0.4M",
      "status": "Under Review",
      "tier": "Strategic",
    "accountOwner": "Elena Ruiz",
    documents: [], notes: [],
      "msa": null
    },
  {
      "id": "SUP-08",
      "name": "Coastal Technologies",
      "category": "Raw Materials",
      "risk": "Low",
      "risk_score": 11,
      "spend": "$2.5M",
      "status": "Preferred",
      "tier": "Strategic",
    "accountOwner": "Dana Kim",
    documents: [], notes: [],
      "msa": {
        "name": "Coastal Technologies — Master Services Agreement",
        "expires": "28 days"
      }
    },
  {
      "id": "SUP-09",
      "name": "Silverline Dynamics",
      "category": "Raw Materials",
      "risk": "High",
      "risk_score": 43,
      "spend": "$2.7M",
      "status": "Preferred",
      "tier": "Transactional",
    "accountOwner": "Marcus Webb",
    documents: [], notes: [],
      "msa": {
        "name": "Silverline Dynamics — Master Services Agreement",
        "expires": "94 days"
      }
    },
  {
      "id": "SUP-10",
      "name": "Ironwood Ventures",
      "category": "IT & Software",
      "risk": "Medium",
      "risk_score": 52,
      "spend": "$2.9M",
      "status": "Under Review",
      "tier": "Strategic",
    "accountOwner": "Sam Okafor",
    documents: [], notes: [],
      "msa": {
        "name": "Ironwood Ventures — Master Services Agreement",
        "expires": "208 days",
        "flag": "Auto-renews, no negotiation window"
      }
    },
  {
      "id": "SUP-11",
      "name": "Nimbus Consulting",
      "category": "Professional Services",
      "risk": "High",
      "risk_score": 16,
      "spend": "$1.4M",
      "status": "Preferred",
      "tier": "Transactional",
    "accountOwner": "Priya Shah",
    documents: [], notes: [],
      "msa": {
        "name": "Nimbus Consulting — Master Services Agreement",
        "expires": "134 days"
      }
    },
  {
      "id": "SUP-12",
      "name": "Harbor Robotics",
      "category": "Marketing",
      "risk": "Medium",
      "risk_score": 34,
      "spend": "$0.7M",
      "status": "Under Review",
      "tier": "Transactional",
    "accountOwner": "Elena Ruiz",
    documents: [], notes: [],
      "msa": {
        "name": "Harbor Robotics — Master Services Agreement",
        "expires": "288 days"
      }
    },
  {
      "id": "SUP-13",
      "name": "Anchor Analytics",
      "category": "Marketing",
      "risk": "High",
      "risk_score": 79,
      "spend": "$0.2M",
      "status": "Approved",
      "tier": "Preferred",
    "accountOwner": "Dana Kim",
    documents: [], notes: [],
      "msa": null
    },
  {
      "id": "SUP-14",
      "name": "Coastal Labs",
      "category": "Facilities",
      "risk": "Low",
      "risk_score": 80,
      "spend": "$0.9M",
      "status": "Under Review",
      "tier": "Transactional",
    "accountOwner": "Marcus Webb",
    documents: [], notes: [],
      "msa": {
        "name": "Coastal Labs — Master Services Agreement",
        "expires": "249 days",
        "flag": "Pending counter-signature"
      }
    },
  {
      "id": "SUP-15",
      "name": "Driftwood Technologies",
      "category": "Professional Services",
      "risk": "Medium",
      "risk_score": 82,
      "spend": "$0.4M",
      "status": "Pending Onboarding",
      "tier": "Preferred",
    "accountOwner": "Sam Okafor",
    documents: [], notes: [],
      "msa": {
        "name": "Driftwood Technologies — Master Services Agreement",
        "expires": "85 days"
      }
    },
  {
      "id": "SUP-16",
      "name": "Elmwood Networks",
      "category": "IT & Software",
      "risk": "Low",
      "risk_score": 62,
      "spend": "$3.4M",
      "status": "Preferred",
      "tier": "Strategic",
    "accountOwner": "Priya Shah",
    documents: [], notes: [],
      "msa": {
        "name": "Elmwood Networks — Master Services Agreement",
        "expires": "254 days"
      }
    },
  {
      "id": "SUP-17",
      "name": "Lumen Consulting",
      "category": "IT & Software",
      "risk": "High",
      "risk_score": 42,
      "spend": "$3.1M",
      "status": "Under Review",
      "tier": "Strategic",
    "accountOwner": "Elena Ruiz",
    documents: [], notes: [],
      "msa": {
        "name": "Lumen Consulting — Master Services Agreement",
        "expires": "247 days",
        "flag": "Missing updated insurance rider"
      }
    },
  {
      "id": "SUP-18",
      "name": "Maplewood Robotics",
      "category": "Facilities",
      "risk": "High",
      "risk_score": 21,
      "spend": "$1.4M",
      "status": "Under Review",
      "tier": "Unmanaged",
    "accountOwner": "Dana Kim",
    documents: [], notes: [],
      "msa": null
    },
  {
      "id": "SUP-19",
      "name": "Cascade Partners",
      "category": "Logistics",
      "risk": "High",
      "risk_score": 49,
      "spend": "$0.9M",
      "status": "Pending Onboarding",
      "tier": "Unmanaged",
    "accountOwner": "Marcus Webb",
    documents: [], notes: [],
      "msa": {
        "name": "Cascade Partners — Master Services Agreement",
        "expires": "172 days"
      }
    },
  {
      "id": "SUP-20",
      "name": "Harbor Facilities",
      "category": "Professional Services",
      "risk": null,
      "risk_score": null,
      "spend": "$3.3M",
      "status": "Pending Onboarding",
      "tier": "Strategic",
    "accountOwner": "Sam Okafor",
    documents: [], notes: [],
      "msa": {
        "name": "Harbor Facilities — Master Services Agreement",
        "expires": "80 days"
      }
    },
  {
      "id": "SUP-21",
      "name": "Oakhurst Industries",
      "category": "Logistics",
      "risk": "High",
      "risk_score": 62,
      "spend": "$2.3M",
      "status": "Approved",
      "tier": "Preferred",
    "accountOwner": "Priya Shah",
    documents: [], notes: [],
      "msa": {
        "name": "Oakhurst Industries — Master Services Agreement",
        "expires": "219 days"
      }
    },
  {
      "id": "SUP-22",
      "name": "Bridgeway Logistics",
      "category": "Marketing",
      "risk": "Low",
      "risk_score": 36,
      "spend": "$0.1M",
      "status": "Preferred",
      "tier": "Unmanaged",
    "accountOwner": "Elena Ruiz",
    documents: [], notes: [],
      "msa": {
        "name": "Bridgeway Logistics — Master Services Agreement",
        "expires": "132 days"
      }
    },
  {
      "id": "SUP-23",
      "name": "Maplewood Technologies",
      "category": "Raw Materials",
      "risk": "Low",
      "risk_score": 50,
      "spend": "$0.5M",
      "status": "Preferred",
      "tier": "Strategic",
    "accountOwner": "Dana Kim",
    documents: [], notes: [],
      "msa": {
        "name": "Maplewood Technologies — Master Services Agreement",
        "expires": "263 days"
      }
    },
  {
      "id": "SUP-24",
      "name": "Granite Partners",
      "category": "Professional Services",
      "risk": "Medium",
      "risk_score": 60,
      "spend": "$1.7M",
      "status": "Approved",
      "tier": "Unmanaged",
    "accountOwner": "Marcus Webb",
    documents: [], notes: [],
      "msa": {
        "name": "Granite Partners — Master Services Agreement",
        "expires": "196 days"
      }
    },
  {
      "id": "SUP-25",
      "name": "Frontier Holdings",
      "category": "Raw Materials",
      "risk": "High",
      "risk_score": 20,
      "spend": "$0.7M",
      "status": "Preferred",
      "tier": "Strategic",
    "accountOwner": "Sam Okafor",
    documents: [], notes: [],
      "msa": {
        "name": "Frontier Holdings — Master Services Agreement",
        "expires": "70 days"
      }
    },
  {
      "id": "SUP-26",
      "name": "Harbor Ventures",
      "category": "Marketing",
      "risk": "Medium",
      "risk_score": 67,
      "spend": "$3.5M",
      "status": "Approved",
      "tier": "Preferred",
    "accountOwner": "Priya Shah",
    documents: [], notes: [],
      "msa": {
        "name": "Harbor Ventures — Master Services Agreement",
        "expires": "296 days",
        "flag": "Missing updated insurance rider"
      }
    },
  {
      "id": "SUP-27",
      "name": "Lakeshore Labs",
      "category": "IT & Software",
      "risk": "Low",
      "risk_score": 29,
      "spend": "$1.5M",
      "status": "Pending Onboarding",
      "tier": "Strategic",
    "accountOwner": "Elena Ruiz",
    documents: [], notes: [],
      "msa": null
    },
  {
      "id": "SUP-28",
      "name": "Junction Dynamics",
      "category": "IT & Software",
      "risk": "Medium",
      "risk_score": 41,
      "spend": "$1.8M",
      "status": "Pending Onboarding",
      "tier": "Preferred",
    "accountOwner": "Dana Kim",
    documents: [], notes: [],
      "msa": {
        "name": "Junction Dynamics — Master Services Agreement",
        "expires": "299 days"
      }
    },
  {
      "id": "SUP-29",
      "name": "Beacon Media",
      "category": "Logistics",
      "risk": "Low",
      "risk_score": 82,
      "spend": "$3.4M",
      "status": "Preferred",
      "tier": "Preferred",
    "accountOwner": "Marcus Webb",
    documents: [], notes: [],
      "msa": {
        "name": "Beacon Media — Master Services Agreement",
        "expires": "286 days"
      }
    },
  {
      "id": "SUP-30",
      "name": "Cobalt Networks",
      "category": "IT & Software",
      "risk": null,
      "risk_score": null,
      "spend": "$3.1M",
      "status": "Preferred",
      "tier": "Preferred",
    "accountOwner": "Sam Okafor",
    documents: [], notes: [],
      "msa": null
    },
  {
      "id": "SUP-31",
      "name": "Amber Industries",
      "category": "Logistics",
      "risk": "Medium",
      "risk_score": 82,
      "spend": "$1.4M",
      "status": "Under Review",
      "tier": "Strategic",
    "accountOwner": "Priya Shah",
    documents: [], notes: [],
      "msa": {
        "name": "Amber Industries — Master Services Agreement",
        "expires": "175 days"
      }
    },
  {
      "id": "SUP-32",
      "name": "Westfield Media",
      "category": "Raw Materials",
      "risk": "Low",
      "risk_score": 9,
      "spend": "$1.8M",
      "status": "Pending Onboarding",
      "tier": "Preferred",
    "accountOwner": "Elena Ruiz",
    documents: [], notes: [],
      "msa": {
        "name": "Westfield Media — Master Services Agreement",
        "expires": "52 days"
      }
    },
  {
      "id": "SUP-33",
      "name": "Silverline Ventures",
      "category": "Logistics",
      "risk": "Low",
      "risk_score": 55,
      "spend": "$3.5M",
      "status": "Under Review",
      "tier": "Transactional",
    "accountOwner": "Dana Kim",
    documents: [], notes: [],
      "msa": {
        "name": "Silverline Ventures — Master Services Agreement",
        "expires": "169 days"
      }
    },
  {
      "id": "SUP-34",
      "name": "Granite Solutions",
      "category": "Raw Materials",
      "risk": null,
      "risk_score": null,
      "spend": "$0.6M",
      "status": "Under Review",
      "tier": "Unmanaged",
    "accountOwner": "Marcus Webb",
    documents: [], notes: [],
      "msa": {
        "name": "Granite Solutions — Master Services Agreement",
        "expires": "69 days"
      }
    },
  {
      "id": "SUP-35",
      "name": "Amber Analytics",
      "category": "Facilities",
      "risk": "Low",
      "risk_score": 41,
      "spend": "$1.5M",
      "status": "Pending Onboarding",
      "tier": "Preferred",
    "accountOwner": "Sam Okafor",
    documents: [], notes: [],
      "msa": null
    },
  {
      "id": "SUP-36",
      "name": "Amber Group",
      "category": "Facilities",
      "risk": null,
      "risk_score": null,
      "spend": "$2.0M",
      "status": "Approved",
      "tier": "Strategic",
    "accountOwner": "Priya Shah",
    documents: [], notes: [],
      "msa": {
        "name": "Amber Group — Master Services Agreement",
        "expires": "297 days"
      }
    },
  {
      "id": "SUP-37",
      "name": "Driftwood Media",
      "category": "IT & Software",
      "risk": "High",
      "risk_score": 27,
      "spend": "$1.3M",
      "status": "Preferred",
      "tier": "Strategic",
    "accountOwner": "Elena Ruiz",
    documents: [], notes: [],
      "msa": {
        "name": "Driftwood Media — Master Services Agreement",
        "expires": "235 days",
        "flag": "Auto-renews, no negotiation window"
      }
    },
  {
      "id": "SUP-38",
      "name": "Prairie Dynamics",
      "category": "IT & Software",
      "risk": "Low",
      "risk_score": 21,
      "spend": "$0.9M",
      "status": "Under Review",
      "tier": "Transactional",
    "accountOwner": "Dana Kim",
    documents: [], notes: [],
      "msa": {
        "name": "Prairie Dynamics — Master Services Agreement",
        "expires": "94 days"
      }
    },
  {
      "id": "SUP-39",
      "name": "Glacier Technologies",
      "category": "Logistics",
      "risk": "Low",
      "risk_score": 30,
      "spend": "$0.2M",
      "status": "Under Review",
      "tier": "Preferred",
    "accountOwner": "Marcus Webb",
    documents: [], notes: [],
      "msa": {
        "name": "Glacier Technologies — Master Services Agreement",
        "expires": "70 days"
      }
    },
  {
      "id": "SUP-40",
      "name": "Nimbus Technologies",
      "category": "Marketing",
      "risk": "Medium",
      "risk_score": 52,
      "spend": "$0.8M",
      "status": "Under Review",
      "tier": "Preferred",
    "accountOwner": "Sam Okafor",
    documents: [], notes: [],
      "msa": null
    }
];

// Contracts sit under the service they support, not directly under the supplier — the
// supplier-level Master Services Agreement (MSA) lives on the SUPPLIERS record above.
// Risk is optional here: many service contracts simply haven't needed a risk assessment.
const CONTRACTS = [
  {
    id: "CT-1001", name: "Vantage Cloud — Hosting Order #2291", supplier: "Vantage Cloud Systems",
    service: "Cloud Infrastructure Hosting", type: "Service Order",
    documents: [], notes: [], status: "Active",
    value: "$1.6M", effective: "Jan 15, 2026", daysToExpiry: 142, risk: null, flag: null,
    owner: "Priya Shah", governingLaw: "Delaware, US", autoRenew: true,
    summary: "A standard hosting order under Vantage's MSA, covering production and DR infrastructure. No open issues.",
    clauses: [
      { title: "Scope of Services", text: "Vendor provides cloud compute, storage, and network infrastructure for production and disaster-recovery environments." },
      { title: "Service Levels", text: "99.95% uptime commitment with service credits for shortfalls, measured monthly." },
      { title: "Renewal", text: "Automatically renews for successive 12-month terms unless either party gives 60 days' notice." },
    ],
    history: [
      { date: "Jan 15, 2026", event: "Contract executed" },
      { date: "Jun 2, 2026", event: "Annual SLA review completed — no exceptions" },
    ],
  },
  {
    id: "CT-1002", name: "Vantage Cloud — Support Addendum", supplier: "Vantage Cloud Systems",
    service: "Application Support & Maintenance", type: "Addendum",
    documents: [], notes: [], status: "Active",
    value: "$640K", effective: "Feb 1, 2026", daysToExpiry: 64, risk: "Medium", flag: "SOC 2 report renewal overdue",
    owner: "Priya Shah", governingLaw: "Delaware, US", autoRenew: true,
    summary: "Covers ongoing application support and maintenance. Vendor's SOC 2 Type II report lapsed and hasn't been renewed — the one open compliance item.",
    clauses: [
      { title: "Support Tiers", text: "24/7 Severity-1 response within 30 minutes; standard tickets within one business day." },
      { title: "Compliance Reporting", text: "Vendor shall provide an annual SOC 2 Type II report within 30 days of issuance." },
      { title: "Fees", text: "Fixed monthly support fee with a 3% annual escalator tied to CPI." },
    ],
    history: [
      { date: "Feb 1, 2026", event: "Contract executed" },
      { date: "May 20, 2026", event: "SOC 2 report requested — vendor response pending" },
    ],
  },
  {
    id: "CT-1003", name: "Vantage Cloud — Data Processing Addendum", supplier: "Vantage Cloud Systems",
    service: null, type: "DPA",
    documents: [], notes: [], status: "Active",
    value: "N/A", effective: "Jan 15, 2026", daysToExpiry: 210, risk: "Medium", flag: "Annual DPA review overdue by 45 days",
    owner: "Compliance Team", governingLaw: "Delaware, US", autoRenew: false,
    summary: "Governs data handling and privacy obligations across all Vantage services. Annual review is overdue.",
    clauses: [
      { title: "Data Processing", text: "Vendor processes Company data solely per documented instructions and applicable privacy law." },
      { title: "Subprocessors", text: "Vendor must notify Company 30 days before engaging any new subprocessor." },
      { title: "Breach Notification", text: "Vendor shall notify Company within 72 hours of becoming aware of a data breach." },
    ],
    history: [
      { date: "Jan 15, 2026", event: "DPA executed alongside MSA" },
    ],
  },
  {
    id: "CT-1004", name: "Northwind Logistics — Freight Rate Schedule", supplier: "Northwind Logistics",
    service: "Freight & Distribution Services", type: "Rate Schedule",
    documents: [], notes: [], status: "Active",
    value: "$3.1M", effective: "Aug 1, 2025", daysToExpiry: 34, risk: "Medium", flag: "8% price escalation clause",
    owner: "Elena Ruiz", governingLaw: "Illinois, US", autoRenew: true,
    summary: "Sets freight rates for the core distribution lanes. An 8% escalation triggers automatically at renewal unless renegotiated.",
    clauses: [
      { title: "Rate Structure", text: "Per-lane freight rates fixed for the term, with fuel surcharge adjusted monthly." },
      { title: "Escalation", text: "Rates increase 8% automatically upon renewal unless a new schedule is negotiated 45 days prior." },
      { title: "Volume Commitment", text: "Company commits to a minimum annual shipment volume; shortfalls incur a true-up fee." },
    ],
    history: [
      { date: "Aug 1, 2025", event: "Schedule executed" },
      { date: "Jul 27, 2026", event: "Rate increase notice received from vendor" },
    ],
  },
  {
    id: "CT-1005", name: "Northwind Logistics — Warehouse Sublease Agreement", supplier: "Northwind Logistics",
    service: null, type: "Lease",
    documents: [], notes: [], status: "Breach Flagged",
    value: "$820K", effective: "Mar 1, 2025", daysToExpiry: 120, risk: "High", flag: "Repeated late deliveries — SLA breach reported by Ops",
    owner: "Elena Ruiz", governingLaw: "Illinois, US", autoRenew: false,
    summary: "Sublease for regional warehouse space. Operations has reported repeated late deliveries that may constitute an SLA breach under this agreement.",
    clauses: [
      { title: "Premises", text: "Vendor subleases 40,000 sq ft of warehouse space for cross-dock operations." },
      { title: "Delivery SLA", text: "Inbound freight must be processed within 4 hours of dock arrival; persistent failure is a material breach." },
      { title: "Remedy", text: "Company may terminate for cause after two uncured breach notices within any 90-day period." },
    ],
    history: [
      { date: "Mar 1, 2025", event: "Sublease executed" },
      { date: "Jul 10, 2026", event: "First breach notice issued — late dock processing" },
      { date: "Jul 26, 2026", event: "Second incident reported — flagged for breach review" },
    ],
  },
  {
    id: "CT-1006", name: "Halcyon Facilities — Maintenance Order", supplier: "Halcyon Facilities Group",
    service: "Facilities Maintenance Services", type: "Service Order",
    documents: [], notes: [], status: "Pending Signature",
    value: "$1.1M", effective: "Pending", daysToExpiry: 52, risk: "High", flag: "Governing MSA missing counter-signature",
    owner: "Dana Kim", governingLaw: "Texas, US", autoRenew: false,
    summary: "Facilities maintenance order for regional sites. Not yet effective — the vendor has not returned a countersigned copy, and the underlying MSA has the same gap.",
    clauses: [
      { title: "Scope", text: "Preventive and reactive maintenance across all regional facility sites." },
      { title: "Response Times", text: "Emergency requests addressed within 2 hours; routine requests within 3 business days." },
      { title: "Execution", text: "This order is not binding until countersigned by an authorized Vendor representative." },
    ],
    history: [
      { date: "Jun 5, 2026", event: "Order sent for signature" },
      { date: "Jul 5, 2026", event: "Reminder sent — no response" },
    ],
  },
  {
    id: "CT-1007", name: "Meridian Steel — Supply Schedule", supplier: "Meridian Steel Co.",
    service: "Raw Material Supply Coordination", type: "Supply Schedule",
    documents: [], notes: [], status: "Active",
    value: "$4.2M", effective: "Oct 1, 2025", daysToExpiry: 89, risk: null, flag: null,
    owner: "Sam Okafor", governingLaw: "Ohio, US", autoRenew: true,
    summary: "Core raw material supply schedule. Performance has been steady with no open issues.",
    clauses: [
      { title: "Pricing", text: "Fixed unit pricing for the term with a quarterly index adjustment tied to steel commodity rates." },
      { title: "Delivery", text: "Vendor commits to a 5-business-day standard lead time." },
      { title: "Quality", text: "All shipments must meet ASTM specifications; nonconforming lots may be rejected at no cost." },
    ],
    history: [
      { date: "Oct 1, 2025", event: "Schedule executed" },
      { date: "Jul 15, 2026", event: "Quarterly performance review — no exceptions" },
    ],
  },
  {
    id: "CT-1008", name: "Meridian Steel — Environmental Compliance Rider", supplier: "Meridian Steel Co.",
    service: null, type: "Compliance Rider",
    documents: [], notes: [], status: "Active",
    value: "N/A", effective: "Oct 1, 2025", daysToExpiry: 175, risk: "Medium", flag: "New EPA reporting requirement effective Q4",
    owner: "Compliance Team", governingLaw: "Ohio, US", autoRenew: true,
    summary: "Environmental compliance obligations attached to the supply relationship. A new EPA reporting requirement takes effect this Q4 and hasn't been incorporated yet.",
    clauses: [
      { title: "Reporting", text: "Vendor shall report emissions and waste-handling data on a quarterly basis." },
      { title: "Regulatory Updates", text: "Rider must be amended within 60 days of any material change in applicable environmental law." },
    ],
    history: [
      { date: "Oct 1, 2025", event: "Rider executed" },
    ],
  },
  {
    id: "CT-1009", name: "Orbital Marketing Partners — Non-Disclosure Agreement", supplier: "Orbital Marketing Partners",
    service: null, type: "NDA",
    documents: [], notes: [], status: "Expired",
    value: "N/A", effective: "Jan 10, 2025", daysToExpiry: -18, risk: null, flag: "Expired — renew before next campaign kickoff",
    owner: "Marcus Webb", governingLaw: "California, US", autoRenew: false,
    summary: "Mutual NDA covering creative and campaign materials. It lapsed 18 days ago and should be renewed before sharing new campaign assets.",
    clauses: [
      { title: "Confidential Information", text: "Covers unreleased creative concepts, campaign strategy, and unpublished performance data." },
      { title: "Term", text: "Confidentiality obligations survive 2 years past expiration of this agreement." },
    ],
    history: [
      { date: "Jan 10, 2025", event: "NDA executed" },
      { date: "Jul 11, 2026", event: "Agreement lapsed" },
    ],
  },
  {
    id: "CT-1010", name: "Crescent Analytics — Mutual NDA", supplier: "Crescent Analytics",
    service: null, type: "NDA",
    documents: [], notes: [], status: "Draft",
    value: "N/A", effective: "Not yet effective", daysToExpiry: null, risk: null, flag: "Awaiting legal review",
    owner: "Marcus Webb", governingLaw: "TBD", autoRenew: false,
    summary: "Drafted as part of Crescent Analytics' onboarding. Awaiting legal review before it can be sent for signature.",
    clauses: [
      { title: "Confidential Information", text: "Standard mutual confidentiality terms, drafted from Paradigm's template." },
      { title: "Term", text: "Two-year term from execution, with a three-year confidentiality survival period." },
    ],
    history: [
      { date: "Jul 24, 2026", event: "Draft created from intake request INT-2198" },
    ],
  },
  {
      "id": "CT-1011",
      "name": "Anchor Analytics — Rate Schedule #1011",
      "supplier": "Anchor Analytics",
      "service": "Event Management — Anchor",
      "type": "Rate Schedule",
    documents: [], notes: [],
      "status": "Draft",
      "value": "$1.2M",
      "effective": "Not yet effective",
      "daysToExpiry": null,
      "risk": "Medium",
      "flag": null,
      "owner": "Marcus Webb",
      "governingLaw": "California, US",
      "autoRenew": false,
      "summary": "Governs Event Management — Anchor on behalf of Anchor Analytics.",
      "clauses": [
        {
          "title": "Scope",
          "text": "Defines the scope of services and deliverables covered by this agreement."
        },
        {
          "title": "Term",
          "text": "Sets the effective term and renewal conditions for this agreement."
        }
      ],
      "history": [
        {
          "date": "Jan 2026",
          "event": "Contract executed"
        }
      ]
    },
  {
      "id": "CT-1012",
      "name": "Amber Analytics — Addendum #1012",
      "supplier": "Amber Analytics",
      "service": "Building Maintenance — Amber",
      "type": "Addendum",
    documents: [], notes: [],
      "status": "Expired",
      "value": "$0.9M",
      "effective": "Jan 2026",
      "daysToExpiry": -37,
      "risk": null,
      "flag": null,
      "owner": "Priya Shah",
      "governingLaw": "Texas, US",
      "autoRenew": false,
      "summary": "Governs Building Maintenance — Amber on behalf of Amber Analytics.",
      "clauses": [
        {
          "title": "Scope",
          "text": "Defines the scope of services and deliverables covered by this agreement."
        },
        {
          "title": "Term",
          "text": "Sets the effective term and renewal conditions for this agreement."
        }
      ],
      "history": [
        {
          "date": "Jan 2026",
          "event": "Contract executed"
        }
      ]
    },
  {
      "id": "CT-1013",
      "name": "Coastal Technologies — Supply Schedule #1013",
      "supplier": "Coastal Technologies",
      "service": "Packaging Materials — Coastal",
      "type": "Supply Schedule",
    documents: [], notes: [],
      "status": "Draft",
      "value": "$0.2M",
      "effective": "Not yet effective",
      "daysToExpiry": null,
      "risk": "Low",
      "flag": null,
      "owner": "Marcus Webb",
      "governingLaw": "Ohio, US",
      "autoRenew": true,
      "summary": "Governs Packaging Materials — Coastal on behalf of Coastal Technologies.",
      "clauses": [
        {
          "title": "Scope",
          "text": "Defines the scope of services and deliverables covered by this agreement."
        },
        {
          "title": "Term",
          "text": "Sets the effective term and renewal conditions for this agreement."
        }
      ],
      "history": [
        {
          "date": "Jan 2026",
          "event": "Contract executed"
        }
      ]
    },
  {
      "id": "CT-1014",
      "name": "Junction Dynamics — Service Order #1014",
      "supplier": "Junction Dynamics",
      "service": "Cybersecurity Monitoring — Junction",
      "type": "Service Order",
    documents: [], notes: [],
      "status": "Active",
      "value": "$2.3M",
      "effective": "Jan 2026",
      "daysToExpiry": 124,
      "risk": "Low",
      "flag": null,
      "owner": "Elena Ruiz",
      "governingLaw": "Delaware, US",
      "autoRenew": true,
      "summary": "Governs Cybersecurity Monitoring — Junction on behalf of Junction Dynamics.",
      "clauses": [
        {
          "title": "Scope",
          "text": "Defines the scope of services and deliverables covered by this agreement."
        },
        {
          "title": "Term",
          "text": "Sets the effective term and renewal conditions for this agreement."
        }
      ],
      "history": [
        {
          "date": "Jan 2026",
          "event": "Contract executed"
        }
      ]
    },
  {
      "id": "CT-1015",
      "name": "Cobalt Networks — Rate Schedule #1015",
      "supplier": "Cobalt Networks",
      "service": "Application Support — Cobalt",
      "type": "Rate Schedule",
    documents: [], notes: [],
      "status": "Active",
      "value": "$1.2M",
      "effective": "Jan 2026",
      "daysToExpiry": 81,
      "risk": null,
      "flag": null,
      "owner": "Marcus Webb",
      "governingLaw": "Delaware, US",
      "autoRenew": false,
      "summary": "Governs Application Support — Cobalt on behalf of Cobalt Networks.",
      "clauses": [
        {
          "title": "Scope",
          "text": "Defines the scope of services and deliverables covered by this agreement."
        },
        {
          "title": "Term",
          "text": "Sets the effective term and renewal conditions for this agreement."
        }
      ],
      "history": [
        {
          "date": "Jan 2026",
          "event": "Contract executed"
        }
      ]
    },
  {
      "id": "CT-1016",
      "name": "Harbor Ventures — Supply Schedule #1016",
      "supplier": "Harbor Ventures",
      "service": "Media Buying — Harbor",
      "type": "Supply Schedule",
    documents: [], notes: [],
      "status": "Draft",
      "value": "$1.2M",
      "effective": "Not yet effective",
      "daysToExpiry": null,
      "risk": null,
      "flag": null,
      "owner": "Dana Kim",
      "governingLaw": "California, US",
      "autoRenew": false,
      "summary": "Governs Media Buying — Harbor on behalf of Harbor Ventures.",
      "clauses": [
        {
          "title": "Scope",
          "text": "Defines the scope of services and deliverables covered by this agreement."
        },
        {
          "title": "Term",
          "text": "Sets the effective term and renewal conditions for this agreement."
        }
      ],
      "history": [
        {
          "date": "Jan 2026",
          "event": "Contract executed"
        }
      ]
    },
  {
      "id": "CT-1017",
      "name": "Amber Group — Service Order #1017",
      "supplier": "Amber Group",
      "service": "HVAC Maintenance — Amber",
      "type": "Service Order",
    documents: [], notes: [],
      "status": "Active",
      "value": "$2.2M",
      "effective": "Jan 2026",
      "daysToExpiry": 29,
      "risk": "Medium",
      "flag": null,
      "owner": "Dana Kim",
      "governingLaw": "Texas, US",
      "autoRenew": true,
      "summary": "Governs HVAC Maintenance — Amber on behalf of Amber Group.",
      "clauses": [
        {
          "title": "Scope",
          "text": "Defines the scope of services and deliverables covered by this agreement."
        },
        {
          "title": "Term",
          "text": "Sets the effective term and renewal conditions for this agreement."
        }
      ],
      "history": [
        {
          "date": "Jan 2026",
          "event": "Contract executed"
        }
      ]
    },
  {
      "id": "CT-1018",
      "name": "Silverline Ventures — Supply Schedule #1018",
      "supplier": "Silverline Ventures",
      "service": "Warehouse Management — Silverline",
      "type": "Supply Schedule",
    documents: [], notes: [],
      "status": "Expired",
      "value": "$0.7M",
      "effective": "Jan 2026",
      "daysToExpiry": -45,
      "risk": "Medium",
      "flag": null,
      "owner": "Marcus Webb",
      "governingLaw": "Illinois, US",
      "autoRenew": false,
      "summary": "Governs Warehouse Management — Silverline on behalf of Silverline Ventures.",
      "clauses": [
        {
          "title": "Scope",
          "text": "Defines the scope of services and deliverables covered by this agreement."
        },
        {
          "title": "Term",
          "text": "Sets the effective term and renewal conditions for this agreement."
        }
      ],
      "history": [
        {
          "date": "Jan 2026",
          "event": "Contract executed"
        }
      ]
    },
  {
      "id": "CT-1019",
      "name": "Harbor Robotics — Rate Schedule #1019",
      "supplier": "Harbor Robotics",
      "service": "Creative Production — Harbor (2)",
      "type": "Rate Schedule",
    documents: [], notes: [],
      "status": "Active",
      "value": "$0.3M",
      "effective": "Jan 2026",
      "daysToExpiry": 255,
      "risk": "Low",
      "flag": null,
      "owner": "Priya Shah",
      "governingLaw": "California, US",
      "autoRenew": false,
      "summary": "Governs Creative Production — Harbor (2) on behalf of Harbor Robotics.",
      "clauses": [
        {
          "title": "Scope",
          "text": "Defines the scope of services and deliverables covered by this agreement."
        },
        {
          "title": "Term",
          "text": "Sets the effective term and renewal conditions for this agreement."
        }
      ],
      "history": [
        {
          "date": "Jan 2026",
          "event": "Contract executed"
        }
      ]
    },
  {
      "id": "CT-1020",
      "name": "Cascade Partners — Supply Schedule #1020",
      "supplier": "Cascade Partners",
      "service": "Inventory Management — Cascade",
      "type": "Supply Schedule",
    documents: [], notes: [],
      "status": "Draft",
      "value": "$1.0M",
      "effective": "Not yet effective",
      "daysToExpiry": null,
      "risk": null,
      "flag": null,
      "owner": "Dana Kim",
      "governingLaw": "Illinois, US",
      "autoRenew": true,
      "summary": "Governs Inventory Management — Cascade on behalf of Cascade Partners.",
      "clauses": [
        {
          "title": "Scope",
          "text": "Defines the scope of services and deliverables covered by this agreement."
        },
        {
          "title": "Term",
          "text": "Sets the effective term and renewal conditions for this agreement."
        }
      ],
      "history": [
        {
          "date": "Jan 2026",
          "event": "Contract executed"
        }
      ]
    },
  {
      "id": "CT-1021",
      "name": "Nimbus Technologies — Addendum #1021",
      "supplier": "Nimbus Technologies",
      "service": "Brand Strategy Consulting — Nimbus",
      "type": "Addendum",
    documents: [], notes: [],
      "status": "Active",
      "value": "$1.2M",
      "effective": "Jan 2026",
      "daysToExpiry": 106,
      "risk": null,
      "flag": null,
      "owner": "Priya Shah",
      "governingLaw": "California, US",
      "autoRenew": true,
      "summary": "Governs Brand Strategy Consulting — Nimbus on behalf of Nimbus Technologies.",
      "clauses": [
        {
          "title": "Scope",
          "text": "Defines the scope of services and deliverables covered by this agreement."
        },
        {
          "title": "Term",
          "text": "Sets the effective term and renewal conditions for this agreement."
        }
      ],
      "history": [
        {
          "date": "Jan 2026",
          "event": "Contract executed"
        }
      ]
    },
  {
      "id": "CT-1022",
      "name": "Amber Group — Addendum #1022",
      "supplier": "Amber Group",
      "service": "Waste Management — Amber",
      "type": "Addendum",
    documents: [], notes: [],
      "status": "Expired",
      "value": "$1.8M",
      "effective": "Jan 2026",
      "daysToExpiry": -27,
      "risk": "Low",
      "flag": null,
      "owner": "Elena Ruiz",
      "governingLaw": "Texas, US",
      "autoRenew": false,
      "summary": "Governs Waste Management — Amber on behalf of Amber Group.",
      "clauses": [
        {
          "title": "Scope",
          "text": "Defines the scope of services and deliverables covered by this agreement."
        },
        {
          "title": "Term",
          "text": "Sets the effective term and renewal conditions for this agreement."
        }
      ],
      "history": [
        {
          "date": "Jan 2026",
          "event": "Contract executed"
        }
      ]
    },
  {
      "id": "CT-1023",
      "name": "Maplewood Robotics — Addendum #1023",
      "supplier": "Maplewood Robotics",
      "service": "HVAC Maintenance — Maplewood",
      "type": "Addendum",
    documents: [], notes: [],
      "status": "Active",
      "value": "$1.5M",
      "effective": "Jan 2026",
      "daysToExpiry": 121,
      "risk": null,
      "flag": null,
      "owner": "Priya Shah",
      "governingLaw": "Texas, US",
      "autoRenew": false,
      "summary": "Governs HVAC Maintenance — Maplewood on behalf of Maplewood Robotics.",
      "clauses": [
        {
          "title": "Scope",
          "text": "Defines the scope of services and deliverables covered by this agreement."
        },
        {
          "title": "Term",
          "text": "Sets the effective term and renewal conditions for this agreement."
        }
      ],
      "history": [
        {
          "date": "Jan 2026",
          "event": "Contract executed"
        }
      ]
    },
  {
      "id": "CT-1024",
      "name": "Granite Partners — Supply Schedule #1024",
      "supplier": "Granite Partners",
      "service": "Legal Advisory — Granite",
      "type": "Supply Schedule",
    documents: [], notes: [],
      "status": "Draft",
      "value": "$1.8M",
      "effective": "Not yet effective",
      "daysToExpiry": null,
      "risk": "High",
      "flag": "Flagged for elevated risk during last review cycle",
      "owner": "Marcus Webb",
      "governingLaw": "New York, US",
      "autoRenew": true,
      "summary": "Governs Legal Advisory — Granite on behalf of Granite Partners.",
      "clauses": [
        {
          "title": "Scope",
          "text": "Defines the scope of services and deliverables covered by this agreement."
        },
        {
          "title": "Term",
          "text": "Sets the effective term and renewal conditions for this agreement."
        }
      ],
      "history": [
        {
          "date": "Jan 2026",
          "event": "Contract executed"
        }
      ]
    },
  {
      "id": "CT-1025",
      "name": "Coastal Labs — Rate Schedule #1025",
      "supplier": "Coastal Labs",
      "service": "Security Staffing — Coastal",
      "type": "Rate Schedule",
    documents: [], notes: [],
      "status": "Breach Flagged",
      "value": "$0.4M",
      "effective": "Jan 2026",
      "daysToExpiry": 90,
      "risk": "High",
      "flag": "Vendor under review for repeated SLA shortfalls",
      "owner": "Priya Shah",
      "governingLaw": "Texas, US",
      "autoRenew": false,
      "summary": "Governs Security Staffing — Coastal on behalf of Coastal Labs.",
      "clauses": [
        {
          "title": "Scope",
          "text": "Defines the scope of services and deliverables covered by this agreement."
        },
        {
          "title": "Term",
          "text": "Sets the effective term and renewal conditions for this agreement."
        }
      ],
      "history": [
        {
          "date": "Jan 2026",
          "event": "Contract executed"
        }
      ]
    },
  {
      "id": "CT-1026",
      "name": "Westfield Media — Rate Schedule #1026",
      "supplier": "Westfield Media",
      "service": "Industrial Adhesives — Westfield",
      "type": "Rate Schedule",
    documents: [], notes: [],
      "status": "Expired",
      "value": "$0.2M",
      "effective": "Jan 2026",
      "daysToExpiry": -22,
      "risk": "High",
      "flag": "Flagged for elevated risk during last review cycle",
      "owner": "Sam Okafor",
      "governingLaw": "Ohio, US",
      "autoRenew": false,
      "summary": "Governs Industrial Adhesives — Westfield on behalf of Westfield Media.",
      "clauses": [
        {
          "title": "Scope",
          "text": "Defines the scope of services and deliverables covered by this agreement."
        },
        {
          "title": "Term",
          "text": "Sets the effective term and renewal conditions for this agreement."
        }
      ],
      "history": [
        {
          "date": "Jan 2026",
          "event": "Contract executed"
        }
      ]
    },
  {
      "id": "CT-1027",
      "name": "Orbital Marketing Partners — Supply Schedule #1027",
      "supplier": "Orbital Marketing Partners",
      "service": "Digital Advertising — Orbital",
      "type": "Supply Schedule",
    documents: [], notes: [],
      "status": "Draft",
      "value": "$0.2M",
      "effective": "Not yet effective",
      "daysToExpiry": null,
      "risk": null,
      "flag": null,
      "owner": "Dana Kim",
      "governingLaw": "California, US",
      "autoRenew": false,
      "summary": "Governs Digital Advertising — Orbital on behalf of Orbital Marketing Partners.",
      "clauses": [
        {
          "title": "Scope",
          "text": "Defines the scope of services and deliverables covered by this agreement."
        },
        {
          "title": "Term",
          "text": "Sets the effective term and renewal conditions for this agreement."
        }
      ],
      "history": [
        {
          "date": "Jan 2026",
          "event": "Contract executed"
        }
      ]
    },
  {
      "id": "CT-1028",
      "name": "Crescent Analytics — Service Order #1028",
      "supplier": "Crescent Analytics",
      "service": "Audit Services — Crescent",
      "type": "Service Order",
    documents: [], notes: [],
      "status": "Pending Signature",
      "value": "$1.0M",
      "effective": "Jan 2026",
      "daysToExpiry": 86,
      "risk": "High",
      "flag": "Awaiting countersignature from vendor",
      "owner": "Sam Okafor",
      "governingLaw": "New York, US",
      "autoRenew": true,
      "summary": "Governs Audit Services — Crescent on behalf of Crescent Analytics.",
      "clauses": [
        {
          "title": "Scope",
          "text": "Defines the scope of services and deliverables covered by this agreement."
        },
        {
          "title": "Term",
          "text": "Sets the effective term and renewal conditions for this agreement."
        }
      ],
      "history": [
        {
          "date": "Jan 2026",
          "event": "Contract executed"
        }
      ]
    },
  {
      "id": "CT-1029",
      "name": "Nimbus Consulting — Service Order #1029",
      "supplier": "Nimbus Consulting",
      "service": "Audit Services — Nimbus",
      "type": "Service Order",
    documents: [], notes: [],
      "status": "Draft",
      "value": "$1.6M",
      "effective": "Not yet effective",
      "daysToExpiry": null,
      "risk": "High",
      "flag": "Flagged for elevated risk during last review cycle",
      "owner": "Dana Kim",
      "governingLaw": "New York, US",
      "autoRenew": true,
      "summary": "Governs Audit Services — Nimbus on behalf of Nimbus Consulting.",
      "clauses": [
        {
          "title": "Scope",
          "text": "Defines the scope of services and deliverables covered by this agreement."
        },
        {
          "title": "Term",
          "text": "Sets the effective term and renewal conditions for this agreement."
        }
      ],
      "history": [
        {
          "date": "Jan 2026",
          "event": "Contract executed"
        }
      ]
    },
  {
      "id": "CT-1030",
      "name": "Prairie Dynamics — Addendum #1030",
      "supplier": "Prairie Dynamics",
      "service": "Application Support — Prairie",
      "type": "Addendum",
    documents: [], notes: [],
      "status": "Active",
      "value": "$2.0M",
      "effective": "Jan 2026",
      "daysToExpiry": 250,
      "risk": null,
      "flag": null,
      "owner": "Dana Kim",
      "governingLaw": "Delaware, US",
      "autoRenew": true,
      "summary": "Governs Application Support — Prairie on behalf of Prairie Dynamics.",
      "clauses": [
        {
          "title": "Scope",
          "text": "Defines the scope of services and deliverables covered by this agreement."
        },
        {
          "title": "Term",
          "text": "Sets the effective term and renewal conditions for this agreement."
        }
      ],
      "history": [
        {
          "date": "Jan 2026",
          "event": "Contract executed"
        }
      ]
    },
  {
      "id": "CT-1031",
      "name": "Amber Industries — Service Order #1031",
      "supplier": "Amber Industries",
      "service": "Customs Brokerage — Amber",
      "type": "Service Order",
    documents: [], notes: [],
      "status": "Draft",
      "value": "$0.1M",
      "effective": "Not yet effective",
      "daysToExpiry": null,
      "risk": null,
      "flag": null,
      "owner": "Marcus Webb",
      "governingLaw": "Illinois, US",
      "autoRenew": true,
      "summary": "Governs Customs Brokerage — Amber on behalf of Amber Industries.",
      "clauses": [
        {
          "title": "Scope",
          "text": "Defines the scope of services and deliverables covered by this agreement."
        },
        {
          "title": "Term",
          "text": "Sets the effective term and renewal conditions for this agreement."
        }
      ],
      "history": [
        {
          "date": "Jan 2026",
          "event": "Contract executed"
        }
      ]
    },
  {
      "id": "CT-1032",
      "name": "Amber Group — Addendum #1032",
      "supplier": "Amber Group",
      "service": "Building Maintenance — Amber (2)",
      "type": "Addendum",
    documents: [], notes: [],
      "status": "Active",
      "value": "$1.0M",
      "effective": "Jan 2026",
      "daysToExpiry": 210,
      "risk": "Low",
      "flag": null,
      "owner": "Dana Kim",
      "governingLaw": "Texas, US",
      "autoRenew": true,
      "summary": "Governs Building Maintenance — Amber (2) on behalf of Amber Group.",
      "clauses": [
        {
          "title": "Scope",
          "text": "Defines the scope of services and deliverables covered by this agreement."
        },
        {
          "title": "Term",
          "text": "Sets the effective term and renewal conditions for this agreement."
        }
      ],
      "history": [
        {
          "date": "Jan 2026",
          "event": "Contract executed"
        }
      ]
    },
  {
      "id": "CT-1033",
      "name": "Vantage Cloud Systems — Service Order #1033",
      "supplier": "Vantage Cloud Systems",
      "service": "Network Security Monitoring — Vantage (2)",
      "type": "Service Order",
    documents: [], notes: [],
      "status": "Expired",
      "value": "$0.2M",
      "effective": "Jan 2026",
      "daysToExpiry": -45,
      "risk": "Low",
      "flag": null,
      "owner": "Priya Shah",
      "governingLaw": "Delaware, US",
      "autoRenew": true,
      "summary": "Governs Network Security Monitoring — Vantage (2) on behalf of Vantage Cloud Systems.",
      "clauses": [
        {
          "title": "Scope",
          "text": "Defines the scope of services and deliverables covered by this agreement."
        },
        {
          "title": "Term",
          "text": "Sets the effective term and renewal conditions for this agreement."
        }
      ],
      "history": [
        {
          "date": "Jan 2026",
          "event": "Contract executed"
        }
      ]
    },
  {
      "id": "CT-1034",
      "name": "Prairie Dynamics — Supply Schedule #1034",
      "supplier": "Prairie Dynamics",
      "service": "Application Support — Prairie (2)",
      "type": "Supply Schedule",
    documents: [], notes: [],
      "status": "Active",
      "value": "$2.1M",
      "effective": "Jan 2026",
      "daysToExpiry": 149,
      "risk": "High",
      "flag": "Flagged for elevated risk during last review cycle",
      "owner": "Dana Kim",
      "governingLaw": "Delaware, US",
      "autoRenew": false,
      "summary": "Governs Application Support — Prairie (2) on behalf of Prairie Dynamics.",
      "clauses": [
        {
          "title": "Scope",
          "text": "Defines the scope of services and deliverables covered by this agreement."
        },
        {
          "title": "Term",
          "text": "Sets the effective term and renewal conditions for this agreement."
        }
      ],
      "history": [
        {
          "date": "Jan 2026",
          "event": "Contract executed"
        }
      ]
    },
  {
      "id": "CT-1035",
      "name": "Orbital Marketing Partners — Addendum #1035",
      "supplier": "Orbital Marketing Partners",
      "service": "Market Research — Orbital",
      "type": "Addendum",
    documents: [], notes: [],
      "status": "Active",
      "value": "$0.4M",
      "effective": "Jan 2026",
      "daysToExpiry": 178,
      "risk": "Medium",
      "flag": null,
      "owner": "Priya Shah",
      "governingLaw": "California, US",
      "autoRenew": false,
      "summary": "Governs Market Research — Orbital on behalf of Orbital Marketing Partners.",
      "clauses": [
        {
          "title": "Scope",
          "text": "Defines the scope of services and deliverables covered by this agreement."
        },
        {
          "title": "Term",
          "text": "Sets the effective term and renewal conditions for this agreement."
        }
      ],
      "history": [
        {
          "date": "Jan 2026",
          "event": "Contract executed"
        }
      ]
    },
  {
      "id": "CT-1036",
      "name": "Silverline Ventures — Supply Schedule #1036",
      "supplier": "Silverline Ventures",
      "service": "Last-Mile Delivery — Silverline",
      "type": "Supply Schedule",
    documents: [], notes: [],
      "status": "Pending Signature",
      "value": "$1.6M",
      "effective": "Jan 2026",
      "daysToExpiry": 52,
      "risk": null,
      "flag": "Awaiting countersignature from vendor",
      "owner": "Sam Okafor",
      "governingLaw": "Illinois, US",
      "autoRenew": false,
      "summary": "Governs Last-Mile Delivery — Silverline on behalf of Silverline Ventures.",
      "clauses": [
        {
          "title": "Scope",
          "text": "Defines the scope of services and deliverables covered by this agreement."
        },
        {
          "title": "Term",
          "text": "Sets the effective term and renewal conditions for this agreement."
        }
      ],
      "history": [
        {
          "date": "Jan 2026",
          "event": "Contract executed"
        }
      ]
    },
  {
      "id": "CT-1037",
      "name": "Halcyon Facilities Group — Supply Schedule #1037",
      "supplier": "Halcyon Facilities Group",
      "service": "Landscaping Services — Halcyon",
      "type": "Supply Schedule",
    documents: [], notes: [],
      "status": "Draft",
      "value": "$0.1M",
      "effective": "Not yet effective",
      "daysToExpiry": null,
      "risk": "Low",
      "flag": null,
      "owner": "Dana Kim",
      "governingLaw": "Texas, US",
      "autoRenew": false,
      "summary": "Governs Landscaping Services — Halcyon on behalf of Halcyon Facilities Group.",
      "clauses": [
        {
          "title": "Scope",
          "text": "Defines the scope of services and deliverables covered by this agreement."
        },
        {
          "title": "Term",
          "text": "Sets the effective term and renewal conditions for this agreement."
        }
      ],
      "history": [
        {
          "date": "Jan 2026",
          "event": "Contract executed"
        }
      ]
    },
  {
      "id": "CT-1038",
      "name": "Halcyon Facilities Group — Addendum #1038",
      "supplier": "Halcyon Facilities Group",
      "service": "HVAC Maintenance — Halcyon",
      "type": "Addendum",
    documents: [], notes: [],
      "status": "Active",
      "value": "$0.6M",
      "effective": "Jan 2026",
      "daysToExpiry": 268,
      "risk": null,
      "flag": null,
      "owner": "Elena Ruiz",
      "governingLaw": "Texas, US",
      "autoRenew": false,
      "summary": "Governs HVAC Maintenance — Halcyon on behalf of Halcyon Facilities Group.",
      "clauses": [
        {
          "title": "Scope",
          "text": "Defines the scope of services and deliverables covered by this agreement."
        },
        {
          "title": "Term",
          "text": "Sets the effective term and renewal conditions for this agreement."
        }
      ],
      "history": [
        {
          "date": "Jan 2026",
          "event": "Contract executed"
        }
      ]
    },
  {
      "id": "CT-1039",
      "name": "Anchor Analytics — Rate Schedule #1039",
      "supplier": "Anchor Analytics",
      "service": "Market Research — Anchor",
      "type": "Rate Schedule",
    documents: [], notes: [],
      "status": "Breach Flagged",
      "value": "$1.2M",
      "effective": "Jan 2026",
      "daysToExpiry": 110,
      "risk": "High",
      "flag": "Vendor under review for repeated SLA shortfalls",
      "owner": "Sam Okafor",
      "governingLaw": "California, US",
      "autoRenew": true,
      "summary": "Governs Market Research — Anchor on behalf of Anchor Analytics.",
      "clauses": [
        {
          "title": "Scope",
          "text": "Defines the scope of services and deliverables covered by this agreement."
        },
        {
          "title": "Term",
          "text": "Sets the effective term and renewal conditions for this agreement."
        }
      ],
      "history": [
        {
          "date": "Jan 2026",
          "event": "Contract executed"
        }
      ]
    },
  {
      "id": "CT-1040",
      "name": "Vantage Cloud Systems — Service Order #1040",
      "supplier": "Vantage Cloud Systems",
      "service": "Data Analytics Platform — Vantage",
      "type": "Service Order",
    documents: [], notes: [],
      "status": "Pending Signature",
      "value": "$0.4M",
      "effective": "Jan 2026",
      "daysToExpiry": 53,
      "risk": "High",
      "flag": "Awaiting countersignature from vendor",
      "owner": "Marcus Webb",
      "governingLaw": "Delaware, US",
      "autoRenew": false,
      "summary": "Governs Data Analytics Platform — Vantage on behalf of Vantage Cloud Systems.",
      "clauses": [
        {
          "title": "Scope",
          "text": "Defines the scope of services and deliverables covered by this agreement."
        },
        {
          "title": "Term",
          "text": "Sets the effective term and renewal conditions for this agreement."
        }
      ],
      "history": [
        {
          "date": "Jan 2026",
          "event": "Contract executed"
        }
      ]
    },
  {
      "id": "CT-1041",
      "name": "Harbor Ventures — Addendum #1041",
      "supplier": "Harbor Ventures",
      "service": "Creative Production — Harbor",
      "type": "Addendum",
    documents: [], notes: [],
      "status": "Breach Flagged",
      "value": "$2.0M",
      "effective": "Jan 2026",
      "daysToExpiry": 98,
      "risk": "High",
      "flag": "Vendor under review for repeated SLA shortfalls",
      "owner": "Elena Ruiz",
      "governingLaw": "California, US",
      "autoRenew": true,
      "summary": "Governs Creative Production — Harbor on behalf of Harbor Ventures.",
      "clauses": [
        {
          "title": "Scope",
          "text": "Defines the scope of services and deliverables covered by this agreement."
        },
        {
          "title": "Term",
          "text": "Sets the effective term and renewal conditions for this agreement."
        }
      ],
      "history": [
        {
          "date": "Jan 2026",
          "event": "Contract executed"
        }
      ]
    },
  {
      "id": "CT-1042",
      "name": "Orbital Marketing Partners — Service Order #1042",
      "supplier": "Orbital Marketing Partners",
      "service": "Content Production — Orbital",
      "type": "Service Order",
    documents: [], notes: [],
      "status": "Active",
      "value": "$2.3M",
      "effective": "Jan 2026",
      "daysToExpiry": 206,
      "risk": null,
      "flag": null,
      "owner": "Sam Okafor",
      "governingLaw": "California, US",
      "autoRenew": false,
      "summary": "Governs Content Production — Orbital on behalf of Orbital Marketing Partners.",
      "clauses": [
        {
          "title": "Scope",
          "text": "Defines the scope of services and deliverables covered by this agreement."
        },
        {
          "title": "Term",
          "text": "Sets the effective term and renewal conditions for this agreement."
        }
      ],
      "history": [
        {
          "date": "Jan 2026",
          "event": "Contract executed"
        }
      ]
    },
  {
      "id": "CT-1043",
      "name": "Junction Dynamics — Supply Schedule #1043",
      "supplier": "Junction Dynamics",
      "service": "Network Security Monitoring — Junction",
      "type": "Supply Schedule",
    documents: [], notes: [],
      "status": "Active",
      "value": "$0.8M",
      "effective": "Jan 2026",
      "daysToExpiry": 293,
      "risk": null,
      "flag": null,
      "owner": "Marcus Webb",
      "governingLaw": "Delaware, US",
      "autoRenew": true,
      "summary": "Governs Network Security Monitoring — Junction on behalf of Junction Dynamics.",
      "clauses": [
        {
          "title": "Scope",
          "text": "Defines the scope of services and deliverables covered by this agreement."
        },
        {
          "title": "Term",
          "text": "Sets the effective term and renewal conditions for this agreement."
        }
      ],
      "history": [
        {
          "date": "Jan 2026",
          "event": "Contract executed"
        }
      ]
    },
  {
      "id": "CT-1044",
      "name": "Lakeshore Labs — Addendum #1044",
      "supplier": "Lakeshore Labs",
      "service": "Network Security Monitoring — Lakeshore",
      "type": "Addendum",
    documents: [], notes: [],
      "status": "Active",
      "value": "$1.1M",
      "effective": "Jan 2026",
      "daysToExpiry": 312,
      "risk": "Medium",
      "flag": null,
      "owner": "Dana Kim",
      "governingLaw": "Delaware, US",
      "autoRenew": true,
      "summary": "Governs Network Security Monitoring — Lakeshore on behalf of Lakeshore Labs.",
      "clauses": [
        {
          "title": "Scope",
          "text": "Defines the scope of services and deliverables covered by this agreement."
        },
        {
          "title": "Term",
          "text": "Sets the effective term and renewal conditions for this agreement."
        }
      ],
      "history": [
        {
          "date": "Jan 2026",
          "event": "Contract executed"
        }
      ]
    },
  {
      "id": "CT-1045",
      "name": "Maplewood Robotics — Supply Schedule #1045",
      "supplier": "Maplewood Robotics",
      "service": "Security Staffing — Maplewood",
      "type": "Supply Schedule",
    documents: [], notes: [],
      "status": "Active",
      "value": "$0.4M",
      "effective": "Jan 2026",
      "daysToExpiry": 122,
      "risk": "High",
      "flag": "Flagged for elevated risk during last review cycle",
      "owner": "Dana Kim",
      "governingLaw": "Texas, US",
      "autoRenew": false,
      "summary": "Governs Security Staffing — Maplewood on behalf of Maplewood Robotics.",
      "clauses": [
        {
          "title": "Scope",
          "text": "Defines the scope of services and deliverables covered by this agreement."
        },
        {
          "title": "Term",
          "text": "Sets the effective term and renewal conditions for this agreement."
        }
      ],
      "history": [
        {
          "date": "Jan 2026",
          "event": "Contract executed"
        }
      ]
    },
  {
      "id": "CT-1046",
      "name": "Frontier Holdings — Supply Schedule #1046",
      "supplier": "Frontier Holdings",
      "service": "Industrial Adhesives — Frontier",
      "type": "Supply Schedule",
    documents: [], notes: [],
      "status": "Breach Flagged",
      "value": "$2.2M",
      "effective": "Jan 2026",
      "daysToExpiry": 57,
      "risk": "High",
      "flag": "Vendor under review for repeated SLA shortfalls",
      "owner": "Sam Okafor",
      "governingLaw": "Ohio, US",
      "autoRenew": true,
      "summary": "Governs Industrial Adhesives — Frontier on behalf of Frontier Holdings.",
      "clauses": [
        {
          "title": "Scope",
          "text": "Defines the scope of services and deliverables covered by this agreement."
        },
        {
          "title": "Term",
          "text": "Sets the effective term and renewal conditions for this agreement."
        }
      ],
      "history": [
        {
          "date": "Jan 2026",
          "event": "Contract executed"
        }
      ]
    },
  {
      "id": "CT-1047",
      "name": "Orbital Marketing Partners — Rate Schedule #1047",
      "supplier": "Orbital Marketing Partners",
      "service": "Brand Strategy Consulting — Orbital",
      "type": "Rate Schedule",
    documents: [], notes: [],
      "status": "Active",
      "value": "$1.1M",
      "effective": "Jan 2026",
      "daysToExpiry": 102,
      "risk": "Low",
      "flag": null,
      "owner": "Sam Okafor",
      "governingLaw": "California, US",
      "autoRenew": false,
      "summary": "Governs Brand Strategy Consulting — Orbital on behalf of Orbital Marketing Partners.",
      "clauses": [
        {
          "title": "Scope",
          "text": "Defines the scope of services and deliverables covered by this agreement."
        },
        {
          "title": "Term",
          "text": "Sets the effective term and renewal conditions for this agreement."
        }
      ],
      "history": [
        {
          "date": "Jan 2026",
          "event": "Contract executed"
        }
      ]
    },
  {
      "id": "CT-1048",
      "name": "Beacon Media — Supply Schedule #1048",
      "supplier": "Beacon Media",
      "service": "Fleet Maintenance — Beacon",
      "type": "Supply Schedule",
    documents: [], notes: [],
      "status": "Active",
      "value": "$2.1M",
      "effective": "Jan 2026",
      "daysToExpiry": 133,
      "risk": "Medium",
      "flag": null,
      "owner": "Priya Shah",
      "governingLaw": "Illinois, US",
      "autoRenew": false,
      "summary": "Governs Fleet Maintenance — Beacon on behalf of Beacon Media.",
      "clauses": [
        {
          "title": "Scope",
          "text": "Defines the scope of services and deliverables covered by this agreement."
        },
        {
          "title": "Term",
          "text": "Sets the effective term and renewal conditions for this agreement."
        }
      ],
      "history": [
        {
          "date": "Jan 2026",
          "event": "Contract executed"
        }
      ]
    },
  {
      "id": "CT-1049",
      "name": "Glacier Technologies — Supply Schedule #1049",
      "supplier": "Glacier Technologies",
      "service": "Freight Transportation — Glacier",
      "type": "Supply Schedule",
    documents: [], notes: [],
      "status": "Draft",
      "value": "$0.6M",
      "effective": "Not yet effective",
      "daysToExpiry": null,
      "risk": "Low",
      "flag": null,
      "owner": "Priya Shah",
      "governingLaw": "Illinois, US",
      "autoRenew": false,
      "summary": "Governs Freight Transportation — Glacier on behalf of Glacier Technologies.",
      "clauses": [
        {
          "title": "Scope",
          "text": "Defines the scope of services and deliverables covered by this agreement."
        },
        {
          "title": "Term",
          "text": "Sets the effective term and renewal conditions for this agreement."
        }
      ],
      "history": [
        {
          "date": "Jan 2026",
          "event": "Contract executed"
        }
      ]
    },
  {
      "id": "CT-1050",
      "name": "Vantage Cloud Systems — Service Order #1050",
      "supplier": "Vantage Cloud Systems",
      "service": "Network Security Monitoring — Vantage",
      "type": "Service Order",
    documents: [], notes: [],
      "status": "Active",
      "value": "$1.9M",
      "effective": "Jan 2026",
      "daysToExpiry": 70,
      "risk": "Low",
      "flag": null,
      "owner": "Elena Ruiz",
      "governingLaw": "Delaware, US",
      "autoRenew": false,
      "summary": "Governs Network Security Monitoring — Vantage on behalf of Vantage Cloud Systems.",
      "clauses": [
        {
          "title": "Scope",
          "text": "Defines the scope of services and deliverables covered by this agreement."
        },
        {
          "title": "Term",
          "text": "Sets the effective term and renewal conditions for this agreement."
        }
      ],
      "history": [
        {
          "date": "Jan 2026",
          "event": "Contract executed"
        }
      ]
    },
  {
      "id": "CT-1051",
      "name": "Amber Group — DPA #1051",
      "supplier": "Amber Group",
      "service": null,
      "type": "DPA",
    documents: [], notes: [],
      "status": "Pending Signature",
      "value": "N/A",
      "effective": "Jan 2026",
      "daysToExpiry": null,
      "risk": "Medium",
      "flag": null,
      "owner": "Elena Ruiz",
      "governingLaw": "Texas, US",
      "autoRenew": false,
      "summary": "Supplier-level DPA covering the overall relationship with Amber Group.",
      "clauses": [
        {
          "title": "Confidentiality / Compliance Terms",
          "text": "Standard terms drafted from Paradigm's template library."
        },
        {
          "title": "Term",
          "text": "Term and renewal conditions as specified in the executed agreement."
        }
      ],
      "history": [
        {
          "date": "Jan 2026",
          "event": "Agreement executed"
        }
      ]
    },
  {
      "id": "CT-1052",
      "name": "Anchor Analytics — NDA #1052",
      "supplier": "Anchor Analytics",
      "service": null,
      "type": "NDA",
    documents: [], notes: [],
      "status": "Draft",
      "value": "N/A",
      "effective": "Not yet effective",
      "daysToExpiry": null,
      "risk": "Low",
      "flag": null,
      "owner": "Priya Shah",
      "governingLaw": "California, US",
      "autoRenew": false,
      "summary": "Supplier-level NDA covering the overall relationship with Anchor Analytics.",
      "clauses": [
        {
          "title": "Confidentiality / Compliance Terms",
          "text": "Standard terms drafted from Paradigm's template library."
        },
        {
          "title": "Term",
          "text": "Term and renewal conditions as specified in the executed agreement."
        }
      ],
      "history": [
        {
          "date": "Jan 2026",
          "event": "Agreement executed"
        }
      ]
    },
  {
      "id": "CT-1053",
      "name": "Maplewood Robotics — Amendment #1053",
      "supplier": "Maplewood Robotics",
      "service": null,
      "type": "Amendment",
    documents: [], notes: [],
      "status": "Draft",
      "value": "N/A",
      "effective": "Not yet effective",
      "daysToExpiry": null,
      "risk": null,
      "flag": null,
      "owner": "Marcus Webb",
      "governingLaw": "Texas, US",
      "autoRenew": false,
      "summary": "Supplier-level Amendment covering the overall relationship with Maplewood Robotics.",
      "clauses": [
        {
          "title": "Confidentiality / Compliance Terms",
          "text": "Standard terms drafted from Paradigm's template library."
        },
        {
          "title": "Term",
          "text": "Term and renewal conditions as specified in the executed agreement."
        }
      ],
      "history": [
        {
          "date": "Jan 2026",
          "event": "Agreement executed"
        }
      ]
    },
  {
      "id": "CT-1054",
      "name": "Cascade Partners — Compliance Rider #1054",
      "supplier": "Cascade Partners",
      "service": null,
      "type": "Compliance Rider",
    documents: [], notes: [],
      "status": "Active",
      "value": "N/A",
      "effective": "Jan 2026",
      "daysToExpiry": 228,
      "risk": "Low",
      "flag": null,
      "owner": "Dana Kim",
      "governingLaw": "Illinois, US",
      "autoRenew": false,
      "summary": "Supplier-level Compliance Rider covering the overall relationship with Cascade Partners.",
      "clauses": [
        {
          "title": "Confidentiality / Compliance Terms",
          "text": "Standard terms drafted from Paradigm's template library."
        },
        {
          "title": "Term",
          "text": "Term and renewal conditions as specified in the executed agreement."
        }
      ],
      "history": [
        {
          "date": "Jan 2026",
          "event": "Agreement executed"
        }
      ]
    },
  {
      "id": "CT-1055",
      "name": "Silverline Dynamics — NDA #1055",
      "supplier": "Silverline Dynamics",
      "service": null,
      "type": "NDA",
    documents: [], notes: [],
      "status": "Active",
      "value": "N/A",
      "effective": "Jan 2026",
      "daysToExpiry": 64,
      "risk": "Low",
      "flag": null,
      "owner": "Elena Ruiz",
      "governingLaw": "Ohio, US",
      "autoRenew": false,
      "summary": "Supplier-level NDA covering the overall relationship with Silverline Dynamics.",
      "clauses": [
        {
          "title": "Confidentiality / Compliance Terms",
          "text": "Standard terms drafted from Paradigm's template library."
        },
        {
          "title": "Term",
          "text": "Term and renewal conditions as specified in the executed agreement."
        }
      ],
      "history": [
        {
          "date": "Jan 2026",
          "event": "Agreement executed"
        }
      ]
    },
  {
      "id": "CT-1056",
      "name": "Westfield Media — NDA #1056",
      "supplier": "Westfield Media",
      "service": null,
      "type": "NDA",
    documents: [], notes: [],
      "status": "Expired",
      "value": "N/A",
      "effective": "Jan 2026",
      "daysToExpiry": -79,
      "risk": "Low",
      "flag": null,
      "owner": "Elena Ruiz",
      "governingLaw": "Ohio, US",
      "autoRenew": false,
      "summary": "Supplier-level NDA covering the overall relationship with Westfield Media.",
      "clauses": [
        {
          "title": "Confidentiality / Compliance Terms",
          "text": "Standard terms drafted from Paradigm's template library."
        },
        {
          "title": "Term",
          "text": "Term and renewal conditions as specified in the executed agreement."
        }
      ],
      "history": [
        {
          "date": "Jan 2026",
          "event": "Agreement executed"
        }
      ]
    },
  {
      "id": "CT-1057",
      "name": "Meridian Steel Co. — NDA #1057",
      "supplier": "Meridian Steel Co.",
      "service": null,
      "type": "NDA",
    documents: [], notes: [],
      "status": "Active",
      "value": "N/A",
      "effective": "Jan 2026",
      "daysToExpiry": 203,
      "risk": null,
      "flag": null,
      "owner": "Marcus Webb",
      "governingLaw": "Ohio, US",
      "autoRenew": false,
      "summary": "Supplier-level NDA covering the overall relationship with Meridian Steel Co..",
      "clauses": [
        {
          "title": "Confidentiality / Compliance Terms",
          "text": "Standard terms drafted from Paradigm's template library."
        },
        {
          "title": "Term",
          "text": "Term and renewal conditions as specified in the executed agreement."
        }
      ],
      "history": [
        {
          "date": "Jan 2026",
          "event": "Agreement executed"
        }
      ]
    },
  {
      "id": "CT-1058",
      "name": "Halcyon Facilities Group — Compliance Rider #1058",
      "supplier": "Halcyon Facilities Group",
      "service": null,
      "type": "Compliance Rider",
    documents: [], notes: [],
      "status": "Pending Signature",
      "value": "N/A",
      "effective": "Jan 2026",
      "daysToExpiry": null,
      "risk": null,
      "flag": null,
      "owner": "Elena Ruiz",
      "governingLaw": "Texas, US",
      "autoRenew": false,
      "summary": "Supplier-level Compliance Rider covering the overall relationship with Halcyon Facilities Group.",
      "clauses": [
        {
          "title": "Confidentiality / Compliance Terms",
          "text": "Standard terms drafted from Paradigm's template library."
        },
        {
          "title": "Term",
          "text": "Term and renewal conditions as specified in the executed agreement."
        }
      ],
      "history": [
        {
          "date": "Jan 2026",
          "event": "Agreement executed"
        }
      ]
    },
  {
      "id": "CT-1059",
      "name": "Lumen Consulting — NDA #1059",
      "supplier": "Lumen Consulting",
      "service": null,
      "type": "NDA",
    documents: [], notes: [],
      "status": "Expired",
      "value": "N/A",
      "effective": "Jan 2026",
      "daysToExpiry": -63,
      "risk": null,
      "flag": null,
      "owner": "Dana Kim",
      "governingLaw": "Delaware, US",
      "autoRenew": false,
      "summary": "Supplier-level NDA covering the overall relationship with Lumen Consulting.",
      "clauses": [
        {
          "title": "Confidentiality / Compliance Terms",
          "text": "Standard terms drafted from Paradigm's template library."
        },
        {
          "title": "Term",
          "text": "Term and renewal conditions as specified in the executed agreement."
        }
      ],
      "history": [
        {
          "date": "Jan 2026",
          "event": "Agreement executed"
        }
      ]
    },
  {
      "id": "CT-1060",
      "name": "Northwind Logistics — DPA #1060",
      "supplier": "Northwind Logistics",
      "service": null,
      "type": "DPA",
    documents: [], notes: [],
      "status": "Active",
      "value": "N/A",
      "effective": "Jan 2026",
      "daysToExpiry": 132,
      "risk": null,
      "flag": null,
      "owner": "Dana Kim",
      "governingLaw": "Illinois, US",
      "autoRenew": false,
      "summary": "Supplier-level DPA covering the overall relationship with Northwind Logistics.",
      "clauses": [
        {
          "title": "Confidentiality / Compliance Terms",
          "text": "Standard terms drafted from Paradigm's template library."
        },
        {
          "title": "Term",
          "text": "Term and renewal conditions as specified in the executed agreement."
        }
      ],
      "history": [
        {
          "date": "Jan 2026",
          "event": "Agreement executed"
        }
      ]
    },
  {
      "id": "CT-1061",
      "name": "Orbital Marketing Partners — Insurance Rider #1061",
      "supplier": "Orbital Marketing Partners",
      "service": null,
      "type": "Insurance Rider",
    documents: [], notes: [],
      "status": "Draft",
      "value": "N/A",
      "effective": "Not yet effective",
      "daysToExpiry": null,
      "risk": "Medium",
      "flag": null,
      "owner": "Sam Okafor",
      "governingLaw": "California, US",
      "autoRenew": false,
      "summary": "Supplier-level Insurance Rider covering the overall relationship with Orbital Marketing Partners.",
      "clauses": [
        {
          "title": "Confidentiality / Compliance Terms",
          "text": "Standard terms drafted from Paradigm's template library."
        },
        {
          "title": "Term",
          "text": "Term and renewal conditions as specified in the executed agreement."
        }
      ],
      "history": [
        {
          "date": "Jan 2026",
          "event": "Agreement executed"
        }
      ]
    },
  {
      "id": "CT-1062",
      "name": "Lakeshore Labs — Compliance Rider #1062",
      "supplier": "Lakeshore Labs",
      "service": null,
      "type": "Compliance Rider",
    documents: [], notes: [],
      "status": "Active",
      "value": "N/A",
      "effective": "Jan 2026",
      "daysToExpiry": 48,
      "risk": null,
      "flag": null,
      "owner": "Dana Kim",
      "governingLaw": "Delaware, US",
      "autoRenew": false,
      "summary": "Supplier-level Compliance Rider covering the overall relationship with Lakeshore Labs.",
      "clauses": [
        {
          "title": "Confidentiality / Compliance Terms",
          "text": "Standard terms drafted from Paradigm's template library."
        },
        {
          "title": "Term",
          "text": "Term and renewal conditions as specified in the executed agreement."
        }
      ],
      "history": [
        {
          "date": "Jan 2026",
          "event": "Agreement executed"
        }
      ]
    },
  {
      "id": "CT-1063",
      "name": "Vantage Cloud Systems — Insurance Rider #1063",
      "supplier": "Vantage Cloud Systems",
      "service": null,
      "type": "Insurance Rider",
    documents: [], notes: [],
      "status": "Breach Flagged",
      "value": "N/A",
      "effective": "Jan 2026",
      "daysToExpiry": null,
      "risk": null,
      "flag": null,
      "owner": "Dana Kim",
      "governingLaw": "Delaware, US",
      "autoRenew": false,
      "summary": "Supplier-level Insurance Rider covering the overall relationship with Vantage Cloud Systems.",
      "clauses": [
        {
          "title": "Confidentiality / Compliance Terms",
          "text": "Standard terms drafted from Paradigm's template library."
        },
        {
          "title": "Term",
          "text": "Term and renewal conditions as specified in the executed agreement."
        }
      ],
      "history": [
        {
          "date": "Jan 2026",
          "event": "Agreement executed"
        }
      ]
    },
  {
      "id": "CT-1064",
      "name": "Bridgeway Logistics — Insurance Rider #1064",
      "supplier": "Bridgeway Logistics",
      "service": null,
      "type": "Insurance Rider",
    documents: [], notes: [],
      "status": "Active",
      "value": "N/A",
      "effective": "Jan 2026",
      "daysToExpiry": 218,
      "risk": "Medium",
      "flag": null,
      "owner": "Marcus Webb",
      "governingLaw": "California, US",
      "autoRenew": false,
      "summary": "Supplier-level Insurance Rider covering the overall relationship with Bridgeway Logistics.",
      "clauses": [
        {
          "title": "Confidentiality / Compliance Terms",
          "text": "Standard terms drafted from Paradigm's template library."
        },
        {
          "title": "Term",
          "text": "Term and renewal conditions as specified in the executed agreement."
        }
      ],
      "history": [
        {
          "date": "Jan 2026",
          "event": "Agreement executed"
        }
      ]
    },
  {
      "id": "CT-1065",
      "name": "Frontier Holdings — Compliance Rider #1065",
      "supplier": "Frontier Holdings",
      "service": null,
      "type": "Compliance Rider",
    documents: [], notes: [],
      "status": "Active",
      "value": "N/A",
      "effective": "Jan 2026",
      "daysToExpiry": 203,
      "risk": null,
      "flag": null,
      "owner": "Marcus Webb",
      "governingLaw": "Ohio, US",
      "autoRenew": false,
      "summary": "Supplier-level Compliance Rider covering the overall relationship with Frontier Holdings.",
      "clauses": [
        {
          "title": "Confidentiality / Compliance Terms",
          "text": "Standard terms drafted from Paradigm's template library."
        },
        {
          "title": "Term",
          "text": "Term and renewal conditions as specified in the executed agreement."
        }
      ],
      "history": [
        {
          "date": "Jan 2026",
          "event": "Agreement executed"
        }
      ]
    },
  {
      "id": "CT-1066",
      "name": "Oakhurst Industries — Compliance Rider #1066",
      "supplier": "Oakhurst Industries",
      "service": null,
      "type": "Compliance Rider",
    documents: [], notes: [],
      "status": "Active",
      "value": "N/A",
      "effective": "Jan 2026",
      "daysToExpiry": 295,
      "risk": "Low",
      "flag": null,
      "owner": "Priya Shah",
      "governingLaw": "Illinois, US",
      "autoRenew": false,
      "summary": "Supplier-level Compliance Rider covering the overall relationship with Oakhurst Industries.",
      "clauses": [
        {
          "title": "Confidentiality / Compliance Terms",
          "text": "Standard terms drafted from Paradigm's template library."
        },
        {
          "title": "Term",
          "text": "Term and renewal conditions as specified in the executed agreement."
        }
      ],
      "history": [
        {
          "date": "Jan 2026",
          "event": "Agreement executed"
        }
      ]
    },
  {
      "id": "CT-1067",
      "name": "Amber Industries — Compliance Rider #1067",
      "supplier": "Amber Industries",
      "service": null,
      "type": "Compliance Rider",
    documents: [], notes: [],
      "status": "Active",
      "value": "N/A",
      "effective": "Jan 2026",
      "daysToExpiry": 250,
      "risk": null,
      "flag": null,
      "owner": "Sam Okafor",
      "governingLaw": "Illinois, US",
      "autoRenew": false,
      "summary": "Supplier-level Compliance Rider covering the overall relationship with Amber Industries.",
      "clauses": [
        {
          "title": "Confidentiality / Compliance Terms",
          "text": "Standard terms drafted from Paradigm's template library."
        },
        {
          "title": "Term",
          "text": "Term and renewal conditions as specified in the executed agreement."
        }
      ],
      "history": [
        {
          "date": "Jan 2026",
          "event": "Agreement executed"
        }
      ]
    },
  {
      "id": "CT-1068",
      "name": "Junction Dynamics — Insurance Rider #1068",
      "supplier": "Junction Dynamics",
      "service": null,
      "type": "Insurance Rider",
    documents: [], notes: [],
      "status": "Active",
      "value": "N/A",
      "effective": "Jan 2026",
      "daysToExpiry": 82,
      "risk": null,
      "flag": null,
      "owner": "Dana Kim",
      "governingLaw": "Delaware, US",
      "autoRenew": false,
      "summary": "Supplier-level Insurance Rider covering the overall relationship with Junction Dynamics.",
      "clauses": [
        {
          "title": "Confidentiality / Compliance Terms",
          "text": "Standard terms drafted from Paradigm's template library."
        },
        {
          "title": "Term",
          "text": "Term and renewal conditions as specified in the executed agreement."
        }
      ],
      "history": [
        {
          "date": "Jan 2026",
          "event": "Agreement executed"
        }
      ]
    },
  {
      "id": "CT-1069",
      "name": "Nimbus Technologies — Insurance Rider #1069",
      "supplier": "Nimbus Technologies",
      "service": null,
      "type": "Insurance Rider",
    documents: [], notes: [],
      "status": "Active",
      "value": "N/A",
      "effective": "Jan 2026",
      "daysToExpiry": 258,
      "risk": "Medium",
      "flag": null,
      "owner": "Elena Ruiz",
      "governingLaw": "California, US",
      "autoRenew": false,
      "summary": "Supplier-level Insurance Rider covering the overall relationship with Nimbus Technologies.",
      "clauses": [
        {
          "title": "Confidentiality / Compliance Terms",
          "text": "Standard terms drafted from Paradigm's template library."
        },
        {
          "title": "Term",
          "text": "Term and renewal conditions as specified in the executed agreement."
        }
      ],
      "history": [
        {
          "date": "Jan 2026",
          "event": "Agreement executed"
        }
      ]
    },
  {
      "id": "CT-1070",
      "name": "Granite Solutions — Compliance Rider #1070",
      "supplier": "Granite Solutions",
      "service": null,
      "type": "Compliance Rider",
    documents: [], notes: [],
      "status": "Active",
      "value": "N/A",
      "effective": "Jan 2026",
      "daysToExpiry": 258,
      "risk": null,
      "flag": null,
      "owner": "Dana Kim",
      "governingLaw": "Ohio, US",
      "autoRenew": false,
      "summary": "Supplier-level Compliance Rider covering the overall relationship with Granite Solutions.",
      "clauses": [
        {
          "title": "Confidentiality / Compliance Terms",
          "text": "Standard terms drafted from Paradigm's template library."
        },
        {
          "title": "Term",
          "text": "Term and renewal conditions as specified in the executed agreement."
        }
      ],
      "history": [
        {
          "date": "Jan 2026",
          "event": "Agreement executed"
        }
      ]
    }
];

const INVOICES = [
  { id: "INV-88210", supplier: "Vantage Cloud Systems", amount: "$142,000", status: "Matched", conf: 99,
    hold: false, holdReason: null, overage: null,
    poId: "PO-58231", poTotal: 142000, invoiceDate: "Jul 3, 2026", dueDate: "Aug 2, 2026", paymentTerms: "Net 30",
    department: "IT Operations", category: "IT & Software", subcategory: "Cloud Infrastructure",
    documents: [], notes: [] },
  { id: "INV-88214", supplier: "Northwind Logistics", amount: "$58,300", status: "Exception", conf: 62,
    hold: true, holdReason: "Exception — quantity mismatch pending resolution", overage: null,
    poId: "PO-58233", poTotal: 58300, invoiceDate: "Jul 12, 2026", dueDate: "Aug 11, 2026", paymentTerms: "Net 30",
    department: "Logistics", category: "Logistics", subcategory: "Freight Services",
    documents: [], notes: [] },
  { id: "INV-88219", supplier: "Meridian Steel Co.", amount: "$310,500", status: "Matched", conf: 97,
    hold: false, holdReason: null,
    overage: { amount: "$18,500 over PO-58229", approved: null, note: "Invoiced amount exceeds the linked PO by roughly 3%." },
    poId: "PO-58229", poTotal: 292000, invoiceDate: "Jun 28, 2026", dueDate: "Aug 27, 2026", paymentTerms: "Net 60",
    department: "Manufacturing", category: "Raw Materials", subcategory: "Steel Supply",
    documents: [], notes: [] },
  { id: "INV-88221", supplier: "Halcyon Facilities Group", amount: "$9,800", status: "Duplicate?", conf: 41,
    hold: true, holdReason: "Flagged as a possible duplicate — held pending investigation", overage: null,
    poId: "PO-58235", poTotal: 9800, invoiceDate: "Jul 20, 2026", dueDate: "Aug 19, 2026", paymentTerms: "Net 30",
    department: "Facilities", category: "Facilities", subcategory: "Maintenance",
    documents: [], notes: [] },
];

const VALUE_TYPES = ["Savings", "Cost Avoidance", "Payment Terms Improvement"];

// Value tracking: logged by the contract manager (the contract's owner), routed to Finance
// for approval before it counts toward the credited business owner's total.
const VALUE_ITEMS = [
  { id: "VAL-001", type: "Cost Avoidance", title: "Held freight rate escalation to 5% vs. planned 8%",
    contractId: "CT-1004", poId: null, supplier: "Northwind Logistics", amount: 0.093,
    creditedTo: "Elena Ruiz", submittedBy: "Elena Ruiz", status: "Pending Finance Approval",
    financeApprover: null, note: "Negotiated the renewal escalation down from the standard 8% clause to 5%.", dateSubmitted: "Jul 22, 2026" },
  { id: "VAL-002", type: "Savings", title: "Consolidated hosting tiers under the Vantage MSA",
    contractId: "CT-1001", poId: "PO-58231", supplier: "Vantage Cloud Systems", amount: 0.18,
    creditedTo: "Priya Shah", submittedBy: "Priya Shah", status: "Approved",
    financeApprover: "You (Executive)", note: "Right-sized compute tiers during the annual review, reducing run-rate.", dateSubmitted: "Jun 10, 2026" },
  { id: "VAL-003", type: "Payment Terms Improvement", title: "Extended payment terms from Net 30 to Net 60",
    contractId: "CT-1007", poId: null, supplier: "Meridian Steel Co.", amount: 0.06,
    creditedTo: "Sam Okafor", submittedBy: "Sam Okafor", status: "Approved",
    financeApprover: "Priya Shah", note: "Improves working capital by roughly one month of raw materials spend.", dateSubmitted: "May 2, 2026" },
  { id: "VAL-004", type: "Cost Avoidance", title: "Averted a mid-year price increase during steel market volatility",
    contractId: "CT-1007", poId: null, supplier: "Meridian Steel Co.", amount: 0.25,
    creditedTo: "Sam Okafor", submittedBy: "Sam Okafor", status: "Pending Finance Approval",
    financeApprover: null, note: "Locked pricing for two additional quarters ahead of a market-wide increase.", dateSubmitted: "Jul 26, 2026" },
  { id: "VAL-005", type: "Savings", title: "Reduced facilities janitorial staffing overage",
    contractId: "CT-1006", poId: null, supplier: "Halcyon Facilities Group", amount: 0.04,
    creditedTo: "Dana Kim", submittedBy: "Dana Kim", status: "Rejected",
    financeApprover: "Priya Shah", note: "Insufficient documentation — resubmit with vendor invoice backup.", dateSubmitted: "Jun 28, 2026" },
  { id: "VAL-006", type: "Payment Terms Improvement", title: "Standardized Net 45 terms across the IT vendor pool",
    contractId: "CT-1002", poId: null, supplier: "Vantage Cloud Systems", amount: 0.03,
    creditedTo: "Priya Shah", submittedBy: "Priya Shah", status: "Approved",
    financeApprover: "You (Executive)", note: "Applied the new standard term at renewal.", dateSubmitted: "Feb 14, 2026" },
  { id: "VAL-007", type: "Savings", title: "Volume discount tier achieved on hosting order",
    contractId: "CT-1001", poId: "PO-58231", supplier: "Vantage Cloud Systems", amount: 0.085,
    creditedTo: "Priya Shah", submittedBy: "Priya Shah", status: "Pending Finance Approval",
    financeApprover: null, note: "Crossed the next volume-discount threshold this quarter.", dateSubmitted: "Jul 29, 2026" },
  { id: "VAL-008", type: "Cost Avoidance", title: "Avoided duplicate PO issuance after invoice reconciliation",
    contractId: null, poId: "PO-58218", supplier: "Orbital Marketing Partners", amount: 0.022,
    creditedTo: "Marcus Webb", submittedBy: "Marcus Webb", status: "Approved",
    financeApprover: "You (Executive)", note: "Caught during monthly invoice reconciliation before payment.", dateSubmitted: "Apr 3, 2026" },
];

const COPILOT_SEEDS = [
  "Find cheaper suppliers for Facilities",
  "Show contracts expiring in 60 days",
  "Create an RFP for freight services",
  "What's our savings this quarter?",
];

const COPILOT_REPLIES = {
  "Find cheaper suppliers for Facilities": "I found 4 alternative suppliers in your network with rates 9–14% below Halcyon's current contract. Vantage Facility Partners has the strongest fit — similar SLA coverage, ESG score of 82, and no open risk flags. Want me to draft an RFP?",
  "Show contracts expiring in 60 days": "12 contracts expire in the next 60 days, totaling $9.6M in spend. 2 have unfavorable auto-renewal terms — Vantage Cloud (18 days) and a Northwind Logistics rate clause (34 days). I'd recommend starting renegotiation on both this week.",
  "Create an RFP for freight services": "Drafting an RFP for freight services now — scope pulled from your last 3 logistics contracts, evaluation criteria weighted 40% cost / 30% on-time performance / 30% risk. I'll route it to Procurement Leader for review before publishing.",
  "What's our savings this quarter?": "Identified savings this quarter: $3.4M realized, $1.8M in flagged opportunities not yet actioned — mostly supplier consolidation in IT & Software and a freight rate renegotiation. Want the full breakdown by category?",
};

// Grounds the Copilot's answer in whatever's actually in the shared store, falling back to the
// scripted COPILOT_REPLIES only when the question isn't one we can compute from live data.
const liveCopilotReply = (text, ctx) => {
  const { contracts, suppliers, sourcingEvents } = ctx;
  const lower = text.toLowerCase();

  if (lower.includes("contracts expiring") || (lower.includes("expir") && lower.includes("60"))) {
    const soon = contracts.filter((c) => c.daysToExpiry != null && c.daysToExpiry >= 0 && c.daysToExpiry <= 60);
    if (soon.length === 0) return "No contracts are currently expiring within 60 days.";
    const lines = soon.map((c) => `${c.name} (${c.supplier}) — ${c.daysToExpiry}d`).join("; ");
    return `${soon.length} contract${soon.length > 1 ? "s" : ""} expiring within 60 days: ${lines}.`;
  }

  if (lower.includes("cheaper suppliers") && lower.includes("facilities")) {
    const facilities = suppliers.filter((s) => s.category === "Facilities");
    const names = facilities.map((s) => s.name).join(", ") || "none on file";
    return `Currently on file in Facilities: ${names}. ${
      facilities.some((s) => s.risk === "High") ? "One is flagged High risk — worth benchmarking a second source before renewing." : "None are currently flagged High risk."
    }`;
  }

  if (lower.includes("rfp") && lower.includes("freight")) {
    const existing = sourcingEvents.find((e) => e.title.toLowerCase().includes("freight"));
    if (existing) {
      return `There's already an active sourcing event for freight — "${existing.title}", currently at ${existing.stage} with ${existing.suppliers} suppliers invited and ${existing.savings} projected savings. Want me to check its status instead of starting a new one?`;
    }
  }

  if (lower.includes("savings") && lower.includes("quarter")) {
    const total = sourcingEvents.reduce((sum, e) => sum + parseMoney(e.savings), 0);
    return `Across ${sourcingEvents.length} active sourcing events, projected savings total roughly $${total.toFixed(2)}M. Want the breakdown by event?`;
  }

  const mentioned = suppliers.find((s) => lower.includes(s.name.toLowerCase()));
  if (mentioned) {
    return mentioned.risk_score != null
      ? `${mentioned.name} is currently rated ${mentioned.risk} risk (score ${mentioned.risk_score}), status ${mentioned.status}.`
      : `${mentioned.name} hasn't been risk-assessed yet — current status is ${mentioned.status}.`;
  }

  return COPILOT_REPLIES[text] ||
    "I've pulled the relevant records and I'm cross-checking them against policy — I'll follow up in this thread with a recommendation and any exceptions found.";
};

const CONTRACT_AI_SEEDS = [
  "Summarize the key risks",
  "What happens if we terminate early?",
  "Draft a renewal reminder email",
  "Compare terms to our standard MSA",
];

const contractAIReply = (contract, q) => {
  const lower = q.toLowerCase();
  if (lower.includes("key risk")) {
    return `Primary risk factors: ${contract.risk ? `${contract.risk} risk rating` : "no formal risk rating yet"}${
      contract.flag ? `, driven mainly by "${contract.flag}."` : "."
    }${contract.autoRenew ? " This contract also auto-renews, so a decision is needed before the notice window closes." : ""}`;
  }
  if (lower.includes("terminate")) {
    return `Early termination would follow the termination clause on file and require written notice. Any work tied to ${
      contract.service || "this contract"
    } would need a transition plan first. I'd loop in ${contract.owner} before proceeding.`;
  }
  if (lower.includes("renewal") || lower.includes("reminder")) {
    return `Draft ready — a renewal reminder addressed to ${contract.supplier}, referencing the ${expiryLabel(contract)} remaining and requesting confirmation of terms. Want me to route it to ${contract.owner} for review first?`;
  }
  if (lower.includes("standard msa") || lower.includes("compare")) {
    return `Compared to our standard template, this contract ${
      contract.risk === "High" ? "deviates on liability caps and notice periods" : "is broadly aligned, with only minor differences in payment terms"
    }.`;
  }
  return `I've reviewed ${contract.name} — let me know what you'd like me to check, summarize, or draft next.`;
};

const INTAKE_STAGES = ["New", "Triage", "Routed", "In Progress", "Closed"];



const INTAKE_REQUESTS = [
  { id: "INT-2201", title: "New service: Cloud migration support", type: "Service Request", requester: "Priya Shah", stage: "Triage",
    category: "IT & Software", subcategory: "Cloud Infrastructure", value: "$180,000", neededBy: "2026-09-15",
    description: "Ongoing support and enhancement work for the cloud migration effort — likely an extension of the existing Vantage engagement rather than a net-new service.",
    ai: "Matches active Vantage Cloud engagement — suggest amend existing service agreement rather than new intake.",
    costCenter: "CC-3000 IT", department: "IT", executiveSponsor: "Marcus Webb", sourcingManager: null,
    attachments: [], draftContract: null, needsBudgetDisposition: false, aiReview: null,
    dispositions: [], locked: false },
  { id: "INT-2198", title: "Onboard new vendor: Crescent Analytics", type: "New Vendor", requester: "Marcus Webb", stage: "New",
    category: "Professional Services", subcategory: "Management Consulting", value: "$200,000", neededBy: "2026-08-30",
    description: "Analytics consultancy engaged for a Q3 pricing study. Needs full onboarding before any statement of work can be signed.",
    ai: "Category: Professional Services. Suggested owner: Vendor Management.",
    costCenter: "CC-1000 Corporate", department: "Procurement", executiveSponsor: "Priya Shah", sourcingManager: "Elena Ruiz",
    attachments: [], draftContract: null, needsBudgetDisposition: false, aiReview: null,
    dispositions: [], locked: false },
  { id: "INT-2194", title: "Contract amendment: Northwind rate change", type: "Contract Change", requester: "Elena Ruiz", stage: "Routed",
    category: "Logistics", subcategory: "Freight & Transportation", value: "$3,100,000", neededBy: "2026-08-15",
    description: "Northwind has issued a rate increase notice ahead of the freight schedule renewal. Needs legal and category review before acceptance.",
    ai: "Routed to Contract Agent for escalation clause review.",
    costCenter: "CC-2000 Operations", department: "Operations", executiveSponsor: "You (Executive)", sourcingManager: "Dana Kim",
    attachments: [], draftContract: null, needsBudgetDisposition: false, aiReview: null,
    dispositions: [], locked: false },
  { id: "INT-2189", title: "Purchase request: 40 laptops", type: "Purchase Request", requester: "Sam Okafor", stage: "In Progress",
    category: "IT & Software", subcategory: "Hardware & Devices", value: "$62,000", neededBy: "2026-08-10",
    description: "Standard refresh cycle for the Austin office. Matches an existing catalog item and preferred supplier.",
    ai: "Auto-approved under existing blanket order policy — no human review needed.",
    costCenter: "CC-3000 IT", department: "IT", executiveSponsor: null, sourcingManager: null,
    attachments: [], draftContract: null, needsBudgetDisposition: false, aiReview: null,
    dispositions: [], locked: false },
  { id: "INT-2191", title: "New vendor: Bluepeak Facilities", type: "New Vendor", requester: "Dana Kim", stage: "In Progress",
    category: "Facilities", subcategory: "Maintenance & Repair", value: "$450,000", neededBy: "2026-09-01",
    description: "Backup facilities vendor being evaluated as a second source alongside Halcyon, given Halcyon's open governance gaps.",
    ai: "Risk scoring in progress — preliminary score 22 (Low).",
    costCenter: "CC-2000 Operations", department: "Operations", executiveSponsor: "You (Executive)", sourcingManager: "Priya Shah",
    attachments: [], draftContract: null, needsBudgetDisposition: false, aiReview: null,
    dispositions: [], locked: false },
  { id: "INT-2183", title: "Recurring: Office supplies replenishment", type: "Purchase Request", requester: "Auto-generated", stage: "Closed",
    category: "Facilities", subcategory: "Office Furniture & Fixtures", value: "$4,200", neededBy: "2026-07-20",
    description: "System-generated recurring order under the standing office supplies agreement.",
    ai: "Fulfilled via recurring order — no exceptions.",
    costCenter: "CC-2000 Operations", department: "Operations", executiveSponsor: null, sourcingManager: null,
    attachments: [], draftContract: null, needsBudgetDisposition: false, aiReview: null,
    dispositions: [{ id: "D-1", action: "Auto-approved", note: "Fulfilled via recurring order — no exceptions.", link: null, actor: "System", date: "Jul 20, 2026" }],
    locked: true },
];

const DISPOSITION_ACTIONS = {
  "Service Request": [
    { id: "new_service", label: "Create new service", stage: "In Progress" },
    { id: "link_service", label: "Link to existing service", stage: "In Progress", pick: "service" },
    { id: "decline", label: "Decline", stage: "Closed" },
  ],
  "Contract Request": [
    { id: "new_contract", label: "Draft new contract with preferred supplier", stage: "In Progress", pick: "supplier" },
    { id: "amend", label: "Attach as amendment to supplier's agreements", stage: "Routed", pick: "supplier" },
    { id: "decline", label: "Decline", stage: "Closed" },
  ],
  "New Vendor": [
    { id: "onboard", label: "Onboard as supplier", stage: "Closed" },
    { id: "diligence", label: "Request additional diligence", stage: "Triage" },
    { id: "decline", label: "Decline", stage: "Closed" },
  ],
  "New Project": [
    { id: "launch_package", label: "Route to Project Management to launch package", stage: "Routed" },
    { id: "decline", label: "Decline", stage: "Closed" },
  ],
  "RFx / Sourcing Event": [
    { id: "launch_rfp", label: "Launch RFP", stage: "In Progress", pick: "supplierCount" },
    { id: "decline", label: "Decline", stage: "Closed" },
  ],
  "Purchase Request": [
    { id: "approve", label: "Approve", stage: "Closed" },
    { id: "reject", label: "Reject", stage: "Closed" },
  ],
  "Contract Change": [
    { id: "route_contract_agent", label: "Route to Contract Agent", stage: "Routed" },
    { id: "close", label: "Close", stage: "Closed" },
  ],
};
const DEFAULT_DISPOSITIONS = [
  { id: "approve", label: "Approve", stage: "Closed" },
  { id: "decline", label: "Decline", stage: "Closed" },
];

const parseMoney = (str) => {
  if (!str || typeof str !== "string") return 0;
  const cleaned = str.replace(/[^0-9.]/g, "");
  const n = parseFloat(cleaned) || 0;
  if (/b/i.test(str)) return n * 1000;
  if (/m/i.test(str)) return n;
  if (/k/i.test(str)) return n / 1000;
  return n / 1_000_000; // assume raw dollars
};

const findEscalationPct = (contracts) => {
  for (const c of contracts) {
    const match = (c.flag || "").match(/(\d+(\.\d+)?)\s*%/);
    if (match) return parseFloat(match[1]);
  }
  return null;
};

const stageDotColor = (stage) =>
  stage === "Closed" ? "bg-emerald-500"
  : stage === "In Progress" ? "bg-[#2563EB]"
  : stage === "Routed" ? "bg-[#16A34A]"
  : stage === "Triage" ? "bg-amber-400"
  : "bg-slate-300"; // New

const USERS = [
  { name: "Priya Shah", role: "Procurement Leader" },
  { name: "Elena Ruiz", role: "Category Manager" },
  { name: "Dana Kim", role: "Buyer" },
  { name: "Marcus Webb", role: "Category Manager" },
  { name: "Sam Okafor", role: "Buyer" },
  { name: "Compliance Team", role: "Compliance Officer" },
  { name: "IT Administrator", role: "IT Administrator" },
  { name: "You (Executive)", role: "Executive" },
];

// Reads the same PERMISSION_MODULES / PERMISSIONS_MATRIX shown in Administration → Roles & Permissions,
// so a change made there is the same data gating buttons everywhere else.
const permissionLevel = (role, moduleLabel) => {
  const row = PERMISSIONS_MATRIX[role];
  if (!row) return "None";
  const idx = PERMISSION_MODULES.indexOf(moduleLabel);
  return idx === -1 ? "None" : row[idx];
};
const canEdit = (role, moduleLabel) => ["Edit", "Approve"].includes(permissionLevel(role, moduleLabel));
const canApprove = (role, moduleLabel) => permissionLevel(role, moduleLabel) === "Approve";
const canView = (role, moduleLabel) => permissionLevel(role, moduleLabel) !== "None";

function Gated({ role, module, level = "edit", children, fallbackLabel }) {
  const allowed = level === "approve" ? canApprove(role, module) : level === "view" ? canView(role, module) : canEdit(role, module);
  if (allowed) return children;
  return (
    <button
      disabled
      title={`Your role (${role}) doesn't have ${level === "approve" ? "approval" : "edit"} access to ${module}`}
      className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-slate-50 text-slate-500 text-sm px-3 py-2 cursor-not-allowed"
    >
      <Lock size={14} /> {fallbackLabel || "Restricted"}
    </button>
  );
}


const RISK_CATEGORIES = [
  "Information Security",
  "Data Privacy",
  "Regulatory Compliance",
  "Conflict of Interest",
  "AI / Automated Decisioning",
  "System Access & Identity",
  "Business Continuity",
  "Financial Stability",
  "Fourth-Party / Subcontractor",
  "Reputational",
];

const SERVICES = [
  {
    id: "SV-01", name: "Cloud Infrastructure Hosting", supplier: "Vantage Cloud Systems", contract: "Vantage Cloud — Hosting Order #2291",
    category: "IT & Software", criticality: "Critical", governance: "Governed", riskScore: 14, sla: 98, lastReview: "Jul 2",
    documents: [], notes: [], owner: "Priya Shah",
    contacts: [
      { name: "Priya Shah", role: "Business Owner", org: "Paradigm" },
      { name: "Marcus Webb", role: "Technical Contact", org: "Paradigm" },
      { name: "Rina Alvarez", role: "Account Director", org: "Vantage Cloud Systems" },
    ],
    complianceDocs: [
      { name: "SOC 2 Type II Report", status: "On File", date: "Mar 2026", expires: "Mar 2027" },
      { name: "Penetration Test Report", status: "On File", date: "Jan 2026", expires: null },
      { name: "Certificate of Insurance", status: "On File", date: "Jun 2026", expires: "Jun 2027" },
    ],
    slas: [
      { metric: "Uptime", target: "99.95%", actual: "99.97%", status: "Met" },
      { metric: "P1 Response Time", target: "15 min", actual: "11 min", status: "Met" },
      { metric: "P1 Resolution Time", target: "4 hrs", actual: "3.2 hrs", status: "Met" },
    ],
    riskAssessment: {
      "Information Security": { rating: "Low", note: "Annual penetration test clean, no critical findings." },
      "Data Privacy": { rating: "Low", note: "Covered under an active Data Processing Addendum." },
      "Regulatory Compliance": { rating: "Low", note: "SOC 2 Type II current through Mar 2027." },
      "Conflict of Interest": { rating: "Low", note: "No overlapping engagements identified." },
      "AI / Automated Decisioning": { rating: "Low", note: "No AI-driven decisioning in this service." },
      "System Access & Identity": { rating: "Low", note: "SSO and least-privilege access enforced." },
      "Business Continuity": { rating: "Medium", note: "Last full DR failover test was 14 months ago." },
      "Financial Stability": { rating: "Low", note: "Vendor credit rating stable (A-)." },
      "Fourth-Party / Subcontractor": { rating: "Medium", note: "Relies on two subprocessors for backup storage." },
      "Reputational": { rating: "Low", note: "No adverse media in the past 12 months." },
    },
  },
  {
    id: "SV-02", name: "Application Support & Maintenance", supplier: "Vantage Cloud Systems", contract: "Vantage Cloud — Support Addendum",
    category: "IT & Software", criticality: "High", governance: "Gap identified", riskScore: 32, sla: 91, lastReview: "Jun 10",
    documents: [], notes: [], owner: "Elena Ruiz",
    gap: "SOC 2 report renewal overdue",
    contacts: [
      { name: "Priya Shah", role: "Business Owner", org: "Paradigm" },
      { name: "Rina Alvarez", role: "Account Director", org: "Vantage Cloud Systems" },
    ],
    complianceDocs: [
      { name: "SOC 2 Type II Report", status: "Expired", date: "Feb 2025", expires: "Feb 2026" },
      { name: "Data Processing Addendum", status: "On File", date: "Jan 2026", expires: null },
    ],
    slas: [
      { metric: "P1 Response Time", target: "30 min", actual: "42 min", status: "At Risk" },
      { metric: "Ticket Resolution (SLA)", target: "95%", actual: "91%", status: "At Risk" },
      { metric: "Customer Satisfaction", target: "90%", actual: "88%", status: "At Risk" },
    ],
    riskAssessment: {
      "Information Security": { rating: "Medium", note: "SOC 2 report lapsed — can't confirm current control effectiveness." },
      "Data Privacy": { rating: "Medium", note: "DPA in place but annual review is overdue." },
      "Regulatory Compliance": { rating: "High", note: "SOC 2 Type II expired 45 days ago." },
      "Conflict of Interest": { rating: "Low", note: "None identified." },
      "AI / Automated Decisioning": { rating: "Medium", note: "Vendor uses an AI-assisted ticket triage tool; model governance not yet reviewed." },
      "System Access & Identity": { rating: "Low", note: "Access reviewed quarterly." },
      "Business Continuity": { rating: "Low", note: "Shared on-call rotation with adequate coverage." },
      "Financial Stability": { rating: "Low", note: "Stable." },
      "Fourth-Party / Subcontractor": { rating: "Low", note: "No subcontractors used." },
      "Reputational": { rating: "Low", note: "No issues on record." },
    },
  },
  {
    id: "SV-03", name: "Freight & Distribution Services", supplier: "Northwind Logistics", contract: "Northwind Logistics — Freight Rate Schedule",
    category: "Logistics", criticality: "High", governance: "Governed", riskScore: 28, sla: 94, lastReview: "Jun 28",
    documents: [], notes: [], owner: "Dana Kim",
    contacts: [
      { name: "Elena Ruiz", role: "Business Owner", org: "Paradigm" },
      { name: "Lucia Fenn", role: "Ops Lead", org: "Northwind Logistics" },
    ],
    complianceDocs: [
      { name: "DOT Compliance Certificate", status: "On File", date: "Jan 2026", expires: "Jan 2027" },
      { name: "Certificate of Insurance", status: "On File", date: "Aug 2025", expires: "Aug 2026" },
    ],
    slas: [
      { metric: "On-Time Delivery", target: "97%", actual: "94%", status: "At Risk" },
      { metric: "Damage Rate", target: "< 0.5%", actual: "0.3%", status: "Met" },
    ],
    riskAssessment: {
      "Information Security": { rating: "Low", note: "Limited data exposure — logistics data only." },
      "Data Privacy": { rating: "Low", note: "No personal data processed." },
      "Regulatory Compliance": { rating: "Medium", note: "DOT compliance current; annual audit due in 60 days." },
      "Conflict of Interest": { rating: "Low", note: "None identified." },
      "AI / Automated Decisioning": { rating: "Low", note: "Route optimization is rules-based, not AI-driven." },
      "System Access & Identity": { rating: "Medium", note: "Shared login found at two regional depots — flagged for cleanup." },
      "Business Continuity": { rating: "Medium", note: "Single-carrier dependency on core lanes." },
      "Financial Stability": { rating: "Medium", note: "Fuel cost pressure reported this quarter." },
      "Fourth-Party / Subcontractor": { rating: "High", note: "Heavy reliance on subcontracted regional carriers." },
      "Reputational": { rating: "Low", note: "No issues on record." },
    },
  },
  {
    id: "SV-04", name: "Facilities Maintenance Services", supplier: "Halcyon Facilities Group", contract: "Halcyon Facilities — Maintenance Order",
    category: "Facilities", criticality: "Medium", governance: "Gap identified", riskScore: 61, sla: 82, lastReview: "May 14",
    documents: [], notes: [], owner: "Marcus Webb",
    gap: "Governing contract missing counter-signature",
    contacts: [
      { name: "Dana Kim", role: "Business Owner", org: "Paradigm" },
      { name: "Unassigned", role: "Vendor Representative", org: "Halcyon Facilities Group" },
    ],
    complianceDocs: [
      { name: "Certificate of Insurance", status: "Expired", date: "Apr 2025", expires: "Apr 2026" },
      { name: "Background Check Attestation", status: "Missing", date: null, expires: null },
    ],
    slas: [
      { metric: "Emergency Response", target: "2 hrs", actual: "3.5 hrs", status: "Breached" },
      { metric: "Routine Request Completion", target: "3 days", actual: "3 days", status: "Met" },
    ],
    riskAssessment: {
      "Information Security": { rating: "Low", note: "No system access required for this service." },
      "Data Privacy": { rating: "Low", note: "No data processed." },
      "Regulatory Compliance": { rating: "High", note: "Governing contract unsigned — service is technically uncovered." },
      "Conflict of Interest": { rating: null, note: null },
      "AI / Automated Decisioning": { rating: null, note: null },
      "System Access & Identity": { rating: "Medium", note: "Vendor staff carry building access badges — review overdue." },
      "Business Continuity": { rating: "Medium", note: "No documented backup vendor for emergency repairs." },
      "Financial Stability": { rating: "High", note: "Vendor is flagged Under Review by the supplier risk team." },
      "Fourth-Party / Subcontractor": { rating: "Medium", note: "Uses independent contractors for HVAC work." },
      "Reputational": { rating: "Low", note: "No issues on record." },
    },
  },
  {
    id: "SV-05", name: "Raw Material Supply Coordination", supplier: "Meridian Steel Co.", contract: "Meridian Steel — Supply Schedule",
    category: "Raw Materials", criticality: "Medium", governance: "Governed", riskScore: null, sla: 96, lastReview: "Jul 15",
    documents: [], notes: [], owner: "Sam Okafor",
    contacts: [
      { name: "Sam Okafor", role: "Business Owner", org: "Paradigm" },
      { name: "Tom Brannigan", role: "VP Sales", org: "Meridian Steel Co." },
    ],
    complianceDocs: [
      { name: "ASTM Quality Certification", status: "On File", date: "Jul 2025", expires: "Jul 2027" },
      { name: "Certificate of Insurance", status: "On File", date: "Oct 2025", expires: "Oct 2026" },
    ],
    slas: [
      { metric: "On-Time Delivery", target: "98%", actual: "98.4%", status: "Met" },
      { metric: "Quality Reject Rate", target: "< 1%", actual: "0.4%", status: "Met" },
    ],
    riskAssessment: {
      "Information Security": { rating: null, note: null },
      "Data Privacy": { rating: null, note: null },
      "Regulatory Compliance": { rating: "Low", note: "ASTM quality certifications current." },
      "Conflict of Interest": { rating: "Low", note: "None identified." },
      "AI / Automated Decisioning": { rating: null, note: null },
      "System Access & Identity": { rating: null, note: null },
      "Business Continuity": { rating: "Medium", note: "Single-source for two specialty alloys." },
      "Financial Stability": { rating: "Low", note: "Stable, investment-grade rated." },
      "Fourth-Party / Subcontractor": { rating: "Low", note: "Vertically integrated — minimal subcontracting." },
      "Reputational": { rating: "Low", note: "No issues on record." },
    },
  },
  {
    id: "SV-06", name: "Brand Creative Production", supplier: "Orbital Marketing Partners", contract: null,
    category: "Marketing", criticality: "Critical", governance: "Uncontracted", riskScore: 74, sla: null, lastReview: "Never",
    documents: [], notes: [], owner: "Priya Shah",
    gap: "No executed contract on file — service is being delivered without contractual coverage",
    contacts: [
      { name: "Marcus Webb", role: "Business Owner", org: "Paradigm" },
      { name: "Unassigned", role: "Vendor Representative", org: "Orbital Marketing Partners" },
    ],
    complianceDocs: [
      { name: "Master Services Agreement", status: "Missing", date: null, expires: null },
      { name: "Certificate of Insurance", status: "Requested", date: null, expires: null },
    ],
    slas: [
      { metric: "Campaign Delivery Timeliness", target: "95%", actual: "—", status: "Not tracked" },
    ],
    riskAssessment: {
      "Information Security": { rating: "High", note: "No security review possible without an executed contract." },
      "Data Privacy": { rating: "High", note: "Unclear data handling terms — no DPA on file." },
      "Regulatory Compliance": { rating: "High", note: "No governing contract at all." },
      "Conflict of Interest": { rating: "Medium", note: "Agency also represents a competitor brand — under review." },
      "AI / Automated Decisioning": { rating: "Medium", note: "Vendor uses generative AI tools for concepting; usage rights unclear." },
      "System Access & Identity": { rating: "Low", note: "No system access granted." },
      "Business Continuity": { rating: "Medium", note: "Small agency — key-person dependency." },
      "Financial Stability": { rating: null, note: null },
      "Fourth-Party / Subcontractor": { rating: null, note: null },
      "Reputational": { rating: "Medium", note: "Agency's other client relationships not yet vetted." },
    },
  },
  {
      "id": "SV-07",
      "name": "Network Security Monitoring — Junction",
      "supplier": "Junction Dynamics",
      "contract": "Junction Dynamics — Supply Schedule #1043",
      "category": "IT & Software",
      "criticality": "High",
      "governance": "Governed",
      "riskScore": 75,
      "sla": 95,
      "lastReview": "Not yet reviewed",
    documents: [], notes: [], "owner": "Elena Ruiz",
      "gap": null,
      "contacts": [
        {
          "name": "Riley Mercer",
          "role": "Business Owner",
          "org": "Paradigm"
        },
        {
          "name": "Unassigned",
          "role": "Vendor Representative",
          "org": "Junction Dynamics"
        }
      ],
      "complianceDocs": [
        {
          "name": "Certificate of Insurance",
          "status": "Expired",
          "date": "Jan 2026",
          "expires": "Jan 2027"
        }
      ],
      "slas": [
        {
          "metric": "Service Level Compliance",
          "target": "95%",
          "actual": "93%",
          "status": "At Risk"
        }
      ],
      "riskAssessment": {
        "Information Security": {
          "rating": "Low",
          "note": "Low risk based on latest vendor assessment cycle."
        },
        "Data Privacy": {
          "rating": "High",
          "note": "High risk based on latest vendor assessment cycle."
        },
        "AI / Automated Decisioning": {
          "rating": "Low",
          "note": "Low risk based on latest vendor assessment cycle."
        },
        "Fourth-Party / Subcontractor": {
          "rating": "Low",
          "note": "Low risk based on latest vendor assessment cycle."
        }
      }
    },
  {
      "id": "SV-08",
      "name": "Freight Transportation — Glacier",
      "supplier": "Glacier Technologies",
      "contract": "Glacier Technologies — Supply Schedule #1049",
      "category": "Logistics",
      "criticality": "Medium",
      "governance": "Governed",
      "riskScore": null,
      "sla": null,
      "lastReview": "Not yet reviewed",
    documents: [], notes: [], "owner": "Dana Kim",
      "gap": null,
      "contacts": [
        {
          "name": "Quinn Pierce",
          "role": "Business Owner",
          "org": "Paradigm"
        },
        {
          "name": "Unassigned",
          "role": "Vendor Representative",
          "org": "Glacier Technologies"
        }
      ],
      "complianceDocs": [
        {
          "name": "Certificate of Insurance",
          "status": "Expired",
          "date": "Jan 2026",
          "expires": "Jan 2027"
        }
      ],
      "slas": [
        {
          "metric": "Service Level Compliance",
          "target": "95%",
          "actual": "96%",
          "status": "Met"
        }
      ],
      "riskAssessment": {
        "Information Security": {
          "rating": "Low",
          "note": "Low risk based on latest vendor assessment cycle."
        },
        "Fourth-Party / Subcontractor": {
          "rating": "Medium",
          "note": "Medium risk based on latest vendor assessment cycle."
        },
        "Conflict of Interest": {
          "rating": "Low",
          "note": "Low risk based on latest vendor assessment cycle."
        },
        "Regulatory Compliance": {
          "rating": "Low",
          "note": "Low risk based on latest vendor assessment cycle."
        },
        "Financial Stability": {
          "rating": "Medium",
          "note": "Medium risk based on latest vendor assessment cycle."
        }
      }
    },
  {
      "id": "SV-09",
      "name": "Last-Mile Delivery — Silverline",
      "supplier": "Silverline Ventures",
      "contract": "Silverline Ventures — Supply Schedule #1036",
      "category": "Logistics",
      "criticality": "High",
      "governance": "Governed",
      "riskScore": 34,
      "sla": 90,
      "lastReview": "Not yet reviewed",
    documents: [], notes: [], "owner": "Marcus Webb",
      "gap": null,
      "contacts": [
        {
          "name": "Jamie Nolan",
          "role": "Business Owner",
          "org": "Paradigm"
        },
        {
          "name": "Unassigned",
          "role": "Vendor Representative",
          "org": "Silverline Ventures"
        }
      ],
      "complianceDocs": [
        {
          "name": "Certificate of Insurance",
          "status": "Expired",
          "date": "Jan 2026",
          "expires": "Jan 2027"
        }
      ],
      "slas": [
        {
          "metric": "Service Level Compliance",
          "target": "95%",
          "actual": "94%",
          "status": "Met"
        }
      ],
      "riskAssessment": {
        "Reputational": {
          "rating": "Low",
          "note": "Low risk based on latest vendor assessment cycle."
        },
        "AI / Automated Decisioning": {
          "rating": "Low",
          "note": "Low risk based on latest vendor assessment cycle."
        },
        "Business Continuity": {
          "rating": "Low",
          "note": "Low risk based on latest vendor assessment cycle."
        }
      }
    },
  {
      "id": "SV-10",
      "name": "Building Maintenance — Amber",
      "supplier": "Amber Analytics",
      "contract": "Amber Analytics — Addendum #1012",
      "category": "Facilities",
      "criticality": "Medium",
      "governance": "Governed",
      "riskScore": 31,
      "sla": 87,
      "lastReview": "Not yet reviewed",
    documents: [], notes: [], "owner": "Sam Okafor",
      "gap": null,
      "contacts": [
        {
          "name": "Reese Ortega",
          "role": "Business Owner",
          "org": "Paradigm"
        },
        {
          "name": "Unassigned",
          "role": "Vendor Representative",
          "org": "Amber Analytics"
        }
      ],
      "complianceDocs": [
        {
          "name": "Certificate of Insurance",
          "status": "On File",
          "date": "Jan 2026",
          "expires": "Jan 2027"
        }
      ],
      "slas": [
        {
          "metric": "Service Level Compliance",
          "target": "95%",
          "actual": "94%",
          "status": "Met"
        }
      ],
      "riskAssessment": {
        "Data Privacy": {
          "rating": "Medium",
          "note": "Medium risk based on latest vendor assessment cycle."
        },
        "Conflict of Interest": {
          "rating": "Low",
          "note": "Low risk based on latest vendor assessment cycle."
        },
        "AI / Automated Decisioning": {
          "rating": "Low",
          "note": "Low risk based on latest vendor assessment cycle."
        },
        "Reputational": {
          "rating": "High",
          "note": "High risk based on latest vendor assessment cycle."
        }
      }
    },
  {
      "id": "SV-11",
      "name": "Data Analytics Platform — Vantage",
      "supplier": "Vantage Cloud Systems",
      "contract": "Vantage Cloud Systems — Service Order #1040",
      "category": "IT & Software",
      "criticality": "Medium",
      "governance": "Governed",
      "riskScore": 28,
      "sla": 78,
      "lastReview": "Not yet reviewed",
    documents: [], notes: [], "owner": "Priya Shah",
      "gap": null,
      "contacts": [
        {
          "name": "Sam Irwin",
          "role": "Business Owner",
          "org": "Paradigm"
        },
        {
          "name": "Unassigned",
          "role": "Vendor Representative",
          "org": "Vantage Cloud Systems"
        }
      ],
      "complianceDocs": [
        {
          "name": "Certificate of Insurance",
          "status": "On File",
          "date": "Jan 2026",
          "expires": "Jan 2027"
        }
      ],
      "slas": [
        {
          "metric": "Service Level Compliance",
          "target": "95%",
          "actual": "97%",
          "status": "Met"
        }
      ],
      "riskAssessment": {
        "Business Continuity": {
          "rating": "Low",
          "note": "Low risk based on latest vendor assessment cycle."
        },
        "Conflict of Interest": {
          "rating": "High",
          "note": "High risk based on latest vendor assessment cycle."
        }
      }
    },
  {
      "id": "SV-12",
      "name": "Security Staffing — Coastal",
      "supplier": "Coastal Labs",
      "contract": "Coastal Labs — Rate Schedule #1025",
      "category": "Facilities",
      "criticality": "Medium",
      "governance": "Governed",
      "riskScore": 50,
      "sla": 92,
      "lastReview": "Not yet reviewed",
    documents: [], notes: [], "owner": "Elena Ruiz",
      "gap": null,
      "contacts": [
        {
          "name": "Drew Lowell",
          "role": "Business Owner",
          "org": "Paradigm"
        },
        {
          "name": "Unassigned",
          "role": "Vendor Representative",
          "org": "Coastal Labs"
        }
      ],
      "complianceDocs": [
        {
          "name": "Certificate of Insurance",
          "status": "On File",
          "date": "Jan 2026",
          "expires": "Jan 2027"
        }
      ],
      "slas": [
        {
          "metric": "Service Level Compliance",
          "target": "95%",
          "actual": "88%",
          "status": "Met"
        }
      ],
      "riskAssessment": {
        "Fourth-Party / Subcontractor": {
          "rating": "Low",
          "note": "Low risk based on latest vendor assessment cycle."
        },
        "Financial Stability": {
          "rating": "Medium",
          "note": "Medium risk based on latest vendor assessment cycle."
        },
        "Regulatory Compliance": {
          "rating": "Medium",
          "note": "Medium risk based on latest vendor assessment cycle."
        },
        "System Access & Identity": {
          "rating": "Low",
          "note": "Low risk based on latest vendor assessment cycle."
        },
        "Conflict of Interest": {
          "rating": "Medium",
          "note": "Medium risk based on latest vendor assessment cycle."
        }
      }
    },
  {
      "id": "SV-13",
      "name": "Audit Services — Nimbus",
      "supplier": "Nimbus Consulting",
      "contract": "Nimbus Consulting — Service Order #1029",
      "category": "Professional Services",
      "criticality": "High",
      "governance": "Governed",
      "riskScore": null,
      "sla": 95,
      "lastReview": "Not yet reviewed",
    documents: [], notes: [], "owner": "Dana Kim",
      "gap": null,
      "contacts": [
        {
          "name": "Quinn Ellis",
          "role": "Business Owner",
          "org": "Paradigm"
        },
        {
          "name": "Unassigned",
          "role": "Vendor Representative",
          "org": "Nimbus Consulting"
        }
      ],
      "complianceDocs": [
        {
          "name": "Certificate of Insurance",
          "status": "On File",
          "date": "Jan 2026",
          "expires": "Jan 2027"
        }
      ],
      "slas": [
        {
          "metric": "Service Level Compliance",
          "target": "95%",
          "actual": "93%",
          "status": "Met"
        }
      ],
      "riskAssessment": {
        "Regulatory Compliance": {
          "rating": "Low",
          "note": "Low risk based on latest vendor assessment cycle."
        },
        "Reputational": {
          "rating": "Medium",
          "note": "Medium risk based on latest vendor assessment cycle."
        }
      }
    },
  {
      "id": "SV-14",
      "name": "Cybersecurity Monitoring — Junction",
      "supplier": "Junction Dynamics",
      "contract": "Junction Dynamics — Service Order #1014",
      "category": "IT & Software",
      "criticality": "Critical",
      "governance": "Governed",
      "riskScore": null,
      "sla": 96,
      "lastReview": "Not yet reviewed",
    documents: [], notes: [], "owner": "Marcus Webb",
      "gap": null,
      "contacts": [
        {
          "name": "Casey Nolan",
          "role": "Business Owner",
          "org": "Paradigm"
        },
        {
          "name": "Unassigned",
          "role": "Vendor Representative",
          "org": "Junction Dynamics"
        }
      ],
      "complianceDocs": [
        {
          "name": "Certificate of Insurance",
          "status": "Missing",
          "date": "Jan 2026",
          "expires": "Jan 2027"
        }
      ],
      "slas": [
        {
          "metric": "Service Level Compliance",
          "target": "95%",
          "actual": "93%",
          "status": "At Risk"
        }
      ],
      "riskAssessment": {
        "Reputational": {
          "rating": "Low",
          "note": "Low risk based on latest vendor assessment cycle."
        },
        "Business Continuity": {
          "rating": "High",
          "note": "High risk based on latest vendor assessment cycle."
        }
      }
    },
  {
      "id": "SV-15",
      "name": "Metal Fabrication — Meridian",
      "supplier": "Meridian Steel Co.",
      "contract": null,
      "category": "Raw Materials",
      "criticality": "High",
      "governance": "Uncontracted",
      "riskScore": 44,
      "sla": 78,
      "lastReview": "Not yet reviewed",
    documents: [], notes: [], "owner": "Sam Okafor",
      "gap": "No executed contract on file — service is being delivered without contractual coverage",
      "contacts": [
        {
          "name": "Avery Bennett",
          "role": "Business Owner",
          "org": "Paradigm"
        },
        {
          "name": "Unassigned",
          "role": "Vendor Representative",
          "org": "Meridian Steel Co."
        }
      ],
      "complianceDocs": [
        {
          "name": "Certificate of Insurance",
          "status": "On File",
          "date": "Jan 2026",
          "expires": "Jan 2027"
        }
      ],
      "slas": [
        {
          "metric": "Service Level Compliance",
          "target": "95%",
          "actual": "93%",
          "status": "Met"
        }
      ],
      "riskAssessment": {
        "System Access & Identity": {
          "rating": "High",
          "note": "High risk based on latest vendor assessment cycle."
        },
        "Business Continuity": {
          "rating": "High",
          "note": "High risk based on latest vendor assessment cycle."
        },
        "Regulatory Compliance": {
          "rating": "Low",
          "note": "Low risk based on latest vendor assessment cycle."
        },
        "Fourth-Party / Subcontractor": {
          "rating": "High",
          "note": "High risk based on latest vendor assessment cycle."
        },
        "Conflict of Interest": {
          "rating": "Low",
          "note": "Low risk based on latest vendor assessment cycle."
        }
      }
    },
  {
      "id": "SV-16",
      "name": "HVAC Maintenance — Amber",
      "supplier": "Amber Group",
      "contract": "Amber Group — Service Order #1017",
      "category": "Facilities",
      "criticality": "High",
      "governance": "Governed",
      "riskScore": 37,
      "sla": 88,
      "lastReview": "Not yet reviewed",
    documents: [], notes: [], "owner": "Priya Shah",
      "gap": null,
      "contacts": [
        {
          "name": "Jordan Nolan",
          "role": "Business Owner",
          "org": "Paradigm"
        },
        {
          "name": "Unassigned",
          "role": "Vendor Representative",
          "org": "Amber Group"
        }
      ],
      "complianceDocs": [
        {
          "name": "Certificate of Insurance",
          "status": "On File",
          "date": "Jan 2026",
          "expires": "Jan 2027"
        }
      ],
      "slas": [
        {
          "metric": "Service Level Compliance",
          "target": "95%",
          "actual": "80%",
          "status": "Met"
        }
      ],
      "riskAssessment": {
        "AI / Automated Decisioning": {
          "rating": "Low",
          "note": "Low risk based on latest vendor assessment cycle."
        },
        "Business Continuity": {
          "rating": "Medium",
          "note": "Medium risk based on latest vendor assessment cycle."
        },
        "Reputational": {
          "rating": "Low",
          "note": "Low risk based on latest vendor assessment cycle."
        },
        "Fourth-Party / Subcontractor": {
          "rating": "High",
          "note": "High risk based on latest vendor assessment cycle."
        },
        "Information Security": {
          "rating": "Low",
          "note": "Low risk based on latest vendor assessment cycle."
        }
      }
    },
  {
      "id": "SV-17",
      "name": "Inventory Management — Cascade",
      "supplier": "Cascade Partners",
      "contract": "Cascade Partners — Supply Schedule #1020",
      "category": "Logistics",
      "criticality": "Medium",
      "governance": "Governed",
      "riskScore": null,
      "sla": null,
      "lastReview": "Not yet reviewed",
    documents: [], notes: [], "owner": "Elena Ruiz",
      "gap": null,
      "contacts": [
        {
          "name": "Riley Diaz",
          "role": "Business Owner",
          "org": "Paradigm"
        },
        {
          "name": "Unassigned",
          "role": "Vendor Representative",
          "org": "Cascade Partners"
        }
      ],
      "complianceDocs": [
        {
          "name": "Certificate of Insurance",
          "status": "On File",
          "date": "Jan 2026",
          "expires": "Jan 2027"
        }
      ],
      "slas": [
        {
          "metric": "Service Level Compliance",
          "target": "95%",
          "actual": "85%",
          "status": "Met"
        }
      ],
      "riskAssessment": {
        "Reputational": {
          "rating": "Low",
          "note": "Low risk based on latest vendor assessment cycle."
        },
        "Conflict of Interest": {
          "rating": "Low",
          "note": "Low risk based on latest vendor assessment cycle."
        }
      }
    },
  {
      "id": "SV-18",
      "name": "Event Management — Anchor",
      "supplier": "Anchor Analytics",
      "contract": "Anchor Analytics — Rate Schedule #1011",
      "category": "Marketing",
      "criticality": "High",
      "governance": "Governed",
      "riskScore": 58,
      "sla": 84,
      "lastReview": "Not yet reviewed",
    documents: [], notes: [], "owner": "Dana Kim",
      "gap": null,
      "contacts": [
        {
          "name": "Skyler Lowell",
          "role": "Business Owner",
          "org": "Paradigm"
        },
        {
          "name": "Unassigned",
          "role": "Vendor Representative",
          "org": "Anchor Analytics"
        }
      ],
      "complianceDocs": [
        {
          "name": "Certificate of Insurance",
          "status": "On File",
          "date": "Jan 2026",
          "expires": "Jan 2027"
        }
      ],
      "slas": [
        {
          "metric": "Service Level Compliance",
          "target": "95%",
          "actual": "98%",
          "status": "Met"
        }
      ],
      "riskAssessment": {
        "Reputational": {
          "rating": "Low",
          "note": "Low risk based on latest vendor assessment cycle."
        },
        "Conflict of Interest": {
          "rating": "Medium",
          "note": "Medium risk based on latest vendor assessment cycle."
        }
      }
    },
  {
      "id": "SV-19",
      "name": "Fleet Maintenance — Beacon",
      "supplier": "Beacon Media",
      "contract": "Beacon Media — Supply Schedule #1048",
      "category": "Logistics",
      "criticality": "High",
      "governance": "Governed",
      "riskScore": null,
      "sla": 78,
      "lastReview": "Not yet reviewed",
    documents: [], notes: [], "owner": "Marcus Webb",
      "gap": null,
      "contacts": [
        {
          "name": "Avery Foster",
          "role": "Business Owner",
          "org": "Paradigm"
        },
        {
          "name": "Unassigned",
          "role": "Vendor Representative",
          "org": "Beacon Media"
        }
      ],
      "complianceDocs": [
        {
          "name": "Certificate of Insurance",
          "status": "Missing",
          "date": "Jan 2026",
          "expires": "Jan 2027"
        }
      ],
      "slas": [
        {
          "metric": "Service Level Compliance",
          "target": "95%",
          "actual": "94%",
          "status": "Met"
        }
      ],
      "riskAssessment": {
        "Financial Stability": {
          "rating": "Medium",
          "note": "Medium risk based on latest vendor assessment cycle."
        },
        "Data Privacy": {
          "rating": "Low",
          "note": "Low risk based on latest vendor assessment cycle."
        },
        "Business Continuity": {
          "rating": "Low",
          "note": "Low risk based on latest vendor assessment cycle."
        },
        "Regulatory Compliance": {
          "rating": "Low",
          "note": "Low risk based on latest vendor assessment cycle."
        },
        "System Access & Identity": {
          "rating": "Low",
          "note": "Low risk based on latest vendor assessment cycle."
        }
      }
    },
  {
      "id": "SV-20",
      "name": "Landscaping Services — Halcyon",
      "supplier": "Halcyon Facilities Group",
      "contract": "Halcyon Facilities Group — Supply Schedule #1037",
      "category": "Facilities",
      "criticality": "High",
      "governance": "Governed",
      "riskScore": 21,
      "sla": 92,
      "lastReview": "Not yet reviewed",
    documents: [], notes: [], "owner": "Sam Okafor",
      "gap": null,
      "contacts": [
        {
          "name": "Morgan Grant",
          "role": "Business Owner",
          "org": "Paradigm"
        },
        {
          "name": "Unassigned",
          "role": "Vendor Representative",
          "org": "Halcyon Facilities Group"
        }
      ],
      "complianceDocs": [
        {
          "name": "Certificate of Insurance",
          "status": "Expired",
          "date": "Jan 2026",
          "expires": "Jan 2027"
        }
      ],
      "slas": [
        {
          "metric": "Service Level Compliance",
          "target": "95%",
          "actual": "90%",
          "status": "Met"
        }
      ],
      "riskAssessment": {
        "Financial Stability": {
          "rating": "Low",
          "note": "Low risk based on latest vendor assessment cycle."
        },
        "Business Continuity": {
          "rating": "Medium",
          "note": "Medium risk based on latest vendor assessment cycle."
        },
        "System Access & Identity": {
          "rating": "Low",
          "note": "Low risk based on latest vendor assessment cycle."
        }
      }
    },
  {
      "id": "SV-21",
      "name": "Digital Advertising — Orbital",
      "supplier": "Orbital Marketing Partners",
      "contract": "Orbital Marketing Partners — Supply Schedule #1027",
      "category": "Marketing",
      "criticality": "Medium",
      "governance": "Governed",
      "riskScore": null,
      "sla": 80,
      "lastReview": "Not yet reviewed",
    documents: [], notes: [], "owner": "Priya Shah",
      "gap": null,
      "contacts": [
        {
          "name": "Rowan Bennett",
          "role": "Business Owner",
          "org": "Paradigm"
        },
        {
          "name": "Unassigned",
          "role": "Vendor Representative",
          "org": "Orbital Marketing Partners"
        }
      ],
      "complianceDocs": [
        {
          "name": "Certificate of Insurance",
          "status": "On File",
          "date": "Jan 2026",
          "expires": "Jan 2027"
        }
      ],
      "slas": [
        {
          "metric": "Service Level Compliance",
          "target": "95%",
          "actual": "89%",
          "status": "Met"
        }
      ],
      "riskAssessment": {
        "Business Continuity": {
          "rating": "Medium",
          "note": "Medium risk based on latest vendor assessment cycle."
        },
        "Financial Stability": {
          "rating": "Medium",
          "note": "Medium risk based on latest vendor assessment cycle."
        },
        "Conflict of Interest": {
          "rating": "Low",
          "note": "Low risk based on latest vendor assessment cycle."
        }
      }
    },
  {
      "id": "SV-22",
      "name": "Industrial Adhesives — Westfield",
      "supplier": "Westfield Media",
      "contract": "Westfield Media — Rate Schedule #1026",
      "category": "Raw Materials",
      "criticality": "High",
      "governance": "Governed",
      "riskScore": 57,
      "sla": 94,
      "lastReview": "Not yet reviewed",
    documents: [], notes: [], "owner": "Elena Ruiz",
      "gap": null,
      "contacts": [
        {
          "name": "Morgan Grant",
          "role": "Business Owner",
          "org": "Paradigm"
        },
        {
          "name": "Unassigned",
          "role": "Vendor Representative",
          "org": "Westfield Media"
        }
      ],
      "complianceDocs": [
        {
          "name": "Certificate of Insurance",
          "status": "On File",
          "date": "Jan 2026",
          "expires": "Jan 2027"
        }
      ],
      "slas": [
        {
          "metric": "Service Level Compliance",
          "target": "95%",
          "actual": "97%",
          "status": "At Risk"
        }
      ],
      "riskAssessment": {
        "Business Continuity": {
          "rating": "Medium",
          "note": "Medium risk based on latest vendor assessment cycle."
        },
        "Fourth-Party / Subcontractor": {
          "rating": "Low",
          "note": "Low risk based on latest vendor assessment cycle."
        },
        "System Access & Identity": {
          "rating": "Low",
          "note": "Low risk based on latest vendor assessment cycle."
        },
        "Regulatory Compliance": {
          "rating": "Low",
          "note": "Low risk based on latest vendor assessment cycle."
        }
      }
    },
  {
      "id": "SV-23",
      "name": "HVAC Maintenance — Maplewood",
      "supplier": "Maplewood Robotics",
      "contract": "Maplewood Robotics — Addendum #1023",
      "category": "Facilities",
      "criticality": "Medium",
      "governance": "Governed",
      "riskScore": null,
      "sla": 94,
      "lastReview": "Not yet reviewed",
    documents: [], notes: [], "owner": "Dana Kim",
      "gap": null,
      "contacts": [
        {
          "name": "Alex Bennett",
          "role": "Business Owner",
          "org": "Paradigm"
        },
        {
          "name": "Unassigned",
          "role": "Vendor Representative",
          "org": "Maplewood Robotics"
        }
      ],
      "complianceDocs": [
        {
          "name": "Certificate of Insurance",
          "status": "Expired",
          "date": "Jan 2026",
          "expires": "Jan 2027"
        }
      ],
      "slas": [
        {
          "metric": "Service Level Compliance",
          "target": "95%",
          "actual": "84%",
          "status": "At Risk"
        }
      ],
      "riskAssessment": {
        "Data Privacy": {
          "rating": "Low",
          "note": "Low risk based on latest vendor assessment cycle."
        },
        "Conflict of Interest": {
          "rating": "Low",
          "note": "Low risk based on latest vendor assessment cycle."
        },
        "AI / Automated Decisioning": {
          "rating": "Medium",
          "note": "Medium risk based on latest vendor assessment cycle."
        },
        "Reputational": {
          "rating": "Low",
          "note": "Low risk based on latest vendor assessment cycle."
        }
      }
    },
  {
      "id": "SV-24",
      "name": "Application Support — Prairie",
      "supplier": "Prairie Dynamics",
      "contract": "Prairie Dynamics — Addendum #1030",
      "category": "IT & Software",
      "criticality": "Medium",
      "governance": "Governed",
      "riskScore": null,
      "sla": 88,
      "lastReview": "Not yet reviewed",
    documents: [], notes: [], "owner": "Marcus Webb",
      "gap": null,
      "contacts": [
        {
          "name": "Reese Lowell",
          "role": "Business Owner",
          "org": "Paradigm"
        },
        {
          "name": "Unassigned",
          "role": "Vendor Representative",
          "org": "Prairie Dynamics"
        }
      ],
      "complianceDocs": [
        {
          "name": "Certificate of Insurance",
          "status": "On File",
          "date": "Jan 2026",
          "expires": "Jan 2027"
        }
      ],
      "slas": [
        {
          "metric": "Service Level Compliance",
          "target": "95%",
          "actual": "84%",
          "status": "Met"
        }
      ],
      "riskAssessment": {
        "Information Security": {
          "rating": "Low",
          "note": "Low risk based on latest vendor assessment cycle."
        },
        "AI / Automated Decisioning": {
          "rating": "Low",
          "note": "Low risk based on latest vendor assessment cycle."
        },
        "Financial Stability": {
          "rating": "Low",
          "note": "Low risk based on latest vendor assessment cycle."
        }
      }
    },
  {
      "id": "SV-25",
      "name": "Network Security Monitoring — Vantage",
      "supplier": "Vantage Cloud Systems",
      "contract": "Vantage Cloud Systems — Service Order #1050",
      "category": "IT & Software",
      "criticality": "High",
      "governance": "Governed",
      "riskScore": null,
      "sla": 97,
      "lastReview": "Not yet reviewed",
    documents: [], notes: [], "owner": "Sam Okafor",
      "gap": null,
      "contacts": [
        {
          "name": "Jamie Foster",
          "role": "Business Owner",
          "org": "Paradigm"
        },
        {
          "name": "Unassigned",
          "role": "Vendor Representative",
          "org": "Vantage Cloud Systems"
        }
      ],
      "complianceDocs": [
        {
          "name": "Certificate of Insurance",
          "status": "On File",
          "date": "Jan 2026",
          "expires": "Jan 2027"
        }
      ],
      "slas": [
        {
          "metric": "Service Level Compliance",
          "target": "95%",
          "actual": "99%",
          "status": "At Risk"
        }
      ],
      "riskAssessment": {
        "Fourth-Party / Subcontractor": {
          "rating": "High",
          "note": "High risk based on latest vendor assessment cycle."
        },
        "Business Continuity": {
          "rating": "Low",
          "note": "Low risk based on latest vendor assessment cycle."
        },
        "Financial Stability": {
          "rating": "Low",
          "note": "Low risk based on latest vendor assessment cycle."
        }
      }
    },
  {
      "id": "SV-26",
      "name": "Market Research — Anchor",
      "supplier": "Anchor Analytics",
      "contract": "Anchor Analytics — Rate Schedule #1039",
      "category": "Marketing",
      "criticality": "High",
      "governance": "Governed",
      "riskScore": null,
      "sla": null,
      "lastReview": "Not yet reviewed",
    documents: [], notes: [], "owner": "Priya Shah",
      "gap": null,
      "contacts": [
        {
          "name": "Drew Foster",
          "role": "Business Owner",
          "org": "Paradigm"
        },
        {
          "name": "Unassigned",
          "role": "Vendor Representative",
          "org": "Anchor Analytics"
        }
      ],
      "complianceDocs": [
        {
          "name": "Certificate of Insurance",
          "status": "On File",
          "date": "Jan 2026",
          "expires": "Jan 2027"
        }
      ],
      "slas": [
        {
          "metric": "Service Level Compliance",
          "target": "95%",
          "actual": "87%",
          "status": "Met"
        }
      ],
      "riskAssessment": {
        "Regulatory Compliance": {
          "rating": "Low",
          "note": "Low risk based on latest vendor assessment cycle."
        },
        "Fourth-Party / Subcontractor": {
          "rating": "Low",
          "note": "Low risk based on latest vendor assessment cycle."
        },
        "Data Privacy": {
          "rating": "Medium",
          "note": "Medium risk based on latest vendor assessment cycle."
        }
      }
    },
  {
      "id": "SV-27",
      "name": "Industrial Adhesives — Frontier",
      "supplier": "Frontier Holdings",
      "contract": "Frontier Holdings — Supply Schedule #1046",
      "category": "Raw Materials",
      "criticality": "Critical",
      "governance": "Gap identified",
      "riskScore": 43,
      "sla": 98,
      "lastReview": "Not yet reviewed",
    documents: [], notes: [], "owner": "Elena Ruiz",
      "gap": "Annual compliance report overdue",
      "contacts": [
        {
          "name": "Alex Diaz",
          "role": "Business Owner",
          "org": "Paradigm"
        },
        {
          "name": "Unassigned",
          "role": "Vendor Representative",
          "org": "Frontier Holdings"
        }
      ],
      "complianceDocs": [
        {
          "name": "Certificate of Insurance",
          "status": "Expired",
          "date": "Jan 2026",
          "expires": "Jan 2027"
        }
      ],
      "slas": [
        {
          "metric": "Service Level Compliance",
          "target": "95%",
          "actual": "99%",
          "status": "At Risk"
        }
      ],
      "riskAssessment": {
        "Business Continuity": {
          "rating": "Medium",
          "note": "Medium risk based on latest vendor assessment cycle."
        },
        "Data Privacy": {
          "rating": "High",
          "note": "High risk based on latest vendor assessment cycle."
        },
        "Conflict of Interest": {
          "rating": "Medium",
          "note": "Medium risk based on latest vendor assessment cycle."
        }
      }
    },
  {
      "id": "SV-28",
      "name": "Network Security Monitoring — Vantage (2)",
      "supplier": "Vantage Cloud Systems",
      "contract": "Vantage Cloud Systems — Service Order #1033",
      "category": "IT & Software",
      "criticality": "Critical",
      "governance": "Gap identified",
      "riskScore": 48,
      "sla": 86,
      "lastReview": "Not yet reviewed",
    documents: [], notes: [], "owner": "Dana Kim",
      "gap": "Vendor security questionnaire not yet returned",
      "contacts": [
        {
          "name": "Reese Bennett",
          "role": "Business Owner",
          "org": "Paradigm"
        },
        {
          "name": "Unassigned",
          "role": "Vendor Representative",
          "org": "Vantage Cloud Systems"
        }
      ],
      "complianceDocs": [
        {
          "name": "Certificate of Insurance",
          "status": "Expired",
          "date": "Jan 2026",
          "expires": "Jan 2027"
        }
      ],
      "slas": [
        {
          "metric": "Service Level Compliance",
          "target": "95%",
          "actual": "98%",
          "status": "Met"
        }
      ],
      "riskAssessment": {
        "Financial Stability": {
          "rating": "Low",
          "note": "Low risk based on latest vendor assessment cycle."
        },
        "Data Privacy": {
          "rating": "Low",
          "note": "Low risk based on latest vendor assessment cycle."
        },
        "Information Security": {
          "rating": "Low",
          "note": "Low risk based on latest vendor assessment cycle."
        },
        "Conflict of Interest": {
          "rating": "High",
          "note": "High risk based on latest vendor assessment cycle."
        },
        "System Access & Identity": {
          "rating": "Medium",
          "note": "Medium risk based on latest vendor assessment cycle."
        }
      }
    },
  {
      "id": "SV-29",
      "name": "Security Staffing — Maplewood",
      "supplier": "Maplewood Robotics",
      "contract": "Maplewood Robotics — Supply Schedule #1045",
      "category": "Facilities",
      "criticality": "Medium",
      "governance": "Gap identified",
      "riskScore": 33,
      "sla": 91,
      "lastReview": "Not yet reviewed",
    documents: [], notes: [], "owner": "Marcus Webb",
      "gap": "Vendor security questionnaire not yet returned",
      "contacts": [
        {
          "name": "Jamie Ortega",
          "role": "Business Owner",
          "org": "Paradigm"
        },
        {
          "name": "Unassigned",
          "role": "Vendor Representative",
          "org": "Maplewood Robotics"
        }
      ],
      "complianceDocs": [
        {
          "name": "Certificate of Insurance",
          "status": "On File",
          "date": "Jan 2026",
          "expires": "Jan 2027"
        }
      ],
      "slas": [
        {
          "metric": "Service Level Compliance",
          "target": "95%",
          "actual": "94%",
          "status": "Met"
        }
      ],
      "riskAssessment": {
        "Data Privacy": {
          "rating": "Low",
          "note": "Low risk based on latest vendor assessment cycle."
        },
        "Financial Stability": {
          "rating": "Low",
          "note": "Low risk based on latest vendor assessment cycle."
        },
        "System Access & Identity": {
          "rating": "Low",
          "note": "Low risk based on latest vendor assessment cycle."
        },
        "Conflict of Interest": {
          "rating": "Low",
          "note": "Low risk based on latest vendor assessment cycle."
        },
        "Regulatory Compliance": {
          "rating": "Low",
          "note": "Low risk based on latest vendor assessment cycle."
        }
      }
    },
  {
      "id": "SV-30",
      "name": "Network Security Monitoring — Lakeshore",
      "supplier": "Lakeshore Labs",
      "contract": "Lakeshore Labs — Addendum #1044",
      "category": "IT & Software",
      "criticality": "Critical",
      "governance": "Governed",
      "riskScore": 61,
      "sla": 78,
      "lastReview": "Not yet reviewed",
    documents: [], notes: [], "owner": "Sam Okafor",
      "gap": null,
      "contacts": [
        {
          "name": "Taylor Pierce",
          "role": "Business Owner",
          "org": "Paradigm"
        },
        {
          "name": "Unassigned",
          "role": "Vendor Representative",
          "org": "Lakeshore Labs"
        }
      ],
      "complianceDocs": [
        {
          "name": "Certificate of Insurance",
          "status": "Expired",
          "date": "Jan 2026",
          "expires": "Jan 2027"
        }
      ],
      "slas": [
        {
          "metric": "Service Level Compliance",
          "target": "95%",
          "actual": "94%",
          "status": "At Risk"
        }
      ],
      "riskAssessment": {
        "Business Continuity": {
          "rating": "Medium",
          "note": "Medium risk based on latest vendor assessment cycle."
        },
        "Information Security": {
          "rating": "Low",
          "note": "Low risk based on latest vendor assessment cycle."
        },
        "Conflict of Interest": {
          "rating": "Low",
          "note": "Low risk based on latest vendor assessment cycle."
        },
        "AI / Automated Decisioning": {
          "rating": "Low",
          "note": "Low risk based on latest vendor assessment cycle."
        },
        "Regulatory Compliance": {
          "rating": "Low",
          "note": "Low risk based on latest vendor assessment cycle."
        }
      }
    },
  {
      "id": "SV-31",
      "name": "Application Support — Prairie (2)",
      "supplier": "Prairie Dynamics",
      "contract": "Prairie Dynamics — Supply Schedule #1034",
      "category": "IT & Software",
      "criticality": "Medium",
      "governance": "Governed",
      "riskScore": 30,
      "sla": 78,
      "lastReview": "Not yet reviewed",
    documents: [], notes: [], "owner": "Priya Shah",
      "gap": null,
      "contacts": [
        {
          "name": "Jamie Ortega",
          "role": "Business Owner",
          "org": "Paradigm"
        },
        {
          "name": "Unassigned",
          "role": "Vendor Representative",
          "org": "Prairie Dynamics"
        }
      ],
      "complianceDocs": [
        {
          "name": "Certificate of Insurance",
          "status": "Missing",
          "date": "Jan 2026",
          "expires": "Jan 2027"
        }
      ],
      "slas": [
        {
          "metric": "Service Level Compliance",
          "target": "95%",
          "actual": "95%",
          "status": "Met"
        }
      ],
      "riskAssessment": {
        "Data Privacy": {
          "rating": "Medium",
          "note": "Medium risk based on latest vendor assessment cycle."
        },
        "Conflict of Interest": {
          "rating": "Low",
          "note": "Low risk based on latest vendor assessment cycle."
        },
        "Reputational": {
          "rating": "High",
          "note": "High risk based on latest vendor assessment cycle."
        },
        "Fourth-Party / Subcontractor": {
          "rating": "Low",
          "note": "Low risk based on latest vendor assessment cycle."
        },
        "Information Security": {
          "rating": "Medium",
          "note": "Medium risk based on latest vendor assessment cycle."
        }
      }
    },
  {
      "id": "SV-32",
      "name": "Waste Management — Amber",
      "supplier": "Amber Group",
      "contract": "Amber Group — Addendum #1022",
      "category": "Facilities",
      "criticality": "Medium",
      "governance": "Governed",
      "riskScore": null,
      "sla": 82,
      "lastReview": "Not yet reviewed",
    documents: [], notes: [], "owner": "Elena Ruiz",
      "gap": null,
      "contacts": [
        {
          "name": "Casey Ortega",
          "role": "Business Owner",
          "org": "Paradigm"
        },
        {
          "name": "Unassigned",
          "role": "Vendor Representative",
          "org": "Amber Group"
        }
      ],
      "complianceDocs": [
        {
          "name": "Certificate of Insurance",
          "status": "On File",
          "date": "Jan 2026",
          "expires": "Jan 2027"
        }
      ],
      "slas": [
        {
          "metric": "Service Level Compliance",
          "target": "95%",
          "actual": "89%",
          "status": "At Risk"
        }
      ],
      "riskAssessment": {
        "AI / Automated Decisioning": {
          "rating": "Low",
          "note": "Low risk based on latest vendor assessment cycle."
        },
        "Business Continuity": {
          "rating": "Medium",
          "note": "Medium risk based on latest vendor assessment cycle."
        }
      }
    },
  {
      "id": "SV-33",
      "name": "Market Research — Harbor",
      "supplier": "Harbor Ventures",
      "contract": null,
      "category": "Marketing",
      "criticality": "Medium",
      "governance": "Uncontracted",
      "riskScore": 72,
      "sla": 92,
      "lastReview": "Not yet reviewed",
    documents: [], notes: [], "owner": "Dana Kim",
      "gap": "No executed contract on file — service is being delivered without contractual coverage",
      "contacts": [
        {
          "name": "Jamie Bennett",
          "role": "Business Owner",
          "org": "Paradigm"
        },
        {
          "name": "Unassigned",
          "role": "Vendor Representative",
          "org": "Harbor Ventures"
        }
      ],
      "complianceDocs": [
        {
          "name": "Certificate of Insurance",
          "status": "Expired",
          "date": "Jan 2026",
          "expires": "Jan 2027"
        }
      ],
      "slas": [
        {
          "metric": "Service Level Compliance",
          "target": "95%",
          "actual": "95%",
          "status": "At Risk"
        }
      ],
      "riskAssessment": {
        "System Access & Identity": {
          "rating": "Medium",
          "note": "Medium risk based on latest vendor assessment cycle."
        },
        "Reputational": {
          "rating": "High",
          "note": "High risk based on latest vendor assessment cycle."
        },
        "Business Continuity": {
          "rating": "Low",
          "note": "Low risk based on latest vendor assessment cycle."
        },
        "Conflict of Interest": {
          "rating": "Low",
          "note": "Low risk based on latest vendor assessment cycle."
        },
        "Regulatory Compliance": {
          "rating": "Medium",
          "note": "Medium risk based on latest vendor assessment cycle."
        }
      }
    },
  {
      "id": "SV-34",
      "name": "Customs Brokerage — Amber",
      "supplier": "Amber Industries",
      "contract": "Amber Industries — Service Order #1031",
      "category": "Logistics",
      "criticality": "Medium",
      "governance": "Governed",
      "riskScore": 26,
      "sla": 96,
      "lastReview": "Not yet reviewed",
    documents: [], notes: [], "owner": "Marcus Webb",
      "gap": null,
      "contacts": [
        {
          "name": "Taylor Carter",
          "role": "Business Owner",
          "org": "Paradigm"
        },
        {
          "name": "Unassigned",
          "role": "Vendor Representative",
          "org": "Amber Industries"
        }
      ],
      "complianceDocs": [
        {
          "name": "Certificate of Insurance",
          "status": "Missing",
          "date": "Jan 2026",
          "expires": "Jan 2027"
        }
      ],
      "slas": [
        {
          "metric": "Service Level Compliance",
          "target": "95%",
          "actual": "88%",
          "status": "Met"
        }
      ],
      "riskAssessment": {
        "Data Privacy": {
          "rating": "High",
          "note": "High risk based on latest vendor assessment cycle."
        },
        "Financial Stability": {
          "rating": "Low",
          "note": "Low risk based on latest vendor assessment cycle."
        },
        "Reputational": {
          "rating": "Low",
          "note": "Low risk based on latest vendor assessment cycle."
        },
        "AI / Automated Decisioning": {
          "rating": "Medium",
          "note": "Medium risk based on latest vendor assessment cycle."
        }
      }
    },
  {
      "id": "SV-35",
      "name": "Audit Services — Crescent",
      "supplier": "Crescent Analytics",
      "contract": "Crescent Analytics — Service Order #1028",
      "category": "Professional Services",
      "criticality": "Critical",
      "governance": "Governed",
      "riskScore": 78,
      "sla": 88,
      "lastReview": "Not yet reviewed",
    documents: [], notes: [], "owner": "Sam Okafor",
      "gap": null,
      "contacts": [
        {
          "name": "Rowan Lowell",
          "role": "Business Owner",
          "org": "Paradigm"
        },
        {
          "name": "Unassigned",
          "role": "Vendor Representative",
          "org": "Crescent Analytics"
        }
      ],
      "complianceDocs": [
        {
          "name": "Certificate of Insurance",
          "status": "On File",
          "date": "Jan 2026",
          "expires": "Jan 2027"
        }
      ],
      "slas": [
        {
          "metric": "Service Level Compliance",
          "target": "95%",
          "actual": "94%",
          "status": "Met"
        }
      ],
      "riskAssessment": {
        "Fourth-Party / Subcontractor": {
          "rating": "Medium",
          "note": "Medium risk based on latest vendor assessment cycle."
        },
        "Information Security": {
          "rating": "Low",
          "note": "Low risk based on latest vendor assessment cycle."
        },
        "Data Privacy": {
          "rating": "Low",
          "note": "Low risk based on latest vendor assessment cycle."
        },
        "Financial Stability": {
          "rating": "Low",
          "note": "Low risk based on latest vendor assessment cycle."
        },
        "System Access & Identity": {
          "rating": "High",
          "note": "High risk based on latest vendor assessment cycle."
        }
      }
    },
  {
      "id": "SV-36",
      "name": "Creative Production — Harbor",
      "supplier": "Harbor Ventures",
      "contract": "Harbor Ventures — Addendum #1041",
      "category": "Marketing",
      "criticality": "High",
      "governance": "Governed",
      "riskScore": 47,
      "sla": 91,
      "lastReview": "Not yet reviewed",
    documents: [], notes: [], "owner": "Priya Shah",
      "gap": null,
      "contacts": [
        {
          "name": "Jordan Kramer",
          "role": "Business Owner",
          "org": "Paradigm"
        },
        {
          "name": "Unassigned",
          "role": "Vendor Representative",
          "org": "Harbor Ventures"
        }
      ],
      "complianceDocs": [
        {
          "name": "Certificate of Insurance",
          "status": "Missing",
          "date": "Jan 2026",
          "expires": "Jan 2027"
        }
      ],
      "slas": [
        {
          "metric": "Service Level Compliance",
          "target": "95%",
          "actual": "99%",
          "status": "At Risk"
        }
      ],
      "riskAssessment": {
        "Conflict of Interest": {
          "rating": "Low",
          "note": "Low risk based on latest vendor assessment cycle."
        },
        "Fourth-Party / Subcontractor": {
          "rating": "Medium",
          "note": "Medium risk based on latest vendor assessment cycle."
        },
        "Business Continuity": {
          "rating": "Low",
          "note": "Low risk based on latest vendor assessment cycle."
        }
      }
    },
  {
      "id": "SV-37",
      "name": "Content Production — Bridgeway",
      "supplier": "Bridgeway Logistics",
      "contract": null,
      "category": "Marketing",
      "criticality": "High",
      "governance": "Uncontracted",
      "riskScore": null,
      "sla": 92,
      "lastReview": "Not yet reviewed",
    documents: [], notes: [], "owner": "Elena Ruiz",
      "gap": "No executed contract on file — service is being delivered without contractual coverage",
      "contacts": [
        {
          "name": "Casey Lowell",
          "role": "Business Owner",
          "org": "Paradigm"
        },
        {
          "name": "Unassigned",
          "role": "Vendor Representative",
          "org": "Bridgeway Logistics"
        }
      ],
      "complianceDocs": [
        {
          "name": "Certificate of Insurance",
          "status": "Missing",
          "date": "Jan 2026",
          "expires": "Jan 2027"
        }
      ],
      "slas": [
        {
          "metric": "Service Level Compliance",
          "target": "95%",
          "actual": "88%",
          "status": "Met"
        }
      ],
      "riskAssessment": {
        "Information Security": {
          "rating": "Low",
          "note": "Low risk based on latest vendor assessment cycle."
        },
        "Financial Stability": {
          "rating": "Low",
          "note": "Low risk based on latest vendor assessment cycle."
        },
        "AI / Automated Decisioning": {
          "rating": "High",
          "note": "High risk based on latest vendor assessment cycle."
        },
        "System Access & Identity": {
          "rating": "High",
          "note": "High risk based on latest vendor assessment cycle."
        }
      }
    },
  {
      "id": "SV-38",
      "name": "Media Buying — Harbor",
      "supplier": "Harbor Ventures",
      "contract": "Harbor Ventures — Supply Schedule #1016",
      "category": "Marketing",
      "criticality": "Medium",
      "governance": "Governed",
      "riskScore": null,
      "sla": 89,
      "lastReview": "Not yet reviewed",
    documents: [], notes: [], "owner": "Dana Kim",
      "gap": null,
      "contacts": [
        {
          "name": "Peyton Kramer",
          "role": "Business Owner",
          "org": "Paradigm"
        },
        {
          "name": "Unassigned",
          "role": "Vendor Representative",
          "org": "Harbor Ventures"
        }
      ],
      "complianceDocs": [
        {
          "name": "Certificate of Insurance",
          "status": "Missing",
          "date": "Jan 2026",
          "expires": "Jan 2027"
        }
      ],
      "slas": [
        {
          "metric": "Service Level Compliance",
          "target": "95%",
          "actual": "89%",
          "status": "Met"
        }
      ],
      "riskAssessment": {
        "AI / Automated Decisioning": {
          "rating": "Low",
          "note": "Low risk based on latest vendor assessment cycle."
        },
        "Information Security": {
          "rating": "Medium",
          "note": "Medium risk based on latest vendor assessment cycle."
        },
        "Business Continuity": {
          "rating": "Medium",
          "note": "Medium risk based on latest vendor assessment cycle."
        },
        "Regulatory Compliance": {
          "rating": "High",
          "note": "High risk based on latest vendor assessment cycle."
        }
      }
    },
  {
      "id": "SV-39",
      "name": "Market Research — Orbital",
      "supplier": "Orbital Marketing Partners",
      "contract": "Orbital Marketing Partners — Addendum #1035",
      "category": "Marketing",
      "criticality": "High",
      "governance": "Governed",
      "riskScore": 42,
      "sla": 99,
      "lastReview": "Not yet reviewed",
    documents: [], notes: [], "owner": "Marcus Webb",
      "gap": null,
      "contacts": [
        {
          "name": "Taylor Carter",
          "role": "Business Owner",
          "org": "Paradigm"
        },
        {
          "name": "Unassigned",
          "role": "Vendor Representative",
          "org": "Orbital Marketing Partners"
        }
      ],
      "complianceDocs": [
        {
          "name": "Certificate of Insurance",
          "status": "Expired",
          "date": "Jan 2026",
          "expires": "Jan 2027"
        }
      ],
      "slas": [
        {
          "metric": "Service Level Compliance",
          "target": "95%",
          "actual": "90%",
          "status": "At Risk"
        }
      ],
      "riskAssessment": {
        "Data Privacy": {
          "rating": "Medium",
          "note": "Medium risk based on latest vendor assessment cycle."
        },
        "Information Security": {
          "rating": "Low",
          "note": "Low risk based on latest vendor assessment cycle."
        },
        "AI / Automated Decisioning": {
          "rating": "Low",
          "note": "Low risk based on latest vendor assessment cycle."
        }
      }
    },
  {
      "id": "SV-40",
      "name": "Warehouse Management — Silverline",
      "supplier": "Silverline Ventures",
      "contract": "Silverline Ventures — Supply Schedule #1018",
      "category": "Logistics",
      "criticality": "High",
      "governance": "Governed",
      "riskScore": 56,
      "sla": 86,
      "lastReview": "Not yet reviewed",
    documents: [], notes: [], "owner": "Sam Okafor",
      "gap": null,
      "contacts": [
        {
          "name": "Jordan Diaz",
          "role": "Business Owner",
          "org": "Paradigm"
        },
        {
          "name": "Unassigned",
          "role": "Vendor Representative",
          "org": "Silverline Ventures"
        }
      ],
      "complianceDocs": [
        {
          "name": "Certificate of Insurance",
          "status": "On File",
          "date": "Jan 2026",
          "expires": "Jan 2027"
        }
      ],
      "slas": [
        {
          "metric": "Service Level Compliance",
          "target": "95%",
          "actual": "92%",
          "status": "At Risk"
        }
      ],
      "riskAssessment": {
        "AI / Automated Decisioning": {
          "rating": "Medium",
          "note": "Medium risk based on latest vendor assessment cycle."
        },
        "Financial Stability": {
          "rating": "Low",
          "note": "Low risk based on latest vendor assessment cycle."
        },
        "Reputational": {
          "rating": "Low",
          "note": "Low risk based on latest vendor assessment cycle."
        }
      }
    },
  {
      "id": "SV-41",
      "name": "Application Support — Cobalt",
      "supplier": "Cobalt Networks",
      "contract": "Cobalt Networks — Rate Schedule #1015",
      "category": "IT & Software",
      "criticality": "Critical",
      "governance": "Governed",
      "riskScore": null,
      "sla": null,
      "lastReview": "Not yet reviewed",
    documents: [], notes: [], "owner": "Priya Shah",
      "gap": null,
      "contacts": [
        {
          "name": "Riley Pierce",
          "role": "Business Owner",
          "org": "Paradigm"
        },
        {
          "name": "Unassigned",
          "role": "Vendor Representative",
          "org": "Cobalt Networks"
        }
      ],
      "complianceDocs": [
        {
          "name": "Certificate of Insurance",
          "status": "On File",
          "date": "Jan 2026",
          "expires": "Jan 2027"
        }
      ],
      "slas": [
        {
          "metric": "Service Level Compliance",
          "target": "95%",
          "actual": "82%",
          "status": "At Risk"
        }
      ],
      "riskAssessment": {
        "AI / Automated Decisioning": {
          "rating": "Medium",
          "note": "Medium risk based on latest vendor assessment cycle."
        },
        "Business Continuity": {
          "rating": "Low",
          "note": "Low risk based on latest vendor assessment cycle."
        },
        "System Access & Identity": {
          "rating": "Medium",
          "note": "Medium risk based on latest vendor assessment cycle."
        },
        "Information Security": {
          "rating": "High",
          "note": "High risk based on latest vendor assessment cycle."
        }
      }
    },
  {
      "id": "SV-42",
      "name": "Building Maintenance — Amber (2)",
      "supplier": "Amber Group",
      "contract": "Amber Group — Addendum #1032",
      "category": "Facilities",
      "criticality": "Medium",
      "governance": "Governed",
      "riskScore": null,
      "sla": null,
      "lastReview": "Not yet reviewed",
    documents: [], notes: [], "owner": "Elena Ruiz",
      "gap": null,
      "contacts": [
        {
          "name": "Sam Diaz",
          "role": "Business Owner",
          "org": "Paradigm"
        },
        {
          "name": "Unassigned",
          "role": "Vendor Representative",
          "org": "Amber Group"
        }
      ],
      "complianceDocs": [
        {
          "name": "Certificate of Insurance",
          "status": "Missing",
          "date": "Jan 2026",
          "expires": "Jan 2027"
        }
      ],
      "slas": [
        {
          "metric": "Service Level Compliance",
          "target": "95%",
          "actual": "94%",
          "status": "Met"
        }
      ],
      "riskAssessment": {
        "AI / Automated Decisioning": {
          "rating": "Low",
          "note": "Low risk based on latest vendor assessment cycle."
        },
        "Financial Stability": {
          "rating": "Low",
          "note": "Low risk based on latest vendor assessment cycle."
        }
      }
    },
  {
      "id": "SV-43",
      "name": "Electronic Components — Meridian",
      "supplier": "Meridian Steel Co.",
      "contract": null,
      "category": "Raw Materials",
      "criticality": "High",
      "governance": "Uncontracted",
      "riskScore": 22,
      "sla": 97,
      "lastReview": "Not yet reviewed",
    documents: [], notes: [], "owner": "Dana Kim",
      "gap": "No executed contract on file — service is being delivered without contractual coverage",
      "contacts": [
        {
          "name": "Peyton Lowell",
          "role": "Business Owner",
          "org": "Paradigm"
        },
        {
          "name": "Unassigned",
          "role": "Vendor Representative",
          "org": "Meridian Steel Co."
        }
      ],
      "complianceDocs": [
        {
          "name": "Certificate of Insurance",
          "status": "Expired",
          "date": "Jan 2026",
          "expires": "Jan 2027"
        }
      ],
      "slas": [
        {
          "metric": "Service Level Compliance",
          "target": "95%",
          "actual": "81%",
          "status": "Met"
        }
      ],
      "riskAssessment": {
        "AI / Automated Decisioning": {
          "rating": "Low",
          "note": "Low risk based on latest vendor assessment cycle."
        },
        "Information Security": {
          "rating": "Low",
          "note": "Low risk based on latest vendor assessment cycle."
        },
        "System Access & Identity": {
          "rating": "Low",
          "note": "Low risk based on latest vendor assessment cycle."
        },
        "Data Privacy": {
          "rating": "High",
          "note": "High risk based on latest vendor assessment cycle."
        },
        "Conflict of Interest": {
          "rating": "Low",
          "note": "Low risk based on latest vendor assessment cycle."
        }
      }
    },
  {
      "id": "SV-44",
      "name": "Legal Advisory — Granite",
      "supplier": "Granite Partners",
      "contract": "Granite Partners — Supply Schedule #1024",
      "category": "Professional Services",
      "criticality": "Medium",
      "governance": "Governed",
      "riskScore": null,
      "sla": null,
      "lastReview": "Not yet reviewed",
    documents: [], notes: [], "owner": "Marcus Webb",
      "gap": null,
      "contacts": [
        {
          "name": "Reese Ellis",
          "role": "Business Owner",
          "org": "Paradigm"
        },
        {
          "name": "Unassigned",
          "role": "Vendor Representative",
          "org": "Granite Partners"
        }
      ],
      "complianceDocs": [
        {
          "name": "Certificate of Insurance",
          "status": "On File",
          "date": "Jan 2026",
          "expires": "Jan 2027"
        }
      ],
      "slas": [
        {
          "metric": "Service Level Compliance",
          "target": "95%",
          "actual": "97%",
          "status": "Met"
        }
      ],
      "riskAssessment": {
        "Information Security": {
          "rating": "Low",
          "note": "Low risk based on latest vendor assessment cycle."
        },
        "System Access & Identity": {
          "rating": "Low",
          "note": "Low risk based on latest vendor assessment cycle."
        }
      }
    },
  {
      "id": "SV-45",
      "name": "HVAC Maintenance — Halcyon",
      "supplier": "Halcyon Facilities Group",
      "contract": "Halcyon Facilities Group — Addendum #1038",
      "category": "Facilities",
      "criticality": "High",
      "governance": "Governed",
      "riskScore": 10,
      "sla": 82,
      "lastReview": "Not yet reviewed",
    documents: [], notes: [], "owner": "Sam Okafor",
      "gap": null,
      "contacts": [
        {
          "name": "Riley Nolan",
          "role": "Business Owner",
          "org": "Paradigm"
        },
        {
          "name": "Unassigned",
          "role": "Vendor Representative",
          "org": "Halcyon Facilities Group"
        }
      ],
      "complianceDocs": [
        {
          "name": "Certificate of Insurance",
          "status": "On File",
          "date": "Jan 2026",
          "expires": "Jan 2027"
        }
      ],
      "slas": [
        {
          "metric": "Service Level Compliance",
          "target": "95%",
          "actual": "98%",
          "status": "Met"
        }
      ],
      "riskAssessment": {
        "Fourth-Party / Subcontractor": {
          "rating": "Low",
          "note": "Low risk based on latest vendor assessment cycle."
        },
        "AI / Automated Decisioning": {
          "rating": "Medium",
          "note": "Medium risk based on latest vendor assessment cycle."
        },
        "Regulatory Compliance": {
          "rating": "Low",
          "note": "Low risk based on latest vendor assessment cycle."
        }
      }
    },
  {
      "id": "SV-46",
      "name": "Packaging Materials — Coastal",
      "supplier": "Coastal Technologies",
      "contract": "Coastal Technologies — Supply Schedule #1013",
      "category": "Raw Materials",
      "criticality": "Critical",
      "governance": "Governed",
      "riskScore": null,
      "sla": 81,
      "lastReview": "Not yet reviewed",
    documents: [], notes: [], "owner": "Priya Shah",
      "gap": null,
      "contacts": [
        {
          "name": "Jordan Irwin",
          "role": "Business Owner",
          "org": "Paradigm"
        },
        {
          "name": "Unassigned",
          "role": "Vendor Representative",
          "org": "Coastal Technologies"
        }
      ],
      "complianceDocs": [
        {
          "name": "Certificate of Insurance",
          "status": "On File",
          "date": "Jan 2026",
          "expires": "Jan 2027"
        }
      ],
      "slas": [
        {
          "metric": "Service Level Compliance",
          "target": "95%",
          "actual": "99%",
          "status": "Met"
        }
      ],
      "riskAssessment": {
        "Financial Stability": {
          "rating": "Medium",
          "note": "Medium risk based on latest vendor assessment cycle."
        },
        "Reputational": {
          "rating": "Low",
          "note": "Low risk based on latest vendor assessment cycle."
        }
      }
    },
  {
      "id": "SV-47",
      "name": "Brand Strategy Consulting — Nimbus",
      "supplier": "Nimbus Technologies",
      "contract": "Nimbus Technologies — Addendum #1021",
      "category": "Marketing",
      "criticality": "Critical",
      "governance": "Gap identified",
      "riskScore": null,
      "sla": 90,
      "lastReview": "Not yet reviewed",
    documents: [], notes: [], "owner": "Elena Ruiz",
      "gap": "Vendor security questionnaire not yet returned",
      "contacts": [
        {
          "name": "Riley Hayes",
          "role": "Business Owner",
          "org": "Paradigm"
        },
        {
          "name": "Unassigned",
          "role": "Vendor Representative",
          "org": "Nimbus Technologies"
        }
      ],
      "complianceDocs": [
        {
          "name": "Certificate of Insurance",
          "status": "Expired",
          "date": "Jan 2026",
          "expires": "Jan 2027"
        }
      ],
      "slas": [
        {
          "metric": "Service Level Compliance",
          "target": "95%",
          "actual": "94%",
          "status": "At Risk"
        }
      ],
      "riskAssessment": {
        "Data Privacy": {
          "rating": "Low",
          "note": "Low risk based on latest vendor assessment cycle."
        },
        "Financial Stability": {
          "rating": "Low",
          "note": "Low risk based on latest vendor assessment cycle."
        },
        "Fourth-Party / Subcontractor": {
          "rating": "Low",
          "note": "Low risk based on latest vendor assessment cycle."
        },
        "Information Security": {
          "rating": "Medium",
          "note": "Medium risk based on latest vendor assessment cycle."
        },
        "Business Continuity": {
          "rating": "Low",
          "note": "Low risk based on latest vendor assessment cycle."
        }
      }
    },
  {
      "id": "SV-48",
      "name": "Content Production — Orbital",
      "supplier": "Orbital Marketing Partners",
      "contract": "Orbital Marketing Partners — Service Order #1042",
      "category": "Marketing",
      "criticality": "Critical",
      "governance": "Governed",
      "riskScore": 80,
      "sla": 84,
      "lastReview": "Not yet reviewed",
    documents: [], notes: [], "owner": "Dana Kim",
      "gap": null,
      "contacts": [
        {
          "name": "Taylor Lowell",
          "role": "Business Owner",
          "org": "Paradigm"
        },
        {
          "name": "Unassigned",
          "role": "Vendor Representative",
          "org": "Orbital Marketing Partners"
        }
      ],
      "complianceDocs": [
        {
          "name": "Certificate of Insurance",
          "status": "Missing",
          "date": "Jan 2026",
          "expires": "Jan 2027"
        }
      ],
      "slas": [
        {
          "metric": "Service Level Compliance",
          "target": "95%",
          "actual": "82%",
          "status": "Met"
        }
      ],
      "riskAssessment": {
        "Financial Stability": {
          "rating": "Low",
          "note": "Low risk based on latest vendor assessment cycle."
        },
        "Conflict of Interest": {
          "rating": "Medium",
          "note": "Medium risk based on latest vendor assessment cycle."
        },
        "Business Continuity": {
          "rating": "Low",
          "note": "Low risk based on latest vendor assessment cycle."
        },
        "Regulatory Compliance": {
          "rating": "Low",
          "note": "Low risk based on latest vendor assessment cycle."
        },
        "Fourth-Party / Subcontractor": {
          "rating": "Low",
          "note": "Low risk based on latest vendor assessment cycle."
        }
      }
    },
  {
      "id": "SV-49",
      "name": "Creative Production — Harbor (2)",
      "supplier": "Harbor Robotics",
      "contract": "Harbor Robotics — Rate Schedule #1019",
      "category": "Marketing",
      "criticality": "Critical",
      "governance": "Governed",
      "riskScore": 57,
      "sla": 95,
      "lastReview": "Not yet reviewed",
    documents: [], notes: [], "owner": "Marcus Webb",
      "gap": null,
      "contacts": [
        {
          "name": "Jamie Grant",
          "role": "Business Owner",
          "org": "Paradigm"
        },
        {
          "name": "Unassigned",
          "role": "Vendor Representative",
          "org": "Harbor Robotics"
        }
      ],
      "complianceDocs": [
        {
          "name": "Certificate of Insurance",
          "status": "Missing",
          "date": "Jan 2026",
          "expires": "Jan 2027"
        }
      ],
      "slas": [
        {
          "metric": "Service Level Compliance",
          "target": "95%",
          "actual": "81%",
          "status": "Met"
        }
      ],
      "riskAssessment": {
        "Reputational": {
          "rating": "Low",
          "note": "Low risk based on latest vendor assessment cycle."
        },
        "Fourth-Party / Subcontractor": {
          "rating": "Medium",
          "note": "Medium risk based on latest vendor assessment cycle."
        }
      }
    },
  {
      "id": "SV-50",
      "name": "Brand Strategy Consulting — Orbital",
      "supplier": "Orbital Marketing Partners",
      "contract": "Orbital Marketing Partners — Rate Schedule #1047",
      "category": "Marketing",
      "criticality": "Critical",
      "governance": "Governed",
      "riskScore": 37,
      "sla": null,
      "lastReview": "Not yet reviewed",
    documents: [], notes: [], "owner": "Sam Okafor",
      "gap": null,
      "contacts": [
        {
          "name": "Rowan Ortega",
          "role": "Business Owner",
          "org": "Paradigm"
        },
        {
          "name": "Unassigned",
          "role": "Vendor Representative",
          "org": "Orbital Marketing Partners"
        }
      ],
      "complianceDocs": [
        {
          "name": "Certificate of Insurance",
          "status": "On File",
          "date": "Jan 2026",
          "expires": "Jan 2027"
        }
      ],
      "slas": [
        {
          "metric": "Service Level Compliance",
          "target": "95%",
          "actual": "99%",
          "status": "At Risk"
        }
      ],
      "riskAssessment": {
        "Conflict of Interest": {
          "rating": "Low",
          "note": "Low risk based on latest vendor assessment cycle."
        },
        "Data Privacy": {
          "rating": "Medium",
          "note": "Medium risk based on latest vendor assessment cycle."
        },
        "System Access & Identity": {
          "rating": "Low",
          "note": "Low risk based on latest vendor assessment cycle."
        },
        "Business Continuity": {
          "rating": "Medium",
          "note": "Medium risk based on latest vendor assessment cycle."
        },
        "AI / Automated Decisioning": {
          "rating": "Medium",
          "note": "Medium risk based on latest vendor assessment cycle."
        }
      }
    }
];

// Illustrative portfolio-wide counts for the landing dashboard — the clickable list below
// shows the actual named vendors we have full records for; the tier cards represent the
// broader book of vendors under management.
const VENDOR_TIER_META = [
  { tier: "Partner", color: "#16A34A", description: "Deepest strategic alignment, joint planning" },
  { tier: "Strategic", color: "#2563EB", description: "High spend or criticality, actively managed" },
  { tier: "Preferred", color: "#0EA5E9", description: "Approved and in good standing" },
  { tier: "Transactional", color: "#94a3b8", description: "Low complexity, light-touch oversight" },
  { tier: "Unmanaged", color: "#DC2626", description: "Active spend without proper oversight in place" },
];

const VENDOR_SLAS = [
  { id: "VSLA-01", supplier: "Vantage Cloud Systems", metric: "Overall SLA Compliance", target: "98%", actual: "99.1%", status: "Met", enforcement: null },
  { id: "VSLA-02", supplier: "Vantage Cloud Systems", metric: "Invoice Accuracy", target: "99%", actual: "100%", status: "Met", enforcement: null },
  { id: "VSLA-03", supplier: "Meridian Steel Co.", metric: "On-Time Delivery", target: "98%", actual: "98.4%", status: "Met", enforcement: null },
  { id: "VSLA-04", supplier: "Northwind Logistics", metric: "On-Time Delivery", target: "97%", actual: "94%", status: "At Risk",
    enforcement: { action: "Formal improvement plan requested", date: "Jul 20, 2026", note: "Vendor given 30 days to improve on-time delivery before the penalty clause is invoked." } },
  { id: "VSLA-05", supplier: "Halcyon Facilities Group", metric: "Emergency Response Time", target: "2 hrs", actual: "3.5 hrs", status: "Breached",
    enforcement: { action: "Service credit invoked", date: "Jul 15, 2026", note: "$1,200 credit applied against the next invoice per the SLA breach clause." } },
  { id: "VSLA-06", supplier: "Orbital Marketing Partners", metric: "Campaign Delivery Timeliness", target: "95%", actual: "—", status: "Not tracked",
    enforcement: null, note: "Cannot be formally monitored or enforced — no governing contract on file." },
];

const BUSINESS_REVIEWS = [
  { id: "BR-001", supplier: "Vantage Cloud Systems", type: "QBR", scheduledDate: "2026-08-15", status: "Scheduled", notes: null },
  { id: "BR-002", supplier: "Meridian Steel Co.", type: "QBR", scheduledDate: "2026-08-20", status: "Scheduled", notes: null },
  { id: "BR-003", supplier: "Crescent Analytics", type: "QBR", scheduledDate: "2026-09-01", status: "Scheduled", notes: null },
  { id: "BR-004", supplier: "Northwind Logistics", type: "QBR", scheduledDate: "2026-07-10", status: "Completed Late",
    completedDate: "2026-07-18", notes: "Discussed rate escalation and delivery performance; agreed to revisit pricing next quarter." },
  { id: "BR-005", supplier: "Vantage Cloud Systems", type: "Annual Review", scheduledDate: "2026-05-01", status: "Completed On-Time",
    completedDate: "2026-05-01", notes: "Reviewed annual performance; renewed strategic roadmap alignment for the cloud migration program." },
  { id: "BR-006", supplier: "Meridian Steel Co.", type: "QBR", scheduledDate: "2026-04-15", status: "Completed On-Time",
    completedDate: "2026-04-15", notes: "Confirmed steel quality certifications and delivery performance remain strong." },
  { id: "BR-007", supplier: "Orbital Marketing Partners", type: "QBR", scheduledDate: "2026-03-01", status: "Completed Late",
    completedDate: "2026-03-12", notes: "Reviewed campaign performance; flagged the missing MSA as a follow-up item." },
  { id: "BR-008", supplier: "Halcyon Facilities Group", type: "QBR", scheduledDate: "2026-06-01", status: "Overdue", notes: null },
];

const WORKFLOWS = [
  { name: "Invoice Exception Routing", trigger: "Invoice match confidence < 80%",
    steps: ["Trigger", "AI Triage", "AP Review", "Escalation"], active: true, runs: 1204 },
  { name: "New Vendor Onboarding", trigger: "Intake type = New Vendor",
    steps: ["Trigger", "Risk Scoring", "Compliance Docs", "Category Approval", "Activate"], active: true, runs: 37 },
  { name: "PO Approval Chain", trigger: "PO value > $50,000",
    steps: ["Trigger", "Manager Approval", "Finance Approval", "Issue PO"], active: true, runs: 512 },
  { name: "Contract Renewal Alert", trigger: "90 days before expiry",
    steps: ["Trigger", "Contract Agent Review", "Notify Owner", "Renegotiate?"], active: false, runs: 0 },
];

const PURCHASE_ORDERS = [
  { id: "PO-58231", supplier: "Vantage Cloud Systems", type: "Standard", amount: "$142,000", status: "Issued", req: "REQ-901" },
  { id: "PO-58229", supplier: "Meridian Steel Co.", type: "Blanket", amount: "$620,000", status: "Received", req: "REQ-889" },
  { id: "PO-58233", supplier: "Northwind Logistics", type: "Service", amount: "$58,300", status: "Pending Approval", req: "REQ-905" },
  { id: "PO-58235", supplier: "Halcyon Facilities Group", type: "Emergency", amount: "$9,800", status: "Draft", req: "REQ-910" },
  { id: "PO-58218", supplier: "Orbital Marketing Partners", type: "Recurring", amount: "$22,400", status: "Closed", req: "REQ-844" },
];

const PO_STATS = [
  { label: "Open POs", value: "312" },
  { label: "Open value", value: "$18.4M" },
  { label: "Avg. cycle time", value: "0.8d" },
  { label: "Auto-issued", value: "76%" },
];

const RISK_TREND = [
  { m: "Feb", index: 32 }, { m: "Mar", index: 29 }, { m: "Apr", index: 35 },
  { m: "May", index: 41 }, { m: "Jun", index: 38 }, { m: "Jul", index: 44 },
];

const RISK_FLAGS = [
  { supplier: "Halcyon Facilities Group", type: "Compliance", severity: "High", detail: "Certificate of insurance lapsed 14 days ago", age: "14d" },
  { supplier: "Northwind Logistics", type: "Financial", severity: "Medium", detail: "Credit rating downgraded one notch by D&B", age: "3d" },
  { supplier: "Crescent Analytics", type: "Cyber", severity: "Medium", detail: "Named in a third-party breach disclosure feed", age: "6d" },
  { supplier: "Meridian Steel Co.", type: "Concentration", severity: "Low", detail: "22% of raw materials spend concentrated in one supplier", age: "ongoing" },
];

const CONFIG_ITEMS = [
  { name: "Approval Workflows", owner: "Priya Shah", edited: "2 days ago", enabled: true },
  { name: "Intake Forms", owner: "Marcus Webb", edited: "5 days ago", enabled: true },
  { name: "Risk Scoring Model", owner: "Compliance Team", edited: "1 week ago", enabled: true },
  { name: "Supplier Questionnaire", owner: "Dana Kim", edited: "3 weeks ago", enabled: true },
  { name: "Invoice Exception Rules", owner: "Elena Ruiz", edited: "Yesterday", enabled: true },
  { name: "Notification Templates", owner: "IT Admin", edited: "1 month ago", enabled: false },
];

const FIELD_PALETTE = ["Text", "Number", "Currency", "Dropdown", "Date", "Approval Step", "Condition", "AI Decision"];

const AI_PROMPTS = [
  { agent: "Supplier Agent", prompt: "Flag any supplier whose insurance certificate expires within 30 days and summarize the risk in two sentences." },
  { agent: "Contract Agent", prompt: "Identify contracts renewing in 90 days with auto-renewal clauses unfavorable to Paradigm." },
  { agent: "Procurement Advisor", prompt: "Summarize weekly savings, risk, and compliance trends for an executive audience in under 150 words." },
];

const BUDGETS = [
  { category: "IT & Software", allocated: 22.0, committed: 14.1, spent: 12.8 },
  { category: "Logistics", allocated: 14.5, committed: 9.8, spent: 8.9 },
  { category: "Facilities", allocated: 6.0, committed: 5.6, spent: 5.1 },
  { category: "Marketing", allocated: 7.2, committed: 4.9, spent: 4.1 },
  { category: "Professional Services", allocated: 9.5, committed: 6.2, spent: 5.4 },
];

const FORECAST_DATA = [
  { m: "May", actual: 44, forecast: null }, { m: "Jun", actual: 46, forecast: null },
  { m: "Jul", actual: 45, forecast: 45 }, { m: "Aug", actual: null, forecast: 47 },
  { m: "Sep", actual: null, forecast: 49 }, { m: "Oct", actual: null, forecast: 51 },
  { m: "Nov", actual: null, forecast: 48 }, { m: "Dec", actual: null, forecast: 53 },
];

const FORECAST_STATS = [
  { label: "Projected Q3 spend", value: "$147M" },
  { label: "Projected savings", value: "$5.1M" },
  { label: "Cash conversion cycle", value: "38d" },
  { label: "Working capital impact", value: "+$2.3M" },
];

const PM_MONTHS = ["Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const PROJECTS = [
  {
    id: "PRJ-001", name: "Cloud Migration Program", owner: "Priya Shah", supplier: "Vantage Cloud Systems",
    status: "On Track", progress: 64, startIdx: 1, endIdx: 7,
    documents: [], notes: [], risk: "Low",
    package: {
      budgetCategory: "IT & Software", budgetAmount: 1.2,
      rfpId: null, contractIds: ["CT-1001", "CT-1002"], serviceIds: ["SV-01", "SV-02"],
      poIds: ["PO-58231"], invoiceIds: ["INV-88210"],
    },
    timeline: [
      { date: "Apr 1, 2026", type: "budget", event: "Package launched — $1.2M allocated from IT & Software budget" },
      { date: "Apr 3, 2026", type: "service", event: "Linked services: Cloud Infrastructure Hosting, Application Support & Maintenance" },
      { date: "Apr 5, 2026", type: "contract", event: "Contracts attached: Hosting Order #2291, Support Addendum" },
      { date: "Jun 2, 2026", type: "po", event: "PO-58231 issued to Vantage Cloud Systems" },
      { date: "Jun 18, 2026", type: "invoice", event: "INV-88210 matched touchless" },
    ],
  },
  {
    id: "PRJ-002", name: "Facilities Consolidation", owner: "Dana Kim", supplier: "Halcyon Facilities Group", risk: "High",
    status: "At Risk", progress: 41, startIdx: 0, endIdx: 6,
    documents: [], notes: [],
    package: {
      budgetCategory: "Facilities", budgetAmount: 0.64,
      rfpId: null, contractIds: ["CT-1006"], serviceIds: ["SV-04"],
      poIds: ["PO-58235"], invoiceIds: ["INV-88221"],
    },
    timeline: [
      { date: "Mar 3, 2026", type: "budget", event: "Package launched — $640K allocated from Facilities budget" },
      { date: "Mar 6, 2026", type: "service", event: "Linked service: Facilities Maintenance Services" },
      { date: "Jun 5, 2026", type: "contract", event: "Maintenance Order sent for signature — still pending" },
      { date: "Jul 8, 2026", type: "po", event: "PO-58235 drafted, held pending contract signature" },
      { date: "Jul 20, 2026", type: "invoice", event: "INV-88221 flagged as a possible duplicate" },
    ],
  },
  {
    id: "PRJ-003", name: "Freight Network Redesign", owner: "Elena Ruiz", supplier: "Northwind Logistics", risk: "Medium",
    status: "On Track", progress: 58, startIdx: 2, endIdx: 8,
    documents: [], notes: [],
    package: {
      budgetCategory: "Logistics", budgetAmount: 3.1,
      rfpId: "RFP-2201", contractIds: ["CT-1004", "CT-1005"], serviceIds: ["SV-03"],
      poIds: ["PO-58233"], invoiceIds: ["INV-88214"],
    },
    timeline: [
      { date: "May 2, 2026", type: "rfp", event: "Sourcing event RFP-2201 launched — 6 suppliers invited" },
      { date: "May 20, 2026", type: "budget", event: "$3.1M allocated from Logistics budget pending award" },
      { date: "Jun 10, 2026", type: "service", event: "Linked service: Freight & Distribution Services" },
      { date: "Jun 15, 2026", type: "contract", event: "Freight Rate Schedule and Warehouse Sublease attached" },
      { date: "Jul 1, 2026", type: "po", event: "PO-58233 submitted for approval" },
      { date: "Jul 10, 2026", type: "invoice", event: "INV-88214 flagged as an exception" },
    ],
  },
  {
    id: "PRJ-004", name: "Brand Refresh Rollout", owner: "Marcus Webb", supplier: "Orbital Marketing Partners", risk: "High",
    status: "Delayed", progress: 22, startIdx: 3, endIdx: 6,
    documents: [], notes: [],
    package: {
      budgetCategory: "Marketing", budgetAmount: 0.225,
      rfpId: null, contractIds: [], serviceIds: ["SV-06"],
      poIds: ["PO-58218"], invoiceIds: [],
    },
    timeline: [
      { date: "Jun 1, 2026", type: "budget", event: "Package launched — $225K allocated from Marketing budget" },
      { date: "Jun 4, 2026", type: "service", event: "Linked service: Brand Creative Production" },
      { date: "Jun 4, 2026", type: "risk", event: "Risk assessment flagged: no governing contract on file" },
      { date: "Jun 20, 2026", type: "po", event: "PO-58218 issued against prior campaign — no active contract backing it" },
    ],
  },
  {
      "id": "PRJ-005",
      "name": "Integrated Analytics Initiative",
      "owner": "Elena Ruiz",
      "supplier": "Oakhurst Industries",
      "status": "At Risk",
      "progress": 88,
      "startIdx": 0,
      "endIdx": 2,
    documents: [], notes: [],
      "risk": "Low",
      "package": {
        "budgetCategory": "Facilities",
        "budgetAmount": 1.549,
        "rfpId": null,
        "contractIds": [],
        "serviceIds": [],
        "poIds": [],
        "invoiceIds": [],
        "requestedComponents": []
      },
      "timeline": [
        {
          "date": "Jan 2026",
          "type": "budget",
          "event": "Package launched — $1.549M requested from Facilities"
        }
      ]
    },
  {
      "id": "PRJ-006",
      "name": "Next-Gen Warehouse Initiative",
      "owner": "Marcus Webb",
      "supplier": "Crescent Analytics",
      "status": "At Risk",
      "progress": 13,
      "startIdx": 1,
      "endIdx": 3,
    documents: [], notes: [],
      "risk": "Low",
      "package": {
        "budgetCategory": "Professional Services",
        "budgetAmount": 0.392,
        "rfpId": null,
        "contractIds": [],
        "serviceIds": [],
        "poIds": [],
        "invoiceIds": [],
        "requestedComponents": []
      },
      "timeline": [
        {
          "date": "Jan 2026",
          "type": "budget",
          "event": "Package launched — $0.392M requested from Professional Services"
        }
      ]
    },
  {
      "id": "PRJ-007",
      "name": "Integrated Onboarding Expansion",
      "owner": "Sam Okafor",
      "supplier": "Driftwood Media",
      "status": "At Risk",
      "progress": 11,
      "startIdx": 1,
      "endIdx": 3,
    documents: [], notes: [],
      "risk": "Low",
      "package": {
        "budgetCategory": "Facilities",
        "budgetAmount": 1.136,
        "rfpId": null,
        "contractIds": [],
        "serviceIds": [],
        "poIds": [],
        "invoiceIds": [],
        "requestedComponents": []
      },
      "timeline": [
        {
          "date": "Jan 2026",
          "type": "budget",
          "event": "Package launched — $1.136M requested from Facilities"
        }
      ]
    },
  {
      "id": "PRJ-008",
      "name": "Modernization Analytics Transformation",
      "owner": "Elena Ruiz",
      "supplier": "Amber Group",
      "status": "On Track",
      "progress": 79,
      "startIdx": 4,
      "endIdx": 7,
    documents: [], notes: [],
      "risk": "High",
      "package": {
        "budgetCategory": "IT & Software",
        "budgetAmount": 1.502,
        "rfpId": null,
        "contractIds": [],
        "serviceIds": [],
        "poIds": [],
        "invoiceIds": [],
        "requestedComponents": []
      },
      "timeline": [
        {
          "date": "Jan 2026",
          "type": "budget",
          "event": "Package launched — $1.502M requested from IT & Software"
        }
      ]
    },
  {
      "id": "PRJ-009",
      "name": "Next-Gen Onboarding Expansion",
      "owner": "Marcus Webb",
      "supplier": "Amber Analytics",
      "status": "On Track",
      "progress": 64,
      "startIdx": 4,
      "endIdx": 9,
    documents: [], notes: [],
      "risk": "Low",
      "package": {
        "budgetCategory": "Logistics",
        "budgetAmount": 1.841,
        "rfpId": null,
        "contractIds": [],
        "serviceIds": [],
        "poIds": [],
        "invoiceIds": [],
        "requestedComponents": []
      },
      "timeline": [
        {
          "date": "Jan 2026",
          "type": "budget",
          "event": "Package launched — $1.841M requested from Logistics"
        }
      ]
    },
  {
      "id": "PRJ-010",
      "name": "Operational Security Transformation",
      "owner": "Marcus Webb",
      "supplier": "Granite Solutions",
      "status": "On Track",
      "progress": 62,
      "startIdx": 2,
      "endIdx": 8,
    documents: [], notes: [],
      "risk": "Low",
      "package": {
        "budgetCategory": "Professional Services",
        "budgetAmount": 1.134,
        "rfpId": null,
        "contractIds": [],
        "serviceIds": [],
        "poIds": [],
        "invoiceIds": [],
        "requestedComponents": []
      },
      "timeline": [
        {
          "date": "Jan 2026",
          "type": "budget",
          "event": "Package launched — $1.134M requested from Professional Services"
        }
      ]
    },
  {
      "id": "PRJ-011",
      "name": "Modernization Platform Transformation",
      "owner": "Priya Shah",
      "supplier": "Lakeshore Labs",
      "status": "Delayed",
      "progress": 0,
      "startIdx": 4,
      "endIdx": 9,
    documents: [], notes: [],
      "risk": "Medium",
      "package": {
        "budgetCategory": "Facilities",
        "budgetAmount": 1.832,
        "rfpId": null,
        "contractIds": [],
        "serviceIds": [],
        "poIds": [],
        "invoiceIds": [],
        "requestedComponents": []
      },
      "timeline": [
        {
          "date": "Jan 2026",
          "type": "budget",
          "event": "Package launched — $1.832M requested from Facilities"
        }
      ]
    },
  {
      "id": "PRJ-012",
      "name": "Automated Facilities Rebuild",
      "owner": "Priya Shah",
      "supplier": "Orbital Marketing Partners",
      "status": "On Track",
      "progress": 65,
      "startIdx": 5,
      "endIdx": 7,
    documents: [], notes: [],
      "risk": null,
      "package": {
        "budgetCategory": "Facilities",
        "budgetAmount": 1.711,
        "rfpId": null,
        "contractIds": [],
        "serviceIds": [],
        "poIds": [],
        "invoiceIds": [],
        "requestedComponents": []
      },
      "timeline": [
        {
          "date": "Jan 2026",
          "type": "budget",
          "event": "Package launched — $1.711M requested from Facilities"
        }
      ]
    },
  {
      "id": "PRJ-013",
      "name": "Strategic Security Upgrade",
      "owner": "Priya Shah",
      "supplier": "Maplewood Technologies",
      "status": "At Risk",
      "progress": 50,
      "startIdx": 1,
      "endIdx": 7,
    documents: [], notes: [],
      "risk": null,
      "package": {
        "budgetCategory": "IT & Software",
        "budgetAmount": 0.63,
        "rfpId": null,
        "contractIds": [],
        "serviceIds": [],
        "poIds": [],
        "invoiceIds": [],
        "requestedComponents": []
      },
      "timeline": [
        {
          "date": "Jan 2026",
          "type": "budget",
          "event": "Package launched — $0.63M requested from IT & Software"
        }
      ]
    },
  {
      "id": "PRJ-014",
      "name": "Integrated Facilities Rebuild",
      "owner": "Marcus Webb",
      "supplier": "Harbor Ventures",
      "status": "At Risk",
      "progress": 15,
      "startIdx": 1,
      "endIdx": 6,
    documents: [], notes: [],
      "risk": "Medium",
      "package": {
        "budgetCategory": "Logistics",
        "budgetAmount": 2.145,
        "rfpId": null,
        "contractIds": [],
        "serviceIds": [],
        "poIds": [],
        "invoiceIds": [],
        "requestedComponents": []
      },
      "timeline": [
        {
          "date": "Jan 2026",
          "type": "budget",
          "event": "Package launched — $2.145M requested from Logistics"
        }
      ]
    },
  {
      "id": "PRJ-015",
      "name": "Modernization Security Expansion",
      "owner": "Marcus Webb",
      "supplier": "Maplewood Technologies",
      "status": "On Track",
      "progress": 24,
      "startIdx": 0,
      "endIdx": 3,
    documents: [], notes: [],
      "risk": "High",
      "package": {
        "budgetCategory": "Logistics",
        "budgetAmount": 0.11,
        "rfpId": null,
        "contractIds": [],
        "serviceIds": [],
        "poIds": [],
        "invoiceIds": [],
        "requestedComponents": []
      },
      "timeline": [
        {
          "date": "Jan 2026",
          "type": "budget",
          "event": "Package launched — $0.11M requested from Logistics"
        }
      ]
    }
];

const PACKAGE_COMPONENTS = [
  { id: "rfp", label: "RFP / Sourcing Event", icon: Gavel, requestType: "RFx / Sourcing Event" },
  { id: "contract", label: "Contract", icon: FileText, requestType: "Contract Request" },
  { id: "service", label: "Service", icon: Layers, requestType: "Service Request" },
  { id: "risk", label: "Risk Assessment", icon: ShieldCheck, requestType: null },
  { id: "po", label: "Purchase Order", icon: ClipboardList, requestType: "Purchase Request" },
  { id: "invoice", label: "Invoice Tracking", icon: Receipt, requestType: null },
];

const REQUEST_TYPES = [
  { id: "Service Request", label: "Service", icon: Briefcase },
  { id: "Contract Request", label: "Contract", icon: FileText },
  { id: "New Vendor", label: "Vendor", icon: Building2 },
  { id: "New Project", label: "Project", icon: CalendarRange },
  { id: "RFx / Sourcing Event", label: "RFx / Sourcing", icon: Gavel },
  { id: "Purchase Request", label: "Purchase", icon: ShoppingCart },
];

// 2026 category taxonomy — L1 groupings with L2 detail underneath. The first five L1s
// intentionally match existing Budget categories; the rest deliberately have no budget
// line yet, so requests in those categories surface the "needs disposition" flow.
const CATEGORY_TAXONOMY = {
  "IT & Software": ["Cloud Infrastructure", "Enterprise Software", "Cybersecurity", "Hardware & Devices", "IT Managed Services", "Telecommunications"],
  "Logistics": ["Freight & Transportation", "Warehousing & Distribution", "Customs & Trade Compliance", "Fleet Management", "Last-Mile Delivery"],
  "Facilities": ["Janitorial Services", "Maintenance & Repair", "Security Services", "Landscaping", "Office Furniture & Fixtures", "Utilities & Waste Management"],
  "Marketing": ["Advertising & Media Buying", "Digital Marketing", "Public Relations", "Events & Sponsorships", "Content & Creative Production", "Market Research"],
  "Professional Services": ["Management Consulting", "Legal Services", "Accounting & Audit", "HR & Recruiting", "Training & Development", "Interim Staffing"],
  "Raw Materials": ["Metals & Alloys", "Chemicals", "Packaging Materials", "Electronic Components", "Textiles & Fabrics"],
  "Human Capital & Contingent Labor": ["Staffing Agencies", "Independent Contractors", "Payroll Services", "Benefits Administration", "Workforce Management Software"],
  "Financial Services": ["Banking & Treasury", "Insurance", "Tax Advisory", "Investment & Advisory Services", "Payment Processing"],
  "Energy & Sustainability": ["Renewable Energy", "Utilities Management", "Carbon Offsets & Credits", "ESG Consulting", "Energy Efficiency Equipment"],
  "Healthcare & Benefits": ["Medical Services", "Wellness Programs", "Occupational Health", "Health Insurance Brokerage"],
  "Travel & Fleet": ["Corporate Travel", "Fleet Leasing", "Fuel Cards & Management", "Ground Transportation"],
  "AI & Data Services": ["AI / ML Platforms", "Data Licensing", "Data Labeling & Annotation", "Model Hosting & Inference", "Data Analytics Services"],
  "Capital Equipment": ["Manufacturing Equipment", "Laboratory Equipment", "Construction Equipment", "Material Handling Equipment"],
};

const REQUEST_CATEGORIES = Object.keys(CATEGORY_TAXONOMY);

const COST_CENTERS = ["CC-1000 Corporate", "CC-2000 Operations", "CC-3000 IT", "CC-4000 Sales & Marketing", "CC-5000 R&D"];
const DEPARTMENTS = ["Procurement", "IT", "Finance", "Operations", "Marketing", "Legal", "HR", "Engineering"];

const aiSuggestion = (type) => ({
  "Service Request": "Checking for overlap with existing governed services before routing to Category Intelligence Agent.",
  "Contract Request": "Routed to Contract Agent for clause drafting and risk review.",
  "New Vendor": "Suggested owner: Vendor Management — risk scoring will run automatically.",
  "New Project": "Suggested owner: Project Management — awaiting budget confirmation.",
  "RFx / Sourcing Event": "Suggested owner: Sourcing — AI will recommend suppliers to invite.",
  "Purchase Request": "Checking against blanket order policy for auto-approval eligibility.",
}[type] || "Triaging request and identifying the right owner.");

// Lightweight keyword classifier standing in for a real AI reviewer — matches the
// title/description against L1/L2 category terms to suggest a spend category.
const CATEGORY_KEYWORDS = {
  "Cloud Infrastructure": "IT & Software", "Software": "IT & Software", "Cybersecurity": "IT & Software", "Security software": "IT & Software",
  "Freight": "Logistics", "Shipping": "Logistics", "Warehouse": "Logistics", "Fleet": "Logistics",
  "Janitorial": "Facilities", "Maintenance": "Facilities", "Landscaping": "Facilities", "Office": "Facilities",
  "Advertising": "Marketing", "Campaign": "Marketing", "Creative": "Marketing", "Brand": "Marketing", "Event": "Marketing",
  "Consulting": "Professional Services", "Legal": "Professional Services", "Audit": "Professional Services", "Training": "Professional Services",
  "Steel": "Raw Materials", "Chemical": "Raw Materials", "Packaging": "Raw Materials",
  "Staffing": "Human Capital & Contingent Labor", "Contractor": "Human Capital & Contingent Labor", "Recruiting": "Human Capital & Contingent Labor",
  "Insurance": "Financial Services", "Tax": "Financial Services", "Bank": "Financial Services",
  "Energy": "Energy & Sustainability", "Carbon": "Energy & Sustainability", "ESG": "Energy & Sustainability",
  "Wellness": "Healthcare & Benefits", "Medical": "Healthcare & Benefits", "Health": "Healthcare & Benefits",
  "Travel": "Travel & Fleet", "Airfare": "Travel & Fleet", "Lease": "Travel & Fleet",
  "AI": "AI & Data Services", "Model": "AI & Data Services", "Data": "AI & Data Services",
  "Equipment": "Capital Equipment", "Machinery": "Capital Equipment",
};

const aiClassifyCategory = (text) => {
  const lower = (text || "").toLowerCase();
  for (const [kw, cat] of Object.entries(CATEGORY_KEYWORDS)) {
    if (lower.includes(kw.toLowerCase())) return cat;
  }
  return null;
};

// Simulated first-pass contract review. This is pattern-based, not a real read of the
// uploaded document's contents — it's presented to the user as such (see the modal copy).
const aiReviewContract = (fileName) => {
  const seed = (fileName || "").length;
  return {
    preamble: seed % 2 === 0 ? "Present and complete" : "Missing effective date in preamble",
    grammar: (seed % 4) + 1,
    redundancy: seed % 3 === 0 ? "2 redundant indemnification clauses found" : "No redundant clauses detected",
    substandardTerms: seed % 2 === 0
      ? "Liability cap is below our standard floor — flag for legal review"
      : "Terms are within standard parameters",
  };
};

const DISPOSITION_RECOMMENDATIONS = {
  "Service Request": "new_service",
  "Contract Request": "new_contract",
  "New Vendor": "onboard",
  "New Project": "launch_package",
  "RFx / Sourcing Event": "launch_rfp",
  "Purchase Request": "approve",
  "Contract Change": "route_contract_agent",
};

const RequestsContext = React.createContext(null);

// window.storage only exists inside Claude's artifact sandbox (and gives shared,
// multi-user persistence there). Deployed standalone — e.g. on Cloudflare — it doesn't
// exist, so this falls back to localStorage: still persists, but per-browser only.
const hasArtifactStorage = typeof window !== "undefined" && window.storage && typeof window.storage.get === "function";

const storage = {
  async get(key) {
    if (hasArtifactStorage) return window.storage.get(key, true);
    try {
      const raw = localStorage.getItem(key);
      return raw ? { key, value: raw } : null;
    } catch {
      return null;
    }
  },
  async set(key, value) {
    if (hasArtifactStorage) return window.storage.set(key, value, true);
    try {
      localStorage.setItem(key, value);
      return { key, value };
    } catch {
      return null;
    }
  },
  async delete(key) {
    if (hasArtifactStorage) return window.storage.delete(key, true);
    try {
      localStorage.removeItem(key);
      return { key, deleted: true };
    } catch {
      return null;
    }
  },
};


const FIELD_OBJECTS = ["Supplier", "Contract", "Service", "Vendor", "Project"];

const FIELDS_BY_OBJECT = {
  Supplier: [
    { name: "Legal Name", type: "Text", required: true, custom: false },
    { name: "Tax ID", type: "Text", required: true, custom: false },
    { name: "Risk Score", type: "Number", required: false, custom: false },
    { name: "ESG Score", type: "Number", required: false, custom: true },
    { name: "Diversity Certification", type: "Dropdown", required: false, custom: true },
    { name: "Insurance Expiry", type: "Date", required: true, custom: false },
  ],
  Contract: [
    { name: "Contract Title", type: "Text", required: true, custom: false },
    { name: "Effective Date", type: "Date", required: true, custom: false },
    { name: "Expiration Date", type: "Date", required: true, custom: false },
    { name: "Auto-Renewal", type: "Checkbox", required: false, custom: false },
    { name: "Governing Law", type: "Dropdown", required: false, custom: true },
  ],
  Service: [
    { name: "Service Name", type: "Text", required: true, custom: false },
    { name: "Criticality Tier", type: "Dropdown", required: true, custom: false },
    { name: "SLA Target", type: "Number", required: false, custom: true },
    { name: "Governance Status", type: "Dropdown", required: true, custom: false },
  ],
  Vendor: [
    { name: "Tier", type: "Dropdown", required: true, custom: false },
    { name: "Primary Contact", type: "Text", required: false, custom: false },
    { name: "Diversity Flag", type: "Checkbox", required: false, custom: true },
  ],
  Project: [
    { name: "Project Name", type: "Text", required: true, custom: false },
    { name: "Sponsor", type: "Text", required: false, custom: false },
    { name: "Health Status", type: "Dropdown", required: true, custom: false },
  ],
};

const ROLES = [
  { name: "Executive", users: 12 }, { name: "Procurement Leader", users: 8 },
  { name: "Category Manager", users: 24 }, { name: "Buyer", users: 96 },
  { name: "Approver", users: 140 }, { name: "Finance Analyst", users: 31 },
  { name: "Accounts Payable", users: 22 }, { name: "Compliance Officer", users: 9 },
  { name: "IT Administrator", users: 6 }, { name: "Auditor", users: 5 },
];

const PERMISSION_MODULES = ["Suppliers", "Sourcing", "Contracts", "Services", "Invoices", "Budget", "Admin"];

const PERMISSIONS_MATRIX = {
  "Executive": ["View", "View", "View", "View", "View", "View", "None"],
  "Procurement Leader": ["Edit", "Approve", "Edit", "Edit", "View", "Edit", "View"],
  "Category Manager": ["Edit", "Edit", "View", "Edit", "None", "View", "None"],
  "Buyer": ["View", "View", "None", "None", "None", "None", "None"],
  "Approver": ["View", "View", "View", "View", "Approve", "View", "None"],
  "Finance Analyst": ["View", "None", "View", "View", "Edit", "Edit", "None"],
  "Accounts Payable": ["None", "None", "None", "None", "Approve", "View", "None"],
  "Compliance Officer": ["View", "None", "Edit", "Edit", "None", "None", "None"],
  "IT Administrator": ["None", "None", "None", "None", "None", "None", "Edit"],
  "Auditor": ["View", "View", "View", "View", "View", "View", "View"],
};

const NOTIFICATION_RULES = [
  { trigger: "Contract expiring within 30 days", channels: ["mail", "bell"], recipients: "Contract Owner, Procurement Leader", enabled: true },
  { trigger: "Invoice exception detected", channels: ["mail", "message"], recipients: "Accounts Payable", enabled: true },
  { trigger: "Supplier risk score increases 20+ pts", channels: ["mail", "sms"], recipients: "Compliance Officer", enabled: true },
  { trigger: "New intake request submitted", channels: ["bell"], recipients: "Category Owner", enabled: true },
  { trigger: "Budget committed exceeds 90%", channels: ["mail"], recipients: "Finance Analyst", enabled: true },
  { trigger: "Workflow run fails", channels: ["mail", "message"], recipients: "IT Administrator", enabled: false },
];

const BRAND_SWATCHES = ["#0B1220", "#2563EB", "#16A34A", "#7C5CFC", "#B54708", "#1F6F5C"];

const TEMPLATES = [
  { name: "RFP Cover Template", type: "Sourcing", edited: "3 days ago" },
  { name: "Contract Cover Page", type: "Legal", edited: "1 week ago" },
  { name: "Invoice Exception Notice (Email)", type: "Finance", edited: "Yesterday" },
  { name: "Supplier Onboarding Welcome", type: "Vendor Mgmt", edited: "2 weeks ago" },
  { name: "Executive Weekly Report", type: "Analytics", edited: "5 days ago" },
  { name: "Intake Confirmation (Email)", type: "Intake", edited: "4 days ago" },
];

const AUDIT_LOG = [
  { time: "Jul 27, 2:14 PM", user: "Elena Ruiz", action: 'Edited approval workflow "PO Approval Chain"' },
  { time: "Jul 27, 11:02 AM", user: "System · Invoice Agent", action: "Processed 214 invoices touchless" },
  { time: "Jul 26, 4:45 PM", user: "Dana Kim", action: 'Onboarded vendor "Bluepeak Facilities"' },
  { time: "Jul 26, 9:30 AM", user: "IT Administrator", action: "Updated SSO configuration" },
  { time: "Jul 25, 3:12 PM", user: "Compliance Officer", action: "Approved risk scoring model change" },
  { time: "Jul 24, 10:20 AM", user: "Priya Shah", action: 'Added custom field "ESG Score" to Supplier object' },
];

/* --------------------------------- helpers --------------------------------- */

const riskColor = (risk) =>
  risk === "Low" ? "text-emerald-600 bg-emerald-50 border-emerald-200"
  : risk === "Medium" ? "text-amber-700 bg-amber-50 border-amber-200"
  : "text-rose-700 bg-rose-50 border-rose-200";

const statusColor = (status) =>
  status === "active" ? "bg-emerald-500"
  : status === "attention" ? "bg-amber-500" : "bg-slate-400";

const invStatusColor = (status) =>
  status === "Matched" ? "text-emerald-700 bg-emerald-50 border-emerald-200"
  : status === "Exception" ? "text-amber-700 bg-amber-50 border-amber-200"
  : "text-rose-700 bg-rose-50 border-rose-200";

const tierColor = (tier) =>
  tier === "Partner" ? "text-emerald-700 bg-emerald-50 border-emerald-200"
  : tier === "Strategic" ? "text-[#2563EB] bg-[#2563EB]/10 border-[#2563EB]/20"
  : tier === "Preferred" ? "text-[#16A34A] bg-[#16A34A]/10 border-[#16A34A]/20"
  : tier === "Transactional" ? "text-slate-500 bg-slate-100 border-slate-200"
  : "text-rose-700 bg-rose-50 border-rose-200"; // Unmanaged

const docStatusColor = (status) =>
  status === "On File" ? "text-emerald-700 bg-emerald-50 border-emerald-200"
  : status === "Requested" ? "text-amber-700 bg-amber-50 border-amber-200"
  : status === "Expired" ? "text-rose-700 bg-rose-50 border-rose-200"
  : "text-rose-700 bg-rose-50 border-rose-200"; // Missing

const slaStatusColor = (status) =>
  status === "Met" ? "text-emerald-700 bg-emerald-50 border-emerald-200"
  : status === "At Risk" ? "text-amber-700 bg-amber-50 border-amber-200"
  : status === "Breached" ? "text-rose-700 bg-rose-50 border-rose-200"
  : status === "Monitoring" ? "text-[#2563EB] bg-[#2563EB]/10 border-[#2563EB]/20"
  : "text-slate-400 bg-slate-50 border-slate-200"; // Not tracked

const reviewStatusColor = (status) =>
  status === "Scheduled" ? "text-[#2563EB] bg-[#2563EB]/10 border-[#2563EB]/20"
  : status === "Completed On-Time" ? "text-emerald-700 bg-emerald-50 border-emerald-200"
  : status === "Completed Late" ? "text-amber-700 bg-amber-50 border-amber-200"
  : "text-rose-700 bg-rose-50 border-rose-200"; // Overdue

const valueStatusColor = (status) =>
  status === "Approved" ? "text-emerald-700 bg-emerald-50 border-emerald-200"
  : status === "Rejected" ? "text-rose-700 bg-rose-50 border-rose-200"
  : "text-amber-700 bg-amber-50 border-amber-200"; // Pending Finance Approval

const valueTypeColor = (type) =>
  type === "Savings" ? "text-emerald-700 bg-emerald-50 border-emerald-200"
  : type === "Cost Avoidance" ? "text-[#2563EB] bg-[#2563EB]/10 border-[#2563EB]/20"
  : "text-[#16A34A] bg-[#16A34A]/10 border-[#16A34A]/20"; // Payment Terms Improvement

const governanceColor = (g) =>
  g === "Governed" ? "text-emerald-700 bg-emerald-50 border-emerald-200"
  : g === "Gap identified" ? "text-amber-700 bg-amber-50 border-amber-200"
  : "text-rose-700 bg-rose-50 border-rose-200";

const criticalityColor = (c) =>
  c === "Critical" ? "text-rose-700 bg-rose-50 border-rose-200"
  : c === "High" ? "text-amber-700 bg-amber-50 border-amber-200"
  : "text-slate-600 bg-slate-100 border-slate-200";

const timelineIcon = (type) =>
  type === "budget" ? Wallet
  : type === "service" ? Layers
  : type === "contract" ? FileText
  : type === "po" ? ClipboardList
  : type === "invoice" ? Receipt
  : type === "rfp" ? Gavel
  : type === "risk" ? ShieldAlert
  : CheckCircle2;

const projectStatusColor = (status) =>
  status === "On Track" ? "text-emerald-700 bg-emerald-50 border-emerald-200"
  : status === "At Risk" ? "text-amber-700 bg-amber-50 border-amber-200"
  : "text-rose-700 bg-rose-50 border-rose-200";

const contractStatusColor = (status) =>
  status === "Active" ? "text-emerald-700 bg-emerald-50 border-emerald-200"
  : status === "Draft" ? "text-slate-500 bg-slate-100 border-slate-200"
  : status === "Pending Signature" ? "text-amber-700 bg-amber-50 border-amber-200"
  : status === "Expired" ? "text-slate-400 bg-slate-50 border-slate-200"
  : status === "Terminated" ? "text-slate-400 bg-slate-50 border-slate-200"
  : "text-rose-700 bg-rose-50 border-rose-200"; // Breach Flagged

const expiryLabel = (c) => {
  if (c.daysToExpiry == null) return "—";
  if (c.daysToExpiry < 0) return `Expired ${Math.abs(c.daysToExpiry)}d ago`;
  return `${c.daysToExpiry}d`;
};

const poStatusColor = (status) =>
  status === "Issued" ? "text-emerald-700 bg-emerald-50 border-emerald-200"
  : status === "Received" ? "text-[#2563EB] bg-[#2563EB]/10 border-[#2563EB]/20"
  : status === "Pending Approval" ? "text-amber-700 bg-amber-50 border-amber-200"
  : status === "Draft" ? "text-slate-500 bg-slate-100 border-slate-200"
  : "text-slate-400 bg-slate-50 border-slate-200";

const severityColor = (sev) =>
  sev === "High" ? "text-rose-700 bg-rose-50 border-rose-200"
  : sev === "Medium" ? "text-amber-700 bg-amber-50 border-amber-200"
  : "text-emerald-700 bg-emerald-50 border-emerald-200";

const INTAKE_TYPE_STYLES = {
  "New Vendor": "bg-[#2563EB]/10 text-[#2563EB]",
  "Service Request": "bg-[#16A34A]/10 text-[#16A34A]",
  "Contract Change": "bg-rose-50 text-rose-600",
  "Contract Request": "bg-rose-50 text-rose-600",
  "New Project": "bg-indigo-50 text-indigo-600",
  "RFx / Sourcing Event": "bg-violet-50 text-violet-600",
  "Purchase Request": "bg-slate-100 text-slate-600",
};
const intakeTypeColor = (type) => INTAKE_TYPE_STYLES[type] || "bg-slate-100 text-slate-600";

/* --------------------------------- shell --------------------------------- */

function KpiCard({ k }) {
  const good = k.trend === "up";
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 flex flex-col gap-3">
      <span className="text-xs font-medium uppercase tracking-wide text-slate-500">{k.label}</span>
      <div className="flex items-end justify-between">
        <span className="font-mono text-3xl font-semibold text-slate-900">{k.value}{k.unit}</span>
        <span className={`flex items-center gap-1 text-xs font-medium ${good ? "text-emerald-600" : "text-amber-600"}`}>
          {good ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
          target {k.target}{k.unit}
        </span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-slate-100">
        <div
          className={`h-1.5 rounded-full ${good ? "bg-[#2563EB]" : "bg-amber-500"}`}
          style={{ width: `${Math.min(100, (k.value / (k.target * 1.15)) * 100)}%` }}
        />
      </div>
    </div>
  );
}

function SectionTitle({ eyebrow, title, action }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <div>
        <div className="text-[11px] font-semibold uppercase tracking-widest text-[#16A34A]">{eyebrow}</div>
        <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
      </div>
      {action}
    </div>
  );
}

// Click-to-edit text field. Renders as plain text with a pencil affordance on hover;
// clicking swaps in an input. Enter/blur saves, Escape cancels.
function EditableText({ value, onSave, placeholder = "—", className = "", inputClassName = "", editable = true }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value || "");

  if (!editable) {
    return <span className={className}>{value || placeholder}</span>;
  }

  if (editing) {
    return (
      <input
        autoFocus
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={() => { onSave(draft.trim()); setEditing(false); }}
        onKeyDown={(e) => {
          if (e.key === "Enter") { onSave(draft.trim()); setEditing(false); }
          if (e.key === "Escape") { setDraft(value || ""); setEditing(false); }
        }}
        className={`rounded border border-[#2563EB] px-1.5 py-0.5 outline-none ${inputClassName || className}`}
      />
    );
  }

  return (
    <button
      onClick={() => { setDraft(value || ""); setEditing(true); }}
      className={`group inline-flex items-center gap-1 text-left hover:bg-slate-50 rounded px-0.5 -mx-0.5 ${className}`}
      title="Click to edit"
    >
      <span className={value ? "" : "text-slate-400 italic"}>{value || placeholder}</span>
      <Edit3 size={11} className="text-slate-300 opacity-0 group-hover:opacity-100 shrink-0" />
    </button>
  );
}

// Click-to-edit select field — used for things like risk rating, status, tier.
// `options` is an array of strings; `null` is always offered as "Not assessed" / clear.
function EditableSelect({ value, options, onSave, renderValue, editable = true, allowClear = true, clearLabel = "Not assessed" }) {
  const [editing, setEditing] = useState(false);

  if (!editable) {
    return renderValue ? renderValue(value) : <span>{value || clearLabel}</span>;
  }

  if (editing) {
    return (
      <select
        autoFocus
        value={value || ""}
        onChange={(e) => { onSave(e.target.value || null); setEditing(false); }}
        onBlur={() => setEditing(false)}
        className="rounded border border-[#2563EB] px-1.5 py-0.5 text-xs outline-none bg-white"
      >
        {allowClear && <option value="">{clearLabel}</option>}
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    );
  }

  return (
    <button onClick={() => setEditing(true)} className="group inline-flex items-center gap-1 hover:opacity-80" title="Click to edit">
      {renderValue ? renderValue(value) : <span>{value || clearLabel}</span>}
      <Edit3 size={10} className="text-slate-300 opacity-0 group-hover:opacity-100 shrink-0" />
    </button>
  );
}

function Dashboard() {
  return (
    <div className="space-y-8">
      <div>
        <SectionTitle eyebrow="Live · updated 2 min ago" title="Enterprise pulse" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {KPIS.map((k) => <KpiCard key={k.label} k={k} />)}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-xl border border-slate-200 bg-white p-5">
          <SectionTitle eyebrow="Spend" title="Planned vs. actual spend ($M)" />
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={SPEND_TREND}>
              <defs>
                <linearGradient id="actual" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2563EB" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#2563EB" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#eef1f3" />
              <XAxis dataKey="m" tick={{ fontSize: 12, fill: "#64748b" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: "#64748b" }} axisLine={false} tickLine={false} />
              <Tooltip />
              <Area type="monotone" dataKey="planned" stroke="#16A34A" strokeDasharray="4 3" fill="none" />
              <Area type="monotone" dataKey="actual" stroke="#2563EB" fill="url(#actual)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <SectionTitle eyebrow="Mix" title="Spend by category" />
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={CATEGORY_SPEND} dataKey="value" nameKey="name" innerRadius={45} outerRadius={80} paddingAngle={2}>
                {CATEGORY_SPEND.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-2 space-y-1.5">
            {CATEGORY_SPEND.slice(0, 4).map((c, i) => (
              <div key={c.name} className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-2 text-slate-600">
                  <span className="h-2 w-2 rounded-full" style={{ background: PIE_COLORS[i] }} />
                  {c.name}
                </span>
                <span className="font-mono text-slate-800">${c.value}M</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div>
        <SectionTitle eyebrow="Autonomous agents" title="Agent activity" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {AGENTS.map((a) => {
            const Icon = a.icon;
            return (
              <div key={a.name} className="rounded-xl border border-slate-200 bg-white p-4 flex gap-3">
                <div className="h-9 w-9 shrink-0 rounded-lg bg-[#0B1220] flex items-center justify-center">
                  <Icon size={16} className="text-[#16A34A]" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-slate-900">{a.name}</span>
                    <span className={`h-1.5 w-1.5 rounded-full ${statusColor(a.status)}`} />
                  </div>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">{a.detail}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* --------------------------------- intake --------------------------------- */

function IntakeTaskLists({ requests, onOpen }) {
  const { openNewRequest } = React.useContext(RequestsContext);
  const [filter, setFilter] = useState("All");
  const [query, setQuery] = useState("");
  const [collapsed, setCollapsed] = useState({ Closed: true });
  const types = ["All", ...REQUEST_TYPES.map((t) => t.id), "Contract Change"];
  const filtered = requests
    .filter((r) => filter === "All" || r.type === filter)
    .filter((r) => {
      const q = query.trim().toLowerCase();
      if (!q) return true;
      return r.title.toLowerCase().includes(q) || r.id.toLowerCase().includes(q) || r.requester.toLowerCase().includes(q);
    });

  return (
    <div>
      <SectionTitle eyebrow="Single front door" title="Intake requests"
        action={<button onClick={() => openNewRequest(null)} className="flex items-center gap-1.5 rounded-lg bg-[#0B1220] text-white text-sm px-3 py-2 hover:bg-slate-800"><Plus size={14}/>New intake</button>} />

      <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 mb-4">
        <Search size={15} className="text-slate-400" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by title, ID, or requester…"
          className="flex-1 outline-none text-sm placeholder:text-slate-400"
        />
      </div>

      <div className="flex flex-wrap gap-2 mb-5">
        {types.map((t) => (
          <button key={t} onClick={() => setFilter(t)}
            className={`text-xs rounded-full border px-3 py-1.5 font-medium transition-colors ${
              filter === t ? "bg-[#0B1220] text-white border-[#0B1220]" : "border-slate-200 text-slate-500 hover:border-slate-300"
            }`}>
            {t}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {INTAKE_STAGES.map((stage) => {
          const items = filtered.filter((r) => r.stage === stage);
          const isCollapsed = collapsed[stage];
          return (
            <div key={stage} className="rounded-xl border border-slate-200 bg-white overflow-hidden">
              <button
                onClick={() => setCollapsed((c) => ({ ...c, [stage]: !c[stage] }))}
                className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 hover:bg-slate-100/70 transition-colors"
              >
                <span className="flex items-center gap-2">
                  <span className={`h-2 w-2 rounded-full ${stageDotColor(stage)}`} />
                  <span className="text-sm font-semibold text-slate-700">{stage}</span>
                  <span className="text-xs font-mono text-slate-400">{items.length}</span>
                </span>
                <ChevronRight size={16} className={`text-slate-400 transition-transform ${isCollapsed ? "" : "rotate-90"}`} />
              </button>

              {!isCollapsed && (
                <div className="divide-y divide-slate-100">
                  {items.map((r) => {
                    const lastDisposition = (r.dispositions || [])[r.dispositions?.length - 1];
                    return (
                      <button key={r.id} onClick={() => onOpen(r.id)} className="w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-slate-50/60 transition-colors">
                        <span className={`h-2 w-2 rounded-full shrink-0 ${stageDotColor(r.stage)}`} />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium text-slate-800 truncate">{r.title}</p>
                            <span className={`text-[10px] font-medium rounded-full px-2 py-0.5 shrink-0 ${intakeTypeColor(r.type)}`}>{r.type}</span>
                            {r.locked && <Lock size={11} className="text-slate-300 shrink-0" />}
                          </div>
                          <p className="text-xs text-slate-400 mt-0.5 truncate">
                            {r.requester}{r.project ? ` · ${r.project}` : ""}{lastDisposition ? ` · ${lastDisposition.action}` : ""}
                          </p>
                        </div>
                        <span className="text-[10px] font-mono text-slate-300 shrink-0">{r.id}</span>
                        <ChevronRight size={14} className="text-slate-300 shrink-0" />
                      </button>
                    );
                  })}
                  {items.length === 0 && (
                    <p className="text-xs text-slate-400 italic px-4 py-3">No requests in this stage.</p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

const INTAKE_FLOW_ROLES = {
  "New": "Requester",
  "Triage": "AI Triage Agent",
  "Routed": "Category Owner",
  "In Progress": "Fulfillment Team",
  "Closed": "Complete",
};

function RequestWorkflowFlow({ request }) {
  const currentIdx = INTAKE_STAGES.indexOf(request.stage);
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 mb-6 overflow-x-auto">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-4">Request workflow</p>
      <div className="flex items-start gap-2 min-w-max">
        {INTAKE_STAGES.map((stage, i) => {
          const state = i < currentIdx ? "done" : i === currentIdx ? "current" : "upcoming";
          return (
            <React.Fragment key={stage}>
              <div className="flex flex-col items-center gap-2 w-32 text-center">
                <div className={`h-10 w-10 rounded-full flex items-center justify-center border-2 ${
                  state === "done" ? "border-emerald-500 bg-emerald-50" :
                  state === "current" ? "border-[#2563EB] bg-[#2563EB]/10" :
                  "border-slate-200 bg-slate-50"
                }`}>
                  {state === "done" ? <CheckCircle2 size={18} className="text-emerald-500" /> :
                   state === "current" ? <Clock size={18} className="text-[#2563EB]" /> :
                   <span className="h-2 w-2 rounded-full bg-slate-300" />}
                </div>
                <div>
                  <p className={`text-xs font-medium ${state === "upcoming" ? "text-slate-400" : "text-slate-800"}`}>{stage}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {stage === "New" ? request.requester : INTAKE_FLOW_ROLES[stage]}
                  </p>
                </div>
              </div>
              {i < INTAKE_STAGES.length - 1 && (
                <div className={`h-px flex-1 mt-5 ${i < currentIdx ? "bg-emerald-300" : "bg-slate-200"}`} style={{ minWidth: 24 }} />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}

function IntakeDetail({ request, onBack, onUpdate }) {
  const { suppliers, services, projects, addContract, addService, addSourcingEvent, onboardSupplier, navigateTo, navigateWithFocus, currentUser } = React.useContext(RequestsContext);
  const [action, setAction] = useState(null);
  const [supplierPick, setSupplierPick] = useState(request.supplier || suppliers[0].name);
  const [newSupplierName, setNewSupplierName] = useState("");
  const [servicePick, setServicePick] = useState(services[0]?.name || "");
  const [supplierCount, setSupplierCount] = useState("5");
  const [done, setDone] = useState(false);
  const [createdLink, setCreatedLink] = useState(null);
  const [forceUnlock, setForceUnlock] = useState(false);

  const actions = DISPOSITION_ACTIONS[request.type] || DEFAULT_DISPOSITIONS;
  const supplierNames = suppliers.map((s) => s.name);
  const requestSupplierIsNew = request.supplier && !supplierNames.includes(request.supplier);
  const dispositions = request.dispositions || [];
  const isLocked = request.locked && !forceUnlock;
  const linkedProject = request.project ? projects.find((p) => p.name === request.project) : null;
  const recommendedId = DISPOSITION_RECOMMENDATIONS[request.type];
  const recommendedAction = actions.find((a) => a.id === recommendedId);

  const apply = (act) => {
    let note = act.label;
    let link = null;

    if (act.id === "new_contract" || act.id === "amend") {
      const effectiveSupplier = supplierPick === "__new__" ? newSupplierName.trim() : supplierPick;
      if (!effectiveSupplier) return;
      const isNewSupplier = !supplierNames.some((n) => n.toLowerCase() === effectiveSupplier.toLowerCase());

      const contractId = `CT-${Math.floor(2000 + Math.random() * 900)}`;
      const contractName = `${effectiveSupplier} — ${act.id === "amend" ? "Amendment" : "New Service Agreement"}`;
      let serviceName = null;

      if (isNewSupplier) {
        onboardSupplier(effectiveSupplier, request.category);
        serviceName = `${effectiveSupplier} — Initial Service`;
        addService({
          id: `SV-${Math.floor(100 + Math.random() * 800)}`,
          name: serviceName, supplier: effectiveSupplier, contract: contractName,
          category: request.category || "Uncategorized", criticality: "Medium", governance: "Governed",
          riskScore: null, sla: null, lastReview: "Not yet reviewed", owner: request.requester,
          contacts: [
            { name: request.requester, role: "Business Owner", org: "Paradigm" },
            { name: "Unassigned", role: "Vendor Representative", org: effectiveSupplier },
          ],
          complianceDocs: [], slas: [],
          riskAssessment: Object.fromEntries(RISK_CATEGORIES.map((c) => [c, { rating: null, note: null }])),
        });
      }

      addContract({
        id: contractId, name: contractName,
        supplier: effectiveSupplier, service: serviceName,
        type: act.id === "amend" ? "Amendment" : "Service Order",
        status: "Draft", value: request.value || "N/A", effective: "Not yet effective",
        daysToExpiry: null, risk: null, flag: "Newly drafted from intake — terms pending",
        owner: request.requester, governingLaw: "TBD", autoRenew: false,
        summary: `Drafted from intake request ${request.id} ("${request.title}"). Terms not yet finalized.`,
        clauses: [
          { title: "Scope", text: "Scope of work to be defined based on the originating request." },
          { title: "Term", text: "Term and renewal terms pending negotiation." },
        ],
        history: [{ date: "Today", event: `Drafted from intake request ${request.id}` }],
        sourceDocument: request.draftContract || null,
        documents: request.draftContract ? [{ name: request.draftContract.name, sizeKB: request.draftContract.sizeKB, uploadedAt: "Today", uploadedBy: request.requester }] : [],
        notes: [],
      });

      note = isNewSupplier
        ? `${act.label} — ${effectiveSupplier} (new supplier + service + ${contractId} set up as a package)`
        : `${act.label} — ${effectiveSupplier} (${contractId} created)`;
      link = { label: `View ${contractId} in Contracts`, view: "contracts", id: contractId };
    } else if (act.id === "launch_rfp") {
      const id = `RFP-${Math.floor(2300 + Math.random() * 300)}`;
      addSourcingEvent({ id, title: `RFP — ${request.title}`, stage: "Market Scan", suppliers: Number(supplierCount) || 1, savings: "TBD", invitedSuppliers: [] });
      note = `${act.label} — inviting ${supplierCount} suppliers (${id} created)`;
      link = { label: `View ${id} in Sourcing`, view: "sourcing", id };
    } else if (act.id === "onboard") {
      const guess = request.title.replace(/^.*?:\s*/, "").trim() || request.title;
      onboardSupplier(guess, request.category);
      note = `${act.label} — ${guess}`;
      link = { label: "View in Suppliers", view: "suppliers", id: null };
    } else if (act.pick === "service") {
      note = `${act.label} — ${servicePick}`;
      link = { label: "View in Services", view: "services", id: null };
    } else if (act.pick === "supplierCount") {
      note = `${act.label} — inviting ${supplierCount} suppliers`;
    }

    const entry = { id: `D-${Math.floor(100 + Math.random() * 900)}`, action: act.label, note, link, actor: currentUser.name, date: "Today" };
    onUpdate(request.id, { stage: act.stage, dispositions: [...dispositions, entry], locked: true });
    setAction(null);
    setDone(true);
    setCreatedLink(link);
    setForceUnlock(false);
  };

  const openLink = (link) => {
    if (link.id) navigateWithFocus(link.view, link.id);
    else navigateTo(link.view);
  };

  return (
    <div>
      <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 mb-4">
        <ArrowLeft size={15} /> All requests
      </button>

      <div className="flex items-start justify-between mb-6 flex-wrap gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-widest text-[#16A34A] mb-1">{request.type} · {request.id}</p>
          <h2 className="text-xl font-semibold text-slate-900">{request.title}</h2>
          <p className="text-sm text-slate-500 mt-1">Submitted by {request.requester}</p>
        </div>
        <div className="flex items-center gap-2">
          {request.locked && (
            <span className="inline-flex items-center gap-1 text-xs font-medium rounded-full border px-2.5 py-1 border-slate-300 bg-slate-100 text-slate-600">
              <Lock size={11} /> Locked
            </span>
          )}
          <span className="inline-flex items-center gap-1.5 text-xs font-medium rounded-full border px-2.5 py-1 border-slate-200 bg-slate-50 text-slate-600">
            <span className={`h-1.5 w-1.5 rounded-full ${stageDotColor(request.stage)}`} />
            {request.stage}
          </span>
        </div>
      </div>

      <RequestWorkflowFlow request={request} />

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-3">Details</p>
            <div className="grid grid-cols-2 gap-3 text-sm mb-4">
              <div><span className="text-slate-400 text-xs block">Category</span><span className="text-slate-700">{request.category || "—"}{request.subcategory ? ` · ${request.subcategory}` : ""}</span></div>
              <div><span className="text-slate-400 text-xs block">Estimated value</span><span className="text-slate-700 font-mono">{request.value || "—"}</span></div>
              <div><span className="text-slate-400 text-xs block">Needed by</span><span className="text-slate-700">{request.neededBy || "—"}</span></div>
              <div><span className="text-slate-400 text-xs block">Cost center</span><span className="text-slate-700">{request.costCenter || "—"}</span></div>
              <div><span className="text-slate-400 text-xs block">Department</span><span className="text-slate-700">{request.department || "—"}</span></div>
              {request.project && (
                <div><span className="text-slate-400 text-xs block">Linked project</span><span className="text-slate-700">{request.project}</span></div>
              )}
              {request.supplier && (
                <div>
                  <span className="text-slate-400 text-xs block">Preferred supplier</span>
                  <span className="text-slate-700">{request.supplier}{requestSupplierIsNew && <span className="text-amber-600"> (new)</span>}</span>
                </div>
              )}
            </div>
            {request.description && (
              <p className="text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-3">{request.description}</p>
            )}
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-3">Stakeholders</p>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><span className="text-slate-400 text-xs block">Requester</span><span className="text-slate-700">{request.requester}</span></div>
              <div><span className="text-slate-400 text-xs block">Executive sponsor</span><span className="text-slate-700">{request.executiveSponsor || "—"}</span></div>
              <div><span className="text-slate-400 text-xs block">Sourcing manager</span><span className="text-slate-700">{request.sourcingManager || "—"}</span></div>
              <div><span className="text-slate-400 text-xs block">Project manager</span><span className="text-slate-700">{linkedProject ? linkedProject.owner : "—"}</span></div>
            </div>
          </div>

          {(request.attachments?.length > 0 || request.draftContract) && (
            <div className="rounded-xl border border-slate-200 bg-white p-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-3">Documents</p>
              <div className="space-y-2">
                {request.draftContract && (
                  <div className="flex items-center gap-2 rounded-lg bg-slate-50 border border-slate-200 px-3 py-2">
                    <FileCheck2 size={13} className="text-slate-400 shrink-0" />
                    <p className="text-xs text-slate-700">{request.draftContract.name} <span className="text-slate-400">· draft contract · {request.draftContract.sizeKB} KB</span></p>
                  </div>
                )}
                {(request.attachments || []).map((a, i) => (
                  <div key={i} className="flex items-center gap-2 rounded-lg bg-slate-50 border border-slate-200 px-3 py-2">
                    <FileCheck2 size={13} className="text-slate-400 shrink-0" />
                    <p className="text-xs text-slate-700">{a.name} <span className="text-slate-400">· {a.sizeKB} KB</span></p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {request.needsBudgetDisposition && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 flex gap-2.5">
              <AlertTriangle size={16} className="text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-amber-700 mb-0.5">No budget or forecast on file</p>
                <p className="text-sm text-slate-700">This request's category ({request.category}) has no existing budget line. It needs to be dispositioned — either allocate budget for this category or route it elsewhere.</p>
              </div>
            </div>
          )}

          <div className="rounded-xl border border-[#16A34A]/30 bg-[#16A34A]/5 p-4 flex gap-2.5">
            <Sparkles size={16} className="text-[#16A34A] shrink-0 mt-0.5" />
            <p className="text-sm text-slate-700 leading-relaxed">{request.ai}</p>
          </div>

          {request.aiReview?.contractReview && (
            <div className="rounded-xl border border-slate-200 bg-white p-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-3 flex items-center gap-1.5"><Sparkles size={13} className="text-[#16A34A]" /> AI contract review</p>
              <div className="space-y-1.5 text-xs text-slate-600">
                <p>• Preamble: <span className="font-medium">{request.aiReview.contractReview.preamble}</span></p>
                <p>• Grammar: <span className="font-medium">{request.aiReview.contractReview.grammar} issue(s) flagged</span></p>
                <p>• Redundancy: <span className="font-medium">{request.aiReview.contractReview.redundancy}</span></p>
                <p>• Terms: <span className="font-medium">{request.aiReview.contractReview.substandardTerms}</span></p>
              </div>
            </div>
          )}

          {dispositions.length > 0 && (
            <div className="rounded-xl border border-slate-200 bg-white p-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-3">Disposition history</p>
              <div className="space-y-3">
                {dispositions.map((d) => (
                  <div key={d.id} className="flex items-start gap-2.5 pb-3 border-b border-slate-100 last:border-0 last:pb-0">
                    <CheckCircle2 size={14} className="text-emerald-600 shrink-0 mt-0.5" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-slate-700">{d.note}</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">{d.actor} · {d.date}</p>
                      {d.link && (
                        <button onClick={() => openLink(d.link)} className="text-xs font-medium text-[#2563EB] hover:underline flex items-center gap-1 mt-1">
                          {d.link.label} <ArrowRight size={11} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 h-fit">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-3">Disposition actions</p>

          {isLocked ? (
            <div>
              <p className="text-xs text-slate-500 mb-3">
                This request has been dispositioned and is locked. Unlock if additional contracts or actions need to be created from it.
              </p>
              <button onClick={() => setForceUnlock(true)} className="w-full text-xs font-medium text-[#2563EB] hover:underline flex items-center justify-center gap-1 rounded-lg border border-slate-200 py-2">
                <Unlock size={12} /> Unlock to disposition again
              </button>
            </div>
          ) : (
            <>
              {done && (
                <div className="mb-3">
                  <p className="text-xs text-emerald-600 flex items-center gap-1 mb-2"><CheckCircle2 size={13}/>Applied</p>
                  {createdLink && (
                    <button onClick={() => openLink(createdLink)} className="text-xs font-medium text-[#2563EB] hover:underline flex items-center gap-1">
                      {createdLink.label} <ArrowRight size={12} />
                    </button>
                  )}
                </div>
              )}

              {recommendedAction && !action && (
                <div className="rounded-lg border border-[#16A34A]/30 bg-[#16A34A]/5 p-3 mb-3">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-[#16A34A] mb-1 flex items-center gap-1"><Sparkles size={11}/>AI recommends</p>
                  <p className="text-xs text-slate-700 mb-2">{recommendedAction.label}</p>
                  <button onClick={() => (recommendedAction.pick ? setAction(recommendedAction) : apply(recommendedAction))}
                    className="text-xs font-medium text-white bg-[#16A34A] hover:bg-[#128a3e] rounded-lg px-3 py-1.5">
                    Use this recommendation
                  </button>
                </div>
              )}

              {!action && (
                <div className="space-y-2">
                  {actions.map((act) => (
                    <button
                      key={act.id}
                      onClick={() => (act.pick ? setAction(act) : apply(act))}
                      className={`w-full text-left rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors ${
                        act.id === "decline" || act.id === "reject" || act.id === "close"
                          ? "border-slate-200 text-slate-500 hover:border-slate-300"
                          : "border-slate-200 text-slate-700 hover:border-[#2563EB] hover:text-[#2563EB]"
                      }`}
                    >
                      {act.label}
                    </button>
                  ))}
                </div>
              )}

              {action && (
                <div className="space-y-3">
                  <p className="text-xs text-slate-500">{action.label}</p>
                  {action.pick === "supplier" && (
                    <>
                      <select value={supplierPick} onChange={(e) => setSupplierPick(e.target.value)}
                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm bg-white outline-none focus:border-[#2563EB]">
                        {requestSupplierIsNew && <option value={request.supplier}>{request.supplier} (new)</option>}
                        {suppliers.map((s) => <option key={s.name} value={s.name}>{s.name}</option>)}
                        <option value="__new__">+ Add a different new supplier</option>
                      </select>
                      {supplierPick === "__new__" && (
                        <input value={newSupplierName} onChange={(e) => setNewSupplierName(e.target.value)}
                          placeholder="New supplier name"
                          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#2563EB]" />
                      )}
                      {(supplierPick === "__new__" ? newSupplierName.trim() : requestSupplierIsNew && supplierPick === request.supplier) && (
                        <p className="text-[11px] text-amber-600">A new supplier and an initial service will be set up alongside this contract.</p>
                      )}
                    </>
                  )}
                  {action.pick === "service" && (
                    <select value={servicePick} onChange={(e) => setServicePick(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm bg-white outline-none focus:border-[#2563EB]">
                      {services.map((s) => <option key={s.id} value={s.name}>{s.name}</option>)}
                    </select>
                  )}
                  {action.pick === "supplierCount" && (
                    <input type="number" min="1" value={supplierCount} onChange={(e) => setSupplierCount(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#2563EB]" />
                  )}
                  <div className="flex gap-2">
                    <button onClick={() => apply(action)} className="flex-1 rounded-lg bg-[#0B1220] text-white text-sm font-medium px-3 py-2 hover:bg-slate-800">
                      Confirm
                    </button>
                    <button onClick={() => setAction(null)} className="text-sm text-slate-500 hover:text-slate-700 px-2">Cancel</button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function Intake() {
  const { requests, updateRequest } = React.useContext(RequestsContext);
  const [selectedId, setSelectedId] = useState(null);
  const selected = requests.find((r) => r.id === selectedId);

  if (selected) {
    return (
      <IntakeDetail
        request={selected}
        onBack={() => setSelectedId(null)}
        onUpdate={(id, patch) => updateRequest(id, patch)}
      />
    );
  }

  return <IntakeTaskLists requests={requests} onOpen={setSelectedId} />;
}

/* -------------------------------- suppliers -------------------------------- */

function SuppliersTable({ suppliers, onOpen }) {
  const [query, setQuery] = useState("");
  const filtered = suppliers.filter((s) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return s.name.toLowerCase().includes(q) || s.category.toLowerCase().includes(q);
  });

  return (
    <div>
      <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 mb-4">
        <Search size={15} className="text-slate-400" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by supplier or category…"
          className="flex-1 outline-none text-sm placeholder:text-slate-400"
        />
      </div>

      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wide">
            <tr>
              <th className="text-left font-medium px-5 py-3">Supplier</th>
              <th className="text-left font-medium px-5 py-3">Category</th>
              <th className="text-left font-medium px-5 py-3">Owner</th>
              <th className="text-left font-medium px-5 py-3">Risk</th>
              <th className="text-left font-medium px-5 py-3">Annual spend</th>
              <th className="text-left font-medium px-5 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((s) => (
              <tr key={s.id} onClick={() => onOpen(s.id)} className="border-t border-slate-100 hover:bg-slate-50 align-top cursor-pointer">
                <td className="px-5 py-3">
                  <p className="font-medium text-slate-900">{s.name}</p>
                  <p className="text-xs mt-1 flex items-center gap-1">
                    {s.msa
                      ? <span className="text-slate-500 flex items-center gap-1"><FileText size={11} className="shrink-0" /> MSA: {s.msa.name} · expires in {s.msa.expires}</span>
                      : <span className="text-rose-500 flex items-center gap-1 font-medium"><AlertTriangle size={11} className="shrink-0" /> No MSA on file</span>}
                  </p>
                  {s.msa?.flag && (
                    <p className="text-[11px] text-amber-600 mt-1 flex items-center gap-1">
                      <AlertTriangle size={11} className="shrink-0" /> {s.msa.flag}
                    </p>
                  )}
                </td>
                <td className="px-5 py-3 text-slate-600">{s.category}</td>
                <td className="px-5 py-3 text-slate-600">
                  {s.accountOwner
                    ? <span className="flex items-center gap-1"><UserCircle size={12} className="text-slate-300" />{s.accountOwner}</span>
                    : <span className="text-rose-500 font-medium">Unassigned</span>}
                </td>
                <td className="px-5 py-3">
                  {s.risk_score != null
                    ? <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium ${riskColor(s.risk)}`}>
                        {s.risk} · {s.risk_score}
                      </span>
                    : <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 text-slate-400 px-2 py-0.5 text-xs font-medium">
                        Not assessed
                      </span>}
                </td>
                <td className="px-5 py-3 font-mono text-slate-800">{s.spend}</td>
                <td className="px-5 py-3 text-slate-600">
                  <div className="flex items-center justify-between gap-2">
                    {s.status}
                    <ChevronRight size={14} className="text-slate-300 shrink-0" />
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={6} className="px-5 py-8 text-center text-sm text-slate-400">No suppliers match this search.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Consumes a pendingFilter set by navigateWithFilter() when it targets this module,
// converting a one-time "arrive here filtered" signal into persistent local filter state.
function usePendingFilter(viewId) {
  const { pendingFilter, clearPendingFilter } = React.useContext(RequestsContext);
  const [activeFilter, setActiveFilter] = useState(null);
  useEffect(() => {
    if (pendingFilter?.view === viewId) {
      setActiveFilter({ matchFn: pendingFilter.matchFn, label: pendingFilter.label });
      clearPendingFilter();
    }
  }, [pendingFilter]);
  return [activeFilter, setActiveFilter];
}

function FilterChip({ activeFilter, onClear }) {
  if (!activeFilter) return null;
  return (
    <div className="flex items-center gap-2 mb-4">
      <span className="text-xs text-slate-500">Filtered by:</span>
      <span className="inline-flex items-center gap-1.5 text-xs font-medium rounded-full border border-slate-300 bg-slate-100 text-slate-700 px-2.5 py-1">
        {activeFilter.label}
        <button onClick={onClear} className="hover:text-slate-900"><X size={12} /></button>
      </span>
    </div>
  );
}

// A consistent document repository + notes area, meant to be dropped into every record's
// detail page (contracts, suppliers, services, projects, invoices, etc.) the same way.
function RecordDocumentsNotes({ documents = [], notes = [], onAddDocument, onAddNote, editable = true }) {
  const [noteText, setNoteText] = useState("");

  const addDoc = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    onAddDocument({ name: file.name, sizeKB: Math.round(file.size / 1024) });
    e.target.value = "";
  };

  const submitNote = () => {
    if (!noteText.trim()) return;
    onAddNote(noteText.trim());
    setNoteText("");
  };

  return (
    <div className="grid md:grid-cols-2 gap-5">
      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 flex items-center gap-1.5">
            <FolderOpen size={14} className="text-slate-400" /> Document repository
          </p>
          {editable && (
            <label className="text-xs font-medium text-[#2563EB] hover:underline cursor-pointer flex items-center gap-1">
              <Upload size={12} /> Add
              <input type="file" className="hidden" onChange={addDoc} />
            </label>
          )}
        </div>
        {documents.length === 0 ? (
          <p className="text-xs text-slate-400 italic">No documents on file.</p>
        ) : (
          <div className="space-y-2">
            {documents.map((d, i) => (
              <div key={d.id || i} className="flex items-center gap-2 rounded-lg bg-slate-50 border border-slate-200 px-3 py-2">
                <FileCheck2 size={13} className="text-slate-400 shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs font-medium text-slate-700 truncate">{d.name}</p>
                  <p className="text-[11px] text-slate-400">{d.sizeKB ? `${d.sizeKB} KB · ` : ""}{d.uploadedAt || d.importedAt || ""}{d.uploadedBy ? ` · ${d.uploadedBy}` : ""}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-3 flex items-center gap-1.5">
          <MessageSquare size={14} className="text-slate-400" /> Notes
        </p>
        {editable && (
          <div className="mb-3">
            <textarea
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              rows={2}
              placeholder="Add a note for the next person who opens this record…"
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs outline-none focus:border-[#2563EB] resize-none mb-2"
            />
            <button
              onClick={submitNote}
              disabled={!noteText.trim()}
              className={`text-xs font-medium rounded-lg px-3 py-1.5 text-white ${noteText.trim() ? "bg-[#0B1220] hover:bg-slate-800" : "bg-slate-300 cursor-not-allowed"}`}
            >
              Add note
            </button>
          </div>
        )}
        {notes.length === 0 ? (
          <p className="text-xs text-slate-400 italic">No notes yet.</p>
        ) : (
          <div className="space-y-2.5">
            {notes.slice().reverse().map((n, i) => (
              <div key={n.id || i} className="pb-2.5 border-b border-slate-100 last:border-0 last:pb-0">
                <p className="text-xs text-slate-700">{n.text}</p>
                <p className="text-[11px] text-slate-400 mt-0.5">{n.author ? `${n.author} · ` : ""}{n.date}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function RelationshipCard({ icon: Icon, title, count, children, empty, onHeaderClick }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="flex items-center justify-between mb-3">
        {onHeaderClick ? (
          <button onClick={onHeaderClick} className="flex items-center gap-2 group">
            <Icon size={15} className="text-slate-400 group-hover:text-[#2563EB]" />
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 group-hover:text-[#2563EB] group-hover:underline">{title}</p>
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <Icon size={15} className="text-slate-400" />
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{title}</p>
          </div>
        )}
        {count != null && <span className="text-xs font-mono text-slate-400">{count}</span>}
      </div>
      {empty ? <p className="text-xs text-slate-400 italic">{empty}</p> : children}
    </div>
  );
}

function SupplierDetail({ supplier, onBack }) {
  const { contracts, sourcingEvents, projects, purchaseOrders, services, invoices, vendorSlas, businessReviews, navigateWithFocus, navigateWithFilter, currentUser, updateSupplier } = React.useContext(RequestsContext);
  const editable = canEdit(currentUser.role, "Suppliers");

  const supplierContracts = contracts.filter((c) => c.supplier === supplier.name);
  const supplierPOs = purchaseOrders.filter((p) => p.supplier === supplier.name);
  const supplierInvoices = invoices.filter((i) => i.supplier === supplier.name);
  const supplierProjects = projects.filter((p) => p.supplier === supplier.name);
  const supplierRFPs = sourcingEvents.filter((e) => (e.invitedSuppliers || []).includes(supplier.name));
  const supplierServices = services.filter((s) => s.supplier === supplier.name);
  const supplierSlas = vendorSlas.filter((v) => v.supplier === supplier.name);
  const slaIssues = supplierSlas.filter((v) => v.status === "At Risk" || v.status === "Breached").length;
  const heldInvoiceCount = supplierInvoices.filter((i) => i.hold).length;
  const nextReview = businessReviews
    .filter((r) => r.supplier === supplier.name && r.status === "Scheduled")
    .sort((a, b) => a.scheduledDate.localeCompare(b.scheduledDate))[0];
  const overdueReview = businessReviews.find((r) => r.supplier === supplier.name && r.status === "Overdue");

  // Lightweight per-supplier spend forecast: current committed contract value,
  // projected forward using any escalation clause found on file (else a flat 3%).
  const committedValue = supplierContracts.filter((c) => c.status === "Active").reduce((sum, c) => sum + parseMoney(c.value), 0);
  const escalation = findEscalationPct(supplierContracts);
  const projectedGrowth = escalation != null ? escalation : 3;
  const projectedValue = committedValue * (1 + projectedGrowth / 100);

  return (
    <div>
      <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 mb-4">
        <ArrowLeft size={15} /> All suppliers
      </button>

      <div className="flex items-start justify-between mb-6 flex-wrap gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-widest text-[#16A34A] mb-1">{supplier.category} · {supplier.id}</p>
          <h2 className="text-xl font-semibold text-slate-900">{supplier.name}</h2>
          <p className="text-sm text-slate-500 mt-1">{supplier.status} · {supplier.spend} annual spend</p>
          <p className="text-xs text-slate-500 mt-1.5 flex items-center gap-1">
            <UserCircle size={13} className="text-slate-400" />
            Account owner:
            <EditableSelect
              value={supplier.accountOwner}
              options={USERS.map((u) => u.name)}
              editable={editable}
              clearLabel="Unassigned"
              onSave={(v) => updateSupplier(supplier.id, { accountOwner: v || "Unassigned" })}
              renderValue={(v) => <span className={`font-medium ${v ? "text-slate-700" : "text-rose-500"}`}>{v || "Unassigned"}</span>}
            />
          </p>
        </div>
        <EditableSelect
          value={supplier.risk}
          options={["Low", "Medium", "High"]}
          editable={editable}
          clearLabel="Risk not assessed"
          onSave={(v) => {
            const scoreForLevel = { Low: 20, Medium: 50, High: 75 };
            updateSupplier(supplier.id, { risk: v, risk_score: v ? (supplier.risk_score ?? scoreForLevel[v]) : null });
          }}
          renderValue={(v) => v
            ? <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium ${riskColor(v)}`}>{v} risk{supplier.risk_score != null ? ` · ${supplier.risk_score}` : ""}</span>
            : <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 text-slate-400 px-2.5 py-1 text-xs font-medium">Risk not assessed</span>}
        />
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4 mb-6 flex items-center gap-2 text-sm">
        <FileText size={14} className="text-slate-400 shrink-0" />
        {supplier.msa
          ? <span className="text-slate-600">MSA: <span className="font-medium text-slate-800">{supplier.msa.name}</span> · expires in {supplier.msa.expires}</span>
          : <span className="text-rose-500 font-medium flex items-center gap-1.5"><AlertTriangle size={14} /> No MSA on file</span>}
        {supplier.msa?.flag && <span className="ml-auto text-xs text-amber-600 flex items-center gap-1"><AlertTriangle size={12} />{supplier.msa.flag}</span>}
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 mb-6">
        <RelationshipCard icon={Layers} title="Services" count={supplierServices.length} empty={supplierServices.length === 0 ? "No services on file." : null}
          onHeaderClick={supplierServices.length > 0 ? () => navigateWithFilter("services", (s) => s.supplier === supplier.name, supplier.name) : undefined}>
          {supplierServices.map((s) => (
            <button key={s.id} onClick={() => navigateWithFocus("services", s.id)} className="w-full mb-2 last:mb-0 flex items-center justify-between gap-2 hover:bg-slate-50 -mx-1 px-1 py-0.5 rounded transition-colors">
              <p className="text-xs text-[#2563EB] truncate">{s.name}</p>
              <span className={`text-[10px] font-medium rounded-full border px-2 py-0.5 shrink-0 ${governanceColor(s.governance)}`}>{s.governance}</span>
            </button>
          ))}
        </RelationshipCard>

        <RelationshipCard icon={FileText} title="Contracts" count={supplierContracts.length} empty={supplierContracts.length === 0 ? "No service-level contracts on file." : null}
          onHeaderClick={supplierContracts.length > 0 ? () => navigateWithFilter("contracts", (c) => c.supplier === supplier.name, supplier.name) : undefined}>
          {supplierContracts.map((c) => (
            <button key={c.id} onClick={() => navigateWithFocus("contracts", c.id)} className="w-full mb-2 last:mb-0 flex items-center justify-between gap-2 hover:bg-slate-50 -mx-1 px-1 py-0.5 rounded transition-colors">
              <p className="text-xs text-[#2563EB] truncate">{c.name}</p>
              <span className={`text-[10px] font-medium rounded-full border px-2 py-0.5 shrink-0 ${contractStatusColor(c.status)}`}>{c.status}</span>
            </button>
          ))}
        </RelationshipCard>

        <RelationshipCard icon={ClipboardList} title="Purchase orders" count={supplierPOs.length} empty={supplierPOs.length === 0 ? "No POs issued." : null}
          onHeaderClick={supplierPOs.length > 0 ? () => navigateWithFilter("pos", (p) => p.supplier === supplier.name, supplier.name) : undefined}>
          {supplierPOs.map((p) => (
            <div key={p.id} className="mb-2 last:mb-0 flex items-center justify-between gap-2">
              <p className="text-xs font-mono text-slate-700">{p.id}</p>
              <p className="text-xs text-slate-500">{p.amount}</p>
              <span className={`text-[10px] font-medium rounded-full border px-2 py-0.5 shrink-0 ${poStatusColor(p.status)}`}>{p.status}</span>
            </div>
          ))}
        </RelationshipCard>

        <RelationshipCard icon={Receipt} title="Invoices" count={supplierInvoices.length} empty={supplierInvoices.length === 0 ? "No invoices on file." : null}
          onHeaderClick={supplierInvoices.length > 0 ? () => navigateWithFilter("invoices", (i) => i.supplier === supplier.name, supplier.name) : undefined}>
          {supplierInvoices.map((i) => (
            <button key={i.id} onClick={() => navigateWithFocus("invoices", i.id)} className="w-full mb-2 last:mb-0 flex items-center justify-between gap-2 hover:bg-slate-50 -mx-1 px-1 py-0.5 rounded transition-colors">
              <p className="text-xs font-mono text-[#2563EB]">{i.id}</p>
              <p className="text-xs text-slate-500">{i.amount}</p>
              <span className={`text-[10px] font-medium rounded-full border px-2 py-0.5 shrink-0 ${invStatusColor(i.status)}`}>{i.status}</span>
            </button>
          ))}
        </RelationshipCard>

        <RelationshipCard icon={Flag} title="Projects" count={supplierProjects.length} empty={supplierProjects.length === 0 ? "Not linked to any active project." : null}
          onHeaderClick={supplierProjects.length > 0 ? () => navigateWithFilter("projects", (p) => p.supplier === supplier.name, supplier.name) : undefined}>
          {supplierProjects.map((p) => (
            <button key={p.id} onClick={() => navigateWithFocus("projects", p.id)} className="w-full mb-2 last:mb-0 flex items-center justify-between gap-2 hover:bg-slate-50 -mx-1 px-1 py-0.5 rounded transition-colors">
              <p className="text-xs text-[#2563EB] truncate">{p.name}</p>
              <span className={`text-[10px] font-medium rounded-full border px-2 py-0.5 shrink-0 ${projectStatusColor(p.status)}`}>{p.status}</span>
            </button>
          ))}
        </RelationshipCard>

        <RelationshipCard icon={Gavel} title="RFPs invited to" count={supplierRFPs.length} empty={supplierRFPs.length === 0 ? "Not currently invited to any sourcing event." : null}
          onHeaderClick={supplierRFPs.length > 0 ? () => navigateWithFilter("sourcing", (e) => (e.invitedSuppliers || []).includes(supplier.name), supplier.name) : undefined}>
          {supplierRFPs.map((e) => (
            <div key={e.id} className="mb-2 last:mb-0">
              <p className="text-xs text-slate-700">{e.title}</p>
              <p className="text-[11px] text-slate-400">{e.stage} · {e.savings}</p>
            </div>
          ))}
        </RelationshipCard>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Handshake size={15} className="text-slate-400" />
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Vendor management</p>
            </div>
            <span className={`text-[10px] font-medium rounded-full border px-2 py-0.5 ${tierColor(supplier.tier)}`}>{supplier.tier || "Unassigned"}</span>
          </div>
          <div className="space-y-1.5 text-xs mb-3">
            <div className="flex justify-between">
              <span className="text-slate-400">Open SLA issues</span>
              {slaIssues > 0
                ? <span className="font-medium text-amber-600">{slaIssues}</span>
                : <span className="text-slate-500">None</span>}
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Next business review</span>
              <span className={overdueReview ? "font-medium text-rose-600" : "text-slate-500"}>
                {overdueReview ? `Overdue (${overdueReview.scheduledDate})` : nextReview ? `${nextReview.type} · ${nextReview.scheduledDate}` : "None scheduled"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Held invoices</span>
              {heldInvoiceCount > 0
                ? <span className="font-medium text-rose-600">{heldInvoiceCount}</span>
                : <span className="text-slate-500">None</span>}
            </div>
          </div>
          <button onClick={() => navigateWithFocus("vendors", supplier.id)} className="text-xs font-medium text-[#2563EB] hover:underline flex items-center gap-1">
            Open vendor management <ArrowRight size={12} />
          </button>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <div className="flex items-center gap-2 mb-3">
          <LineChartIcon size={15} className="text-slate-400" />
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Spend forecast</p>
        </div>
        {committedValue === 0 ? (
          <p className="text-xs text-slate-400 italic">No active contract value to project from yet.</p>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-xs text-slate-400 mb-1">Current committed (active contracts)</p>
                <p className="font-mono text-xl font-semibold text-slate-900">${committedValue.toFixed(2)}M</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 mb-1">Projected next term</p>
                <p className="font-mono text-xl font-semibold text-[#16A34A]">${projectedValue.toFixed(2)}M</p>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={140}>
              <BarChart data={[
                { name: "Current term", value: Number(committedValue.toFixed(2)) },
                { name: "Projected next term", value: Number(projectedValue.toFixed(2)) },
              ]}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eef1f3" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} />
                <Tooltip />
                <Bar dataKey="value" fill="#2563EB" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
            <p className="text-[11px] text-slate-400 mt-2">
              {escalation != null
                ? `Projection uses the ${escalation}% escalation clause found on this supplier's contract terms.`
                : "No escalation clause on file — projection assumes a flat 3% increase."}
            </p>
          </>
        )}
      </div>

      <div className="mt-6">
        <RecordDocumentsNotes
          documents={supplier.documents || []}
          notes={supplier.notes || []}
          editable={editable}
          onAddDocument={(doc) => updateSupplier(supplier.id, { documents: [...(supplier.documents || []), { ...doc, uploadedAt: "Today", uploadedBy: currentUser.name }] })}
          onAddNote={(text) => updateSupplier(supplier.id, { notes: [...(supplier.notes || []), { text, author: currentUser.name, date: "Today" }] })}
        />
      </div>
    </div>
  );
}

function Suppliers() {
  const { openNewRequest, suppliers, pendingFocus, clearFocus, currentUser } = React.useContext(RequestsContext);
  const [selectedId, setSelectedId] = useState(null);
  const selected = suppliers.find((s) => s.id === selectedId);

  useEffect(() => {
    if (pendingFocus?.view === "suppliers" && pendingFocus.id) {
      setSelectedId(pendingFocus.id);
      clearFocus();
    }
  }, [pendingFocus]);

  if (selected) {
    return <SupplierDetail supplier={selected} onBack={() => setSelectedId(null)} />;
  }

  return (
    <div>
      <SectionTitle eyebrow="Supplier lifecycle · onboarding & risk" title="Supplier registry"
        action={
          canEdit(currentUser.role, "Suppliers")
            ? <button onClick={() => openNewRequest("New Vendor")} className="flex items-center gap-1.5 rounded-lg bg-[#0B1220] text-white text-sm px-3 py-2 hover:bg-slate-800"><Plus size={14}/>Onboard supplier</button>
            : <Gated role={currentUser.role} module="Suppliers" fallbackLabel="Onboard supplier" />
        } />
      <p className="text-xs text-slate-500 -mt-3 mb-5 max-w-2xl">
        The Master Services Agreement (MSA) is tracked here at the supplier level. Click any supplier
        to see its full relationship — services, contracts, POs, invoices, projects, and RFP invitations.
      </p>
      <SuppliersTable suppliers={suppliers} onOpen={setSelectedId} />
    </div>
  );
}

/* ----------------------------- vendor management ----------------------------- */

function VendorManagementLanding({ onOpen }) {
  const { suppliers, businessReviews, vendorSlas, invoices } = React.useContext(RequestsContext);
  const [query, setQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState(null); // { type: "tier"|"upcoming"|"overdue", value? }

  const upcoming = businessReviews.filter((r) => r.status === "Scheduled");
  const completed = businessReviews.filter((r) => r.status.startsWith("Completed"));
  const onTime = completed.filter((r) => r.status === "Completed On-Time");
  const onTimePct = completed.length ? Math.round((onTime.length / completed.length) * 100) : null;
  const overdue = businessReviews.filter((r) => r.status === "Overdue");

  const tierCounts = Object.fromEntries(VENDOR_TIER_META.map((t) => [t.tier, suppliers.filter((s) => s.tier === t.tier).length]));

  const toggleTierFilter = (tier) => setActiveFilter((f) => (f?.type === "tier" && f.value === tier ? null : { type: "tier", value: tier }));
  const toggleReviewFilter = (type) => setActiveFilter((f) => (f?.type === type ? null : { type }));

  const suppliersWithUpcoming = new Set(upcoming.map((r) => r.supplier));
  const suppliersWithOverdue = new Set(overdue.map((r) => r.supplier));

  const filtered = suppliers.filter((s) => {
    const q = query.trim().toLowerCase();
    if (q && !(s.name.toLowerCase().includes(q) || (s.tier || "").toLowerCase().includes(q))) return false;
    if (activeFilter?.type === "tier" && s.tier !== activeFilter.value) return false;
    if (activeFilter?.type === "upcoming" && !suppliersWithUpcoming.has(s.name)) return false;
    if (activeFilter?.type === "overdue" && !suppliersWithOverdue.has(s.name)) return false;
    return true;
  });

  return (
    <div>
      <SectionTitle eyebrow="Relationship, SLAs & governance" title="Vendor management" />

      <p className="text-xs text-slate-500 -mt-3 mb-4">Click any card below to filter the vendor list.</p>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        {VENDOR_TIER_META.map((t) => {
          const active = activeFilter?.type === "tier" && activeFilter.value === t.tier;
          return (
            <button
              key={t.tier}
              onClick={() => toggleTierFilter(t.tier)}
              className={`text-left rounded-xl border p-4 transition-colors ${active ? "border-slate-400 bg-slate-50 ring-1 ring-slate-300" : "border-slate-200 bg-white hover:border-slate-300"}`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ background: t.color }} />
                <span className="text-xs font-medium text-slate-500 uppercase tracking-wide truncate">{t.tier}</span>
              </div>
              <p className="font-mono text-2xl font-semibold text-slate-900">{tierCounts[t.tier] || 0}</p>
              <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">{t.description}</p>
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <button
          onClick={() => toggleReviewFilter("upcoming")}
          className={`text-left rounded-xl border p-4 transition-colors ${activeFilter?.type === "upcoming" ? "border-[#2563EB] bg-[#2563EB]/5 ring-1 ring-[#2563EB]/30" : "border-slate-200 bg-white hover:border-slate-300"}`}
        >
          <div className="flex items-center gap-2 mb-1">
            <CalendarCheck size={14} className="text-[#2563EB]" />
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Upcoming business reviews</p>
          </div>
          <p className="font-mono text-2xl font-semibold text-slate-900">{upcoming.length}</p>
        </button>

        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle2 size={14} className="text-emerald-600" />
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">On-time reviews delivered</p>
          </div>
          <p className="font-mono text-2xl font-semibold text-slate-900">{onTimePct != null ? `${onTimePct}%` : "—"}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">{onTime.length} of {completed.length} completed on schedule</p>
        </div>

        <button
          onClick={() => toggleReviewFilter("overdue")}
          className={`text-left rounded-xl border p-4 transition-colors ${
            activeFilter?.type === "overdue" ? "border-rose-400 bg-rose-50 ring-1 ring-rose-300" : overdue.length > 0 ? "border-rose-200 bg-rose-50/40 hover:border-rose-300" : "border-slate-200 bg-white hover:border-slate-300"
          }`}
        >
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle size={14} className={overdue.length > 0 ? "text-rose-500" : "text-slate-400"} />
            <p className={`text-xs font-medium uppercase tracking-wide ${overdue.length > 0 ? "text-rose-500" : "text-slate-500"}`}>Overdue reviews</p>
          </div>
          <p className={`font-mono text-2xl font-semibold ${overdue.length > 0 ? "text-rose-600" : "text-slate-900"}`}>{overdue.length}</p>
        </button>
      </div>

      <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 mb-4">
        <Search size={15} className="text-slate-400" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by vendor or tier…"
          className="flex-1 outline-none text-sm placeholder:text-slate-400"
        />
      </div>

      {activeFilter && (
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xs text-slate-500">Filtered by:</span>
          <span className="inline-flex items-center gap-1.5 text-xs font-medium rounded-full border border-slate-300 bg-slate-100 text-slate-700 px-2.5 py-1">
            {activeFilter.type === "tier" ? `${activeFilter.value} tier` : activeFilter.type === "upcoming" ? "Upcoming review" : "Overdue review"}
            <button onClick={() => setActiveFilter(null)} className="hover:text-slate-900"><X size={12} /></button>
          </span>
        </div>
      )}

      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wide">
            <tr>
              <th className="text-left font-medium px-5 py-3">Vendor</th>
              <th className="text-left font-medium px-5 py-3">Tier</th>
              <th className="text-left font-medium px-5 py-3">Next business review</th>
              <th className="text-left font-medium px-5 py-3">SLA issues</th>
              <th className="text-left font-medium px-5 py-3">Held invoices</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((s) => {
              const nextReview = businessReviews
                .filter((r) => r.supplier === s.name && r.status === "Scheduled")
                .sort((a, b) => a.scheduledDate.localeCompare(b.scheduledDate))[0];
              const slaIssues = vendorSlas.filter((v) => v.supplier === s.name && (v.status === "At Risk" || v.status === "Breached")).length;
              const heldInvoices = invoices.filter((i) => i.supplier === s.name && i.hold).length;
              return (
                <tr key={s.id} onClick={() => onOpen(s.id)} className="border-t border-slate-100 hover:bg-slate-50 cursor-pointer">
                  <td className="px-5 py-3 font-medium text-slate-900">{s.name}</td>
                  <td className="px-5 py-3">
                    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${tierColor(s.tier)}`}>{s.tier || "Unassigned"}</span>
                  </td>
                  <td className="px-5 py-3 text-slate-500">{nextReview ? `${nextReview.type} · ${nextReview.scheduledDate}` : "—"}</td>
                  <td className="px-5 py-3">
                    {slaIssues > 0
                      ? <span className="inline-flex items-center rounded-full border border-amber-200 bg-amber-50 text-amber-700 px-2 py-0.5 text-xs font-medium">{slaIssues}</span>
                      : <span className="text-xs text-slate-300">—</span>}
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center justify-between gap-2">
                      {heldInvoices > 0
                        ? <span className="inline-flex items-center rounded-full border border-rose-200 bg-rose-50 text-rose-700 px-2 py-0.5 text-xs font-medium">{heldInvoices}</span>
                        : <span className="text-xs text-slate-300">—</span>}
                      <ChevronRight size={14} className="text-slate-300 shrink-0" />
                    </div>
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr><td colSpan={5} className="px-5 py-8 text-center text-sm text-slate-400">No vendors match this filter.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function VendorSlaSection({ supplier }) {
  const { vendorSlas, addVendorSla, updateVendorSla, currentUser } = React.useContext(RequestsContext);
  const [mode, setMode] = useState(null); // "establish" | { enforce: slaId }
  const [metric, setMetric] = useState("");
  const [target, setTarget] = useState("");
  const [enforceAction, setEnforceAction] = useState("");
  const [enforceNote, setEnforceNote] = useState("");
  const editable = canEdit(currentUser.role, "Suppliers");

  const slas = vendorSlas.filter((s) => s.supplier === supplier.name);

  const establish = () => {
    if (!metric.trim() || !target.trim()) return;
    addVendorSla({
      id: `VSLA-${Math.floor(100 + Math.random() * 800)}`,
      supplier: supplier.name, metric: metric.trim(), target: target.trim(), actual: "—",
      status: "Monitoring", enforcement: null,
    });
    setMetric(""); setTarget(""); setMode(null);
  };

  const enforce = (slaId) => {
    if (!enforceAction.trim()) return;
    updateVendorSla(slaId, { enforcement: { action: enforceAction.trim(), date: "Today", note: enforceNote.trim() } });
    setEnforceAction(""); setEnforceNote(""); setMode(null);
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <ShieldCheck size={15} className="text-slate-400" />
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">SLAs — established, monitored, enforced</p>
        </div>
        {editable
          ? <button onClick={() => setMode(mode === "establish" ? null : "establish")} className="text-xs font-medium text-[#2563EB] hover:underline flex items-center gap-1"><Plus size={12}/>Establish SLA</button>
          : <Gated role={currentUser.role} module="Suppliers" fallbackLabel="Establish SLA" />}
      </div>

      {mode === "establish" && (
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 mb-3 space-y-2">
          <input value={metric} onChange={(e) => setMetric(e.target.value)} placeholder="Metric (e.g. On-Time Delivery)"
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#2563EB]" />
          <input value={target} onChange={(e) => setTarget(e.target.value)} placeholder="Target (e.g. 97%)"
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#2563EB]" />
          <div className="flex gap-2">
            <button onClick={establish} className="rounded-lg bg-[#0B1220] text-white text-xs font-medium px-3 py-1.5 hover:bg-slate-800">Establish</button>
            <button onClick={() => setMode(null)} className="text-xs text-slate-500 hover:text-slate-700 px-2">Cancel</button>
          </div>
        </div>
      )}

      {slas.length === 0 && <p className="text-xs text-slate-400 italic">No SLAs established yet.</p>}

      <div className="space-y-3">
        {slas.map((s) => (
          <div key={s.id} className="border-b border-slate-100 last:border-0 pb-3 last:pb-0">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-slate-700">{s.metric}</span>
              <span className={`text-[10px] font-medium rounded-full border px-2 py-0.5 ${slaStatusColor(s.status)}`}>{s.status}</span>
            </div>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-slate-400">Target: {s.target}</span>
              <span className="font-mono text-slate-700">{s.actual}</span>
            </div>
            {s.note && <p className="text-[11px] text-slate-400 italic">{s.note}</p>}
            {s.enforcement && (
              <div className="mt-1.5 flex items-start gap-1.5 text-[11px] text-rose-600">
                <ShieldAlert size={11} className="shrink-0 mt-0.5" />
                <span><span className="font-medium">{s.enforcement.action}</span> ({s.enforcement.date}) — {s.enforcement.note}</span>
              </div>
            )}
            {!s.enforcement && (s.status === "At Risk" || s.status === "Breached") && editable && (
              mode && mode.enforce === s.id ? (
                <div className="mt-2 rounded-lg border border-rose-200 bg-rose-50/50 p-2.5 space-y-2">
                  <input value={enforceAction} onChange={(e) => setEnforceAction(e.target.value)} placeholder="Enforcement action (e.g. Service credit invoked)"
                    className="w-full rounded-lg border border-rose-200 px-2.5 py-1.5 text-xs outline-none focus:border-rose-400" />
                  <textarea value={enforceNote} onChange={(e) => setEnforceNote(e.target.value)} rows={2} placeholder="Note"
                    className="w-full rounded-lg border border-rose-200 px-2.5 py-1.5 text-xs outline-none focus:border-rose-400 resize-none" />
                  <div className="flex gap-2">
                    <button onClick={() => enforce(s.id)} className="rounded-lg bg-rose-600 text-white text-xs font-medium px-3 py-1.5 hover:bg-rose-700">Log enforcement</button>
                    <button onClick={() => setMode(null)} className="text-xs text-slate-500 hover:text-slate-700 px-2">Cancel</button>
                  </div>
                </div>
              ) : (
                <button onClick={() => setMode({ enforce: s.id })} className="mt-1.5 text-[11px] font-medium text-rose-600 hover:underline flex items-center gap-1">
                  <ShieldAlert size={11} /> Log enforcement action
                </button>
              )
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function VendorReviewsSection({ supplier }) {
  const { businessReviews, scheduleReview, updateReview, currentUser } = React.useContext(RequestsContext);
  const [mode, setMode] = useState(null); // "schedule" | { complete: reviewId }
  const [type, setType] = useState("QBR");
  const [date, setDate] = useState("");
  const [completedDate, setCompletedDate] = useState("");
  const [notes, setNotes] = useState("");
  const editable = canEdit(currentUser.role, "Suppliers");

  const reviews = businessReviews.filter((r) => r.supplier === supplier.name).sort((a, b) => b.scheduledDate.localeCompare(a.scheduledDate));

  const schedule = () => {
    if (!date) return;
    scheduleReview({ id: `BR-${Math.floor(100 + Math.random() * 800)}`, supplier: supplier.name, type, scheduledDate: date, status: "Scheduled", notes: null });
    setDate(""); setType("QBR"); setMode(null);
  };

  const complete = (review) => {
    if (!completedDate) return;
    const onTime = completedDate <= review.scheduledDate;
    updateReview(review.id, { status: onTime ? "Completed On-Time" : "Completed Late", completedDate, notes: notes.trim() || null });
    setCompletedDate(""); setNotes(""); setMode(null);
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <CalendarCheck size={15} className="text-slate-400" />
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Business reviews — scheduled & documented</p>
        </div>
        {editable
          ? <button onClick={() => setMode(mode === "schedule" ? null : "schedule")} className="text-xs font-medium text-[#2563EB] hover:underline flex items-center gap-1"><Plus size={12}/>Schedule review</button>
          : <Gated role={currentUser.role} module="Suppliers" fallbackLabel="Schedule review" />}
      </div>

      {mode === "schedule" && (
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 mb-3 space-y-2">
          <select value={type} onChange={(e) => setType(e.target.value)} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm bg-white outline-none focus:border-[#2563EB]">
            {["QBR", "MBR", "Annual Review"].map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#2563EB]" />
          <div className="flex gap-2">
            <button onClick={schedule} className="rounded-lg bg-[#0B1220] text-white text-xs font-medium px-3 py-1.5 hover:bg-slate-800">Schedule</button>
            <button onClick={() => setMode(null)} className="text-xs text-slate-500 hover:text-slate-700 px-2">Cancel</button>
          </div>
        </div>
      )}

      {reviews.length === 0 && <p className="text-xs text-slate-400 italic">No business reviews on file yet.</p>}

      <div className="space-y-3">
        {reviews.map((r) => (
          <div key={r.id} className="border-b border-slate-100 last:border-0 pb-3 last:pb-0">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-slate-700">{r.type} · {r.scheduledDate}</span>
              <span className={`text-[10px] font-medium rounded-full border px-2 py-0.5 ${reviewStatusColor(r.status)}`}>{r.status}</span>
            </div>
            {r.notes && <p className="text-xs text-slate-500 leading-relaxed">{r.notes}</p>}
            {(r.status === "Scheduled" || r.status === "Overdue") && editable && (
              mode && mode.complete === r.id ? (
                <div className="mt-2 rounded-lg border border-slate-200 bg-slate-50 p-2.5 space-y-2">
                  <input type="date" value={completedDate} onChange={(e) => setCompletedDate(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs outline-none focus:border-[#2563EB]" />
                  <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} placeholder="What was discussed / decided?"
                    className="w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs outline-none focus:border-[#2563EB] resize-none" />
                  <div className="flex gap-2">
                    <button onClick={() => complete(r)} className="rounded-lg bg-[#0B1220] text-white text-xs font-medium px-3 py-1.5 hover:bg-slate-800">Mark complete</button>
                    <button onClick={() => setMode(null)} className="text-xs text-slate-500 hover:text-slate-700 px-2">Cancel</button>
                  </div>
                </div>
              ) : (
                <button onClick={() => setMode({ complete: r.id })} className="mt-1 text-[11px] font-medium text-[#2563EB] hover:underline flex items-center gap-1">
                  <CheckCircle2 size={11} /> Mark complete & document
                </button>
              )
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function VendorInvoicesSection({ supplier }) {
  const { invoices, updateInvoice, currentUser, navigateWithFilter } = React.useContext(RequestsContext);
  const [holdDraft, setHoldDraft] = useState(null); // invoice id being placed on hold
  const [holdReason, setHoldReason] = useState("");
  const editable = canEdit(currentUser.role, "Suppliers");

  const supplierInvoices = invoices.filter((i) => i.supplier === supplier.name);

  const placeHold = (id) => {
    if (!holdReason.trim()) return;
    updateInvoice(id, { hold: true, holdReason: holdReason.trim() });
    setHoldDraft(null); setHoldReason("");
  };
  const releaseHold = (id) => updateInvoice(id, { hold: false, holdReason: null });
  const decideOverage = (id, approved) => updateInvoice(id, { overage: { ...supplierInvoices.find((i) => i.id === id).overage, approved } });

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      {supplierInvoices.length > 0 ? (
        <button onClick={() => navigateWithFilter("invoices", (i) => i.supplier === supplier.name, supplier.name)} className="flex items-center gap-2 mb-3 group">
          <Receipt size={15} className="text-slate-400 group-hover:text-[#2563EB]" />
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 group-hover:text-[#2563EB] group-hover:underline">Invoices — hold status & overage approvals</p>
        </button>
      ) : (
        <div className="flex items-center gap-2 mb-3">
          <Receipt size={15} className="text-slate-400" />
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Invoices — hold status & overage approvals</p>
        </div>
      )}

      {supplierInvoices.length === 0 && <p className="text-xs text-slate-400 italic">No invoices on file.</p>}

      <div className="space-y-3">
        {supplierInvoices.map((i) => (
          <div key={i.id} className="border-b border-slate-100 last:border-0 pb-3 last:pb-0">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-mono text-slate-700">{i.id}</span>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-slate-600">{i.amount}</span>
                <span className={`text-[10px] font-medium rounded-full border px-2 py-0.5 ${invStatusColor(i.status)}`}>{i.status}</span>
              </div>
            </div>

            {i.hold ? (
              <div className="flex items-center justify-between gap-2 mt-1">
                <p className="text-[11px] text-rose-600 flex items-center gap-1"><Lock size={11}/>{i.holdReason}</p>
                {editable && (
                  <button onClick={() => releaseHold(i.id)} className="text-[11px] font-medium text-[#2563EB] hover:underline flex items-center gap-1 shrink-0">
                    <Unlock size={11}/>Release
                  </button>
                )}
              </div>
            ) : holdDraft === i.id ? (
              <div className="mt-2 rounded-lg border border-slate-200 bg-slate-50 p-2.5 space-y-2">
                <input value={holdReason} onChange={(e) => setHoldReason(e.target.value)} placeholder="Reason for hold"
                  className="w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs outline-none focus:border-[#2563EB]" />
                <div className="flex gap-2">
                  <button onClick={() => placeHold(i.id)} className="rounded-lg bg-rose-600 text-white text-xs font-medium px-3 py-1.5 hover:bg-rose-700">Place on hold</button>
                  <button onClick={() => setHoldDraft(null)} className="text-xs text-slate-500 hover:text-slate-700 px-2">Cancel</button>
                </div>
              </div>
            ) : editable ? (
              <button onClick={() => setHoldDraft(i.id)} className="text-[11px] font-medium text-slate-500 hover:text-rose-600 flex items-center gap-1 mt-1">
                <Lock size={11}/>Place on hold
              </button>
            ) : null}

            {i.overage && (
              <div className="mt-2 rounded-lg border border-amber-200 bg-amber-50/50 p-2.5">
                <p className="text-[11px] text-amber-700 flex items-center gap-1 mb-1"><AlertTriangle size={11}/>{i.overage.amount}</p>
                <p className="text-[11px] text-slate-500 mb-1.5">{i.overage.note}</p>
                {i.overage.approved === null ? (
                  editable ? (
                    <div className="flex gap-2">
                      <button onClick={() => decideOverage(i.id, true)} className="text-[11px] font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg px-2.5 py-1">Approve overage</button>
                      <button onClick={() => decideOverage(i.id, false)} className="text-[11px] font-medium text-white bg-rose-600 hover:bg-rose-700 rounded-lg px-2.5 py-1">Reject</button>
                    </div>
                  ) : <Gated role={currentUser.role} module="Suppliers" level="approve" fallbackLabel="Approve overage" />
                ) : (
                  <span className={`text-[11px] font-medium ${i.overage.approved ? "text-emerald-600" : "text-rose-600"}`}>
                    {i.overage.approved ? "Overage approved" : "Overage rejected"}
                  </span>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function VendorDetail({ supplier, onBack }) {
  const { navigateWithFocus } = React.useContext(RequestsContext);
  return (
    <div>
      <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 mb-4">
        <ArrowLeft size={15} /> All vendors
      </button>

      <div className="flex items-start justify-between mb-6 flex-wrap gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-widest text-[#16A34A] mb-1">{supplier.category}</p>
          <h2 className="text-xl font-semibold text-slate-900">{supplier.name}</h2>
          <button onClick={() => navigateWithFocus("suppliers", supplier.id)} className="text-xs text-[#2563EB] hover:underline mt-1">
            View full supplier profile →
          </button>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-xs font-medium rounded-full border px-2.5 py-1 ${tierColor(supplier.tier)}`}>{supplier.tier || "Unassigned"} tier</span>
          {supplier.risk_score != null
            ? <span className={`text-xs font-medium rounded-full border px-2.5 py-1 ${riskColor(supplier.risk)}`}>{supplier.risk} risk</span>
            : <span className="text-xs font-medium rounded-full border border-slate-200 bg-slate-50 text-slate-400 px-2.5 py-1">Risk not assessed</span>}
        </div>
      </div>

      <div className="space-y-6">
        <VendorSlaSection supplier={supplier} />
        <VendorReviewsSection supplier={supplier} />
        <VendorInvoicesSection supplier={supplier} />
      </div>
    </div>
  );
}

function VendorManagement() {
  const { suppliers, pendingFocus, clearFocus } = React.useContext(RequestsContext);
  const [selectedId, setSelectedId] = useState(null);
  const selected = suppliers.find((s) => s.id === selectedId);

  useEffect(() => {
    if (pendingFocus?.view === "vendors" && pendingFocus.id) {
      setSelectedId(pendingFocus.id);
      clearFocus();
    }
  }, [pendingFocus]);

  if (selected) {
    return <VendorDetail supplier={selected} onBack={() => setSelectedId(null)} />;
  }

  return <VendorManagementLanding onOpen={setSelectedId} />;
}

/* --------------------------------- sourcing --------------------------------- */

const SOURCING_EVENTS = [
  { id: "RFP-2201", title: "Freight Services — RFP 2026-Q3", stage: "Bid Evaluation", suppliers: 6, savings: "$820K est.",
    invitedSuppliers: ["Northwind Logistics", "Meridian Steel Co."] },
  { id: "RFP-2198", title: "IT Hardware Refresh — RFQ", stage: "Award Optimization", suppliers: 4, savings: "$310K est.",
    invitedSuppliers: ["Vantage Cloud Systems", "Crescent Analytics"] },
  { id: "RFP-2190", title: "MRO Consolidation — RFI", stage: "Market Scan", suppliers: 9, savings: "$140K est.",
    invitedSuppliers: ["Halcyon Facilities Group", "Orbital Marketing Partners", "Meridian Steel Co."] },
];

function Sourcing() {
  const { openNewRequest, sourcingEvents } = React.useContext(RequestsContext);
  const [activeFilter, setActiveFilter] = usePendingFilter("sourcing");
  const filteredEvents = sourcingEvents.filter((e) => !activeFilter || activeFilter.matchFn(e));
  return (
    <div>
      <SectionTitle eyebrow="Strategic sourcing" title="Active sourcing events"
        action={
          <div className="flex gap-2">
            <button onClick={() => openNewRequest("RFx / Sourcing Event")} className="flex items-center gap-1.5 rounded-lg border border-slate-200 text-slate-600 text-sm px-3 py-2 hover:border-slate-300"><Plus size={14}/>Request RFx</button>
            <button className="flex items-center gap-1.5 rounded-lg bg-[#0B1220] text-white text-sm px-3 py-2 hover:bg-slate-800"><Sparkles size={14}/>AI-generate event</button>
          </div>
        } />
      <FilterChip activeFilter={activeFilter} onClear={() => setActiveFilter(null)} />
      <div className="grid gap-4">
        {filteredEvents.map((e) => (
          <div key={e.id} className="rounded-xl border border-slate-200 bg-white p-5 flex items-center justify-between">
            <div>
              <p className="font-medium text-slate-900">{e.title}</p>
              <p className="text-xs text-slate-500 mt-1">{e.suppliers} suppliers invited · stage: {e.stage}</p>
            </div>
            <div className="text-right">
              <p className="font-mono text-sm font-semibold text-[#2563EB]">{e.savings}</p>
              <p className="text-xs text-slate-400">projected savings</p>
            </div>
          </div>
        ))}
        {filteredEvents.length === 0 && (
          <p className="text-sm text-slate-400 text-center py-8">No sourcing events match this filter.</p>
        )}
      </div>
    </div>
  );
}

/* --------------------------------- contracts --------------------------------- */

const CONTRACT_STATUSES = ["All", "Active", "Draft", "Pending Signature", "Breach Flagged", "Expired", "Terminated"];

function ContractsTable({ contracts, onOpen }) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("All");
  const [sortAsc, setSortAsc] = useState(true);
  const [activeFilter, setActiveFilter] = usePendingFilter("contracts");

  const filtered = contracts
    .filter((c) => !activeFilter || activeFilter.matchFn(c))
    .filter((c) => status === "All" || c.status === status)
    .filter((c) => {
      const q = query.trim().toLowerCase();
      if (!q) return true;
      return c.name.toLowerCase().includes(q) || c.supplier.toLowerCase().includes(q) || c.type.toLowerCase().includes(q);
    })
    .sort((a, b) => {
      const av = a.daysToExpiry == null ? Infinity : a.daysToExpiry;
      const bv = b.daysToExpiry == null ? Infinity : b.daysToExpiry;
      return sortAsc ? av - bv : bv - av;
    });

  return (
    <div>
      <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 mb-4">
        <Search size={15} className="text-slate-400" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by contract, supplier, or type…"
          className="flex-1 outline-none text-sm placeholder:text-slate-400"
        />
      </div>

      <FilterChip activeFilter={activeFilter} onClear={() => setActiveFilter(null)} />

      <div className="flex flex-wrap gap-2 mb-4">
        {CONTRACT_STATUSES.map((s) => (
          <button key={s} onClick={() => setStatus(s)}
            className={`text-xs rounded-full border px-3 py-1.5 font-medium transition-colors ${
              status === s ? "bg-[#0B1220] text-white border-[#0B1220]" : "border-slate-200 text-slate-500 hover:border-slate-300"
            }`}>
            {s}
          </button>
        ))}
      </div>

      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wide">
            <tr>
              <th className="text-left font-medium px-5 py-3">Contract</th>
              <th className="text-left font-medium px-5 py-3">Supplier</th>
              <th className="text-left font-medium px-5 py-3">Type</th>
              <th className="text-left font-medium px-5 py-3">Value</th>
              <th className="text-left font-medium px-5 py-3">
                <button onClick={() => setSortAsc((v) => !v)} className="flex items-center gap-1 hover:text-slate-700">
                  Expires {sortAsc ? "↑" : "↓"}
                </button>
              </th>
              <th className="text-left font-medium px-5 py-3">Risk</th>
              <th className="text-left font-medium px-5 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((c) => (
              <tr key={c.id} onClick={() => onOpen(c.id)} className="border-t border-slate-100 hover:bg-slate-50 cursor-pointer">
                <td className="px-5 py-3">
                  <p className="font-medium text-slate-900 flex items-center gap-1.5">
                    {c.name}
                    {c.sourceDocument && <FileCheck2 size={12} className="text-slate-300 shrink-0" title={`Imported: ${c.sourceDocument.fileName}`} />}
                  </p>
                  {c.flag && <p className="text-xs text-amber-600 mt-0.5 flex items-center gap-1"><AlertTriangle size={11}/>{c.flag}</p>}
                </td>
                <td className="px-5 py-3 text-slate-600">{c.supplier}</td>
                <td className="px-5 py-3 text-slate-500">{c.type}</td>
                <td className="px-5 py-3 font-mono text-slate-800">{c.value}</td>
                <td className="px-5 py-3 font-mono text-slate-600">{expiryLabel(c)}</td>
                <td className="px-5 py-3">
                  {c.risk
                    ? <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${riskColor(c.risk)}`}>{c.risk}</span>
                    : <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 text-slate-400 px-2 py-0.5 text-xs font-medium">Not assessed</span>}
                </td>
                <td className="px-5 py-3">
                  <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${contractStatusColor(c.status)}`}>{c.status}</span>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={7} className="px-5 py-8 text-center text-sm text-slate-400">No contracts match this search.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ContractDetail({ contract, onBack, onUpdate }) {
  const [messages, setMessages] = useState([
    { role: "ai", text: contract.summary },
  ]);
  const [input, setInput] = useState("");
  const [pendingAction, setPendingAction] = useState(null); // "extend" | "terminate" | "breach" | "note"
  const [extendDate, setExtendDate] = useState("");
  const [breachNote, setBreachNote] = useState("");
  const [noteText, setNoteText] = useState("");
  const { openNewRequest, currentUser } = React.useContext(RequestsContext);
  const editable = canEdit(currentUser.role, "Contracts");
  const approvable = canApprove(currentUser.role, "Contracts");

  const send = (q) => {
    if (!q.trim()) return;
    setMessages((m) => [...m, { role: "user", text: q }, { role: "ai", text: contractAIReply(contract, q) }]);
    setInput("");
  };

  const confirmExtend = () => {
    if (!extendDate) return;
    onUpdate({
      status: "Active",
      daysToExpiry: 365,
      effective: contract.effective,
      history: [...contract.history, { date: "Today", event: `Extended by ${currentUser.name} — new term through ${extendDate}` }],
    });
    setPendingAction(null);
    setExtendDate("");
  };

  const confirmTerminate = () => {
    onUpdate({
      status: "Terminated",
      daysToExpiry: null,
      history: [...contract.history, { date: "Today", event: `Terminated by ${currentUser.name}` }],
    });
    setPendingAction(null);
  };

  const confirmBreach = () => {
    onUpdate({
      status: "Breach Flagged",
      risk: "High",
      flag: breachNote || "Flagged for breach review",
      history: [...contract.history, { date: "Today", event: `Flagged for breach by ${currentUser.name} — ${breachNote || "no note provided"}` }],
    });
    setPendingAction(null);
    setBreachNote("");
  };

  const confirmNote = () => {
    if (!noteText.trim()) return;
    onUpdate({ history: [...contract.history, { date: "Today", event: `${currentUser.name}: "${noteText.trim()}"` }] });
    setPendingAction(null);
    setNoteText("");
  };

  return (
    <div>
      <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 mb-4">
        <ArrowLeft size={15} /> All contracts
      </button>

      <div className="flex items-start justify-between mb-6 flex-wrap gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-widest text-[#16A34A] mb-1">{contract.type} · {contract.id}</p>
          <h2 className="text-xl font-semibold text-slate-900">{contract.name}</h2>
          <p className="text-sm text-slate-500 mt-1">{contract.supplier}{contract.service && <> · governs <span className="text-slate-600">{contract.service}</span></>}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ${contractStatusColor(contract.status)}`}>{contract.status}</span>
          <EditableSelect
            value={contract.risk}
            options={["Low", "Medium", "High"]}
            editable={editable}
            clearLabel="Risk not assessed"
            onSave={(v) => onUpdate({ risk: v })}
            renderValue={(v) => v
              ? <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ${riskColor(v)}`}>{v} risk</span>
              : <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 text-slate-400 px-2.5 py-1 text-xs font-medium">Risk not assessed</span>}
          />
        </div>
      </div>

      {/* Action bar */}
      <div className="flex flex-wrap gap-2 mb-6">
        {editable ? (
          <button onClick={() => setPendingAction(pendingAction === "extend" ? null : "extend")}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 text-slate-600 text-sm px-3 py-2 hover:border-slate-300">
            <RefreshCw size={14} /> Extend
          </button>
        ) : (
          <Gated role={currentUser.role} module="Contracts" fallbackLabel="Extend" />
        )}
        <button onClick={() => setPendingAction(pendingAction === "note" ? null : "note")}
          className="flex items-center gap-1.5 rounded-lg border border-slate-200 text-slate-600 text-sm px-3 py-2 hover:border-slate-300">
          <MessageSquare size={14} /> Add note
        </button>
        {editable ? (
          <button onClick={() => openNewRequest("Contract Request")}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 text-slate-600 text-sm px-3 py-2 hover:border-slate-300">
            <Edit3 size={14} /> Amend
          </button>
        ) : (
          <Gated role={currentUser.role} module="Contracts" fallbackLabel="Amend" />
        )}
        {editable ? (
          <button onClick={() => setPendingAction(pendingAction === "breach" ? null : "breach")}
            className="flex items-center gap-1.5 rounded-lg border border-rose-200 text-rose-600 text-sm px-3 py-2 hover:border-rose-300">
            <Flag size={14} /> Flag for breach
          </button>
        ) : (
          <Gated role={currentUser.role} module="Contracts" fallbackLabel="Flag for breach" />
        )}
        {approvable ? (
          <button onClick={() => setPendingAction(pendingAction === "terminate" ? null : "terminate")}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 text-slate-500 text-sm px-3 py-2 hover:border-slate-300 ml-auto">
            <XCircle size={14} /> Terminate
          </button>
        ) : (
          <div className="ml-auto"><Gated role={currentUser.role} module="Contracts" level="approve" fallbackLabel="Terminate" /></div>
        )}
      </div>

      {pendingAction === "note" && (
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 mb-6">
          <p className="text-xs font-medium text-slate-500 mb-1.5">Note from {currentUser.name}</p>
          <textarea value={noteText} onChange={(e) => setNoteText(e.target.value)} rows={2}
            placeholder="Add context for the next person who opens this contract…"
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#2563EB] resize-none mb-3 bg-white" />
          <div className="flex gap-2">
            <button onClick={confirmNote} disabled={!noteText.trim()}
              className={`rounded-lg px-4 py-2 text-sm font-medium text-white ${noteText.trim() ? "bg-[#0B1220] hover:bg-slate-800" : "bg-slate-300 cursor-not-allowed"}`}>
              Post note
            </button>
            <button onClick={() => setPendingAction(null)} className="text-sm text-slate-500 hover:text-slate-700">Cancel</button>
          </div>
        </div>
      )}

      {pendingAction === "extend" && (
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 mb-6 flex flex-wrap items-end gap-3">
          <div>
            <p className="text-xs font-medium text-slate-500 mb-1.5">New expiration date</p>
            <input type="date" value={extendDate} onChange={(e) => setExtendDate(e.target.value)}
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#2563EB]" />
          </div>
          <button onClick={confirmExtend} disabled={!extendDate}
            className={`rounded-lg px-4 py-2 text-sm font-medium text-white ${extendDate ? "bg-[#0B1220] hover:bg-slate-800" : "bg-slate-300 cursor-not-allowed"}`}>
            Confirm extension
          </button>
          <button onClick={() => setPendingAction(null)} className="text-sm text-slate-500 hover:text-slate-700">Cancel</button>
        </div>
      )}

      {pendingAction === "breach" && (
        <div className="rounded-xl border border-rose-200 bg-rose-50/50 p-4 mb-6">
          <p className="text-xs font-medium text-rose-600 mb-1.5">What happened?</p>
          <textarea value={breachNote} onChange={(e) => setBreachNote(e.target.value)} rows={2}
            placeholder="Describe the breach — this will be logged to the contract history."
            className="w-full rounded-lg border border-rose-200 px-3 py-2 text-sm outline-none focus:border-rose-400 resize-none mb-3" />
          <div className="flex gap-2">
            <button onClick={confirmBreach} className="rounded-lg px-4 py-2 text-sm font-medium text-white bg-rose-600 hover:bg-rose-700">
              Flag for breach
            </button>
            <button onClick={() => setPendingAction(null)} className="text-sm text-slate-500 hover:text-slate-700">Cancel</button>
          </div>
        </div>
      )}

      {pendingAction === "terminate" && (
        <div className="rounded-xl border border-slate-300 bg-slate-50 p-4 mb-6">
          <p className="text-sm text-slate-700 mb-3">
            Terminate <span className="font-medium">{contract.name}</span>? This cannot be undone here.
          </p>
          <div className="flex gap-2">
            <button onClick={confirmTerminate} className="rounded-lg px-4 py-2 text-sm font-medium text-white bg-slate-800 hover:bg-slate-900">
              Confirm termination
            </button>
            <button onClick={() => setPendingAction(null)} className="text-sm text-slate-500 hover:text-slate-700">Cancel</button>
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Document */}
        <div className="lg:col-span-3 rounded-xl border border-slate-200 bg-white p-7">
          <div className="text-center mb-6 pb-6 border-b border-slate-100">
            <p className="text-[11px] uppercase tracking-widest text-slate-400 mb-1">{contract.type}</p>
            <p className="text-base font-semibold text-slate-900">{contract.name}</p>
            <p className="text-xs text-slate-400 mt-1">Effective {contract.effective}</p>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed mb-6">
            This Agreement is entered into between Paradigm Technologies ("Company") and {contract.supplier} ("Vendor"),
            governed by the laws of {contract.governingLaw}. The parties agree to the terms below.
          </p>
          <div className="space-y-4">
            {contract.clauses.map((cl, i) => (
              <div key={i}>
                <p className="text-sm font-medium text-slate-800">{i + 1}. {cl.title}</p>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">{cl.text}</p>
              </div>
            ))}
          </div>
          <div className="mt-8 pt-6 border-t border-slate-100 grid grid-cols-2 gap-6">
            <div>
              <p className="text-xs text-slate-400 mb-3">Paradigm Technologies</p>
              <p className="text-sm text-slate-700 flex items-center gap-1.5"><CheckCircle2 size={14} className="text-emerald-500" /> Signed</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 mb-3">{contract.supplier}</p>
              {contract.status === "Pending Signature" || contract.status === "Draft"
                ? <p className="text-sm text-rose-500 flex items-center gap-1.5"><AlertTriangle size={14} /> Awaiting signature</p>
                : <p className="text-sm text-slate-700 flex items-center gap-1.5"><CheckCircle2 size={14} className="text-emerald-500" /> Signed</p>}
            </div>
          </div>
        </div>

        {/* Details + AI helper */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-3">Details</p>
            <div className="space-y-2.5 text-sm">
              {[
                ["Value", contract.value],
                ["Effective", contract.effective],
                ["Expires", expiryLabel(contract)],
                ["Auto-renew", contract.autoRenew ? "Yes" : "No"],
                ["Governing law", contract.governingLaw],
              ].map(([label, val]) => (
                <div key={label} className="flex justify-between">
                  <span className="text-slate-400">{label}</span>
                  <span className="text-slate-700 font-medium">{val}</span>
                </div>
              ))}
              <div className="flex justify-between">
                <span className="text-slate-400">Owner</span>
                <EditableText
                  value={contract.owner}
                  editable={editable}
                  className="text-slate-700 font-medium"
                  onSave={(v) => onUpdate({ owner: v || contract.owner })}
                />
              </div>
            </div>
            {contract.sourceDocument && (
              <div className="mt-4 pt-4 border-t border-slate-100">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-2">Source document</p>
                <div className="flex items-center gap-2 rounded-lg bg-slate-50 border border-slate-200 px-3 py-2">
                  <FileCheck2 size={14} className="text-slate-400 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-slate-700 truncate">{contract.sourceDocument.fileName}</p>
                    <p className="text-[11px] text-slate-400">{contract.sourceDocument.sizeKB} KB · imported {contract.sourceDocument.importedAt}</p>
                  </div>
                </div>
              </div>
            )}
            <div className="mt-4 pt-4 border-t border-slate-100">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-2">History</p>
              <div className="space-y-2">
                {contract.history.map((h, i) => (
                  <div key={i} className="flex gap-2 text-xs">
                    <span className="text-slate-400 font-mono shrink-0 w-20">{h.date}</span>
                    <span className="text-slate-600">{h.event}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
            <div className="flex items-center gap-2 px-5 py-3 bg-[#0B1220]">
              <Bot size={15} className="text-[#16A34A]" />
              <span className="text-sm font-semibold text-white">Contract AI helper</span>
            </div>
            <div className="p-4 space-y-3 max-h-72 overflow-y-auto">
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[90%] rounded-lg px-3 py-2 text-xs leading-relaxed ${
                    m.role === "user" ? "bg-[#2563EB] text-white" : "bg-slate-50 border border-slate-200 text-slate-700"
                  }`}>
                    {m.text}
                  </div>
                </div>
              ))}
            </div>
            <div className="px-4 pb-3 flex flex-wrap gap-1.5">
              {CONTRACT_AI_SEEDS.map((s) => (
                <button key={s} onClick={() => send(s)}
                  className="text-[11px] rounded-full border border-slate-200 px-2.5 py-1 text-slate-500 hover:border-[#16A34A] hover:text-[#16A34A]">
                  {s}
                </button>
              ))}
            </div>
            <div className="border-t border-slate-100 p-3 flex items-center gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && send(input)}
                placeholder="Ask about this contract…"
                className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-xs outline-none focus:border-[#2563EB]"
              />
              <button onClick={() => send(input)} className="h-8 w-8 rounded-lg bg-[#0B1220] flex items-center justify-center hover:bg-slate-800 shrink-0">
                <Send size={13} className="text-white" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <RecordDocumentsNotes
          documents={contract.documents || []}
          notes={contract.notes || []}
          editable={editable}
          onAddDocument={(doc) => onUpdate({ documents: [...(contract.documents || []), { ...doc, uploadedAt: "Today", uploadedBy: currentUser.name }] })}
          onAddNote={(text) => onUpdate({ notes: [...(contract.notes || []), { text, author: currentUser.name, date: "Today" }] })}
        />
      </div>
    </div>
  );
}

const IMPORT_DOC_TYPES = ["NDA", "MSA", "Addendum", "Order Form", "License Agreement", "Amendment", "Service Order"];

function ImportContractModal({ open, onClose, onImport }) {
  const { suppliers } = React.useContext(RequestsContext);
  const [file, setFile] = useState(null);
  const [docType, setDocType] = useState(IMPORT_DOC_TYPES[0]);
  const [supplier, setSupplier] = useState(suppliers[0]?.name || "");
  const [title, setTitle] = useState("");

  useEffect(() => {
    if (open) {
      setFile(null); setDocType(IMPORT_DOC_TYPES[0]); setSupplier(suppliers[0]?.name || ""); setTitle("");
    }
  }, [open]);

  if (!open) return null;
  const canImport = file && supplier;

  const handleImport = () => {
    if (!canImport) return;
    const id = `CT-${Math.floor(3000 + Math.random() * 900)}`;
    const name = title.trim() || `${supplier} — ${docType}`;
    onImport({
      id, name, supplier, service: null, type: docType, status: "Draft",
      value: "N/A", effective: "Not yet effective", daysToExpiry: null, risk: null,
      flag: "Imported from PDF — pending manual review to complete terms",
      owner: "Unassigned", governingLaw: "TBD", autoRenew: false,
      summary: `Imported from an uploaded document ("${file.name}"). Terms have not yet been reviewed or entered.`,
      clauses: [
        { title: "Source document", text: `Imported from "${file.name}" on ${new Date().toLocaleDateString()}. Full terms pending manual entry.` },
      ],
      history: [{ date: "Today", event: `Imported from PDF: ${file.name}` }],
      sourceDocument: { fileName: file.name, sizeKB: Math.round(file.size / 1024), importedAt: "Today" },
      documents: [{ name: file.name, sizeKB: Math.round(file.size / 1024), uploadedAt: "Today" }],
      notes: [],
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/30" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div>
            <p className="text-sm font-semibold text-slate-900">Import contract document</p>
            <p className="text-xs text-slate-400 mt-0.5">Creates a draft contract record with the file attached for review</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X size={18} /></button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          <div>
            <p className="text-xs font-medium text-slate-500 mb-1.5">Document</p>
            <label className="flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-slate-300 px-4 py-6 text-center cursor-pointer hover:border-[#2563EB] transition-colors">
              <Upload size={20} className="text-slate-400" />
              <span className="text-xs text-slate-500">{file ? file.name : "Click to choose a PDF or Word document"}</span>
              <input type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={(e) => setFile(e.target.files?.[0] || null)} />
            </label>
            {!file && <p className="text-[11px] text-amber-600 mt-1.5">A file is required to import.</p>}
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 mb-1.5">Document type</p>
            <select value={docType} onChange={(e) => setDocType(e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm bg-white outline-none focus:border-[#2563EB]">
              {IMPORT_DOC_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 mb-1.5">Supplier</p>
            <select value={supplier} onChange={(e) => setSupplier(e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm bg-white outline-none focus:border-[#2563EB]">
              {suppliers.map((s) => <option key={s.id} value={s.name}>{s.name}</option>)}
            </select>
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 mb-1.5">Title (optional)</p>
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Defaults to Supplier — Document Type"
              className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#2563EB]" />
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed bg-slate-50 rounded-lg p-3">
            This attaches the file to a new draft contract record — it doesn't read or extract terms from the
            document automatically. Someone will still need to review the PDF and complete the contract's terms.
          </p>
        </div>
        <div className="border-t border-slate-100 px-6 py-4 flex items-center justify-end gap-2">
          <button onClick={onClose} className="rounded-lg px-4 py-2.5 text-sm font-medium text-slate-500 hover:bg-slate-50">Cancel</button>
          <button onClick={handleImport} disabled={!canImport}
            className={`flex items-center gap-1.5 rounded-lg px-4 py-2.5 text-sm font-medium text-white ${canImport ? "bg-[#0B1220] hover:bg-slate-800" : "bg-slate-300 cursor-not-allowed"}`}>
            <Upload size={14} /> Import document
          </button>
        </div>
      </div>
    </div>
  );
}

function Contracts() {
  const { openNewRequest, contracts, addContract, updateContract, pendingFocus, clearFocus, currentUser } = React.useContext(RequestsContext);
  const [selectedId, setSelectedId] = useState(null);
  const [importOpen, setImportOpen] = useState(false);

  const selected = contracts.find((c) => c.id === selectedId);

  const updateSelected = (patch) => updateContract(selectedId, patch);

  useEffect(() => {
    if (pendingFocus?.view === "contracts" && pendingFocus.id) {
      setSelectedId(pendingFocus.id);
      clearFocus();
    }
  }, [pendingFocus]);

  if (selected) {
    return <ContractDetail contract={selected} onBack={() => setSelectedId(null)} onUpdate={updateSelected} />;
  }

  return (
    <div>
      <SectionTitle eyebrow="Connected to the service they support" title="Contracts"
        action={
          <div className="flex gap-2">
            {canEdit(currentUser.role, "Contracts") ? (
              <button onClick={() => setImportOpen(true)} className="flex items-center gap-1.5 rounded-lg border border-slate-200 text-slate-600 text-sm px-3 py-2 hover:border-slate-300"><Upload size={14}/>Import PDF</button>
            ) : <Gated role={currentUser.role} module="Contracts" fallbackLabel="Import PDF" />}
            {canEdit(currentUser.role, "Contracts") ? (
              <button onClick={() => openNewRequest("Contract Request")} className="flex items-center gap-1.5 rounded-lg bg-[#0B1220] text-white text-sm px-3 py-2 hover:bg-slate-800"><Plus size={14}/>Request contract</button>
            ) : <Gated role={currentUser.role} module="Contracts" fallbackLabel="Request contract" />}
          </div>
        } />
      <p className="text-xs text-slate-500 -mt-3 mb-5 max-w-2xl">
        These are service-level contracts — each tied to the specific service it governs. The
        supplier's master agreement (MSA) is shown separately on the <span className="font-medium text-slate-600">Suppliers</span> page.
        Click any row to open the full contract.
      </p>
      <ContractsTable contracts={contracts} onOpen={setSelectedId} />
      <ImportContractModal open={importOpen} onClose={() => setImportOpen(false)} onImport={addContract} />
    </div>
  );
}

/* ------------------------------ services (governance) ------------------------------ */

function ServicesList({ services, onOpen }) {
  const { openNewRequest, currentUser } = React.useContext(RequestsContext);
  const [query, setQuery] = useState("");
  const [activeFilter, setActiveFilter] = usePendingFilter("services");

  const bySupplier = services
    .filter((s) => !activeFilter || activeFilter.matchFn(s))
    .filter((s) => {
      const q = query.trim().toLowerCase();
      if (!q) return true;
      return s.name.toLowerCase().includes(q) || s.supplier.toLowerCase().includes(q);
    })
    .reduce((acc, s) => {
      (acc[s.supplier] = acc[s.supplier] || []).push(s);
      return acc;
    }, {});

  const total = services.length;
  const governed = services.filter((s) => s.governance === "Governed").length;
  const gaps = services.filter((s) => s.governance === "Gap identified").length;
  const uncontracted = services.filter((s) => s.governance === "Uncontracted").length;

  return (
    <div>
      <SectionTitle eyebrow="Risk & governance for services under contract" title="Services"
        action={
          canEdit(currentUser.role, "Services")
            ? <button onClick={() => openNewRequest("Service Request")} className="flex items-center gap-1.5 rounded-lg bg-[#0B1220] text-white text-sm px-3 py-2 hover:bg-slate-800"><Plus size={14}/>New service</button>
            : <Gated role={currentUser.role} module="Services" fallbackLabel="New service" />
        } />

      <p className="text-xs text-slate-500 -mt-3 mb-5 max-w-2xl">
        Every service a supplier delivers should trace back to a contract that governs it. Click any
        service to open its contacts, SLAs, compliance document repository, and full risk assessment.
      </p>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500 mb-1">Services tracked</p>
          <p className="font-mono text-2xl font-semibold text-slate-900">{total}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500 mb-1">Fully governed</p>
          <p className="font-mono text-2xl font-semibold text-emerald-600">{governed}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500 mb-1">Gaps identified</p>
          <p className="font-mono text-2xl font-semibold text-amber-600">{gaps}</p>
        </div>
        <div className="rounded-xl border border-rose-200 bg-rose-50/40 p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-rose-500 mb-1">Uncontracted</p>
          <p className="font-mono text-2xl font-semibold text-rose-600">{uncontracted}</p>
        </div>
      </div>

      <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 mb-5">
        <Search size={15} className="text-slate-400" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by service or supplier…"
          className="flex-1 outline-none text-sm placeholder:text-slate-400"
        />
      </div>

      <FilterChip activeFilter={activeFilter} onClear={() => setActiveFilter(null)} />

      <div className="space-y-5">
        {Object.entries(bySupplier).map(([supplier, svcs]) => (
          <div key={supplier} className="rounded-xl border border-slate-200 bg-white overflow-hidden">
            <div className="flex items-center gap-2.5 px-5 py-3.5 bg-slate-50 border-b border-slate-100">
              <Building2 size={15} className="text-slate-500" />
              <span className="text-sm font-semibold text-slate-800">{supplier}</span>
              <span className="text-xs text-slate-400">· {svcs.length} service{svcs.length > 1 ? "s" : ""} delivered</span>
            </div>
            <div className="divide-y divide-slate-100">
              {svcs.map((s) => (
                <button key={s.id} onClick={() => onOpen(s.id)} className="w-full text-left px-5 py-4 flex items-center justify-between gap-4 hover:bg-slate-50/60 transition-colors">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Layers size={13} className="text-slate-300 shrink-0" />
                      <p className="text-sm font-medium text-slate-900 truncate">{s.name}</p>
                      <span className={`text-[10px] font-medium rounded-full border px-2 py-0.5 shrink-0 ${criticalityColor(s.criticality)}`}>{s.criticality}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-slate-400 pl-5">
                      <ArrowRight size={11} />
                      {s.contract
                        ? <span className="text-slate-600 flex items-center gap-1"><FileText size={11} /> {s.contract}</span>
                        : <span className="text-rose-500 flex items-center gap-1 font-medium"><AlertTriangle size={11} /> No supporting contract on file</span>}
                    </div>
                    {s.gap && (
                      <p className="text-[11px] text-amber-600 mt-1.5 pl-5 flex items-center gap-1">
                        <AlertTriangle size={11} /> {s.gap}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-5 shrink-0">
                    <div className="text-right hidden sm:block">
                      <p className="text-[10px] text-slate-400 uppercase tracking-wide">SLA</p>
                      <p className="font-mono text-sm text-slate-700">{s.sla != null ? `${s.sla}%` : "—"}</p>
                    </div>
                    <div className="text-right hidden sm:block">
                      <p className="text-[10px] text-slate-400 uppercase tracking-wide">Risk</p>
                      {s.riskScore != null
                        ? <p className={`font-mono text-sm ${s.riskScore > 50 ? "text-rose-600" : s.riskScore > 25 ? "text-amber-600" : "text-emerald-600"}`}>{s.riskScore}</p>
                        : <p className="font-mono text-sm text-slate-300">—</p>}
                    </div>
                    <span className={`text-xs font-medium rounded-full border px-2.5 py-1 ${governanceColor(s.governance)}`}>{s.governance}</span>
                    <ChevronRight size={16} className="text-slate-300" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        ))}
        {Object.keys(bySupplier).length === 0 && (
          <p className="text-sm text-slate-400 text-center py-10">No services match this search.</p>
        )}
      </div>
    </div>
  );
}

function ServiceDetail({ service, onBack }) {
  const { currentUser, updateService, suppliers, contracts, projects, updateSupplier, updateContract, updateProject } = React.useContext(RequestsContext);
  const editable = canEdit(currentUser.role, "Services");

  const linkedSupplier = suppliers.find((s) => s.name === service.supplier);
  const linkedContract = service.contract ? contracts.find((c) => c.name === service.contract) : null;
  const linkedProjects = projects.filter((p) => (p.package?.serviceIds || []).includes(service.id));
  return (
    <div>
      <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 mb-4">
        <ArrowLeft size={15} /> All services
      </button>

      <div className="flex items-start justify-between mb-6 flex-wrap gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-widest text-[#16A34A] mb-1">{service.category} · {service.id}</p>
          <h2 className="text-xl font-semibold text-slate-900">{service.name}</h2>
          <p className="text-sm text-slate-500 mt-1">{service.supplier}</p>
        </div>
        <div className="flex items-center gap-2">
          <EditableSelect
            value={service.criticality}
            options={["Critical", "High", "Medium", "Low"]}
            editable={editable}
            allowClear={false}
            onSave={(v) => updateService(service.id, { criticality: v })}
            renderValue={(v) => <span className={`text-xs font-medium rounded-full border px-2.5 py-1 ${criticalityColor(v)}`}>{v}</span>}
          />
          <span className={`text-xs font-medium rounded-full border px-2.5 py-1 ${governanceColor(service.governance)}`}>{service.governance}</span>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4 mb-6 flex items-center gap-2 text-sm">
        <ArrowRight size={14} className="text-slate-300 shrink-0" />
        {service.contract
          ? <span className="text-slate-600 flex items-center gap-1.5"><FileText size={14} className="text-slate-400" /> Governed by <span className="font-medium text-slate-800">{service.contract}</span></span>
          : <span className="text-rose-500 font-medium flex items-center gap-1.5"><AlertTriangle size={14} /> No supporting contract on file</span>}
        {service.gap && (
          <span className="ml-auto text-xs text-amber-600 flex items-center gap-1"><AlertTriangle size={12} />{service.gap}</span>
        )}
      </div>

      {/* Ownership roll-up — one stop shop for every internal owner tied to this service */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <UserCircle size={15} className="text-slate-400" />
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Ownership roll-up</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <p className="text-[11px] text-slate-400 mb-1">This service</p>
            <EditableSelect
              value={service.owner}
              options={USERS.map((u) => u.name)}
              editable={editable}
              clearLabel="Unassigned"
              onSave={(v) => updateService(service.id, { owner: v || "Unassigned" })}
              renderValue={(v) => <span className={`text-sm font-medium ${v ? "text-slate-800" : "text-rose-500"}`}>{v || "Unassigned"}</span>}
            />
          </div>

          <div>
            <p className="text-[11px] text-slate-400 mb-1">Supplier account — {service.supplier}</p>
            {linkedSupplier ? (
              <EditableSelect
                value={linkedSupplier.accountOwner}
                options={USERS.map((u) => u.name)}
                editable={editable}
                clearLabel="Unassigned"
                onSave={(v) => updateSupplier(linkedSupplier.id, { accountOwner: v || "Unassigned" })}
                renderValue={(v) => <span className={`text-sm font-medium ${v ? "text-slate-800" : "text-rose-500"}`}>{v || "Unassigned"}</span>}
              />
            ) : <span className="text-sm text-slate-300">—</span>}
          </div>

          <div>
            <p className="text-[11px] text-slate-400 mb-1">Governing contract{linkedContract ? ` — ${linkedContract.id}` : ""}</p>
            {linkedContract ? (
              <EditableText
                value={linkedContract.owner}
                editable={editable}
                className="text-sm font-medium text-slate-800"
                onSave={(v) => updateContract(linkedContract.id, { owner: v || linkedContract.owner })}
              />
            ) : <span className="text-sm text-slate-400 italic">No contract on file</span>}
          </div>

          <div>
            <p className="text-[11px] text-slate-400 mb-1">{linkedProjects.length > 0 ? "Linked project(s)" : "Projects"}</p>
            {linkedProjects.length > 0 ? (
              <div className="space-y-1.5">
                {linkedProjects.map((p) => (
                  <div key={p.id} className="flex items-center gap-1.5">
                    <span className="text-xs text-slate-400 truncate max-w-[80px]" title={p.name}>{p.name}:</span>
                    <EditableText
                      value={p.owner}
                      editable={editable}
                      className="text-sm font-medium text-slate-800"
                      onSave={(v) => updateProject(p.id, { owner: v || p.owner })}
                    />
                  </div>
                ))}
              </div>
            ) : <span className="text-sm text-slate-400 italic">Not part of a project</span>}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mb-6">
        {/* Business contacts */}
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-center gap-2 mb-3">
            <Users size={15} className="text-slate-400" />
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Business contacts</p>
          </div>
          <div className="space-y-3">
            {service.contacts.map((c, i) => (
              <div key={i} className="flex items-center gap-2.5">
                <UserCircle size={22} className="text-slate-300 shrink-0" />
                <div className="min-w-0">
                  <EditableText
                    value={c.name === "Unassigned" ? "" : c.name}
                    editable={editable}
                    placeholder="Unassigned"
                    className={`text-sm font-medium truncate block ${c.name === "Unassigned" ? "text-rose-500" : "text-slate-800"}`}
                    onSave={(v) => {
                      const contacts = service.contacts.map((x, xi) => (xi === i ? { ...x, name: v || "Unassigned" } : x));
                      updateService(service.id, { contacts });
                    }}
                  />
                  <p className="text-xs text-slate-400 truncate">{c.role} · {c.org}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* SLAs */}
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-center gap-2 mb-3">
            <Clock size={15} className="text-slate-400" />
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Service level agreements</p>
          </div>
          <div className="space-y-3">
            {service.slas.map((s, i) => (
              <div key={i}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-slate-600">{s.metric}</span>
                  <span className={`text-[10px] font-medium rounded-full border px-2 py-0.5 ${slaStatusColor(s.status)}`}>{s.status}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Target: {s.target}</span>
                  <span className="font-mono text-slate-700">{s.actual}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Compliance / risk document repository */}
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-center gap-2 mb-3">
            <FolderOpen size={15} className="text-slate-400" />
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Compliance document repository</p>
          </div>
          <div className="space-y-2.5">
            {service.complianceDocs.map((d, i) => (
              <div key={i} className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <FileCheck2 size={13} className="text-slate-300 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-slate-700 truncate">{d.name}</p>
                    {d.date && <p className="text-[11px] text-slate-400">received {d.date}{d.expires ? ` · expires ${d.expires}` : ""}</p>}
                  </div>
                </div>
                <span className={`text-[10px] font-medium rounded-full border px-2 py-0.5 shrink-0 ${docStatusColor(d.status)}`}>{d.status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Risk assessment */}
      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <div className="flex items-center gap-2 mb-4">
          <ShieldCheck size={15} className="text-slate-400" />
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Risk assessment — 10 categories</p>
        </div>
        <div className="space-y-3">
          {RISK_CATEGORIES.map((cat) => {
            const a = service.riskAssessment[cat] || { rating: null, note: null };
            return (
              <div key={cat} className="flex items-start gap-3 pb-3 border-b border-slate-100 last:border-0 last:pb-0">
                <div className="w-44 shrink-0">
                  <p className="text-sm text-slate-700">{cat}</p>
                </div>
                <div className="shrink-0 w-28">
                  <EditableSelect
                    value={a.rating}
                    options={["Low", "Medium", "High"]}
                    editable={editable}
                    clearLabel="Not assessed"
                    onSave={(v) => {
                      const riskAssessment = { ...service.riskAssessment, [cat]: { rating: v, note: a.note || (v ? `${v} risk — updated manually.` : null) } };
                      updateService(service.id, { riskAssessment });
                    }}
                    renderValue={(v) => v
                      ? <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${riskColor(v)}`}>{v}</span>
                      : <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 text-slate-400 px-2 py-0.5 text-xs font-medium">Not assessed</span>}
                  />
                </div>
                <p className="text-xs text-slate-500 leading-relaxed flex-1">{a.note || "No assessment recorded for this category yet."}</p>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-6">
        <RecordDocumentsNotes
          documents={service.documents || []}
          notes={service.notes || []}
          editable={editable}
          onAddDocument={(doc) => updateService(service.id, { documents: [...(service.documents || []), { ...doc, uploadedAt: "Today", uploadedBy: currentUser.name }] })}
          onAddNote={(text) => updateService(service.id, { notes: [...(service.notes || []), { text, author: currentUser.name, date: "Today" }] })}
        />
      </div>
    </div>
  );
}

function Services() {
  const { pendingFocus, clearFocus, services } = React.useContext(RequestsContext);
  const [selectedId, setSelectedId] = useState(null);
  const selected = services.find((s) => s.id === selectedId);

  useEffect(() => {
    if (pendingFocus?.view === "services" && pendingFocus.id) {
      setSelectedId(pendingFocus.id);
      clearFocus();
    }
  }, [pendingFocus]);

  if (selected) {
    return <ServiceDetail service={selected} onBack={() => setSelectedId(null)} />;
  }

  return <ServicesList services={services} onOpen={setSelectedId} />;
}

/* -------------------------------- guided buying -------------------------------- */

function GuidedBuying() {
  const [q, setQ] = useState("");
  return (
    <div>
      <SectionTitle eyebrow="Conversational requisitions" title="What do you need to buy?" />
      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <div className="flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-3">
          <Search size={16} className="text-slate-400" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder='Try "20 ergonomic chairs for the Austin office by Sept"'
            className="flex-1 outline-none text-sm placeholder:text-slate-400"
          />
          <button className="text-sm font-medium text-[#2563EB] hover:underline">Search catalog</button>
        </div>
        <div className="mt-5 grid grid-cols-2 md:grid-cols-4 gap-3">
          {["Preferred supplier match", "Budget check", "Policy compliant", "Auto-approval eligible"].map((t) => (
            <div key={t} className="rounded-lg bg-slate-50 border border-slate-200 px-3 py-2.5 flex items-center gap-2 text-xs font-medium text-slate-600">
              <CheckCircle2 size={14} className="text-emerald-500" /> {t}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 grid md:grid-cols-3 gap-4">
        {[
          { name: "Steelcase Series 2 Chair", supplier: "Vantage Cloud Systems", price: "$284", tag: "Preferred" },
          { name: "Herman Miller Sayl", supplier: "Meridian Steel Co.", price: "$412", tag: "Approved" },
          { name: "HON Ignition 2.0", supplier: "Orbital Marketing Partners", price: "$219", tag: "Best price" },
        ].map((p) => (
          <div key={p.name} className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="h-24 rounded-lg bg-slate-100 mb-3 flex items-center justify-center text-slate-300 text-xs">Product image</div>
            <p className="text-sm font-medium text-slate-900">{p.name}</p>
            <p className="text-xs text-slate-500">{p.supplier}</p>
            <div className="flex items-center justify-between mt-2">
              <span className="font-mono text-sm font-semibold text-slate-900">{p.price}</span>
              <span className="text-[10px] uppercase tracking-wide font-medium text-[#2563EB] bg-[#2563EB]/10 rounded-full px-2 py-0.5">{p.tag}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* --------------------------------- invoices --------------------------------- */

function InvoicesTable({ invoices, onOpen }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wide">
          <tr>
            <th className="text-left font-medium px-5 py-3">Invoice</th>
            <th className="text-left font-medium px-5 py-3">Supplier</th>
            <th className="text-left font-medium px-5 py-3">Amount</th>
            <th className="text-left font-medium px-5 py-3">Match confidence</th>
            <th className="text-left font-medium px-5 py-3">Status</th>
            <th className="text-left font-medium px-5 py-3">Hold</th>
          </tr>
        </thead>
        <tbody>
          {invoices.map((i) => (
            <tr key={i.id} onClick={() => onOpen(i.id)} className="border-t border-slate-100 hover:bg-slate-50 cursor-pointer">
              <td className="px-5 py-3 font-mono text-slate-800">{i.id}</td>
              <td className="px-5 py-3 text-slate-700">{i.supplier}</td>
              <td className="px-5 py-3 font-mono text-slate-900">{i.amount}</td>
              <td className="px-5 py-3">
                <div className="flex items-center gap-2">
                  <div className="h-1.5 w-20 rounded-full bg-slate-100">
                    <div className={`h-1.5 rounded-full ${i.conf > 90 ? "bg-emerald-500" : i.conf > 60 ? "bg-amber-500" : "bg-rose-500"}`} style={{ width: `${i.conf}%` }} />
                  </div>
                  <span className="text-xs font-mono text-slate-500">{i.conf}%</span>
                </div>
              </td>
              <td className="px-5 py-3">
                <span className={`inline-flex rounded-full border px-2 py-0.5 text-xs font-medium ${invStatusColor(i.status)}`}>{i.status}</span>
              </td>
              <td className="px-5 py-3">
                <div className="flex items-center justify-between gap-2">
                  {i.hold
                    ? <span className="inline-flex items-center gap-1 rounded-full border border-rose-200 bg-rose-50 text-rose-700 px-2 py-0.5 text-xs font-medium"><Lock size={10}/>Held</span>
                    : <span className="text-xs text-slate-300">—</span>}
                  <ChevronRight size={14} className="text-slate-300 shrink-0" />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function InvoiceDetail({ invoice, onBack }) {
  const { purchaseOrders, updateInvoice, suppliers, navigateWithFocus, currentUser } = React.useContext(RequestsContext);
  const [tab, setTab] = useState("files");
  const [alertsOpen, setAlertsOpen] = useState(false);
  const editable = canEdit(currentUser.role, "Invoices");

  const po = purchaseOrders.find((p) => p.id === invoice.poId);
  const supplierRecord = suppliers.find((s) => s.name === invoice.supplier);
  const invoiceAmountNum = parseMoney(invoice.amount) * 1_000_000; // parseMoney returns $M; convert back to raw dollars
  const poTotal = invoice.poTotal || 0;
  const remaining = poTotal - invoiceAmountNum;
  const pct = poTotal > 0 ? Math.min(100, Math.max(0, (invoiceAmountNum / poTotal) * 100)) : 0;

  const alerts = [];
  if (invoice.holdReason) alerts.push(invoice.holdReason);
  if (invoice.overage) alerts.push(`Overage: ${invoice.overage.amount} — ${invoice.overage.note}`);
  if (remaining < 0) alerts.push(`Invoice exceeds the matched PO by $${Math.abs(remaining).toLocaleString()}.`);

  return (
    <div>
      <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 mb-4">
        <ArrowLeft size={15} /> All invoices
      </button>

      <div className="flex items-start justify-between mb-4 flex-wrap gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-widest text-[#16A34A] mb-1">Invoice</p>
          <h2 className="text-xl font-semibold text-slate-900">{invoice.id}</h2>
          <p className="text-sm text-slate-500 mt-1">
            {supplierRecord ? (
              <button onClick={() => navigateWithFocus("suppliers", supplierRecord.id)} className="text-[#2563EB] hover:underline">{invoice.supplier}</button>
            ) : invoice.supplier}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {invoice.hold && (
            <span className="inline-flex items-center gap-1 rounded-full border border-rose-200 bg-rose-50 text-rose-700 px-2.5 py-1 text-xs font-medium"><Lock size={11}/>Held</span>
          )}
          <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ${invStatusColor(invoice.status)}`}>{invoice.status}</span>
        </div>
      </div>

      {alerts.length > 0 && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 mb-6 overflow-hidden">
          <button onClick={() => setAlertsOpen((v) => !v)} className="w-full flex items-center justify-between px-4 py-3">
            <span className="flex items-center gap-2 text-sm font-medium text-amber-800">
              <AlertTriangle size={15} /> Review {alerts.length} risk alert{alerts.length > 1 ? "s" : ""}
            </span>
            <ChevronRight size={16} className={`text-amber-600 transition-transform ${alertsOpen ? "rotate-90" : ""}`} />
          </button>
          {alertsOpen && (
            <div className="px-4 pb-4 space-y-2">
              {alerts.map((a, i) => (
                <p key={i} className="text-xs text-amber-700 flex items-start gap-1.5">
                  <span className="mt-0.5">•</span> {a}
                </p>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Document / PO tabs */}
        <div className="lg:col-span-3 rounded-xl border border-slate-200 bg-white overflow-hidden">
          <div className="flex border-b border-slate-100">
            {[["files", "Files"], ["po", "Matched PO"]].map(([id, label]) => (
              <button key={id} onClick={() => setTab(id)}
                className={`px-5 py-3 text-sm font-medium border-b-2 -mb-px transition-colors ${tab === id ? "border-[#16A34A] text-slate-900" : "border-transparent text-slate-400 hover:text-slate-600"}`}>
                {label}
              </button>
            ))}
          </div>
          <div className="p-6">
            {tab === "files" ? (
              <div>
                <div className="flex items-center justify-between mb-6 pb-6 border-b border-slate-100">
                  <div>
                    <p className="text-base font-semibold text-slate-900">Invoice</p>
                    <p className="text-xs text-slate-400 mt-1">Invoice #{invoice.id}</p>
                  </div>
                  <p className="font-mono text-2xl font-semibold text-slate-900">{invoice.amount}</p>
                </div>
                <div className="grid grid-cols-2 gap-6 text-xs">
                  <div>
                    <p className="text-slate-400 mb-1">From</p>
                    <p className="text-slate-700">{invoice.supplier}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 mb-1">Bill to</p>
                    <p className="text-slate-700">Paradigm Technologies</p>
                  </div>
                </div>
                <div className="mt-6 pt-6 border-t border-slate-100">
                  <p className="text-xs text-slate-400 mb-3">Line items</p>
                  <div className="space-y-2">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-3 rounded bg-slate-100 w-full" />
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div>
                {po ? (
                  <>
                    <div className="flex items-center justify-between mb-4">
                      <p className="text-sm font-semibold text-slate-900">{po.id}</p>
                      <span className={`text-xs font-medium rounded-full border px-2.5 py-1 ${poStatusColor(po.status)}`}>{po.status}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-xs">
                      <div><p className="text-slate-400 mb-1">Supplier</p><p className="text-slate-700">{po.supplier}</p></div>
                      <div><p className="text-slate-400 mb-1">Type</p><p className="text-slate-700">{po.type}</p></div>
                      <div><p className="text-slate-400 mb-1">PO amount</p><p className="font-mono text-slate-700">{po.amount}</p></div>
                      <div><p className="text-slate-400 mb-1">Linked req.</p><p className="font-mono text-slate-700">{po.req}</p></div>
                    </div>
                    <button onClick={() => navigateWithFocus("pos", po.id)} className="mt-4 text-xs text-[#2563EB] hover:underline flex items-center gap-1">
                      Open in Purchase Orders <ArrowRight size={11} />
                    </button>
                  </>
                ) : (
                  <p className="text-xs text-slate-400 italic">No purchase order matched to this invoice.</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* PO match + details */}
        <div className="lg:col-span-2 space-y-6">
          {po && (
            <div className="rounded-xl border border-slate-200 bg-white p-5">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles size={14} className="text-[#16A34A]" />
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">PO match</p>
              </div>
              <p className="text-sm font-medium text-slate-800 mb-3">{po.id}</p>
              <div className="h-2 rounded-full bg-slate-100 mb-2 overflow-hidden">
                <div className={`h-2 rounded-full ${remaining < 0 ? "bg-rose-500" : "bg-[#2563EB]"}`} style={{ width: `${pct}%` }} />
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="font-mono text-slate-700">${invoiceAmountNum.toLocaleString()} invoiced</span>
                <span className={`font-mono ${remaining < 0 ? "text-rose-600 font-medium" : "text-slate-400"}`}>
                  {remaining < 0 ? `$${Math.abs(remaining).toLocaleString()} over` : `$${remaining.toLocaleString()} remaining`}
                </span>
              </div>
            </div>
          )}

          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-3">Invoice details</p>
            <div className="space-y-2.5 text-sm">
              {[
                ["Invoice date", invoice.invoiceDate],
                ["Due date", invoice.dueDate],
                ["Payment terms", invoice.paymentTerms],
                ["Currency", "USD"],
              ].map(([label, val]) => (
                <div key={label} className="flex justify-between">
                  <span className="text-slate-400">{label}</span>
                  <span className="text-slate-700 font-medium">{val || "—"}</span>
                </div>
              ))}
              <div className="flex justify-between">
                <span className="text-slate-400">Department</span>
                <EditableText value={invoice.department} editable={editable} className="text-slate-700 font-medium"
                  onSave={(v) => updateInvoice(invoice.id, { department: v || invoice.department })} />
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Category</span>
                <EditableText value={invoice.category} editable={editable} className="text-slate-700 font-medium"
                  onSave={(v) => updateInvoice(invoice.id, { category: v || invoice.category })} />
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Subcategory</span>
                <EditableText value={invoice.subcategory} editable={editable} className="text-slate-700 font-medium"
                  onSave={(v) => updateInvoice(invoice.id, { subcategory: v || invoice.subcategory })} />
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-2">Hold & overage</p>
            <p className="text-xs text-slate-500 mb-3">
              {invoice.hold ? invoice.holdReason : invoice.overage ? "This invoice has an open overage awaiting a decision." : "No hold or overage on this invoice."}
            </p>
            <button onClick={() => navigateWithFocus("vendors", supplierRecord?.id)} disabled={!supplierRecord}
              className={`text-xs font-medium flex items-center gap-1 ${supplierRecord ? "text-[#2563EB] hover:underline" : "text-slate-300 cursor-not-allowed"}`}>
              Manage in Vendor Management <ArrowRight size={11} />
            </button>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <RecordDocumentsNotes
          documents={invoice.documents || []}
          notes={invoice.notes || []}
          editable={editable}
          onAddDocument={(doc) => updateInvoice(invoice.id, { documents: [...(invoice.documents || []), { ...doc, uploadedAt: "Today", uploadedBy: currentUser.name }] })}
          onAddNote={(text) => updateInvoice(invoice.id, { notes: [...(invoice.notes || []), { text, author: currentUser.name, date: "Today" }] })}
        />
      </div>
    </div>
  );
}

function Invoices() {
  const { invoices, pendingFocus, clearFocus } = React.useContext(RequestsContext);
  const [selectedId, setSelectedId] = useState(null);
  const [activeFilter, setActiveFilter] = usePendingFilter("invoices");
  const selected = invoices.find((i) => i.id === selectedId);

  useEffect(() => {
    if (pendingFocus?.view === "invoices" && pendingFocus.id) {
      setSelectedId(pendingFocus.id);
      clearFocus();
    }
  }, [pendingFocus]);

  if (selected) {
    return <InvoiceDetail invoice={selected} onBack={() => setSelectedId(null)} />;
  }

  const filteredInvoices = invoices.filter((i) => !activeFilter || activeFilter.matchFn(i));

  return (
    <div>
      <SectionTitle eyebrow="Touchless processing" title="Invoice queue" />
      <p className="text-xs text-slate-500 -mt-3 mb-5 max-w-2xl">
        Click any invoice to review it, see its matched PO, and check for risk alerts. Hold status and
        overage approvals are managed per vendor under <span className="font-medium text-slate-600">Vendor Management</span>.
      </p>
      <FilterChip activeFilter={activeFilter} onClear={() => setActiveFilter(null)} />
      <InvoicesTable invoices={filteredInvoices} onOpen={setSelectedId} />
    </div>
  );
}

/* ------------------------------ value tracking ------------------------------ */

function LogValueItemModal({ open, onClose, onSubmit }) {
  const { contracts, currentUser } = React.useContext(RequestsContext);
  const [type, setType] = useState(VALUE_TYPES[0]);
  const [title, setTitle] = useState("");
  const [contractId, setContractId] = useState(contracts[0]?.id || "");
  const [amount, setAmount] = useState("");
  const [creditedTo, setCreditedTo] = useState(USERS[0].name);
  const [note, setNote] = useState("");

  useEffect(() => {
    if (open) {
      setType(VALUE_TYPES[0]); setTitle(""); setContractId(contracts[0]?.id || "");
      setAmount(""); setCreditedTo(USERS[0].name); setNote("");
    }
  }, [open]);

  if (!open) return null;
  const canSubmit = title.trim().length > 0 && contractId;

  const handleSubmit = () => {
    if (!canSubmit) return;
    const contract = contracts.find((c) => c.id === contractId);
    onSubmit({
      id: `VAL-${Math.floor(100 + Math.random() * 800)}`,
      type, title: title.trim(), contractId, poId: null,
      supplier: contract?.supplier || "—",
      amount: Number(amount) || 0,
      creditedTo, submittedBy: currentUser.name, status: "Pending Finance Approval",
      financeApprover: null, note: note.trim(), dateSubmitted: "Today",
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/30" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div>
            <p className="text-sm font-semibold text-slate-900">Log value item</p>
            <p className="text-xs text-slate-400 mt-0.5">Routes to Finance for approval before it counts toward credit</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X size={18} /></button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          <div>
            <p className="text-xs font-medium text-slate-500 mb-1.5">Type</p>
            <div className="grid grid-cols-3 gap-2">
              {VALUE_TYPES.map((t) => (
                <button key={t} onClick={() => setType(t)}
                  className={`rounded-lg border px-2 py-2 text-xs font-medium transition-colors ${type === t ? "border-[#16A34A] bg-[#16A34A]/5 text-[#16A34A]" : "border-slate-200 text-slate-500 hover:border-slate-300"}`}>
                  {t}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 mb-1.5">Title</p>
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Negotiated volume discount on renewal"
              className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#16A34A]" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 mb-1.5">Linked contract</p>
            <select value={contractId} onChange={(e) => setContractId(e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm bg-white outline-none focus:border-[#16A34A]">
              {contracts.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs font-medium text-slate-500 mb-1.5">Value ($M)</p>
              <input value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.05"
                className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#16A34A]" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 mb-1.5">Credit to</p>
              <select value={creditedTo} onChange={(e) => setCreditedTo(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm bg-white outline-none focus:border-[#16A34A]">
                {USERS.map((u) => <option key={u.name} value={u.name}>{u.name}</option>)}
              </select>
            </div>
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 mb-1.5">Note</p>
            <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={3} placeholder="What happened, and how was the value calculated?"
              className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#16A34A] resize-none" />
          </div>
        </div>
        <div className="border-t border-slate-100 px-6 py-4 flex items-center justify-end gap-2">
          <button onClick={onClose} className="rounded-lg px-4 py-2.5 text-sm font-medium text-slate-500 hover:bg-slate-50">Cancel</button>
          <button onClick={handleSubmit} disabled={!canSubmit}
            className={`rounded-lg px-4 py-2.5 text-sm font-medium text-white ${canSubmit ? "bg-[#0B1220] hover:bg-slate-800" : "bg-slate-300 cursor-not-allowed"}`}>
            Submit for finance approval
          </button>
        </div>
      </div>
    </div>
  );
}

function ValueTracking() {
  const { valueItems, addValueItem, updateValueItem, contracts, currentUser, navigateWithFocus } = React.useContext(RequestsContext);
  const [logOpen, setLogOpen] = useState(false);
  const [filterType, setFilterType] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");

  const canLog = canEdit(currentUser.role, "Contracts");
  const canApproveFinance = canEdit(currentUser.role, "Budget");

  const approved = valueItems.filter((v) => v.status === "Approved");
  const pending = valueItems.filter((v) => v.status === "Pending Finance Approval");
  const totalSavings = approved.filter((v) => v.type === "Savings").reduce((s, v) => s + v.amount, 0);
  const totalAvoidance = approved.filter((v) => v.type === "Cost Avoidance").reduce((s, v) => s + v.amount, 0);
  const paymentTermCount = approved.filter((v) => v.type === "Payment Terms Improvement").length;

  const leaderboard = Object.entries(
    approved.reduce((acc, v) => {
      acc[v.creditedTo] = (acc[v.creditedTo] || 0) + v.amount;
      return acc;
    }, {})
  ).sort((a, b) => b[1] - a[1]);

  const filtered = valueItems.filter((v) => {
    if (filterType !== "All" && v.type !== filterType) return false;
    if (filterStatus !== "All" && v.status !== filterStatus) return false;
    return true;
  });

  const decide = (id, approve) => {
    updateValueItem(id, {
      status: approve ? "Approved" : "Rejected",
      financeApprover: currentUser.name,
    });
  };

  return (
    <div>
      <SectionTitle eyebrow="Connected to contracts & purchase orders" title="Value tracking"
        action={
          canLog
            ? <button onClick={() => setLogOpen(true)} className="flex items-center gap-1.5 rounded-lg bg-[#0B1220] text-white text-sm px-3 py-2 hover:bg-slate-800"><Plus size={14}/>Log value item</button>
            : <Gated role={currentUser.role} module="Contracts" fallbackLabel="Log value item" />
        } />
      <p className="text-xs text-slate-500 -mt-3 mb-5 max-w-2xl">
        Contract managers log savings, cost avoidances, and payment term improvements against the
        contract or PO that produced them. Finance approves before it counts toward the credited owner's total.
      </p>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500 mb-1">Approved savings</p>
          <p className="font-mono text-2xl font-semibold text-emerald-600">${totalSavings.toFixed(2)}M</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500 mb-1">Approved avoidance</p>
          <p className="font-mono text-2xl font-semibold text-[#2563EB]">${totalAvoidance.toFixed(2)}M</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500 mb-1">Payment term wins</p>
          <p className="font-mono text-2xl font-semibold text-[#16A34A]">{paymentTermCount}</p>
        </div>
        <div className={`rounded-xl border p-4 ${pending.length > 0 ? "border-amber-200 bg-amber-50/40" : "border-slate-200 bg-white"}`}>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500 mb-1">Pending finance approval</p>
          <p className="font-mono text-2xl font-semibold text-amber-600">{pending.length}</p>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-5 mb-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-3">Credited business owners</p>
        {leaderboard.length === 0 ? (
          <p className="text-xs text-slate-400 italic">No approved value yet.</p>
        ) : (
          <div className="space-y-2.5">
            {leaderboard.map(([owner, total]) => (
              <div key={owner} className="flex items-center justify-between">
                <span className="text-sm text-slate-700 flex items-center gap-1.5"><UserCircle size={14} className="text-slate-300" />{owner}</span>
                <span className="font-mono text-sm font-semibold text-slate-900">${total.toFixed(2)}M credited</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {["All", ...VALUE_TYPES].map((t) => (
          <button key={t} onClick={() => setFilterType(t)}
            className={`text-xs rounded-full border px-3 py-1.5 font-medium transition-colors ${filterType === t ? "bg-[#0B1220] text-white border-[#0B1220]" : "border-slate-200 text-slate-500 hover:border-slate-300"}`}>
            {t}
          </button>
        ))}
        <span className="w-px bg-slate-200 mx-1" />
        {["All", "Pending Finance Approval", "Approved", "Rejected"].map((s) => (
          <button key={s} onClick={() => setFilterStatus(s)}
            className={`text-xs rounded-full border px-3 py-1.5 font-medium transition-colors ${filterStatus === s ? "bg-[#0B1220] text-white border-[#0B1220]" : "border-slate-200 text-slate-500 hover:border-slate-300"}`}>
            {s}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.map((v) => {
          const contract = contracts.find((c) => c.id === v.contractId);
          return (
            <div key={v.id} className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className={`text-[10px] font-medium rounded-full border px-2 py-0.5 ${valueTypeColor(v.type)}`}>{v.type}</span>
                    <p className="text-sm font-medium text-slate-900">{v.title}</p>
                  </div>
                  <p className="text-xs text-slate-400">
                    {v.supplier}
                    {contract && (
                      <> · <button onClick={() => navigateWithFocus("contracts", contract.id)} className="text-[#2563EB] hover:underline">{contract.name}</button></>
                    )}
                    {v.poId && <> · <span className="font-mono">{v.poId}</span></>}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-mono text-sm font-semibold text-slate-900">${v.amount.toFixed(2)}M</p>
                  <span className={`text-[10px] font-medium rounded-full border px-2 py-0.5 ${valueStatusColor(v.status)}`}>{v.status}</span>
                </div>
              </div>
              <p className="text-xs text-slate-500 mb-2">{v.note}</p>
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span>Credited to <span className="font-medium text-slate-600">{v.creditedTo}</span> · logged by {v.submittedBy} · {v.dateSubmitted}</span>
                {v.status === "Pending Finance Approval" && (
                  canApproveFinance ? (
                    <div className="flex gap-2">
                      <button onClick={() => decide(v.id, true)} className="text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg px-2.5 py-1">Approve</button>
                      <button onClick={() => decide(v.id, false)} className="text-xs font-medium text-white bg-rose-600 hover:bg-rose-700 rounded-lg px-2.5 py-1">Reject</button>
                    </div>
                  ) : <Gated role={currentUser.role} module="Budget" level="edit" fallbackLabel="Finance decision" />
                )}
                {v.status === "Approved" && v.financeApprover && <span>Approved by {v.financeApprover}</span>}
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <p className="text-sm text-slate-400 text-center py-8">No value items match this filter.</p>
        )}
      </div>

      <LogValueItemModal open={logOpen} onClose={() => setLogOpen(false)} onSubmit={addValueItem} />
    </div>
  );
}

/* --------------------------------- workflows --------------------------------- */

function Workflows() {
  const [selected, setSelected] = useState(0);
  const wf = WORKFLOWS[selected];

  return (
    <div>
      <SectionTitle eyebrow="No-code configuration" title="Workflow designer"
        action={<button className="flex items-center gap-1.5 rounded-lg bg-[#0B1220] text-white text-sm px-3 py-2 hover:bg-slate-800"><Plus size={14}/>Create workflow</button>} />

      <div className="grid lg:grid-cols-5 gap-6">
        <div className="lg:col-span-2 rounded-xl border border-slate-200 bg-white divide-y divide-slate-100 overflow-hidden">
          {WORKFLOWS.map((w, i) => (
            <button
              key={w.name}
              onClick={() => setSelected(i)}
              className={`w-full text-left px-4 py-3.5 flex items-center justify-between transition-colors ${
                selected === i ? "bg-slate-50" : "hover:bg-slate-50/60"
              }`}
            >
              <div>
                <p className="text-sm font-medium text-slate-900">{w.name}</p>
                <p className="text-xs text-slate-400 mt-0.5">{w.trigger}</p>
              </div>
              {w.active
                ? <PlayCircle size={16} className="text-emerald-500 shrink-0" />
                : <PauseCircle size={16} className="text-slate-300 shrink-0" />}
            </button>
          ))}
        </div>

        <div className="lg:col-span-3 rounded-xl border border-slate-200 bg-white p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-sm font-semibold text-slate-900">{wf.name}</p>
              <p className="text-xs text-slate-400 mt-0.5">Trigger: {wf.trigger}</p>
            </div>
            <span className={`text-xs font-medium rounded-full px-2.5 py-1 ${wf.active ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
              {wf.active ? "Active" : "Paused"}
            </span>
          </div>

          {/* visual step chain */}
          <div className="flex items-center flex-wrap gap-y-4 mb-8">
            {wf.steps.map((step, i) => (
              <React.Fragment key={step}>
                <div className="flex flex-col items-center gap-2 w-24 text-center">
                  <div className={`h-10 w-10 rounded-full flex items-center justify-center border-2 ${
                    i === 0 ? "border-[#16A34A] bg-[#16A34A]/10" : "border-[#2563EB] bg-[#2563EB]/10"
                  }`}>
                    {i === 0 ? <Zap size={16} className="text-[#16A34A]" /> : <CheckCircle2 size={16} className="text-[#2563EB]" />}
                  </div>
                  <span className="text-[11px] font-medium text-slate-600 leading-snug">{step}</span>
                </div>
                {i < wf.steps.length - 1 && <ArrowRight size={16} className="text-slate-300 mx-1 shrink-0" />}
              </React.Fragment>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-lg bg-slate-50 border border-slate-200 p-4">
              <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">Runs (30 days)</p>
              <p className="font-mono text-2xl font-semibold text-slate-900">{wf.runs.toLocaleString()}</p>
            </div>
            <div className="rounded-lg bg-slate-50 border border-slate-200 p-4">
              <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">Configuration</p>
              <p className="text-sm text-slate-600">Drag-and-drop · no code required</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* --------------------------------- analytics --------------------------------- */

function Analytics() {
  return (
    <div>
      <SectionTitle eyebrow="AI-generated narrative" title="Executive summary — this week" />
      <div className="rounded-xl border border-[#16A34A]/30 bg-[#16A34A]/5 p-5 mb-6 flex gap-3">
        <Sparkles size={18} className="text-[#16A34A] shrink-0 mt-0.5" />
        <p className="text-sm text-slate-700 leading-relaxed">
          Spend held within 2% of plan across all categories except Facilities, where maverick spend rose 4.2% —
          largely driven by an unapproved supplier used by two regional sites. Contract compliance dipped slightly
          to 96% pending Halcyon's counter-signature. Three sourcing events are tracking to close $1.27M in
          combined savings by end of quarter.
        </p>
      </div>
      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <SectionTitle eyebrow="Benchmark" title="Cycle time by process (days)" />
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={[
            { name: "Requisition→PO", days: 0.8 }, { name: "Sourcing event", days: 18 },
            { name: "Contract execution", days: 6.2 }, { name: "Invoice to pay", days: 2.1 },
          ]}>
            <CartesianGrid strokeDasharray="3 3" stroke="#eef1f3" />
            <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 12, fill: "#64748b" }} axisLine={false} tickLine={false} />
            <Tooltip />
            <Bar dataKey="days" fill="#2563EB" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

/* ------------------------------ purchase orders ------------------------------ */

function CreatePOModal({ open, onClose, onCreate }) {
  const { suppliers, budgets, commitBudget } = React.useContext(RequestsContext);
  const [supplier, setSupplier] = useState(suppliers[0]?.name || "");
  const [type, setType] = useState("Standard");
  const [amount, setAmount] = useState("");
  const [budgetCategory, setBudgetCategory] = useState(budgets[0].category);

  useEffect(() => {
    if (open) {
      const first = suppliers[0];
      setSupplier(first?.name || "");
      setType("Standard");
      setAmount("");
      const match = budgets.find((b) => b.category === first?.category);
      setBudgetCategory(match ? match.category : budgets[0].category);
    }
  }, [open]);

  if (!open) return null;
  const canCreate = Number(amount) > 0 && supplier;

  const handleCreate = () => {
    if (!canCreate) return;
    const id = `PO-${Math.floor(58300 + Math.random() * 900)}`;
    onCreate({ id, supplier, type, amount: `$${Number(amount).toLocaleString()}`, status: "Pending Approval", req: "—" });
    commitBudget(budgetCategory, Number(amount) / 1_000_000);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/30" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <p className="text-sm font-semibold text-slate-900">Create purchase order</p>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-700"><X size={18} /></button>
        </div>
        <div className="px-6 py-5 space-y-4">
          <div>
            <p className="text-xs font-medium text-slate-500 mb-1.5">Supplier</p>
            <select value={supplier} onChange={(e) => setSupplier(e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#2563EB] bg-white">
              {suppliers.map((s) => <option key={s.id} value={s.name}>{s.name}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs font-medium text-slate-500 mb-1.5">Type</p>
              <select value={type} onChange={(e) => setType(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#2563EB] bg-white">
                {["Standard", "Blanket", "Service", "Emergency", "Recurring"].map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 mb-1.5">Amount ($)</p>
              <input value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="50000"
                className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#2563EB]" />
            </div>
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 mb-1.5">Draw from budget category</p>
            <select value={budgetCategory} onChange={(e) => setBudgetCategory(e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#2563EB] bg-white">
              {budgets.map((b) => <option key={b.category} value={b.category}>{b.category}</option>)}
            </select>
            <p className="text-[11px] text-slate-400 mt-1.5">This amount will be added to that category's committed spend — check it in Budget after creating.</p>
          </div>
        </div>
        <div className="border-t border-slate-100 px-6 py-4 flex items-center justify-end gap-2">
          <button onClick={onClose} className="rounded-lg px-4 py-2.5 text-sm font-medium text-slate-500 hover:bg-slate-50">Cancel</button>
          <button onClick={handleCreate} disabled={!canCreate}
            className={`rounded-lg px-4 py-2.5 text-sm font-medium text-white ${canCreate ? "bg-[#0B1220] hover:bg-slate-800" : "bg-slate-300 cursor-not-allowed"}`}>
            Create PO
          </button>
        </div>
      </div>
    </div>
  );
}

function PurchaseOrders() {
  const { purchaseOrders, addPO, currentUser } = React.useContext(RequestsContext);
  const [createOpen, setCreateOpen] = useState(false);
  const [activeFilter, setActiveFilter] = usePendingFilter("pos");
  const filteredPOs = purchaseOrders.filter((p) => !activeFilter || activeFilter.matchFn(p));

  return (
    <div>
      <SectionTitle eyebrow="Purchasing" title="Purchase orders"
        action={
          <Gated role={currentUser.role} module="Suppliers" level="edit" fallbackLabel="Create PO">
            <button onClick={() => setCreateOpen(true)} className="flex items-center gap-1.5 rounded-lg bg-[#0B1220] text-white text-sm px-3 py-2 hover:bg-slate-800"><Plus size={14}/>Create PO</button>
          </Gated>
        } />

      <FilterChip activeFilter={activeFilter} onClear={() => setActiveFilter(null)} />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {PO_STATS.map((s) => (
          <div key={s.label} className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500 mb-1">{s.label}</p>
            <p className="font-mono text-2xl font-semibold text-slate-900">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wide">
            <tr>
              <th className="text-left font-medium px-5 py-3">PO number</th>
              <th className="text-left font-medium px-5 py-3">Supplier</th>
              <th className="text-left font-medium px-5 py-3">Type</th>
              <th className="text-left font-medium px-5 py-3">Amount</th>
              <th className="text-left font-medium px-5 py-3">Linked req.</th>
              <th className="text-left font-medium px-5 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredPOs.map((p) => (
              <tr key={p.id} className="border-t border-slate-100 hover:bg-slate-50/60">
                <td className="px-5 py-3 font-mono text-slate-800">{p.id}</td>
                <td className="px-5 py-3 font-medium text-slate-900">{p.supplier}</td>
                <td className="px-5 py-3 text-slate-600">{p.type}</td>
                <td className="px-5 py-3 font-mono text-slate-900">{p.amount}</td>
                <td className="px-5 py-3 font-mono text-slate-400">{p.req}</td>
                <td className="px-5 py-3">
                  <span className={`inline-flex rounded-full border px-2 py-0.5 text-xs font-medium ${poStatusColor(p.status)}`}>{p.status}</span>
                </td>
              </tr>
            ))}
            {filteredPOs.length === 0 && (
              <tr><td colSpan={6} className="px-5 py-8 text-center text-sm text-slate-400">No purchase orders match this filter.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <CreatePOModal open={createOpen} onClose={() => setCreateOpen(false)} onCreate={addPO} />
    </div>
  );
}

/* ------------------------------ risk management ------------------------------ */

function RiskManagement() {
  return (
    <div>
      <SectionTitle eyebrow="Predictive risk intelligence" title="Risk management" />

      <div className="grid lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2 rounded-xl border border-slate-200 bg-white p-5">
          <SectionTitle eyebrow="Trend" title="Enterprise risk index" />
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={RISK_TREND}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eef1f3" />
              <XAxis dataKey="m" tick={{ fontSize: 12, fill: "#64748b" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: "#64748b" }} axisLine={false} tickLine={false} />
              <Tooltip />
              <Line type="monotone" dataKey="index" stroke="#16A34A" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 flex flex-col justify-center gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-rose-50 flex items-center justify-center">
              <Radar size={18} className="text-rose-500" />
            </div>
            <div>
              <p className="font-mono text-2xl font-semibold text-slate-900">44</p>
              <p className="text-xs text-slate-500">current risk index (0–100)</p>
            </div>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            Up 6 points month-over-month, driven mainly by a lapsed compliance certificate and one
            supplier credit downgrade. No critical-severity flags open.
          </p>
        </div>
      </div>

      <SectionTitle eyebrow="Open flags" title="Flagged risks" />
      <div className="grid gap-3">
        {RISK_FLAGS.map((r, i) => (
          <div key={i} className="rounded-xl border border-slate-200 bg-white p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-slate-100 flex items-center justify-center">
                <ShieldAlert size={16} className="text-slate-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-900">{r.supplier}</p>
                <p className="text-xs text-slate-500 mt-0.5">{r.detail}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <span className="text-xs text-slate-400 hidden sm:inline">{r.type}</span>
              <span className={`text-xs font-medium rounded-full border px-2.5 py-1 ${severityColor(r.severity)}`}>{r.severity}</span>
              <span className="text-xs text-slate-400 w-14 text-right">{r.age}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* --------------------------- no-code configuration studio --------------------------- */

function ConfigStudio() {
  const [items, setItems] = useState(CONFIG_ITEMS);
  const toggle = (name) => setItems((it) => it.map((i) => (i.name === name ? { ...i, enabled: !i.enabled } : i)));

  return (
    <div>
      <SectionTitle eyebrow="Zero-code administration" title="Configuration studio" />

      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 rounded-xl border border-slate-200 bg-white divide-y divide-slate-100 overflow-hidden">
          {items.map((i) => (
            <div key={i.name} className="flex items-center justify-between px-5 py-3.5">
              <div className="flex items-center gap-3">
                <GripVertical size={14} className="text-slate-300" />
                <div>
                  <p className="text-sm font-medium text-slate-900">{i.name}</p>
                  <p className="text-xs text-slate-400 mt-0.5">Edited by {i.owner} · {i.edited}</p>
                </div>
              </div>
              <button onClick={() => toggle(i.name)}>
                {i.enabled
                  ? <ToggleRight size={26} className="text-[#2563EB]" />
                  : <ToggleLeft size={26} className="text-slate-300" />}
              </button>
            </div>
          ))}
        </div>

        <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50/60 p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-3">Drag onto any form or workflow</p>
          <div className="grid grid-cols-2 gap-2">
            {FIELD_PALETTE.map((f) => (
              <div key={f} className="rounded-lg bg-white border border-slate-200 px-3 py-2.5 text-xs font-medium text-slate-600 flex items-center gap-1.5 cursor-grab">
                <GripVertical size={12} className="text-slate-300" /> {f}
              </div>
            ))}
          </div>
          <p className="text-[11px] text-slate-400 mt-4 leading-relaxed">
            Business admins compose forms, rules, and approval chains here — no developer or
            deployment required. Changes publish instantly to the modules above.
          </p>
        </div>
      </div>

      <SectionTitle eyebrow="Configurable without code" title="AI prompt library" />
      <div className="grid gap-3">
        {AI_PROMPTS.map((p) => (
          <div key={p.agent} className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-[#16A34A] uppercase tracking-wide flex items-center gap-1.5">
                <Sparkles size={12} /> {p.agent}
              </span>
              <button className="text-xs text-slate-500 hover:text-slate-700">Edit prompt</button>
            </div>
            <p className="text-sm text-slate-600 font-mono leading-relaxed bg-slate-50 rounded-lg px-3 py-2 border border-slate-100">
              {p.prompt}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ----------------------------- project management ----------------------------- */

function LaunchPackageModal({ open, onClose, onLaunch }) {
  const { addRequest, suppliers, budgets, commitBudget } = React.useContext(RequestsContext);
  const [name, setName] = useState("");
  const [owner, setOwner] = useState("You");
  const [supplier, setSupplier] = useState(suppliers[0].name);
  const [budgetCategory, setBudgetCategory] = useState(budgets[0].category);
  const [budgetAmount, setBudgetAmount] = useState("");
  const [components, setComponents] = useState(["contract", "service"]);

  useEffect(() => {
    if (open) {
      setName(""); setOwner("You"); setSupplier(suppliers[0].name);
      setBudgetCategory(budgets[0].category); setBudgetAmount(""); setComponents(["contract", "service"]);
    }
  }, [open]);

  if (!open) return null;

  const toggle = (id) => setComponents((c) => (c.includes(id) ? c.filter((x) => x !== id) : [...c, id]));
  const canLaunch = name.trim().length > 0;

  const handleLaunch = () => {
    if (!canLaunch) return;
    const id = `PRJ-${Math.floor(100 + Math.random() * 800)}`;
    const today = "Today";

    const timeline = [
      { date: today, type: "budget", event: `Package launched by ${owner} — $${budgetAmount || "0"}M requested from ${budgetCategory}` },
    ];

    components.forEach((cid) => {
      const comp = PACKAGE_COMPONENTS.find((c) => c.id === cid);
      if (comp?.requestType) {
        addRequest({
          id: `INT-${Math.floor(2400 + Math.random() * 300)}`,
          title: `${name} — ${comp.label}`,
          type: comp.requestType,
          requester: owner,
          stage: "New",
          ai: aiSuggestion(comp.requestType),
          category: budgetCategory,
          project: name,
          supplier: comp.requestType === "Contract Request" ? supplier : null,
          dispositions: [],
          locked: false,
        });
        timeline.push({ date: today, type: cid, event: `${comp.label} requested — filed to Intake` });
      } else if (comp) {
        timeline.push({ date: today, type: cid, event: `${comp.label} scheduled as part of this package` });
      }
    });

    onLaunch({
      id, name, owner, supplier, status: "On Track", progress: 0, startIdx: 4, endIdx: 8,
      package: {
        budgetCategory, budgetAmount: Number(budgetAmount) || 0,
        rfpId: null, contractIds: [], serviceIds: [], poIds: [], invoiceIds: [],
        requestedComponents: components,
      },
      timeline,
    });
    if (Number(budgetAmount) > 0) commitBudget(budgetCategory, Number(budgetAmount));
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/30" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div>
            <p className="text-sm font-semibold text-slate-900">Launch project package</p>
            <p className="text-xs text-slate-400 mt-0.5">Bundles a budget line with the requests needed to stand up the project</p>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-700"><X size={18} /></button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          <div>
            <p className="text-xs font-medium text-slate-500 mb-1.5">Project name</p>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Warehouse Automation Pilot"
              className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#2563EB]" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs font-medium text-slate-500 mb-1.5">Supplier</p>
              <select value={supplier} onChange={(e) => setSupplier(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#2563EB] bg-white">
                {suppliers.map((s) => <option key={s.name} value={s.name}>{s.name}</option>)}
              </select>
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 mb-1.5">Owner</p>
              <input value={owner} onChange={(e) => setOwner(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#2563EB]" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs font-medium text-slate-500 mb-1.5">Budget category</p>
              <select value={budgetCategory} onChange={(e) => setBudgetCategory(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#2563EB] bg-white">
                {budgets.map((b) => <option key={b.category} value={b.category}>{b.category}</option>)}
              </select>
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 mb-1.5">Amount ($M)</p>
              <input value={budgetAmount} onChange={(e) => setBudgetAmount(e.target.value)} placeholder="0.5"
                className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#2563EB]" />
            </div>
          </div>

          <div>
            <p className="text-xs font-medium text-slate-500 mb-2">Include in this package</p>
            <div className="grid grid-cols-2 gap-2">
              {PACKAGE_COMPONENTS.map((c) => {
                const Icon = c.icon;
                const active = components.includes(c.id);
                return (
                  <button key={c.id} onClick={() => toggle(c.id)}
                    className={`flex items-center gap-2 rounded-lg border px-3 py-2.5 text-xs font-medium transition-colors ${
                      active ? "border-[#16A34A] bg-[#16A34A]/5 text-[#16A34A]" : "border-slate-200 text-slate-500 hover:border-slate-300"
                    }`}>
                    <Icon size={14} /> {c.label}
                  </button>
                );
              })}
            </div>
            <p className="text-[11px] text-slate-400 mt-2">Each selected item files a real request to Intake, tagged to this project.</p>
          </div>
        </div>

        <div className="border-t border-slate-100 px-6 py-4 flex items-center justify-end gap-2">
          <button onClick={onClose} className="rounded-lg px-4 py-2.5 text-sm font-medium text-slate-500 hover:bg-slate-50">Cancel</button>
          <button onClick={handleLaunch} disabled={!canLaunch}
            className={`flex items-center gap-1.5 rounded-lg px-4 py-2.5 text-sm font-medium text-white ${canLaunch ? "bg-[#0B1220] hover:bg-slate-800" : "bg-slate-300 cursor-not-allowed"}`}>
            <Package size={14} /> Launch package
          </button>
        </div>
      </div>
    </div>
  );
}

function ProjectsList({ projects, onOpen, onLaunchClick }) {
  const { currentUser } = React.useContext(RequestsContext);
  const [activeFilter, setActiveFilter] = usePendingFilter("projects");
  const filteredProjects = projects.filter((p) => !activeFilter || activeFilter.matchFn(p));
  return (
    <div>
      <SectionTitle eyebrow="Delivery tracking" title="Project management"
        action={
          canEdit(currentUser.role, "Budget")
            ? <button onClick={onLaunchClick} className="flex items-center gap-1.5 rounded-lg bg-[#0B1220] text-white text-sm px-3 py-2 hover:bg-slate-800"><Package size={14}/>Launch package</button>
            : <Gated role={currentUser.role} module="Budget" fallbackLabel="Launch package" />
        } />

      <FilterChip activeFilter={activeFilter} onClear={() => setActiveFilter(null)} />

      <div className="rounded-xl border border-slate-200 bg-white p-5 mb-6 overflow-x-auto">
        <div className="min-w-[640px]">
          <div className="grid text-[10px] text-slate-400 mb-2" style={{ gridTemplateColumns: `repeat(${PM_MONTHS.length}, 1fr)` }}>
            {PM_MONTHS.map((m) => <span key={m} className="text-center">{m}</span>)}
          </div>
          <div className="space-y-3">
            {filteredProjects.map((p) => {
              const span = p.endIdx - p.startIdx;
              return (
                <div key={p.id} className="relative h-7 rounded-md bg-slate-50">
                  <div
                    className="absolute top-0 h-7 rounded-md bg-slate-200 overflow-hidden"
                    style={{ left: `${(p.startIdx / PM_MONTHS.length) * 100}%`, width: `${(span / PM_MONTHS.length) * 100}%` }}
                  >
                    <div
                      className={`h-full ${p.status === "Delayed" ? "bg-rose-400" : p.status === "At Risk" ? "bg-amber-400" : "bg-[#2563EB]"}`}
                      style={{ width: `${p.progress}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="grid gap-3">
        {filteredProjects.map((p) => (
          <button key={p.id} onClick={() => onOpen(p.id)} className="w-full text-left rounded-xl border border-slate-200 bg-white p-4 flex items-center justify-between hover:bg-slate-50/60 transition-colors">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                <Flag size={16} className="text-slate-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-900">{p.name}</p>
                <p className="text-xs text-slate-500 mt-0.5">{p.owner} · {p.supplier}</p>
              </div>
            </div>
            <div className="flex items-center gap-4 shrink-0">
              <div className="w-28 hidden sm:block">
                <div className="h-1.5 rounded-full bg-slate-100">
                  <div className="h-1.5 rounded-full bg-[#2563EB]" style={{ width: `${p.progress}%` }} />
                </div>
              </div>
              <span className="text-xs font-mono text-slate-500 w-9 text-right">{p.progress}%</span>
              {p.risk
                ? <span className={`text-xs font-medium rounded-full border px-2.5 py-1 ${riskColor(p.risk)}`}>{p.risk} risk</span>
                : <span className="text-xs font-medium rounded-full border border-slate-200 bg-slate-50 text-slate-400 px-2.5 py-1">Not assessed</span>}
              <span className={`text-xs font-medium rounded-full border px-2.5 py-1 ${projectStatusColor(p.status)}`}>{p.status}</span>
              <ChevronRight size={16} className="text-slate-300" />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

function PackageCard({ icon: Icon, title, children, empty, onHeaderClick }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      {onHeaderClick ? (
        <button onClick={onHeaderClick} className="flex items-center gap-2 mb-3 group">
          <Icon size={15} className="text-slate-400 group-hover:text-[#2563EB]" />
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 group-hover:text-[#2563EB] group-hover:underline">{title}</p>
        </button>
      ) : (
        <div className="flex items-center gap-2 mb-3">
          <Icon size={15} className="text-slate-400" />
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{title}</p>
        </div>
      )}
      {empty ? <p className="text-xs text-slate-400 italic">{empty}</p> : children}
    </div>
  );
}

function ProjectDetail({ project, onBack }) {
  const { contracts: allContracts, sourcingEvents, budgets, purchaseOrders, services: allServices, invoices: allInvoices, suppliers, navigateWithFocus, navigateWithFilter, navigateTo, currentUser, updateProject } = React.useContext(RequestsContext);
  const editable = canEdit(currentUser.role, "Suppliers");
  const pkg = project.package;
  const budget = budgets.find((b) => b.category === pkg.budgetCategory);
  const rfp = pkg.rfpId ? sourcingEvents.find((r) => r.id === pkg.rfpId) : null;
  const contracts = (pkg.contractIds || []).map((id) => allContracts.find((c) => c.id === id)).filter(Boolean);
  const services = (pkg.serviceIds || []).map((id) => allServices.find((s) => s.id === id)).filter(Boolean);
  const pos = (pkg.poIds || []).map((id) => purchaseOrders.find((p) => p.id === id)).filter(Boolean);
  const invoices = (pkg.invoiceIds || []).map((id) => allInvoices.find((i) => i.id === id)).filter(Boolean);
  const requested = pkg.requestedComponents || [];
  const projectSupplier = suppliers.find((s) => s.name === project.supplier);

  // Roll up the top risk flags from any linked services
  const riskFlags = services.flatMap((s) =>
    Object.entries(s.riskAssessment || {})
      .filter(([, v]) => v.rating === "High" || v.rating === "Medium")
      .map(([cat, v]) => ({ service: s.name, category: cat, ...v }))
  );

  return (
    <div>
      <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 mb-4">
        <ArrowLeft size={15} /> All projects
      </button>

      <div className="flex items-start justify-between mb-6 flex-wrap gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-widest text-[#16A34A] mb-1">{project.id}</p>
          <h2 className="text-xl font-semibold text-slate-900">{project.name}</h2>
          <p className="text-sm text-slate-500 mt-1 flex items-center gap-2 flex-wrap">
            <EditableText
              value={project.owner}
              editable={editable}
              className="text-slate-500"
              onSave={(v) => updateProject(project.id, { owner: v || project.owner })}
            /> ·
            {projectSupplier ? (
              <button onClick={() => navigateWithFocus("suppliers", projectSupplier.id)} className="text-[#2563EB] hover:underline">{project.supplier}</button>
            ) : project.supplier}
            {projectSupplier && (
              <button onClick={() => navigateWithFocus("vendors", projectSupplier.id)} className="text-xs text-[#16A34A] hover:underline flex items-center gap-1">
                <Handshake size={11} /> Vendor management
              </button>
            )}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="font-mono text-sm text-slate-700">{project.progress}%</p>
            <p className="text-[11px] text-slate-400">complete</p>
          </div>
          <EditableSelect
            value={project.risk}
            options={["Low", "Medium", "High"]}
            editable={editable}
            clearLabel="Risk not assessed"
            onSave={(v) => updateProject(project.id, { risk: v })}
            renderValue={(v) => v
              ? <span className={`text-xs font-medium rounded-full border px-2.5 py-1 ${riskColor(v)}`}>{v} risk</span>
              : <span className="text-xs font-medium rounded-full border border-slate-200 bg-slate-50 text-slate-400 px-2.5 py-1">Risk not assessed</span>}
          />
          <span className={`text-xs font-medium rounded-full border px-2.5 py-1 ${projectStatusColor(project.status)}`}>{project.status}</span>
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 mb-6">
        <PackageCard icon={Wallet} title="Budget">
          <p className="text-lg font-mono font-semibold text-slate-900">${pkg.budgetAmount}M</p>
          <p className="text-xs text-slate-400 mt-1">from {pkg.budgetCategory}</p>
          {budget && (
            <>
              <p className="text-[11px] text-slate-400 mt-2">
                Category: ${budget.spent}M spent / ${budget.committed}M committed of ${budget.allocated}M allocated
              </p>
              <button onClick={() => navigateTo("budget")} className="text-xs text-[#2563EB] hover:underline mt-2 flex items-center gap-1">
                Open Budget <ArrowRight size={11} />
              </button>
            </>
          )}
        </PackageCard>

        <PackageCard icon={Gavel} title="RFP / Sourcing" empty={!rfp && !requested.includes("rfp") ? "No sourcing event — direct engagement." : (!rfp ? "Requested — pending creation." : null)}>
          {rfp && (
            <button onClick={() => navigateTo("sourcing")} className="text-left w-full hover:bg-slate-50 -m-1 p-1 rounded-lg transition-colors">
              <p className="text-sm font-medium text-[#2563EB]">{rfp.title}</p>
              <p className="text-xs text-slate-400 mt-1">{rfp.suppliers} suppliers · {rfp.stage}</p>
              <p className="text-xs font-mono text-[#2563EB] mt-1">{rfp.savings} projected</p>
            </button>
          )}
        </PackageCard>

        <PackageCard icon={Layers} title="Linked services" empty={services.length === 0 ? "No services linked yet." : null}
          onHeaderClick={services.length > 0 ? () => navigateWithFilter("services", (s) => (pkg.serviceIds || []).includes(s.id), project.name) : undefined}>
          {services.map((s) => (
            <button key={s.id} onClick={() => navigateWithFocus("services", s.id)} className="w-full text-left mb-2 last:mb-0 hover:bg-slate-50 -mx-1 px-1 py-0.5 rounded transition-colors">
              <p className="text-sm font-medium text-[#2563EB]">{s.name}</p>
              <span className={`text-[10px] font-medium rounded-full border px-2 py-0.5 ${governanceColor(s.governance)}`}>{s.governance}</span>
            </button>
          ))}
        </PackageCard>

        <PackageCard icon={FileText} title="Contracts" empty={contracts.length === 0 ? (requested.includes("contract") ? "Requested — pending drafting." : "No contract on file.") : null}
          onHeaderClick={contracts.length > 0 ? () => navigateWithFilter("contracts", (c) => (pkg.contractIds || []).includes(c.id), project.name) : undefined}>
          {contracts.map((c) => (
            <button key={c.id} onClick={() => navigateWithFocus("contracts", c.id)} className="w-full text-left mb-2 last:mb-0 flex items-center justify-between gap-2 hover:bg-slate-50 -mx-1 px-1 py-0.5 rounded transition-colors">
              <p className="text-xs text-[#2563EB] truncate">{c.name}</p>
              <span className={`text-[10px] font-medium rounded-full border px-2 py-0.5 shrink-0 ${contractStatusColor(c.status)}`}>{c.status}</span>
            </button>
          ))}
        </PackageCard>

        <PackageCard icon={ClipboardList} title="Purchase orders" empty={pos.length === 0 ? "No POs issued yet." : null}
          onHeaderClick={pos.length > 0 ? () => navigateWithFilter("pos", (p) => (pkg.poIds || []).includes(p.id), project.name) : undefined}>
          {pos.map((p) => (
            <button key={p.id} onClick={() => navigateTo("pos")} className="w-full text-left mb-2 last:mb-0 flex items-center justify-between gap-2 hover:bg-slate-50 -mx-1 px-1 py-0.5 rounded transition-colors">
              <p className="text-xs font-mono text-[#2563EB]">{p.id}</p>
              <p className="text-xs text-slate-500">{p.amount}</p>
              <span className={`text-[10px] font-medium rounded-full border px-2 py-0.5 ${poStatusColor(p.status)}`}>{p.status}</span>
            </button>
          ))}
        </PackageCard>

        <PackageCard icon={Receipt} title="Invoices" empty={invoices.length === 0 ? "No invoices yet." : null}
          onHeaderClick={invoices.length > 0 ? () => navigateWithFilter("invoices", (i) => (pkg.invoiceIds || []).includes(i.id), project.name) : undefined}>
          {invoices.map((i) => (
            <button
              key={i.id}
              onClick={() => navigateWithFocus("invoices", i.id)}
              className="w-full text-left mb-2 last:mb-0 flex items-center justify-between gap-2 hover:bg-slate-50 -mx-1 px-1 py-0.5 rounded transition-colors"
              title="Open this invoice"
            >
              <p className="text-xs font-mono text-[#2563EB]">{i.id}</p>
              <p className="text-xs text-slate-500">{i.amount}</p>
              <span className={`text-[10px] font-medium rounded-full border px-2 py-0.5 ${invStatusColor(i.status)}`}>{i.status}</span>
            </button>
          ))}
        </PackageCard>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-5 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <ShieldCheck size={15} className="text-slate-400" />
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Risk assessment roll-up</p>
        </div>
        {riskFlags.length === 0 ? (
          <p className="text-xs text-slate-400 italic">No elevated risk categories across linked services.</p>
        ) : (
          <div className="space-y-2.5">
            {riskFlags.map((r, i) => (
              <div key={i} className="flex items-start gap-3">
                <span className={`text-xs font-medium rounded-full border px-2 py-0.5 shrink-0 ${riskColor(r.rating)}`}>{r.rating}</span>
                <div>
                  <p className="text-xs font-medium text-slate-700">{r.category} <span className="text-slate-400 font-normal">· {r.service}</span></p>
                  <p className="text-xs text-slate-500 mt-0.5">{r.note}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <div className="flex items-center gap-2 mb-4">
          <Clock size={15} className="text-slate-400" />
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Timeline</p>
        </div>
        <div className="space-y-4">
          {project.timeline.map((t, i) => {
            const Icon = timelineIcon(t.type);
            return (
              <div key={i} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className="h-7 w-7 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                    <Icon size={13} className="text-slate-500" />
                  </div>
                  {i < project.timeline.length - 1 && <div className="w-px flex-1 bg-slate-200 mt-1" />}
                </div>
                <div className="pb-4">
                  <p className="text-xs font-mono text-slate-400">{t.date}</p>
                  <p className="text-sm text-slate-700 mt-0.5">{t.event}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-6">
        <RecordDocumentsNotes
          documents={project.documents || []}
          notes={project.notes || []}
          editable={editable}
          onAddDocument={(doc) => updateProject(project.id, { documents: [...(project.documents || []), { ...doc, uploadedAt: "Today", uploadedBy: currentUser.name }] })}
          onAddNote={(text) => updateProject(project.id, { notes: [...(project.notes || []), { text, author: currentUser.name, date: "Today" }] })}
        />
      </div>
    </div>
  );
}

function ProjectManagement() {
  const { projects, addProject, pendingFocus, clearFocus } = React.useContext(RequestsContext);
  const [selectedId, setSelectedId] = useState(null);
  const [launchOpen, setLaunchOpen] = useState(false);

  const selected = projects.find((p) => p.id === selectedId);

  useEffect(() => {
    if (pendingFocus?.view === "projects" && pendingFocus.id) {
      setSelectedId(pendingFocus.id);
      clearFocus();
    }
  }, [pendingFocus]);

  if (selected) {
    return <ProjectDetail project={selected} onBack={() => setSelectedId(null)} />;
  }

  return (
    <div>
      <ProjectsList projects={projects} onOpen={setSelectedId} onLaunchClick={() => setLaunchOpen(true)} />
      <LaunchPackageModal open={launchOpen} onClose={() => setLaunchOpen(false)} onLaunch={addProject} />
    </div>
  );
}

/* --------------------------------- budget --------------------------------- */

function Budget() {
  const { budgets } = React.useContext(RequestsContext);
  const totals = budgets.reduce((acc, b) => ({
    allocated: acc.allocated + b.allocated, committed: acc.committed + b.committed, spent: acc.spent + b.spent,
  }), { allocated: 0, committed: 0, spent: 0 });

  return (
    <div>
      <SectionTitle eyebrow="FY26 · Finance" title="Budget management" />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          ["Total allocated", `$${totals.allocated.toFixed(1)}M`],
          ["Committed", `$${totals.committed.toFixed(1)}M`],
          ["Spent", `$${totals.spent.toFixed(1)}M`],
          ["Available", `$${(totals.allocated - totals.committed).toFixed(1)}M`],
        ].map(([label, val]) => (
          <div key={label} className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500 mb-1">{label}</p>
            <p className="font-mono text-2xl font-semibold text-slate-900">{val}</p>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <SectionTitle eyebrow="By category" title="Budget utilization ($M)" />
        <div className="space-y-5">
          {budgets.map((b) => {
            const pctCommitted = (b.committed / b.allocated) * 100;
            const pctSpent = (b.spent / b.allocated) * 100;
            const overrun = pctCommitted > 90;
            return (
              <div key={b.category}>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="text-slate-700 font-medium">{b.category}</span>
                  <span className="font-mono text-xs text-slate-500">
                    ${b.spent.toFixed(1)}M spent · ${b.committed.toFixed(1)}M committed of ${b.allocated.toFixed(1)}M
                  </span>
                </div>
                <div className="relative h-2.5 rounded-full bg-slate-100">
                  <div className="absolute h-2.5 rounded-full bg-slate-300" style={{ width: `${Math.min(100, pctCommitted)}%` }} />
                  <div className={`absolute h-2.5 rounded-full ${overrun ? "bg-amber-500" : "bg-[#2563EB]"}`} style={{ width: `${Math.min(100, pctSpent)}%` }} />
                </div>
                {overrun && (
                  <p className="text-xs text-amber-600 mt-1 flex items-center gap-1">
                    <AlertTriangle size={12} /> {pctCommitted.toFixed(0)}% committed — approaching allocation limit
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* --------------------------------- forecast --------------------------------- */

function Forecast() {
  return (
    <div>
      <SectionTitle eyebrow="Predictive analytics" title="Spend & cash forecast" />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {FORECAST_STATS.map((s) => (
          <div key={s.label} className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500 mb-1">{s.label}</p>
            <p className="font-mono text-2xl font-semibold text-slate-900">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-5 mb-6">
        <SectionTitle eyebrow="Actual vs. AI-projected" title="Spend forecast ($M)" />
        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={FORECAST_DATA}>
            <CartesianGrid strokeDasharray="3 3" stroke="#eef1f3" />
            <XAxis dataKey="m" tick={{ fontSize: 12, fill: "#64748b" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 12, fill: "#64748b" }} axisLine={false} tickLine={false} />
            <Tooltip />
            <Line type="monotone" dataKey="actual" stroke="#2563EB" strokeWidth={2} dot={{ r: 3 }} connectNulls={false} />
            <Line type="monotone" dataKey="forecast" stroke="#16A34A" strokeWidth={2} strokeDasharray="5 4" dot={{ r: 3 }} connectNulls />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="rounded-xl border border-[#16A34A]/30 bg-[#16A34A]/5 p-5 flex gap-3">
        <Sparkles size={18} className="text-[#16A34A] shrink-0 mt-0.5" />
        <p className="text-sm text-slate-700 leading-relaxed">
          Spend is projected to rise through October, largely seasonal, before easing in November.
          Working capital impact stays positive if the Northwind rate renegotiation lands within
          30 days — otherwise the Q4 forecast tightens by roughly $600K.
        </p>
      </div>
    </div>
  );
}

/* ------------------------------- administration ------------------------------- */

function DataFieldsTab() {
  const [obj, setObj] = useState(FIELD_OBJECTS[0]);
  const [fieldsByObject, setFieldsByObject] = useState(FIELDS_BY_OBJECT);
  const fields = fieldsByObject[obj];

  const addField = () => {
    setFieldsByObject((f) => ({
      ...f,
      [obj]: [...f[obj], { name: `Custom Field ${f[obj].filter((x) => x.custom).length + 1}`, type: "Text", required: false, custom: true }],
    }));
  };

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-5">
        {FIELD_OBJECTS.map((o) => (
          <button key={o} onClick={() => setObj(o)}
            className={`text-xs rounded-full border px-3 py-1.5 font-medium transition-colors ${
              obj === o ? "bg-[#0B1220] text-white border-[#0B1220]" : "border-slate-200 text-slate-500 hover:border-slate-300"
            }`}>
            {o}
          </button>
        ))}
      </div>
      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 bg-slate-50 border-b border-slate-100">
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">{obj} fields</span>
          <button onClick={addField} className="flex items-center gap-1 text-xs font-medium text-[#2563EB] hover:underline">
            <Plus size={12} /> Add custom field
          </button>
        </div>
        <div className="divide-y divide-slate-100">
          {fields.map((f, i) => (
            <div key={i} className="flex items-center justify-between px-5 py-3">
              <div className="flex items-center gap-3">
                <GripVertical size={13} className="text-slate-300" />
                <div>
                  <p className="text-sm font-medium text-slate-800">
                    {f.name}{f.required && <span className="text-rose-400 ml-1">*</span>}
                  </p>
                  <p className="text-xs text-slate-400">{f.type}</p>
                </div>
              </div>
              <span className={`text-[10px] font-medium rounded-full px-2 py-0.5 ${f.custom ? "bg-[#16A34A]/10 text-[#16A34A]" : "bg-slate-100 text-slate-500"}`}>
                {f.custom ? "Custom" : "System"}
              </span>
            </div>
          ))}
        </div>
      </div>
      <p className="text-[11px] text-slate-400 mt-3">Fields added here appear instantly on the {obj} form and record view — no schema migration required.</p>
    </div>
  );
}

function RolesPermissionsTab() {
  const [matrix, setMatrix] = useState(PERMISSIONS_MATRIX);
  const levels = ["None", "View", "Edit", "Approve"];
  const cycle = (role, idx) => {
    setMatrix((m) => {
      const row = [...m[role]];
      row[idx] = levels[(levels.indexOf(row[idx]) + 1) % levels.length];
      return { ...m, [role]: row };
    });
  };
  const levelColor = (lvl) =>
    lvl === "None" ? "bg-slate-100 text-slate-400"
    : lvl === "View" ? "bg-slate-100 text-slate-600"
    : lvl === "Edit" ? "bg-[#2563EB]/10 text-[#2563EB]"
    : "bg-[#16A34A]/10 text-[#16A34A]";

  return (
    <div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
        {ROLES.map((r) => (
          <div key={r.name} className="rounded-lg border border-slate-200 bg-white px-4 py-3 flex items-center justify-between">
            <span className="text-sm font-medium text-slate-800">{r.name}</span>
            <span className="text-xs font-mono text-slate-400">{r.users} users</span>
          </div>
        ))}
      </div>
      <div className="rounded-xl border border-slate-200 bg-white overflow-x-auto">
        <table className="w-full text-sm min-w-[720px]">
          <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wide">
            <tr>
              <th className="text-left font-medium px-5 py-3">Role</th>
              {PERMISSION_MODULES.map((m) => <th key={m} className="text-left font-medium px-3 py-3">{m}</th>)}
            </tr>
          </thead>
          <tbody>
            {ROLES.map((r) => (
              <tr key={r.name} className="border-t border-slate-100">
                <td className="px-5 py-2.5 font-medium text-slate-800 whitespace-nowrap">{r.name}</td>
                {matrix[r.name].map((lvl, i) => (
                  <td key={i} className="px-3 py-2.5">
                    <button onClick={() => cycle(r.name, i)} className={`text-[11px] font-medium rounded-full px-2 py-0.5 ${levelColor(lvl)}`}>
                      {lvl}
                    </button>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-[11px] text-slate-400 mt-3">Click any permission to cycle None → View → Edit → Approve.</p>
    </div>
  );
}

function NotificationsTab() {
  const [rules, setRules] = useState(NOTIFICATION_RULES);
  const toggle = (i) => setRules((r) => r.map((x, idx) => (idx === i ? { ...x, enabled: !x.enabled } : x)));
  const channelIcon = (c) => (c === "mail" ? Mail : c === "bell" ? Bell : c === "message" ? MessageSquare : Smartphone);

  return (
    <div className="rounded-xl border border-slate-200 bg-white divide-y divide-slate-100 overflow-hidden">
      {rules.map((r, i) => (
        <div key={i} className="flex items-center justify-between px-5 py-3.5">
          <div>
            <p className="text-sm font-medium text-slate-800">{r.trigger}</p>
            <p className="text-xs text-slate-400 mt-0.5">To: {r.recipients}</p>
          </div>
          <div className="flex items-center gap-4 shrink-0">
            <div className="flex items-center gap-2">
              {r.channels.map((c, ci) => {
                const Icon = channelIcon(c);
                return <Icon key={ci} size={14} className="text-slate-400" />;
              })}
            </div>
            <button onClick={() => toggle(i)}>
              {r.enabled ? <ToggleRight size={24} className="text-[#2563EB]" /> : <ToggleLeft size={24} className="text-slate-300" />}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

function CreativeSuiteTab() {
  const [primary, setPrimary] = useState("#0B1220");
  const [accent, setAccent] = useState("#16A34A");

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-3">Brand colors</p>
        <p className="text-xs text-slate-500 mb-2">Primary</p>
        <div className="flex gap-2 mb-4">
          {BRAND_SWATCHES.map((c) => (
            <button key={c} onClick={() => setPrimary(c)} className="h-8 w-8 rounded-full border-2"
              style={{ background: c, borderColor: primary === c ? "#94a3b8" : "transparent" }} />
          ))}
        </div>
        <p className="text-xs text-slate-500 mb-2">Accent</p>
        <div className="flex gap-2 mb-4">
          {BRAND_SWATCHES.map((c) => (
            <button key={c} onClick={() => setAccent(c)} className="h-8 w-8 rounded-full border-2"
              style={{ background: c, borderColor: accent === c ? "#94a3b8" : "transparent" }} />
          ))}
        </div>
        <p className="text-xs text-slate-500 mb-1.5">Typography</p>
        <select className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm bg-white outline-none">
          <option>Inter</option>
          <option>IBM Plex Sans</option>
          <option>Space Grotesk</option>
        </select>
      </div>

      <div className="lg:col-span-2 rounded-xl border border-slate-200 overflow-hidden">
        <div className="h-24 flex items-center px-6 transition-colors" style={{ background: primary }}>
          <span className="text-white font-semibold text-lg">Paradigm Technologies</span>
        </div>
        <div className="p-6 bg-white">
          <div className="h-2 w-24 rounded-full mb-3 transition-colors" style={{ background: accent }} />
          <p className="text-sm text-slate-700 font-medium mb-1">Request for Proposal — Freight Services 2026-Q3</p>
          <p className="text-xs text-slate-400">Live preview updates instantly as brand colors change — the same theme applies across RFPs, contracts, and executive reports.</p>
        </div>
      </div>

      <div className="lg:col-span-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-3 mt-2">Document & email templates</p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {TEMPLATES.map((t) => (
            <div key={t.name} className="rounded-xl border border-slate-200 bg-white overflow-hidden">
              <div className="h-14" style={{ background: accent, opacity: 0.18 }} />
              <div className="p-4">
                <p className="text-sm font-medium text-slate-900">{t.name}</p>
                <p className="text-xs text-slate-400 mt-0.5">{t.type} · edited {t.edited}</p>
                <button className="mt-2 text-xs font-medium text-[#2563EB] hover:underline">Edit template</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function AuditLogTab() {
  const { resetDemoData } = React.useContext(RequestsContext);
  const [confirming, setConfirming] = useState(false);

  return (
    <div>
      <div className="rounded-xl border border-slate-200 bg-white divide-y divide-slate-100 overflow-hidden mb-5">
        {AUDIT_LOG.map((a, i) => (
          <div key={i} className="flex items-center justify-between px-5 py-3">
            <div>
              <p className="text-sm text-slate-800">{a.action}</p>
              <p className="text-xs text-slate-400 mt-0.5">{a.user}</p>
            </div>
            <span className="text-xs font-mono text-slate-400 shrink-0">{a.time}</span>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-2">Data & storage</p>
        <p className="text-xs text-slate-500 leading-relaxed mb-3">
          {hasArtifactStorage
            ? "This workspace's data (requests, contracts, suppliers, projects, budgets, and POs) is shared across everyone who opens this artifact — changes you make here are visible to other viewers, and vice versa."
            : "This workspace's data is saved to this browser only (no shared backend is connected in this deployment) — it will persist across refreshes here, but won't be visible to anyone using a different browser or device."}
        </p>
        {!confirming ? (
          <button onClick={() => setConfirming(true)} className="text-xs font-medium text-rose-600 hover:underline">
            Reset all demo data
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-600">This clears everyone's data back to the seed set. Sure?</span>
            <button onClick={() => { resetDemoData(); setConfirming(false); }} className="text-xs font-medium text-white bg-rose-600 hover:bg-rose-700 rounded-lg px-2.5 py-1">
              Yes, reset
            </button>
            <button onClick={() => setConfirming(false)} className="text-xs text-slate-500 hover:text-slate-700">Cancel</button>
          </div>
        )}
      </div>
    </div>
  );
}

const ADMIN_TABS = [
  { id: "fields", label: "Data Fields", icon: Database },
  { id: "roles", label: "Roles & Permissions", icon: ShieldCheck },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "creative", label: "Creative Suite", icon: Palette },
  { id: "audit", label: "Audit Log", icon: Clock },
];

function Administration() {
  const { currentUser } = React.useContext(RequestsContext);
  const [tab, setTab] = useState("fields");

  if (!canView(currentUser.role, "Admin")) {
    return (
      <div>
        <SectionTitle eyebrow="Zero-code administration" title="Administration" />
        <div className="rounded-xl border border-slate-200 bg-white p-8 flex flex-col items-center text-center gap-3">
          <Lock size={28} className="text-slate-300" />
          <p className="text-sm font-medium text-slate-700">You don't have access to Administration</p>
          <p className="text-xs text-slate-400 max-w-sm">
            Your current role, <span className="font-medium text-slate-500">{currentUser.role}</span>, has no
            permission on the Admin module. Switch to IT Administrator (top right) to see this section,
            or adjust the matrix in Roles & Permissions.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <SectionTitle eyebrow="Zero-code administration" title="Administration" />
      <div className="flex gap-1 border-b border-slate-200 mb-6 overflow-x-auto">
        {ADMIN_TABS.map((t) => {
          const Icon = t.icon;
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px whitespace-nowrap transition-colors ${
                active ? "border-[#16A34A] text-slate-900" : "border-transparent text-slate-500 hover:text-slate-700"
              }`}
            >
              <Icon size={14} /> {t.label}
            </button>
          );
        })}
      </div>
      {tab === "fields" && <DataFieldsTab />}
      {tab === "roles" && <RolesPermissionsTab />}
      {tab === "notifications" && <NotificationsTab />}
      {tab === "creative" && <CreativeSuiteTab />}
      {tab === "audit" && <AuditLogTab />}
    </div>
  );
}

const VIEWS = {
  dashboard: Dashboard, intake: Intake, suppliers: Suppliers, vendors: VendorManagement,
  sourcing: Sourcing, contracts: Contracts, services: Services, projects: ProjectManagement,
  buying: GuidedBuying, pos: PurchaseOrders, invoices: Invoices, value: ValueTracking, budget: Budget,
  forecast: Forecast, risk: RiskManagement, workflows: Workflows, config: ConfigStudio,
  analytics: Analytics, admin: Administration,
};

/* ------------------------------ new request modal ------------------------------ */

function NewRequestModal({ open, initialType, onClose, onSubmit }) {
  const { projects, suppliers, budgets } = React.useContext(RequestsContext);
  const [type, setType] = useState(initialType || REQUEST_TYPES[0].id);
  const [title, setTitle] = useState("");
  const [categoryL1, setCategoryL1] = useState(REQUEST_CATEGORIES[0]);
  const [categoryL2, setCategoryL2] = useState(CATEGORY_TAXONOMY[REQUEST_CATEGORIES[0]][0]);
  const [description, setDescription] = useState("");
  const [value, setValue] = useState("");
  const [neededBy, setNeededBy] = useState("");
  const [project, setProject] = useState("");
  const [supplierPick, setSupplierPick] = useState(suppliers[0]?.name || "");
  const [newSupplierName, setNewSupplierName] = useState("");
  const [costCenter, setCostCenter] = useState(COST_CENTERS[0]);
  const [department, setDepartment] = useState(DEPARTMENTS[0]);
  const [executiveSponsor, setExecutiveSponsor] = useState("");
  const [sourcingManager, setSourcingManager] = useState("");
  const [attachments, setAttachments] = useState([]);
  const [draftContract, setDraftContract] = useState(null);
  const [aiReview, setAiReview] = useState(null); // { suggestedCategory, suggestedValue, contractReview }
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (open) {
      setType(initialType || REQUEST_TYPES[0].id);
      setTitle(""); setDescription(""); setValue(""); setNeededBy("");
      setCategoryL1(REQUEST_CATEGORIES[0]); setCategoryL2(CATEGORY_TAXONOMY[REQUEST_CATEGORIES[0]][0]);
      setProject(""); setSupplierPick(suppliers[0]?.name || ""); setNewSupplierName("");
      setCostCenter(COST_CENTERS[0]); setDepartment(DEPARTMENTS[0]);
      setExecutiveSponsor(""); setSourcingManager("");
      setAttachments([]); setDraftContract(null); setAiReview(null);
      setSubmitted(false);
    }
  }, [open, initialType]);

  if (!open) return null;

  const isContractRequest = type === "Contract Request";
  const canSubmit = title.trim().length > 0 && (!isContractRequest || supplierPick !== "__new__" || newSupplierName.trim().length > 0);
  const activeType = REQUEST_TYPES.find((t) => t.id === type) || REQUEST_TYPES[0];

  const budgetMatch = budgets.find((b) => b.category === categoryL1);
  const projectedNext = budgetMatch ? Number((budgetMatch.committed * 1.05).toFixed(2)) : null;

  const changeL1 = (l1) => { setCategoryL1(l1); setCategoryL2(CATEGORY_TAXONOMY[l1][0]); };

  const runAiReview = () => {
    const suggestedCategory = aiClassifyCategory(`${title} ${description}`);
    const result = { suggestedCategory, suggestedValue: value.trim() ? null : "$25,000–$75,000 (estimate)" };
    if (isContractRequest && draftContract) {
      result.contractReview = aiReviewContract(draftContract.name);
    }
    setAiReview(result);
    if (suggestedCategory && suggestedCategory !== categoryL1) changeL1(suggestedCategory);
  };

  const handleSubmit = () => {
    if (!canSubmit) return;
    const effectiveSupplier = isContractRequest ? (supplierPick === "__new__" ? newSupplierName.trim() : supplierPick) : null;
    onSubmit({
      id: `INT-${Math.floor(2300 + Math.random() * 300)}`,
      title: title.trim(),
      type,
      requester: "You",
      stage: "New",
      ai: aiSuggestion(type),
      category: categoryL1,
      subcategory: categoryL2,
      description,
      value,
      neededBy,
      project: project || null,
      supplier: effectiveSupplier,
      costCenter, department,
      executiveSponsor: executiveSponsor || null,
      sourcingManager: sourcingManager || null,
      attachments,
      draftContract,
      needsBudgetDisposition: !budgetMatch,
      aiReview,
      dispositions: [],
      locked: false,
    });
    setSubmitted(true);
    setTimeout(onClose, 1200);
  };

  const addAttachment = (e) => {
    const files = Array.from(e.target.files || []);
    setAttachments((a) => [...a, ...files.map((f) => ({ name: f.name, sizeKB: Math.round(f.size / 1024) }))]);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/30" onClick={onClose} />
      <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div>
            <p className="text-sm font-semibold text-slate-900">New request</p>
            <p className="text-xs text-slate-400 mt-0.5">Submits to Intake for AI triage and routing</p>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-700"><X size={18} /></button>
        </div>

        {submitted ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 px-6 py-16">
            <CheckCircle2 size={36} className="text-emerald-500" />
            <p className="text-sm font-medium text-slate-800">Request submitted</p>
            <p className="text-xs text-slate-400 text-center max-w-xs">{aiSuggestion(type)}</p>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
              <div>
                <p className="text-xs font-medium text-slate-500 mb-2">Request type</p>
                <div className="grid grid-cols-3 gap-2">
                  {REQUEST_TYPES.map((t) => {
                    const Icon = t.icon;
                    const active = t.id === type;
                    return (
                      <button
                        key={t.id}
                        onClick={() => setType(t.id)}
                        className={`flex flex-col items-center gap-1.5 rounded-lg border px-2 py-3 text-xs font-medium transition-colors ${
                          active ? "border-[#16A34A] bg-[#16A34A]/5 text-[#16A34A]" : "border-slate-200 text-slate-500 hover:border-slate-300"
                        }`}
                      >
                        <Icon size={16} />
                        {t.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <p className="text-xs font-medium text-slate-500 mb-1.5">Title</p>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={`e.g. ${activeType.label === "Vendor" ? "Onboard Crescent Analytics" : activeType.label === "RFx / Sourcing" ? "RFP for packaging suppliers" : `New ${activeType.label.toLowerCase()} request`}`}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#2563EB]"
                />
              </div>

              {isContractRequest && (
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <p className="text-xs font-medium text-slate-500 mb-1.5">Preferred supplier</p>
                  <select
                    value={supplierPick}
                    onChange={(e) => setSupplierPick(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm bg-white outline-none focus:border-[#2563EB]"
                  >
                    {suppliers.map((s) => <option key={s.name} value={s.name}>{s.name}</option>)}
                    <option value="__new__">+ New supplier (not yet in system)</option>
                  </select>
                  {supplierPick === "__new__" && (
                    <input
                      value={newSupplierName}
                      onChange={(e) => setNewSupplierName(e.target.value)}
                      placeholder="New supplier name"
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#2563EB] mt-2"
                    />
                  )}
                  <p className="text-[11px] text-slate-400 mt-1.5">
                    {supplierPick === "__new__"
                      ? "Since this supplier is new, onboarding it and setting up an initial service will be packaged together with the contract."
                      : "Contract will be drafted against this supplier's existing record."}
                  </p>
                  <div className="mt-3 pt-3 border-t border-slate-200">
                    <p className="text-xs font-medium text-slate-500 mb-1.5">Attach draft contract (optional)</p>
                    <label className="flex items-center gap-2 rounded-lg border border-dashed border-slate-300 px-3 py-2.5 text-xs text-slate-500 cursor-pointer hover:border-[#2563EB] transition-colors">
                      <Upload size={13} className="text-slate-400 shrink-0" />
                      {draftContract ? draftContract.name : "Choose a PDF or Word draft"}
                      <input type="file" accept=".pdf,.doc,.docx" className="hidden"
                        onChange={(e) => { const f = e.target.files?.[0]; if (f) setDraftContract({ name: f.name, sizeKB: Math.round(f.size / 1024) }); }} />
                    </label>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs font-medium text-slate-500 mb-1.5">Category (L1)</p>
                  <select value={categoryL1} onChange={(e) => changeL1(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#2563EB] bg-white">
                    {REQUEST_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500 mb-1.5">Subcategory (L2)</p>
                  <select value={categoryL2} onChange={(e) => setCategoryL2(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#2563EB] bg-white">
                    {CATEGORY_TAXONOMY[categoryL1].map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs font-medium text-slate-500 mb-1.5">Cost center</p>
                  <select value={costCenter} onChange={(e) => setCostCenter(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#2563EB] bg-white">
                    {COST_CENTERS.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500 mb-1.5">Department</p>
                  <select value={department} onChange={(e) => setDepartment(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#2563EB] bg-white">
                    {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
              </div>

              {/* Budget & forecast snapshot */}
              <div className={`rounded-lg border p-3 ${budgetMatch ? "border-slate-200 bg-slate-50" : "border-amber-200 bg-amber-50/50"}`}>
                <p className="text-xs font-medium text-slate-500 mb-1.5 flex items-center gap-1.5">
                  <Wallet size={13} className="text-slate-400" /> Budget & forecast — {categoryL1}
                </p>
                {budgetMatch ? (
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div><p className="text-slate-400">Allocated</p><p className="font-mono text-slate-700">${budgetMatch.allocated}M</p></div>
                    <div><p className="text-slate-400">Committed</p><p className="font-mono text-slate-700">${budgetMatch.committed}M</p></div>
                    <div><p className="text-slate-400">Projected next Q</p><p className="font-mono text-slate-700">${projectedNext}M</p></div>
                  </div>
                ) : (
                  <p className="text-xs text-amber-700 flex items-center gap-1.5">
                    <AlertTriangle size={12} /> No budget or forecast on file for this category — this request will be flagged for disposition.
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs font-medium text-slate-500 mb-1.5">Executive sponsor</p>
                  <select value={executiveSponsor} onChange={(e) => setExecutiveSponsor(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#2563EB] bg-white">
                    <option value="">None</option>
                    {USERS.map((u) => <option key={u.name} value={u.name}>{u.name}</option>)}
                  </select>
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500 mb-1.5">Sourcing manager (optional)</p>
                  <select value={sourcingManager} onChange={(e) => setSourcingManager(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#2563EB] bg-white">
                    <option value="">None</option>
                    {USERS.map((u) => <option key={u.name} value={u.name}>{u.name}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <p className="text-xs font-medium text-slate-500 mb-1.5">Linked project (optional)</p>
                <select
                  value={project}
                  onChange={(e) => setProject(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#2563EB] bg-white"
                >
                  <option value="">Not linked to a project</option>
                  {projects.map((p) => <option key={p.id} value={p.name}>{p.name}</option>)}
                </select>
              </div>

              <div>
                <p className="text-xs font-medium text-slate-500 mb-1.5">Estimated value (optional)</p>
                <input
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  placeholder="$"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#2563EB]"
                />
              </div>

              <div>
                <p className="text-xs font-medium text-slate-500 mb-1.5">Description / justification</p>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  placeholder="What do you need, and why?"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#2563EB] resize-none"
                />
              </div>

              <div>
                <p className="text-xs font-medium text-slate-500 mb-1.5">Supporting documents</p>
                <label className="flex items-center gap-2 rounded-lg border border-dashed border-slate-300 px-3 py-2.5 text-xs text-slate-500 cursor-pointer hover:border-[#2563EB] transition-colors">
                  <Upload size={13} className="text-slate-400 shrink-0" /> Attach files
                  <input type="file" multiple className="hidden" onChange={addAttachment} />
                </label>
                {attachments.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {attachments.map((a, i) => (
                      <div key={i} className="flex items-center gap-1.5 text-xs text-slate-600">
                        <FileCheck2 size={12} className="text-slate-400 shrink-0" /> {a.name} <span className="text-slate-300">· {a.sizeKB} KB</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* AI first-review */}
              <div className="rounded-lg border border-[#16A34A]/30 bg-[#16A34A]/5 p-3">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-medium text-slate-600 flex items-center gap-1.5"><Sparkles size={13} className="text-[#16A34A]" /> AI first review</p>
                  <button onClick={runAiReview} className="text-xs font-medium text-[#16A34A] hover:underline">Run review</button>
                </div>
                {!aiReview ? (
                  <p className="text-[11px] text-slate-500">
                    AI can pre-check spend estimate and category{isContractRequest ? ", and scan an attached draft contract for substandard terms, grammar, preamble completeness, and redundant clauses" : ""}. This is a simulated review for this prototype, not a real document analysis.
                  </p>
                ) : (
                  <div className="space-y-1.5 text-[11px] text-slate-600">
                    {aiReview.suggestedCategory && <p>• Suggested category: <span className="font-medium">{aiReview.suggestedCategory}</span> (applied above)</p>}
                    {aiReview.suggestedValue && <p>• Suggested spend range: <span className="font-medium">{aiReview.suggestedValue}</span></p>}
                    {!aiReview.suggestedCategory && !aiReview.suggestedValue && !aiReview.contractReview && <p>No changes suggested — details look consistent.</p>}
                    {aiReview.contractReview && (
                      <div className="mt-2 pt-2 border-t border-[#16A34A]/20 space-y-1">
                        <p>• Preamble: <span className="font-medium">{aiReview.contractReview.preamble}</span></p>
                        <p>• Grammar: <span className="font-medium">{aiReview.contractReview.grammar} issue(s) flagged</span></p>
                        <p>• Redundancy: <span className="font-medium">{aiReview.contractReview.redundancy}</span></p>
                        <p>• Terms: <span className="font-medium">{aiReview.contractReview.substandardTerms}</span></p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="border-t border-slate-100 px-6 py-4 flex items-center justify-end gap-2">
              <button onClick={onClose} className="rounded-lg px-4 py-2.5 text-sm font-medium text-slate-500 hover:bg-slate-50">
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={!canSubmit}
                className={`rounded-lg px-4 py-2.5 text-sm font-medium text-white ${
                  canSubmit ? "bg-[#0B1220] hover:bg-slate-800" : "bg-slate-300 cursor-not-allowed"
                }`}
              >
                Submit request
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/* ----------------------------- global search & user switcher ----------------------------- */

function GlobalSearch() {
  const { contracts, suppliers, projects, sourcingEvents, services, navigateWithFocus } = React.useContext(RequestsContext);
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);

  const results = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return [];
    const out = [];
    suppliers.forEach((s) => { if (s.name.toLowerCase().includes(term)) out.push({ type: "Supplier", icon: Building2, label: s.name, view: "suppliers", id: s.id }); });
    contracts.forEach((c) => { if (c.name.toLowerCase().includes(term)) out.push({ type: "Contract", icon: FileText, label: c.name, view: "contracts", id: c.id }); });
    services.forEach((s) => { if (s.name.toLowerCase().includes(term)) out.push({ type: "Service", icon: Layers, label: s.name, view: "services", id: s.id }); });
    projects.forEach((p) => { if (p.name.toLowerCase().includes(term)) out.push({ type: "Project", icon: Flag, label: p.name, view: "projects", id: p.id }); });
    sourcingEvents.forEach((e) => { if (e.title.toLowerCase().includes(term)) out.push({ type: "RFP", icon: Gavel, label: e.title, view: "sourcing", id: e.id }); });
    return out.slice(0, 8);
  }, [q, suppliers, contracts, projects, sourcingEvents, services]);

  return (
    <div className="relative hidden md:block">
      <div className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-1.5 text-slate-400 w-64">
        <Search size={14} className="shrink-0" />
        <input
          value={q}
          onChange={(e) => { setQ(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          placeholder="Search suppliers, contracts, projects…"
          className="flex-1 outline-none text-xs bg-transparent text-slate-700 placeholder:text-slate-400 min-w-0"
        />
      </div>
      {open && results.length > 0 && (
        <div className="absolute top-full mt-1 left-0 w-80 bg-white border border-slate-200 rounded-lg shadow-lg overflow-hidden z-50">
          {results.map((r, i) => {
            const Icon = r.icon;
            return (
              <button key={i} onClick={() => { navigateWithFocus(r.view, r.id); setQ(""); setOpen(false); }}
                className="w-full text-left flex items-center gap-2 px-3 py-2.5 hover:bg-slate-50 border-b border-slate-100 last:border-0">
                <Icon size={13} className="text-slate-400 shrink-0" />
                <span className="text-xs text-slate-700 truncate flex-1">{r.label}</span>
                <span className="text-[10px] text-slate-400 shrink-0">{r.type}</span>
              </button>
            );
          })}
        </div>
      )}
      {open && q.trim() && results.length === 0 && (
        <div className="absolute top-full mt-1 left-0 w-80 bg-white border border-slate-200 rounded-lg shadow-lg p-3 z-50">
          <p className="text-xs text-slate-400">No matches for "{q}".</p>
        </div>
      )}
    </div>
  );
}

function UserSwitcher() {
  const { currentUser, setCurrentUser } = React.useContext(RequestsContext);
  const [open, setOpen] = useState(false);
  const initials = currentUser.name.split(" ").filter((w) => /^[A-Za-z]/.test(w)).map((w) => w[0]).slice(0, 2).join("").toUpperCase();

  return (
    <div className="relative">
      <button onClick={() => setOpen((o) => !o)} className="flex items-center gap-2 hover:opacity-80">
        <div className="h-8 w-8 rounded-full bg-[#2563EB] text-white text-xs font-medium flex items-center justify-center shrink-0">
          {initials}
        </div>
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-2 w-60 bg-white border border-slate-200 rounded-lg shadow-lg overflow-hidden z-50">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400 px-3 py-2 bg-slate-50">Switch user (demo)</p>
            {USERS.map((u) => (
              <button key={u.name} onClick={() => { setCurrentUser(u); setOpen(false); }}
                className={`w-full text-left px-3 py-2 text-xs hover:bg-slate-50 flex items-center justify-between ${currentUser.name === u.name ? "bg-slate-50" : ""}`}>
                <span className="text-slate-700">{u.name}</span>
                <span className="text-slate-400">{u.role}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

/* --------------------------------- copilot --------------------------------- */

function Copilot({ open, onClose }) {
  const ctx = React.useContext(RequestsContext);
  const [messages, setMessages] = useState([
    { role: "ai", text: "I'm your procurement copilot. Ask me about suppliers, contracts, spend, or invoices — or try one of the prompts below." },
  ]);
  const [input, setInput] = useState("");

  const send = (text) => {
    if (!text.trim()) return;
    const reply = liveCopilotReply(text, ctx);
    setMessages((m) => [...m, { role: "user", text }, { role: "ai", text: reply }]);
    setInput("");
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-slate-900/20" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-[#0B1220]">
          <div className="flex items-center gap-2 text-white">
            <div className="h-8 w-8 rounded-lg bg-[#16A34A]/20 flex items-center justify-center">
              <Bot size={16} className="text-[#16A34A]" />
            </div>
            <div>
              <p className="text-sm font-semibold">Procurement Copilot</p>
              <p className="text-[11px] text-slate-400">Always available · every screen</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white"><X size={18} /></button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[85%] rounded-xl px-4 py-2.5 text-sm leading-relaxed ${
                m.role === "user" ? "bg-[#2563EB] text-white" : "bg-slate-50 border border-slate-200 text-slate-700"
              }`}>
                {m.text}
              </div>
            </div>
          ))}
        </div>

        <div className="px-5 pb-3 flex flex-wrap gap-2">
          {COPILOT_SEEDS.map((s) => (
            <button key={s} onClick={() => send(s)}
              className="text-xs rounded-full border border-slate-200 px-3 py-1.5 text-slate-600 hover:border-[#16A34A] hover:text-[#16A34A] transition-colors">
              {s}
            </button>
          ))}
        </div>

        <div className="border-t border-slate-100 p-4 flex items-center gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send(input)}
            placeholder="Ask the copilot anything…"
            className="flex-1 rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#2563EB]"
          />
          <button onClick={() => send(input)} className="h-10 w-10 rounded-lg bg-[#0B1220] flex items-center justify-center hover:bg-slate-800">
            <Send size={16} className="text-white" />
          </button>
        </div>
      </div>
    </div>
  );
}

/* ----------------------------------- app ----------------------------------- */

export default function App() {
  const [view, setView] = useState("dashboard");
  const [copilotOpen, setCopilotOpen] = useState(false);
  const [requests, setRequests] = useState(INTAKE_REQUESTS);
  const [contracts, setContracts] = useState(CONTRACTS);
  const [sourcingEvents, setSourcingEvents] = useState(SOURCING_EVENTS);
  const [suppliers, setSuppliers] = useState(SUPPLIERS);
  const [projects, setProjects] = useState(PROJECTS);
  const [budgets, setBudgets] = useState(BUDGETS);
  const [purchaseOrders, setPurchaseOrders] = useState(PURCHASE_ORDERS);
  const [services, setServices] = useState(SERVICES);
  const [invoices, setInvoices] = useState(INVOICES);
  const [vendorSlas, setVendorSlas] = useState(VENDOR_SLAS);
  const [businessReviews, setBusinessReviews] = useState(BUSINESS_REVIEWS);
  const [valueItems, setValueItems] = useState(VALUE_ITEMS);
  const [currentUser, setCurrentUser] = useState(USERS[0]);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState(null);
  const [pendingFocus, setPendingFocus] = useState(null); // { view, id } set by global search
  const [pendingFilter, setPendingFilter] = useState(null); // { view, matchFn, label } set by module-link navigation
  const [loaded, setLoaded] = useState(false);
  const Active = useMemo(() => VIEWS[view], [view]);
  const activeLabel = NAV.find((n) => n.id === view)?.label;

  // ---- Persistence: shared across everyone who opens this artifact ----
  useEffect(() => {
    (async () => {
      try {
        const res = await storage.get("core-data");
        if (res?.value) {
          const d = JSON.parse(res.value);
          if (d.requests) setRequests(d.requests);
          if (d.contracts) setContracts(d.contracts);
          if (d.sourcingEvents) setSourcingEvents(d.sourcingEvents);
          if (d.suppliers) setSuppliers(d.suppliers);
          if (d.projects) setProjects(d.projects);
          if (d.budgets) setBudgets(d.budgets);
          if (d.purchaseOrders) setPurchaseOrders(d.purchaseOrders);
          if (d.services) setServices(d.services);
          if (d.invoices) setInvoices(d.invoices);
          if (d.vendorSlas) setVendorSlas(d.vendorSlas);
          if (d.businessReviews) setBusinessReviews(d.businessReviews);
          if (d.valueItems) setValueItems(d.valueItems);
        }
      } catch {
        // No saved data yet — starting from seed data is expected on first run.
      } finally {
        setLoaded(true);
      }
    })();
  }, []);

  useEffect(() => {
    if (!loaded) return; // don't overwrite storage with seed data before the initial load completes
    (async () => {
      try {
        await storage.set("core-data", JSON.stringify({
          requests, contracts, sourcingEvents, suppliers, projects, budgets, purchaseOrders, services,
          invoices, vendorSlas, businessReviews, valueItems,
        }));
      } catch {
        // Best-effort save; ignore transient storage failures.
      }
    })();
  }, [loaded, requests, contracts, sourcingEvents, suppliers, projects, budgets, purchaseOrders, services, invoices, vendorSlas, businessReviews, valueItems]);

  const resetDemoData = async () => {
    setRequests(INTAKE_REQUESTS); setContracts(CONTRACTS); setSourcingEvents(SOURCING_EVENTS);
    setSuppliers(SUPPLIERS); setProjects(PROJECTS); setBudgets(BUDGETS); setPurchaseOrders(PURCHASE_ORDERS);
    setServices(SERVICES); setInvoices(INVOICES); setVendorSlas(VENDOR_SLAS); setBusinessReviews(BUSINESS_REVIEWS);
    setValueItems(VALUE_ITEMS);
    try { await storage.delete("core-data"); } catch {}
  };

  const openNewRequest = (type) => { setModalType(type); setModalOpen(true); };
  const addRequest = (req) => setRequests((r) => [req, ...r]);
  const updateRequest = (id, patch) => setRequests((r) => r.map((req) => (req.id === id ? { ...req, ...patch } : req)));

  const addContract = (c) => setContracts((cs) => [c, ...cs]);
  const updateContract = (id, patch) => setContracts((cs) => cs.map((c) => (c.id === id ? { ...c, ...patch } : c)));

  const addSourcingEvent = (e) => setSourcingEvents((es) => [e, ...es]);
  const addProject = (p) => setProjects((ps) => [p, ...ps]);
  const updateProject = (id, patch) => setProjects((ps) => ps.map((p) => (p.id === id ? { ...p, ...patch } : p)));
  const addValueItem = (v) => setValueItems((vs) => [v, ...vs]);
  const updateValueItem = (id, patch) => setValueItems((vs) => vs.map((v) => (v.id === id ? { ...v, ...patch } : v)));

  // Increases a budget category's committed amount — the real "money moves" hook.
  const commitBudget = (category, amountM) => {
    setBudgets((bs) => bs.map((b) => (b.category === category ? { ...b, committed: Number((b.committed + amountM).toFixed(2)) } : b)));
  };

  const addPO = (po) => setPurchaseOrders((ps) => [po, ...ps]);
  const addService = (s) => setServices((ss) => [s, ...ss]);
  const updateService = (id, patch) => setServices((ss) => ss.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  const updateSupplier = (id, patch) => setSuppliers((ss) => ss.map((s) => (s.id === id ? { ...s, ...patch } : s)));

  const updateInvoice = (id, patch) => setInvoices((is) => is.map((i) => (i.id === id ? { ...i, ...patch } : i)));

  const addVendorSla = (s) => setVendorSlas((ss) => [s, ...ss]);
  const updateVendorSla = (id, patch) => setVendorSlas((ss) => ss.map((s) => (s.id === id ? { ...s, ...patch } : s)));

  const scheduleReview = (r) => setBusinessReviews((rs) => [r, ...rs]);
  const updateReview = (id, patch) => setBusinessReviews((rs) => rs.map((r) => (r.id === id ? { ...r, ...patch } : r)));

  // Onboarding a vendor either activates an existing (e.g. "Pending Onboarding") supplier
  // record, or creates a new one if no match exists.
  const onboardSupplier = (nameGuess, category) => {
    setSuppliers((ss) => {
      const match = ss.find((s) => nameGuess.toLowerCase().includes(s.name.toLowerCase()));
      if (match) {
        return ss.map((s) => (s.name === match.name ? { ...s, status: "Approved" } : s));
      }
      return [{
        id: `SUP-${Math.floor(100 + Math.random() * 800)}`,
        name: nameGuess, category: category || "Uncategorized", risk: null, risk_score: null,
        spend: "$0", status: "Approved", msa: null,
      }, ...ss];
    });
  };

  const navigateWithFocus = (targetView, id) => { setPendingFocus({ view: targetView, id }); setView(targetView); };
  const clearFocus = () => setPendingFocus(null);
  const navigateWithFilter = (targetView, matchFn, label) => { setPendingFilter({ view: targetView, matchFn, label }); setView(targetView); };
  const clearPendingFilter = () => setPendingFilter(null);

  const ctxValue = useMemo(() => ({
    requests, openNewRequest, addRequest, updateRequest,
    contracts, addContract, updateContract,
    sourcingEvents, addSourcingEvent,
    suppliers, onboardSupplier, updateSupplier,
    projects, addProject, updateProject,
    valueItems, addValueItem, updateValueItem,
    budgets, commitBudget,
    purchaseOrders, addPO,
    services, addService, updateService,
    invoices, updateInvoice,
    vendorSlas, addVendorSla, updateVendorSla,
    businessReviews, scheduleReview, updateReview,
    currentUser, setCurrentUser,
    navigateTo: setView,
    navigateWithFocus, pendingFocus, clearFocus,
    navigateWithFilter, pendingFilter, clearPendingFilter,
    resetDemoData,
  }), [requests, contracts, sourcingEvents, suppliers, projects, budgets, purchaseOrders, services, invoices, vendorSlas, businessReviews, valueItems, currentUser, pendingFocus, pendingFilter]);

  if (!loaded) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-[#F7F8FA]">
        <p className="text-sm text-slate-400">Loading workspace…</p>
      </div>
    );
  }

  return (
    <RequestsContext.Provider value={ctxValue}>
    <div className="h-screen w-full flex bg-[#F7F8FA] font-sans text-slate-800" style={{ fontFamily: "Inter, ui-sans-serif, system-ui" }}>
      {/* Sidebar */}
      <aside className="w-60 shrink-0 bg-[#0B1220] flex flex-col">
        <div className="px-5 py-5 border-b border-white/5">
          <p className="text-white font-semibold tracking-tight text-[15px]">Paradigm P2P</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Procure-to-Pay · Enterprise</p>
        </div>
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {NAV.map((n) => {
            const Icon = n.icon;
            const active = view === n.id;
            return (
              <button
                key={n.id}
                onClick={() => setView(n.id)}
                className={`w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                  active ? "bg-white/10 text-white" : "text-slate-400 hover:text-slate-100 hover:bg-white/5"
                }`}
              >
                <Icon size={16} className={active ? "text-[#16A34A]" : ""} />
                {n.label}
              </button>
            );
          })}
        </nav>
        <div className="p-3">
          <button
            onClick={() => setCopilotOpen(true)}
            className="w-full flex items-center gap-2 rounded-lg bg-gradient-to-r from-[#16A34A] to-[#a8722f] px-3 py-3 text-sm font-medium text-white hover:opacity-90"
          >
            <Sparkles size={16} /> Ask Copilot
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 shrink-0 border-b border-slate-200 bg-white flex items-center justify-between px-6">
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <span>Paradigm</span><ChevronRight size={14} /><span className="text-slate-700 font-medium">{activeLabel}</span>
          </div>
          <div className="flex items-center gap-4">
            <GlobalSearch />
            <button
              onClick={() => openNewRequest(null)}
              className="flex items-center gap-1.5 rounded-lg bg-[#0B1220] text-white text-sm px-3 py-2 hover:bg-slate-800"
            >
              <Plus size={14} /> New request
            </button>
            <button className="relative text-slate-500 hover:text-slate-700">
              <Bell size={18} />
              <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-[#16A34A]" />
            </button>
            <UserSwitcher />
          </div>
        </header>

        <main className="flex-1 overflow-y-auto px-6 py-6">
          <Active />
        </main>
      </div>

      <Copilot open={copilotOpen} onClose={() => setCopilotOpen(false)} />
      <NewRequestModal
        open={modalOpen}
        initialType={modalType}
        onClose={() => setModalOpen(false)}
        onSubmit={addRequest}
      />

      {!copilotOpen && (
        <button
          onClick={() => setCopilotOpen(true)}
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full bg-[#0B1220] shadow-lg flex items-center justify-center hover:scale-105 transition-transform"
        >
          <Bot size={22} className="text-[#16A34A]" />
        </button>
      )}
    </div>
    </RequestsContext.Provider>
  );
}
