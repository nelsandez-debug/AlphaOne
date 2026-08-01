import "dotenv/config";
import { prisma } from "../src/lib/prisma";
import { Role, PermissionLevel } from "../src/generated/prisma/enums";

// Mirrors the reference prototype's PERMISSION_MODULES / PERMISSIONS_MATRIX
// (Administration -> Roles & Permissions), plus "Intake" (Phase 2), "Purchase
// Orders" / "Vendor Management" (Phase 3), and "Projects" / "Value Tracking" /
// "Risk Management" / "Analytics" (Phase 4-5) appended — the reference left all
// of these either completely ungated or piggybacked on the Suppliers permission
// instead of having their own, which principle 2 doesn't allow here. Levels below
// are a first pass, adjustable later from Administration (Phase 6).
const MODULES = [
  "Suppliers", "Sourcing", "Contracts", "Services", "Invoices", "Budget", "Admin",
  "Intake", "Purchase Orders", "Vendor Management",
  "Projects", "Value Tracking", "Risk Management", "Analytics",
] as const;

const MATRIX: Record<Role, PermissionLevel[]> = {
  [Role.EXECUTIVE]:           ["VIEW", "VIEW", "VIEW", "VIEW", "VIEW", "VIEW", "NONE", "VIEW", "VIEW", "VIEW", "VIEW", "VIEW", "VIEW", "VIEW"] as PermissionLevel[],
  [Role.PROCUREMENT_LEADER]:  ["EDIT", "APPROVE", "EDIT", "EDIT", "VIEW", "EDIT", "VIEW", "EDIT", "EDIT", "EDIT", "EDIT", "EDIT", "EDIT", "VIEW"] as PermissionLevel[],
  [Role.CATEGORY_MANAGER]:    ["EDIT", "EDIT", "VIEW", "EDIT", "NONE", "VIEW", "NONE", "EDIT", "EDIT", "EDIT", "EDIT", "EDIT", "VIEW", "VIEW"] as PermissionLevel[],
  [Role.BUYER]:               ["VIEW", "VIEW", "NONE", "NONE", "NONE", "NONE", "NONE", "EDIT", "EDIT", "VIEW", "VIEW", "EDIT", "NONE", "VIEW"] as PermissionLevel[],
  [Role.APPROVER]:            ["VIEW", "VIEW", "VIEW", "VIEW", "APPROVE", "VIEW", "NONE", "VIEW", "APPROVE", "VIEW", "VIEW", "APPROVE", "VIEW", "VIEW"] as PermissionLevel[],
  [Role.FINANCE_ANALYST]:     ["VIEW", "NONE", "VIEW", "VIEW", "EDIT", "EDIT", "NONE", "VIEW", "VIEW", "VIEW", "VIEW", "APPROVE", "VIEW", "VIEW"] as PermissionLevel[],
  [Role.ACCOUNTS_PAYABLE]:    ["NONE", "NONE", "NONE", "NONE", "APPROVE", "VIEW", "NONE", "NONE", "VIEW", "NONE", "NONE", "VIEW", "NONE", "VIEW"] as PermissionLevel[],
  [Role.COMPLIANCE_OFFICER]:  ["VIEW", "NONE", "EDIT", "EDIT", "NONE", "NONE", "NONE", "VIEW", "NONE", "VIEW", "VIEW", "NONE", "EDIT", "VIEW"] as PermissionLevel[],
  [Role.IT_ADMINISTRATOR]:    ["NONE", "NONE", "NONE", "NONE", "NONE", "NONE", "EDIT", "NONE", "NONE", "NONE", "NONE", "NONE", "NONE", "NONE"] as PermissionLevel[],
  [Role.AUDITOR]:             ["VIEW", "VIEW", "VIEW", "VIEW", "VIEW", "VIEW", "VIEW", "VIEW", "VIEW", "VIEW", "VIEW", "VIEW", "VIEW", "VIEW"] as PermissionLevel[],
};

function moduleKey(label: string): string {
  return label.toLowerCase().replace(/\s+/g, "-");
}

async function main() {
  const modules = await Promise.all(
    MODULES.map((label) =>
      prisma.module.upsert({
        where: { key: moduleKey(label) },
        update: { label },
        create: { key: moduleKey(label), label },
      })
    )
  );

  for (const role of Object.values(Role)) {
    const levels = MATRIX[role];
    for (let i = 0; i < MODULES.length; i++) {
      const moduleRow = modules[i];
      await prisma.rolePermission.upsert({
        where: { role_moduleId: { role, moduleId: moduleRow.id } },
        update: { level: levels[i] },
        create: { role, moduleId: moduleRow.id, level: levels[i] },
      });
    }
  }

  console.log(`Seeded ${modules.length} modules x ${Object.values(Role).length} roles.`);

  await seedSuppliersContractsServices();
  await seedIntakeRequests();
  await seedTransactingData();
  await seedValueAndOversightData();
  await seedWorkflowConfigs();
}

