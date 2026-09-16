/*
  Warnings:

  - You are about to drop the column `userId` on the `job_applications` table. All the data in the column will be lost.
  - Added the required column `resume` to the `developers` table without a default value. This is not possible if the table is not empty.
  - Added the required column `resumePublicId` to the `developers` table without a default value. This is not possible if the table is not empty.
  - Added the required column `title` to the `developers` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "job_applications" DROP CONSTRAINT "job_applications_userId_fkey";

-- AlterTable
ALTER TABLE "developers" ADD COLUMN     "resume" TEXT NOT NULL,
ADD COLUMN     "resumePublicId" TEXT NOT NULL,
ADD COLUMN     "title" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "job_applications" DROP COLUMN "userId";
