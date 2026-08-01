import "dotenv/config";
import { prisma } from "../src/lib/prisma";
import { Role, PermissionLevel } from "../src/generated/prisma/enums";

// AlphaTwo-reduced-scope test build: 7 modules (Intake, Suppliers, Contracts,
// Services, Purchase Orders, Invoices, Projects) instead of the full 18. The
// full PERMISSIONS_MATRIX/seed data is preserved on the `alphatwo` branch/tag
// — see CLAUDE.md.
const MODULES = ["Suppliers", "Contracts", "Services", "Invoices", "Intake", "Purchase Orders", "Projects"] as const;

const MATRIX: Record<Role, PermissionLevel[]> = {
  [Role.EXECUTIVE]:           ["VIEW", "VIEW", "VIEW", "VIEW", "VIEW", "VIEW", "VIEW"] as PermissionLevel[],
  [Role.PROCUREMENT_LEADER]:  ["EDIT", "EDIT", "EDIT", "VIEW", "EDIT", "EDIT", "EDIT"] as PermissionLevel[],
  [Role.CATEGORY_MANAGER]:    ["EDIT", "VIEW", "EDIT", "NONE", "EDIT", "EDIT", "EDIT"] as PermissionLevel[],
  [Role.BUYER]:                ["VIEW", "NONE", "NONE", "NONE", "EDIT", "EDIT", "VIEW"] as PermissionLevel[],
  [Role.APPROVER]:             ["VIEW", "VIEW", "VIEW", "APPROVE", "VIEW", "APPROVE", "VIEW"] as PermissionLevel[],
  [Role.FINANCE_ANALYST]:      ["VIEW", "VIEW", "VIEW", "EDIT", "VIEW", "VIEW", "VIEW"] as PermissionLevel[],
  [Role.ACCOUNTS_PAYABLE]:     ["NONE", "NONE", "NONE", "APPROVE", "NONE", "VIEW", "NONE"] as PermissionLevel[],
  [Role.COMPLIANCE_OFFICER]:   ["VIEW", "EDIT", "EDIT", "NONE", "VIEW", "NONE", "VIEW"] as PermissionLevel[],
  [Role.IT_ADMINISTRATOR]:     ["NONE", "NONE", "NONE", "NONE", "NONE", "NONE", "NONE"] as PermissionLevel[],
  [Role.AUDITOR]:               ["VIEW", "VIEW", "VIEW", "VIEW", "VIEW", "VIEW", "VIEW"] as PermissionLevel[],
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
  await seedPurchaseOrdersAndInvoices();
  await seedProjects();
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

// Phase 3 sample data (Purchase Orders, Invoices). Own idempotency check; looks up
// the Phase 1 sample suppliers/contracts by name rather than threading return
// values across the seed functions above.
async function seedPurchaseOrdersAndInvoices() {
  const existing = await prisma.purchaseOrder.count();
  if (existing > 0) {
    console.log("Sample PurchaseOrder/Invoice data already present, skipping.");
    return;
  }

  const vantage = await prisma.supplier.findFirst({ where: { name: "Vantage Cloud Systems" } });
  const halcyon = await prisma.supplier.findFirst({ where: { name: "Halcyon Facilities Group" } });
  const hostingOrder = await prisma.contract.findFirst({ where: { name: "Vantage Cloud — Hosting Order #2291" } });
  if (!vantage || !halcyon) {
    console.log("Phase 1 sample suppliers not found, skipping Phase 3 sample data.");
    return;
  }

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

  console.log("Seeded 1 PO, 2 invoices.");
}

// Phase 4 sample data (Project). Own idempotency check; looks up existing Phase 1/3
// sample rows by name/field rather than threading return values across the seed
// functions above.
async function seedProjects() {
  const existing = await prisma.project.count();
  if (existing > 0) {
    console.log("Sample Project data already present, skipping.");
    return;
  }

  const vantage = await prisma.supplier.findFirst({ where: { name: "Vantage Cloud Systems" } });
  const halcyon = await prisma.supplier.findFirst({ where: { name: "Halcyon Facilities Group" } });
  const hostingOrder = await prisma.contract.findFirst({ where: { name: "Vantage Cloud — Hosting Order #2291" } });
  const vantagePo = await prisma.purchaseOrder.findFirst({ where: { supplierId: vantage?.id } });
  if (!vantage || !halcyon) {
    console.log("Phase 1 sample data not found, skipping Phase 4 sample data.");
    return;
  }

  const cloudProject = await prisma.project.create({
    data: {
      name: "Cloud Migration Program",
      supplierId: vantage.id,
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

  console.log(`Seeded 2 projects (1 unlinked: ${facilitiesProject.id.slice(-6)}).`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