// A handful of Phase 1 sample records (loosely modeled on the reference prototype's
// demo data) so the Suppliers/Contracts/Services UI has something to look at locally.
// Skipped if suppliers already exist, so re-running the seed is idempotent.
async function seedSuppliersContractsServices() {
  const existing = await prisma.supplier.count();
  if (existing > 0) {
    console.log("Sample Supplier/Contract/Service data already present, skipping.");
    return;
  }

  const vantage = await prisma.supplier.create({
    data: {
      name: "Vantage Cloud Systems",
      category: "IT & Software",
      tier: "PARTNER",
      status: "PREFERRED",
      riskLevel: "LOW",
      riskScore: 12,
    },
  });
  const halcyon = await prisma.supplier.create({
    data: {
      name: "Halcyon Facilities Group",
      category: "Facilities",
      tier: "UNMANAGED",
      status: "UNDER_REVIEW",
      riskLevel: "HIGH",
      riskScore: 78,
    },
  });
  await prisma.supplier.create({
    data: {
      name: "Orbital Marketing Partners",
      category: "Marketing",
      tier: "TRANSACTIONAL",
      status: "APPROVED",
      riskLevel: "MEDIUM",
      riskScore: 39,
    },
  });

  const hostingOrder = await prisma.contract.create({
    data: {
      supplierId: vantage.id,
      name: "Vantage Cloud — Hosting Order #2291",
      type: "Service Order",
      status: "ACTIVE",
      effectiveDate: new Date("2026-01-15"),
      autoRenew: true,
      governingLaw: "Delaware, US",
      summary: "Standard hosting order under Vantage's MSA, covering production and DR infrastructure.",
    },
  });
  await prisma.contract.create({
    data: {
      supplierId: vantage.id,
      name: "Vantage Cloud — Support Addendum",
      type: "Addendum",
      status: "ACTIVE",
      riskLevel: "MEDIUM",
      effectiveDate: new Date("2026-02-01"),
      autoRenew: true,
      governingLaw: "Delaware, US",
      summary: "Ongoing application support and maintenance. SOC 2 Type II report renewal overdue.",
    },
  });
  await prisma.contract.create({
    data: {
      supplierId: halcyon.id,
      name: "Halcyon Facilities — Master Agreement",
      type: "MSA",
      status: "PENDING_SIGNATURE",
      riskLevel: "HIGH",
      autoRenew: false,
      summary: "Pending counter-signature.",
    },
  });

  await prisma.service.create({
    data: {
      supplierId: vantage.id,
      contractId: hostingOrder.id,
      name: "Cloud Infrastructure Hosting",
      category: "IT & Software",
      criticality: "CRITICAL",
      governanceStatus: "Governed",
      riskScore: 14,
      riskAssessment: {
        "Information Security": { rating: "Low", note: "Annual penetration test clean, no critical findings." },
        "Data Privacy": { rating: "Low", note: "Covered under an active Data Processing Addendum." },
        "Business Continuity": { rating: "Medium", note: "Last full DR failover test was 14 months ago." },
      },
      lastReviewedAt: new Date("2026-07-02"),
    },
  });
  await prisma.service.create({
    data: {
      supplierId: halcyon.id,
      name: "Facilities Maintenance",
      category: "Facilities",
      criticality: "HIGH",
      governanceStatus: "Gap identified",
      riskScore: 62,
    },
  });

  console.log("Seeded 3 sample suppliers, 3 contracts, 2 services.");
}

// Phase 2 sample IntakeRequests. Own idempotency check (independent of the Phase 1
// guard above) so this seeds correctly even after Phase 1 sample data already exists.
async function seedIntakeRequests() {
  const existing = await prisma.intakeRequest.count();
  if (existing > 0) {
    console.log("Sample IntakeRequest data already present, skipping.");
    return;
  }

  // A demo requester so sample IntakeRequest rows have a real requesterId FK, same as
  // any Clerk-synced user would. Not a real Clerk account — just seed data.
  const demoRequester = await prisma.user.upsert({
    where: { clerkId: "seed-demo-requester" },
    update: {},
    create: { clerkId: "seed-demo-requester", email: "demo-requester@example.com", name: "Sam Okafor", role: "BUYER" },
  });

  await prisma.intakeRequest.create({
    data: {
      title: "Add a second support engineer to the Vantage contract",
      type: "SERVICE_REQUEST",
      category: "IT & Software",
      description: "Growing ticket volume means the current support tier is falling behind SLA.",
      estimatedValue: 60000,
      requesterId: demoRequester.id,
      stage: "NEW",
    },
  });
  await prisma.intakeRequest.create({
    data: {
      title: "Onboard a new packaging supplier for the West Coast DC",
      type: "NEW_VENDOR",
      category: "Raw Materials",
      description: "Current supplier can't meet volume; need a second source qualified by Q4.",
      estimatedValue: 250000,
      requesterId: demoRequester.id,
      stage: "TRIAGE",
    },
  });

  console.log("Seeded 1 demo requester and 2 sample intake requests.");
}

