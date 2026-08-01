-- CreateEnum
CREATE TYPE "RiskLevel" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- CreateEnum
CREATE TYPE "SupplierTier" AS ENUM ('STRATEGIC', 'PREFERRED', 'PARTNER', 'TRANSACTIONAL', 'UNMANAGED');

-- CreateEnum
CREATE TYPE "SupplierStatus" AS ENUM ('PREFERRED', 'APPROVED', 'UNDER_REVIEW', 'PENDING_ONBOARDING');

-- CreateEnum
CREATE TYPE "ContractStatus" AS ENUM ('DRAFT', 'PENDING_SIGNATURE', 'ACTIVE', 'EXPIRED', 'BREACH_FLAGGED');

-- CreateEnum
CREATE TYPE "ServiceCriticality" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateTable
CREATE TABLE "Ownership" (
    "id" TEXT NOT NULL,
    "recordType" TEXT NOT NULL,
    "recordId" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Ownership_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Supplier" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "tier" "SupplierTier" NOT NULL,
    "status" "SupplierStatus" NOT NULL,
    "riskLevel" "RiskLevel",
    "riskScore" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Supplier_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Contract" (
    "id" TEXT NOT NULL,
    "supplierId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "status" "ContractStatus" NOT NULL,
    "riskLevel" "RiskLevel",
    "effectiveDate" TIMESTAMP(3),
    "expirationDate" TIMESTAMP(3),
    "autoRenew" BOOLEAN NOT NULL DEFAULT false,
    "governingLaw" TEXT,
    "summary" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Contract_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Service" (
    "id" TEXT NOT NULL,
    "supplierId" TEXT NOT NULL,
    "contractId" TEXT,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "criticality" "ServiceCriticality" NOT NULL,
    "governanceStatus" TEXT,
    "riskScore" INTEGER,
    "riskAssessment" JSONB,
    "lastReviewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Service_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Ownership_recordType_recordId_key" ON "Ownership"("recordType", "recordId");

-- CreateIndex
CREATE INDEX "Contract_supplierId_idx" ON "Contract"("supplierId");

-- CreateIndex
CREATE INDEX "Service_supplierId_idx" ON "Service"("supplierId");

-- CreateIndex
CREATE INDEX "Service_contractId_idx" ON "Service"("contractId");

-- AddForeignKey
ALTER TABLE "Ownership" ADD CONSTRAINT "Ownership_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contract" ADD CONSTRAINT "Contract_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Supplier"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Service" ADD CONSTRAINT "Service_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Supplier"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Service" ADD CONSTRAINT "Service_contractId_fkey" FOREIGN KEY ("contractId") REFERENCES "Contract"("id") ON DELETE SET NULL ON UPDATE CASCADE;
