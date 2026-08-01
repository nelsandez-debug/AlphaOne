-- CreateEnum
CREATE TYPE "IntakeRequestType" AS ENUM ('SERVICE_REQUEST', 'NEW_VENDOR', 'CONTRACT_REQUEST', 'CONTRACT_CHANGE', 'PURCHASE_REQUEST', 'NEW_PROJECT', 'SOURCING_EVENT');

-- CreateEnum
CREATE TYPE "IntakeStage" AS ENUM ('NEW', 'TRIAGE', 'ROUTED', 'IN_PROGRESS', 'CLOSED');

-- CreateTable
CREATE TABLE "IntakeRequest" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "type" "IntakeRequestType" NOT NULL,
    "category" TEXT,
    "description" TEXT,
    "estimatedValue" INTEGER,
    "neededBy" TIMESTAMP(3),
    "costCenter" TEXT,
    "department" TEXT,
    "requesterId" TEXT NOT NULL,
    "stage" "IntakeStage" NOT NULL DEFAULT 'NEW',
    "dispositionedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IntakeRequest_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "IntakeRequest" ADD CONSTRAINT "IntakeRequest_requesterId_fkey" FOREIGN KEY ("requesterId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
