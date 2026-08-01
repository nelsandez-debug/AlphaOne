-- CreateEnum
CREATE TYPE "SourcingStage" AS ENUM ('MARKET_SCAN', 'BID_EVALUATION', 'AWARD_OPTIMIZATION', 'CLOSED');

-- CreateEnum
CREATE TYPE "SourcingParticipantStatus" AS ENUM ('INVITED', 'RESPONDED', 'SHORTLISTED', 'AWARDED', 'DECLINED');

-- CreateEnum
CREATE TYPE "VendorSlaStatus" AS ENUM ('MET', 'AT_RISK', 'BREACHED', 'NOT_TRACKED');

-- CreateEnum
CREATE TYPE "BusinessReviewType" AS ENUM ('QBR', 'ANNUAL_REVIEW');

-- CreateEnum
CREATE TYPE "BusinessReviewStatus" AS ENUM ('SCHEDULED', 'COMPLETED_ON_TIME', 'COMPLETED_LATE', 'OVERDUE');

-- CreateEnum
CREATE TYPE "ValueType" AS ENUM ('SAVINGS', 'COST_AVOIDANCE', 'PAYMENT_TERMS_IMPROVEMENT');

-- CreateEnum
CREATE TYPE "ValueStatus" AS ENUM ('PENDING_FINANCE_APPROVAL', 'APPROVED', 'REJECTED');

-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "budgetCategoryId" TEXT,
ADD COLUMN     "sourcingEventId" TEXT;

-- CreateTable
CREATE TABLE "SourcingEvent" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "type" TEXT,
    "stage" "SourcingStage" NOT NULL DEFAULT 'MARKET_SCAN',
    "estimatedSavings" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SourcingEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SourcingEventSupplier" (
    "id" TEXT NOT NULL,
    "sourcingEventId" TEXT NOT NULL,
    "supplierId" TEXT NOT NULL,
    "status" "SourcingParticipantStatus" NOT NULL DEFAULT 'INVITED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SourcingEventSupplier_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VendorSla" (
    "id" TEXT NOT NULL,
    "supplierId" TEXT NOT NULL,
    "metric" TEXT NOT NULL,
    "target" TEXT NOT NULL,
    "actual" TEXT,
    "status" "VendorSlaStatus" NOT NULL DEFAULT 'NOT_TRACKED',
    "enforcementAction" TEXT,
    "enforcementDate" TIMESTAMP(3),
    "enforcementNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VendorSla_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BusinessReview" (
    "id" TEXT NOT NULL,
    "supplierId" TEXT NOT NULL,
    "type" "BusinessReviewType" NOT NULL,
    "scheduledDate" TIMESTAMP(3) NOT NULL,
    "status" "BusinessReviewStatus" NOT NULL DEFAULT 'SCHEDULED',
    "completedDate" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BusinessReview_pkey" PRIMARY KEY ("id")
);

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

-- CreateTable
CREATE TABLE "WorkflowConfig" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WorkflowConfig_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SourcingEventSupplier_sourcingEventId_supplierId_key" ON "SourcingEventSupplier"("sourcingEventId", "supplierId");

-- CreateIndex
CREATE INDEX "VendorSla_supplierId_idx" ON "VendorSla"("supplierId");

-- CreateIndex
CREATE INDEX "BusinessReview_supplierId_idx" ON "BusinessReview"("supplierId");

-- CreateIndex
CREATE UNIQUE INDEX "BudgetCategory_category_key" ON "BudgetCategory"("category");

-- CreateIndex
CREATE INDEX "ValueTrackingItem_supplierId_idx" ON "ValueTrackingItem"("supplierId");

-- CreateIndex
CREATE INDEX "ValueTrackingItem_contractId_idx" ON "ValueTrackingItem"("contractId");

-- CreateIndex
CREATE INDEX "ValueTrackingItem_purchaseOrderId_idx" ON "ValueTrackingItem"("purchaseOrderId");

-- CreateIndex
CREATE INDEX "RiskFlag_supplierId_idx" ON "RiskFlag"("supplierId");

-- CreateIndex
CREATE UNIQUE INDEX "WorkflowConfig_name_key" ON "WorkflowConfig"("name");

-- CreateIndex
CREATE INDEX "Project_budgetCategoryId_idx" ON "Project"("budgetCategoryId");

-- AddForeignKey
ALTER TABLE "SourcingEventSupplier" ADD CONSTRAINT "SourcingEventSupplier_sourcingEventId_fkey" FOREIGN KEY ("sourcingEventId") REFERENCES "SourcingEvent"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SourcingEventSupplier" ADD CONSTRAINT "SourcingEventSupplier_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Supplier"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VendorSla" ADD CONSTRAINT "VendorSla_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Supplier"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BusinessReview" ADD CONSTRAINT "BusinessReview_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Supplier"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

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

