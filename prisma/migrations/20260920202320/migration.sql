/*
  Warnings:

  - The values [AVAILABLE] on the enum `DeveloperAvailabilityStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "DeveloperAvailabilityStatus_new" AS ENUM ('OCCUPIED', 'LEAVE');
ALTER TABLE "public"."developer_availability" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "developer_availability" ALTER COLUMN "status" TYPE "DeveloperAvailabilityStatus_new" USING ("status"::text::"DeveloperAvailabilityStatus_new");
ALTER TYPE "DeveloperAvailabilityStatus" RENAME TO "DeveloperAvailabilityStatus_old";
ALTER TYPE "DeveloperAvailabilityStatus_new" RENAME TO "DeveloperAvailabilityStatus";
DROP TYPE "public"."DeveloperAvailabilityStatus_old";
COMMIT;

-- AlterTable
ALTER TABLE "developer_availability" ALTER COLUMN "status" DROP DEFAULT;
