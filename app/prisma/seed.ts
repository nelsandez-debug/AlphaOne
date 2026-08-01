import "dotenv/config";
import { prisma } from "../src/lib/prisma";
import { Role, PermissionLevel } from "../src/generated/prisma/enums";

// Mirrors the reference prototype's PERMISSION_MODULES / PERMISSIONS_MATRIX
// (Administration -> Roles & Permissions). This seeds the DB-backed equivalent
// so the same data can be edited there later instead of hardcoded.
const MODULES = ["Suppliers", "Sourcing", "Contracts", "Services", "Invoices", "Budget", "Admin"] as const;

const MATRIX: Record<Role, PermissionLevel[]> = {
  [Role.EXECUTIVE]:           ["VIEW", "VIEW", "VIEW", "VIEW", "VIEW", "VIEW", "NONE"] as PermissionLevel[],
  [Role.PROCUREMENT_LEADER]:  ["EDIT", "APPROVE", "EDIT", "EDIT", "VIEW", "EDIT", "VIEW"] as PermissionLevel[],
  [Role.CATEGORY_MANAGER]:    ["EDIT", "EDIT", "VIEW", "EDIT", "NONE", "VIEW", "NONE"] as PermissionLevel[],
  [Role.BUYER]:               ["VIEW", "VIEW", "NONE", "NONE", "NONE", "NONE", "NONE"] as PermissionLevel[],
  [Role.APPROVER]:            ["VIEW", "VIEW", "VIEW", "VIEW", "APPROVE", "VIEW", "NONE"] as PermissionLevel[],
  [Role.FINANCE_ANALYST]:     ["VIEW", "NONE", "VIEW", "VIEW", "EDIT", "EDIT", "NONE"] as PermissionLevel[],
  [Role.ACCOUNTS_PAYABLE]:    ["NONE", "NONE", "NONE", "NONE", "APPROVE", "VIEW", "NONE"] as PermissionLevel[],
  [Role.COMPLIANCE_OFFICER]:  ["VIEW", "NONE", "EDIT", "EDIT", "NONE", "NONE", "NONE"] as PermissionLevel[],
  [Role.IT_ADMINISTRATOR]:    ["NONE", "NONE", "NONE", "NONE", "NONE", "NONE", "EDIT"] as PermissionLevel[],
  [Role.AUDITOR]:             ["VIEW", "VIEW", "VIEW", "VIEW", "VIEW", "VIEW", "VIEW"] as PermissionLevel[],
};

async function main() {
  const modules = await Promise.all(
    MODULES.map((label) =>
      prisma.module.upsert({
        where: { key: label.toLowerCase() },
        update: { label },
        create: { key: label.toLowerCase(), label },
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

  await seedSampleData();
}

// A handful of Phase 1 sample records (loosely modeled on the reference prototype's
// demo data) so the Suppliers/Contracts/Services UI has something to look at locally.
// Skipped if suppliers already exist, so re-running the seed is idempotent.
async function seedSampleData() {
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

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
