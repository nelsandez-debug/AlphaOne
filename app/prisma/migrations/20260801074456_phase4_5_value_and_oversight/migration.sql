-- CreateEnum
CREATE TYPE "ProjectStatus" AS ENUM ('ON_TRACK', 'AT_RISK', 'DELAYED', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "ValueType" AS ENUM ('SAVINGS', 'COST_AVOIDANCE', 'PAYMENT_TERMS_IMPROVEMENT');

-- CreateEnum
CREATE TYPE "ValueStatus" AS ENUM ('PENDING_FINANCE_APPROVAL', 'APPROVED', 'REJECTED');

-- AlterTable
ALTER TABLE "Contract" ADD COLUMN     "projectId" TEXT;

-- AlterTable
ALTER TABLE "Invoice" ADD COLUMN     "projectId" TEXT;

-- AlterTable
ALTER TABLE "PurchaseOrder" ADD COLUMN     "projectId" TEXT;

-- AlterTable
ALTER TABLE "Service" ADD COLUMN     "projectId" TEXT;

-- CreateTable
CREATE TABLE "BudgetCategory" (
    "id" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "allocated" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BudgetCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Project" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "supplierId" TEXT,
    "sourcingEventId" TEXT,
    "budgetCategoryId" TEXT,
    "budgetAmount" INTEGER,
    "status" "ProjectStatus" NOT NULL DEFAULT 'ON_TRACK',
    "progress" INTEGER NOT NULL DEFAULT 0,
    "riskLevel" "RiskLevel",
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ValueTrackingItem" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "type" "ValueType" NOT NULL,
    "amount" INTEGER NOT NULL,
    "supplierId" TEXT NOT NULL,
    "contractId" TEXT,
    "purchaseOrderId" TEXT,
    "submittedById" TEXT NOT NULL,
    "creditedToId" TEXT NOT NULL,
    "financeApproverId" TEXT,
    "status" "ValueStatus" NOT NULL DEFAULT 'PENDING_FINANCE_APPROVAL',
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ValueTrackingItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RiskFlag" (
    "id" TEXT NOT NULL,
    "supplierId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "severity" "RiskLevel" NOT NULL,
    "detail" TEXT NOT NULL,
    "resolved" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RiskFlag_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BudgetCategory_category_key" ON "BudgetCategory"("category");

-- CreateIndex
CREATE INDEX "Project_supplierId_idx" ON "Project"("supplierId");

-- CreateIndex
CREATE INDEX "Project_budgetCategoryId_idx" ON "Project"("budgetCategoryId");

-- CreateIndex
CREATE INDEX "ValueTrackingItem_supplierId_idx" ON "ValueTrackingItem"("supplierId");

-- CreateIndex
CREATE INDEX "ValueTrackingItem_contractId_idx" ON "ValueTrackingItem"("contractId");

-- CreateIndex
CREATE INDEX "ValueTrackingItem_purchaseOrderId_idx" ON "ValueTrackingItem"("purchaseOrderId");

-- CreateIndex
CREATE INDEX "RiskFlag_supplierId_idx" ON "RiskFlag"("supplierId");

-- CreateIndex
CREATE INDEX "Contract_projectId_idx" ON "Contract"("projectId");

-- CreateIndex
CREATE INDEX "Invoice_projectId_idx" ON "Invoice"("projectId");

-- CreateIndex
CREATE INDEX "PurchaseOrder_projectId_idx" ON "PurchaseOrder"("projectId");

-- CreateIndex
CREATE INDEX "Service_projectId_idx" ON "Service"("projectId");

-- AddForeignKey
ALTER TABLE "Contract" ADD CONSTRAINT "Contract_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Service" ADD CONSTRAINT "Service_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseOrder" ADD CONSTRAINT "PurchaseOrder_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Supplier"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_sourcingEventId_fkey" FOREIGN KEY ("sourcingEventId") REFERENCES "SourcingEvent"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_budgetCategoryId_fkey" FOREIGN KEY ("budgetCategoryId") REFERENCES "BudgetCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ValueTrackingItem" ADD CONSTRAINT "ValueTrackingItem_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Supplier"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ValueTrackingItem" ADD CONSTRAINT "ValueTrackingItem_contractId_fkey" FOREIGN KEY ("contractId") REFERENCES "Contract"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ValueTrackingItem" ADD CONSTRAINT "ValueTrackingItem_purchaseOrderId_fkey" FOREIGN KEY ("purchaseOrderId") REFERENCES "PurchaseOrder"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ValueTrackingItem" ADD CONSTRAINT "ValueTrackingItem_submittedById_fkey" FOREIGN KEY ("submittedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ValueTrackingItem" ADD CONSTRAINT "ValueTrackingItem_creditedToId_fkey" FOREIGN KEY ("creditedToId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ValueTrackingItem" ADD CONSTRAINT "ValueTrackingItem_financeApproverId_fkey" FOREIGN KEY ("financeApproverId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RiskFlag" ADD CONSTRAINT "RiskFlag_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Supplier"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
