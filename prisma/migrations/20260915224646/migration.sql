/*
  Warnings:

  - You are about to drop the column `hiredAt` on the `developers` table. All the data in the column will be lost.

*/
-- AlterEnum
ALTER TYPE "EmploymentStatus" ADD VALUE 'NOT_EMPLOYED_YET';

-- AlterTable
ALTER TABLE "developers" DROP COLUMN "hiredAt",
ADD COLUMN     "joiningDate" TIMESTAMP(3),
ALTER COLUMN "employmentStatus" SET DEFAULT 'NOT_EMPLOYED_YET';

-- AlterTable
ALTER TABLE "project_managers" ALTER COLUMN "employmentStatus" SET DEFAULT 'NOT_EMPLOYED_YET';

-- DropEnum
DROP TYPE "ProjectManagerVerificationStatus";

-- CreateIndex
CREATE INDEX "project_managers_employmentStatus_idx" ON "project_managers"("employmentStatus");
