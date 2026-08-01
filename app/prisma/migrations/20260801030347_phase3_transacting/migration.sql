-- CreateEnum
CREATE TYPE "SourcingStage" AS ENUM ('MARKET_SCAN', 'BID_EVALUATION', 'AWARD_OPTIMIZATION', 'CLOSED');

-- CreateEnum
CREATE TYPE "SourcingParticipantStatus" AS ENUM ('INVITED', 'RESPONDED', 'SHORTLISTED', 'AWARDED', 'DECLINED');

-- CreateEnum
CREATE TYPE "POType" AS ENUM ('STANDARD', 'BLANKET', 'SERVICE', 'EMERGENCY', 'RECURRING');

-- CreateEnum
CREATE TYPE "POStatus" AS ENUM ('DRAFT', 'PENDING_APPROVAL', 'ISSUED', 'RECEIVED', 'CLOSED');

-- CreateEnum
CREATE TYPE "InvoiceStatus" AS ENUM ('PENDING', 'MATCHED', 'EXCEPTION', 'DISPUTED', 'PAID');

-- CreateEnum
CREATE TYPE "VendorSlaStatus" AS ENUM ('MET', 'AT_RISK', 'BREACHED', 'NOT_TRACKED');

-- CreateEnum
CREATE TYPE "BusinessReviewType" AS ENUM ('QBR', 'ANNUAL_REVIEW');

-- CreateEnum
CREATE TYPE "BusinessReviewStatus" AS ENUM ('SCHEDULED', 'COMPLETED_ON_TIME', 'COMPLETED_LATE', 'OVERDUE');

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
CREATE TABLE "PurchaseOrder" (
    "id" TEXT NOT NULL,
    "supplierId" TEXT NOT NULL,
    "contractId" TEXT,
    "originIntakeRequestId" TEXT,
    "type" "POType" NOT NULL,
    "status" "POStatus" NOT NULL DEFAULT 'DRAFT',
    "amount" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PurchaseOrder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Invoice" (
    "id" TEXT NOT NULL,
    "supplierId" TEXT NOT NULL,
    "purchaseOrderId" TEXT,
    "amount" INTEGER NOT NULL,
    "status" "InvoiceStatus" NOT NULL DEFAULT 'PENDING',
    "matchConfidence" INTEGER,
    "onHold" BOOLEAN NOT NULL DEFAULT false,
    "holdReason" TEXT,
    "overageAmount" INTEGER,
    "overageApproved" BOOLEAN,
    "overageNote" TEXT,
    "invoiceDate" TIMESTAMP(3),
    "dueDate" TIMESTAMP(3),
    "paymentTerms" TEXT,
    "department" TEXT,
    "category" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Invoice_pkey" PRIMARY KEY ("id")
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

-- CreateIndex
CREATE UNIQUE INDEX "SourcingEventSupplier_sourcingEventId_supplierId_key" ON "SourcingEventSupplier"("sourcingEventId", "supplierId");

-- CreateIndex
CREATE INDEX "PurchaseOrder_supplierId_idx" ON "PurchaseOrder"("supplierId");

-- CreateIndex
CREATE INDEX "PurchaseOrder_contractId_idx" ON "PurchaseOrder"("contractId");

-- CreateIndex
CREATE INDEX "Invoice_supplierId_idx" ON "Invoice"("supplierId");

-- CreateIndex
CREATE INDEX "Invoice_purchaseOrderId_idx" ON "Invoice"("purchaseOrderId");

-- CreateIndex
CREATE INDEX "VendorSla_supplierId_idx" ON "VendorSla"("supplierId");

-- CreateIndex
CREATE INDEX "BusinessReview_supplierId_idx" ON "BusinessReview"("supplierId");

-- AddForeignKey
ALTER TABLE "SourcingEventSupplier" ADD CONSTRAINT "SourcingEventSupplier_sourcingEventId_fkey" FOREIGN KEY ("sourcingEventId") REFERENCES "SourcingEvent"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SourcingEventSupplier" ADD CONSTRAINT "SourcingEventSupplier_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Supplier"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseOrder" ADD CONSTRAINT "PurchaseOrder_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Supplier"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseOrder" ADD CONSTRAINT "PurchaseOrder_contractId_fkey" FOREIGN KEY ("contractId") REFERENCES "Contract"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseOrder" ADD CONSTRAINT "PurchaseOrder_originIntakeRequestId_fkey" FOREIGN KEY ("originIntakeRequestId") REFERENCES "IntakeRequest"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Supplier"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_purchaseOrderId_fkey" FOREIGN KEY ("purchaseOrderId") REFERENCES "PurchaseOrder"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VendorSla" ADD CONSTRAINT "VendorSla_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Supplier"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BusinessReview" ADD CONSTRAINT "BusinessReview_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Supplier"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
