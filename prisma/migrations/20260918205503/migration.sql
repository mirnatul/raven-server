/*
  Warnings:

  - The values [APPROVED] on the enum `ProjectRequestStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "ProjectRequestStatus_new" AS ENUM ('UNDER_REVIEW', 'OFFER_PROJECT_PRICE', 'CONFIRMED', 'REJECTED', 'CANCELLED');
ALTER TABLE "public"."ProjectRequest" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "ProjectRequest" ALTER COLUMN "status" TYPE "ProjectRequestStatus_new" USING ("status"::text::"ProjectRequestStatus_new");
ALTER TYPE "ProjectRequestStatus" RENAME TO "ProjectRequestStatus_old";
ALTER TYPE "ProjectRequestStatus_new" RENAME TO "ProjectRequestStatus";
DROP TYPE "public"."ProjectRequestStatus_old";
ALTER TABLE "ProjectRequest" ALTER COLUMN "status" SET DEFAULT 'UNDER_REVIEW';
COMMIT;
