/*
  Warnings:

  - Made the column `address` on table `users` required. This step will fail if there are existing NULL values in that column.
  - Made the column `contactNumber` on table `users` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "job_applications" ADD COLUMN     "userId" TEXT;

-- AlterTable
ALTER TABLE "users" ALTER COLUMN "address" SET NOT NULL,
ALTER COLUMN "contactNumber" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "job_applications" ADD CONSTRAINT "job_applications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
