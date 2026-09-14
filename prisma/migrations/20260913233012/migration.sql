/*
  Warnings:

  - The values [FRONTEND_DEVELOPER,BACKEND_DEVELOPER,FULLSTACK_DEVELOPER,UI_UX_DESIGNER,QA_ENGINEER,DEVOPS_ENGINEER] on the enum `JobPosition` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "JobPosition_new" AS ENUM ('DEVELOPER', 'PROJECT_MANAGER');
ALTER TABLE "job_openings" ALTER COLUMN "position" TYPE "JobPosition_new" USING ("position"::text::"JobPosition_new");
ALTER TYPE "JobPosition" RENAME TO "JobPosition_old";
ALTER TYPE "JobPosition_new" RENAME TO "JobPosition";
DROP TYPE "public"."JobPosition_old";
COMMIT;