// Phase 3 sample data (Sourcing, Purchase Orders, Invoices, Vendor Management).
// Own idempotency check; looks up the Phase 1 sample suppliers/contracts by name
// rather than threading return values across the seed functions above.
async function seedTransactingData() {
  const existing = await prisma.sourcingEvent.count();
  if (existing > 0) {
    console.log("Sample Phase 3 (Sourcing/PO/Invoice/Vendor Management) data already present, skipping.");
    return;
  }

  const vantage = await prisma.supplier.findFirst({ where: { name: "Vantage Cloud Systems" } });
  const halcyon = await prisma.supplier.findFirst({ where: { name: "Halcyon Facilities Group" } });
  const hostingOrder = await prisma.contract.findFirst({ where: { name: "Vantage Cloud — Hosting Order #2291" } });
  if (!vantage || !halcyon) {
    console.log("Phase 1 sample suppliers not found, skipping Phase 3 sample data.");
    return;
  }

  const sourcingEvent = await prisma.sourcingEvent.create({
    data: { title: "Freight Services — RFP 2026-Q3", type: "RFP", stage: "BID_EVALUATION", estimatedSavings: 820000 },
  });
  await prisma.sourcingEventSupplier.create({
    data: { sourcingEventId: sourcingEvent.id, supplierId: halcyon.id, status: "RESPONDED" },
  });
  await prisma.sourcingEventSupplier.create({
    data: { sourcingEventId: sourcingEvent.id, supplierId: vantage.id, status: "INVITED" },
  });

  const po = await prisma.purchaseOrder.create({
    data: {
      supplierId: vantage.id,
      contractId: hostingOrder?.id ?? null,
      type: "STANDARD",
      status: "ISSUED",
      amount: 142000,
    },
  });

  await prisma.invoice.create({
    data: {
      supplierId: vantage.id,
      purchaseOrderId: po.id,
      amount: 142000,
      status: "MATCHED",
      matchConfidence: 99,
      invoiceDate: new Date("2026-07-03"),
      dueDate: new Date("2026-08-02"),
      paymentTerms: "Net 30",
      department: "IT Operations",
      category: "IT & Software",
    },
  });
  await prisma.invoice.create({
    data: {
      supplierId: halcyon.id,
      amount: 18500,
      status: "EXCEPTION",
      onHold: true,
      holdReason: "Amount exceeds last approved PO by 12%",
      invoiceDate: new Date("2026-07-20"),
      dueDate: new Date("2026-08-19"),
      paymentTerms: "Net 30",
      department: "Facilities",
      category: "Facilities",
    },
  });

  await prisma.vendorSla.create({
    data: {
      supplierId: vantage.id,
      metric: "Uptime",
      target: "99.95%",
      actual: "99.97%",
      status: "MET",
    },
  });
  await prisma.vendorSla.create({
    data: {
      supplierId: halcyon.id,
      metric: "On-site response time",
      target: "4 hours",
      actual: "9 hours",
      status: "BREACHED",
      enforcementAction: "Service credit issued",
      enforcementDate: new Date("2026-07-15"),
    },
  });

  await prisma.businessReview.create({
    data: { supplierId: vantage.id, type: "QBR", scheduledDate: new Date("2026-09-15"), status: "SCHEDULED" },
  });
  await prisma.businessReview.create({
    data: {
      supplierId: halcyon.id,
      type: "ANNUAL_REVIEW",
      scheduledDate: new Date("2026-06-01"),
      status: "OVERDUE",
      notes: "Pending due to unresolved SLA breach.",
    },
  });

  console.log("Seeded 1 sourcing event, 1 PO, 2 invoices, 2 vendor SLAs, 2 business reviews.");
}

