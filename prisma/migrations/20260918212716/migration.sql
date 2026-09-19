/*
  Warnings:

  - The values [CONFIRMED] on the enum `ProjectRequestStatus` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `appointmentId` on the `payments` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `payments` table. All the data in the column will be lost.
  - You are about to drop the `appointments` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[projectRequestId]` on the table `payments` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `projectRequestId` to the `payments` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "ProjectRequestStatus_new" AS ENUM ('UNDER_REVIEW', 'OFFER_PROJECT_PRICE', 'PAID', 'REJECTED', 'CANCELLED');
ALTER TABLE "public"."ProjectRequest" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "ProjectRequest" ALTER COLUMN "status" TYPE "ProjectRequestStatus_new" USING ("status"::text::"ProjectRequestStatus_new");
ALTER TYPE "ProjectRequestStatus" RENAME TO "ProjectRequestStatus_old";
ALTER TYPE "ProjectRequestStatus_new" RENAME TO "ProjectRequestStatus";
DROP TYPE "public"."ProjectRequestStatus_old";
ALTER TABLE "ProjectRequest" ALTER COLUMN "status" SET DEFAULT 'UNDER_REVIEW';
COMMIT;

-- DropForeignKey
ALTER TABLE "payments" DROP CONSTRAINT "payments_appointmentId_fkey";

-- DropIndex
DROP INDEX "payments_appointmentId_key";

-- AlterTable
ALTER TABLE "payments" DROP COLUMN "appointmentId",
DROP COLUMN "status",
ADD COLUMN     "projectRequestId" TEXT NOT NULL;

-- DropTable
DROP TABLE "appointments";

-- CreateIndex
CREATE UNIQUE INDEX "payments_projectRequestId_key" ON "payments"("projectRequestId");

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_projectRequestId_fkey" FOREIGN KEY ("projectRequestId") REFERENCES "ProjectRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;
