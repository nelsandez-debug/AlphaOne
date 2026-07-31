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
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