// Phase 4/5 sample data (BudgetCategory, Project, ValueTrackingItem, RiskFlag).
// Own idempotency check; looks up existing Phase 1/2/3 sample rows by name/field
// rather than threading return values across the seed functions above.
async function seedValueAndOversightData() {
  const existing = await prisma.budgetCategory.count();
  if (existing > 0) {
    console.log("Sample Phase 4/5 (Budget/Project/ValueTracking/RiskFlag) data already present, skipping.");
    return;
  }

  const vantage = await prisma.supplier.findFirst({ where: { name: "Vantage Cloud Systems" } });
  const halcyon = await prisma.supplier.findFirst({ where: { name: "Halcyon Facilities Group" } });
  const hostingOrder = await prisma.contract.findFirst({ where: { name: "Vantage Cloud — Hosting Order #2291" } });
  const vantagePo = await prisma.purchaseOrder.findFirst({ where: { supplierId: vantage?.id } });
  const demoRequester = await prisma.user.findFirst({ where: { clerkId: "seed-demo-requester" } });
  if (!vantage || !halcyon || !demoRequester) {
    console.log("Phase 1/2 sample data not found, skipping Phase 4/5 sample data.");
    return;
  }

  const itBudget = await prisma.budgetCategory.create({ data: { category: "IT & Software", allocated: 22_000_000 } });
  await prisma.budgetCategory.create({ data: { category: "Facilities", allocated: 6_000_000 } });
  await prisma.budgetCategory.create({ data: { category: "Logistics", allocated: 14_500_000 } });

  const cloudProject = await prisma.project.create({
    data: {
      name: "Cloud Migration Program",
      supplierId: vantage.id,
      budgetCategoryId: itBudget.id,
      budgetAmount: 1_200_000,
      status: "ON_TRACK",
      progress: 64,
      riskLevel: "LOW",
    },
  });
  if (hostingOrder) await prisma.contract.update({ where: { id: hostingOrder.id }, data: { projectId: cloudProject.id } });
  if (vantagePo) await prisma.purchaseOrder.update({ where: { id: vantagePo.id }, data: { projectId: cloudProject.id } });

  const facilitiesProject = await prisma.project.create({
    data: {
      name: "Facilities Consolidation",
      supplierId: halcyon.id,
      status: "AT_RISK",
      progress: 41,
      riskLevel: "HIGH",
    },
  });

  if (vantagePo) {
    await prisma.valueTrackingItem.create({
      data: {
        title: "Consolidated hosting tiers under the Vantage MSA",
        type: "SAVINGS",
        amount: 180000,
        supplierId: vantage.id,
        contractId: hostingOrder?.id,
        purchaseOrderId: vantagePo.id,
        submittedById: demoRequester.id,
        creditedToId: demoRequester.id,
        financeApproverId: demoRequester.id,
        status: "APPROVED",
        note: "Right-sized compute tiers during the annual review, reducing run-rate.",
      },
    });
  }
  await prisma.valueTrackingItem.create({
    data: {
      title: "Held freight rate escalation to 5% vs. planned 8%",
      type: "COST_AVOIDANCE",
      amount: 93000,
      supplierId: halcyon.id,
      submittedById: demoRequester.id,
      creditedToId: demoRequester.id,
      status: "PENDING_FINANCE_APPROVAL",
      note: "Negotiated the renewal escalation down from the standard 8% clause to 5%.",
    },
  });

  await prisma.riskFlag.create({
    data: {
      supplierId: halcyon.id,
      type: "Compliance",
      severity: "HIGH",
      detail: "Certificate of insurance lapsed 14 days ago",
    },
  });
  await prisma.riskFlag.create({
    data: {
      supplierId: vantage.id,
      type: "Concentration",
      severity: "LOW",
      detail: "22% of IT & Software spend concentrated in one supplier",
    },
  });

  console.log(`Seeded 3 budget categories, 2 projects (1 unlinked: ${facilitiesProject.id.slice(-6)}), 2 value tracking items, 2 risk flags.`);
}

// Phase 6 sample data — a modest, real settings registry (see the WorkflowConfig
// model comment), not the reference's fabricated drag-and-drop no-code builder.
async function seedWorkflowConfigs() {
  const existing = await prisma.workflowConfig.count();
  if (existing > 0) {
    console.log("Sample WorkflowConfig data already present, skipping.");
    return;
  }

  await prisma.workflowConfig.createMany({
    data: [
      { name: "Approval Workflows", description: "PO and contract approval chains.", category: "Approval", enabled: true },
      { name: "Intake Forms", description: "Fields collected on the Intake submission form.", category: "Intake", enabled: true },
      { name: "Risk Scoring Model", description: "Weights used by the Risk Management index.", category: "Risk", enabled: true },
      { name: "Supplier Questionnaire", description: "Onboarding questionnaire sent to new suppliers.", category: "Suppliers", enabled: true },
      { name: "Invoice Exception Rules", description: "Thresholds that flag an invoice as an exception.", category: "Invoices", enabled: true },
      { name: "Notification Templates", description: "Email/notification copy for workflow events.", category: "Notifications", enabled: false },
    ],
  });

  console.log("Seeded 6 workflow configs.");
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
