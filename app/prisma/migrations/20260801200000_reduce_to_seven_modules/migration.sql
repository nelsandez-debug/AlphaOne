-- DropForeignKey
ALTER TABLE "BusinessReview" DROP CONSTRAINT "BusinessReview_supplierId_fkey";

-- DropForeignKey
ALTER TABLE "Project" DROP CONSTRAINT "Project_budgetCategoryId_fkey";

-- DropForeignKey
ALTER TABLE "Project" DROP CONSTRAINT "Project_sourcingEventId_fkey";

-- DropForeignKey
ALTER TABLE "RiskFlag" DROP CONSTRAINT "RiskFlag_supplierId_fkey";

-- DropForeignKey
ALTER TABLE "SourcingEventSupplier" DROP CONSTRAINT "SourcingEventSupplier_sourcingEventId_fkey";

-- DropForeignKey
ALTER TABLE "SourcingEventSupplier" DROP CONSTRAINT "SourcingEventSupplier_supplierId_fkey";

-- DropForeignKey
ALTER TABLE "ValueTrackingItem" DROP CONSTRAINT "ValueTrackingItem_contractId_fkey";

-- DropForeignKey
ALTER TABLE "ValueTrackingItem" DROP CONSTRAINT "ValueTrackingItem_creditedToId_fkey";

-- DropForeignKey
ALTER TABLE "ValueTrackingItem" DROP CONSTRAINT "ValueTrackingItem_financeApproverId_fkey";

-- DropForeignKey
ALTER TABLE "ValueTrackingItem" DROP CONSTRAINT "ValueTrackingItem_purchaseOrderId_fkey";

-- DropForeignKey
ALTER TABLE "ValueTrackingItem" DROP CONSTRAINT "ValueTrackingItem_submittedById_fkey";

-- DropForeignKey
ALTER TABLE "ValueTrackingItem" DROP CONSTRAINT "ValueTrackingItem_supplierId_fkey";

-- DropForeignKey
ALTER TABLE "VendorSla" DROP CONSTRAINT "VendorSla_supplierId_fkey";

-- DropIndex
DROP INDEX "Project_budgetCategoryId_idx";

-- AlterTable
ALTER TABLE "Project" DROP COLUMN "budgetCategoryId",
DROP COLUMN "sourcingEventId";

-- DropTable
DROP TABLE "BudgetCategory";

-- DropTable
DROP TABLE "BusinessReview";

-- DropTable
DROP TABLE "RiskFlag";

-- DropTable
DROP TABLE "SourcingEvent";

-- DropTable
DROP TABLE "SourcingEventSupplier";

-- DropTable
DROP TABLE "ValueTrackingItem";

-- DropTable
DROP TABLE "VendorSla";

-- DropTable
DROP TABLE "WorkflowConfig";

-- DropEnum
DROP TYPE "BusinessReviewStatus";

-- DropEnum
DROP TYPE "BusinessReviewType";

-- DropEnum
DROP TYPE "SourcingParticipantStatus";

-- DropEnum
DROP TYPE "SourcingStage";

-- DropEnum
DROP TYPE "ValueStatus";

-- DropEnum
DROP TYPE "ValueType";

-- DropEnum
DROP TYPE "VendorSlaStatus";

