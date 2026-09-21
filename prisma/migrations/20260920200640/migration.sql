/*
  Warnings:

  - You are about to alter the column `budget` on the `Project` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Integer`.

*/
-- CreateEnum
CREATE TYPE "DeveloperAvailabilityStatus" AS ENUM ('AVAILABLE', 'OCCUPIED', 'LEAVE');

-- AlterTable
ALTER TABLE "Project" ALTER COLUMN "budget" SET DATA TYPE INTEGER;

-- CreateTable
CREATE TABLE "developer_availability" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "status" "DeveloperAvailabilityStatus" NOT NULL DEFAULT 'AVAILABLE',
    "developerId" TEXT NOT NULL,
    "projectId" TEXT,

    CONSTRAINT "developer_availability_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "developer_availability_developerId_date_idx" ON "developer_availability"("developerId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "developer_availability_developerId_date_key" ON "developer_availability"("developerId", "date");

-- AddForeignKey
ALTER TABLE "developer_availability" ADD CONSTRAINT "developer_availability_developerId_fkey" FOREIGN KEY ("developerId") REFERENCES "developers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "developer_availability" ADD CONSTRAINT "developer_availability_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;
