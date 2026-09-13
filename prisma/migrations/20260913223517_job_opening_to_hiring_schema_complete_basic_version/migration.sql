/*
  Warnings:

  - You are about to drop the column `contactNumber` on the `clients` table. All the data in the column will be lost.
  - You are about to drop the column `deletedAt` on the `clients` table. All the data in the column will be lost.
  - You are about to drop the column `email` on the `clients` table. All the data in the column will be lost.
  - You are about to drop the column `isDeleted` on the `clients` table. All the data in the column will be lost.
  - You are about to drop the column `additionalFiles` on the `developers` table. All the data in the column will be lost.
  - You are about to drop the column `address` on the `developers` table. All the data in the column will be lost.
  - You are about to drop the column `consultationFee` on the `developers` table. All the data in the column will be lost.
  - You are about to drop the column `contactNumber` on the `developers` table. All the data in the column will be lost.
  - You are about to drop the column `deletedAt` on the `developers` table. All the data in the column will be lost.
  - You are about to drop the column `email` on the `developers` table. All the data in the column will be lost.
  - You are about to drop the column `isDeleted` on the `developers` table. All the data in the column will be lost.
  - You are about to drop the column `licenseNumber` on the `developers` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `developers` table. All the data in the column will be lost.
  - You are about to drop the column `rejectionReason` on the `developers` table. All the data in the column will be lost.
  - You are about to drop the column `resume` on the `developers` table. All the data in the column will be lost.
  - You are about to drop the column `resumePublicId` on the `developers` table. All the data in the column will be lost.
  - You are about to drop the column `reviewedAt` on the `developers` table. All the data in the column will be lost.
  - You are about to drop the column `reviewedBy` on the `developers` table. All the data in the column will be lost.
  - You are about to drop the column `verificationStatus` on the `developers` table. All the data in the column will be lost.
  - You are about to drop the column `role` on the `users` table. All the data in the column will be lost.
  - Added the required column `phone` to the `clients` table without a default value. This is not possible if the table is not empty.
  - Made the column `address` on table `clients` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "EmploymentStatus" AS ENUM ('ACTIVE', 'ON_LEAVE', 'SUSPENDED', 'TERMINATED');

-- CreateEnum
CREATE TYPE "JobApplicationStatus" AS ENUM ('UNDER_REVIEW', 'HIRED');

-- CreateEnum
CREATE TYPE "EmploymentType" AS ENUM ('FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP');

-- CreateEnum
CREATE TYPE "WorkplaceType" AS ENUM ('ONSITE', 'REMOTE', 'HYBRID');

-- CreateEnum
CREATE TYPE "JobOpeningStatus" AS ENUM ('PUBLISHED', 'CLOSED');

-- CreateEnum
CREATE TYPE "JobPosition" AS ENUM ('FRONTEND_DEVELOPER', 'BACKEND_DEVELOPER', 'FULLSTACK_DEVELOPER', 'UI_UX_DESIGNER', 'QA_ENGINEER', 'DEVOPS_ENGINEER');

-- CreateEnum
CREATE TYPE "ProjectManagerVerificationStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- DropIndex
DROP INDEX "clients_email_key";

-- DropIndex
DROP INDEX "idx_client_email";

-- DropIndex
DROP INDEX "idx_client_isDeleted";

-- DropIndex
DROP INDEX "developers_email_key";

-- DropIndex
DROP INDEX "developers_licenseNumber_key";

-- DropIndex
DROP INDEX "idx_developer_email";

-- AlterTable
ALTER TABLE "clients" DROP COLUMN "contactNumber",
DROP COLUMN "deletedAt",
DROP COLUMN "email",
DROP COLUMN "isDeleted",
ADD COLUMN     "bio" TEXT,
ADD COLUMN     "companyName" TEXT,
ADD COLUMN     "phone" TEXT NOT NULL,
ALTER COLUMN "address" SET NOT NULL;

-- AlterTable
ALTER TABLE "developers" DROP COLUMN "additionalFiles",
DROP COLUMN "address",
DROP COLUMN "consultationFee",
DROP COLUMN "contactNumber",
DROP COLUMN "deletedAt",
DROP COLUMN "email",
DROP COLUMN "isDeleted",
DROP COLUMN "licenseNumber",
DROP COLUMN "name",
DROP COLUMN "rejectionReason",
DROP COLUMN "resume",
DROP COLUMN "resumePublicId",
DROP COLUMN "reviewedAt",
DROP COLUMN "reviewedBy",
DROP COLUMN "verificationStatus",
ADD COLUMN     "employmentStatus" "EmploymentStatus" NOT NULL DEFAULT 'ACTIVE',
ADD COLUMN     "githubUrl" TEXT,
ADD COLUMN     "hiredAt" TIMESTAMP(3),
ADD COLUMN     "linkedinUrl" TEXT,
ADD COLUMN     "portfolioUrl" TEXT,
ADD COLUMN     "terminatedAt" TIMESTAMP(3),
ADD COLUMN     "terminationReason" TEXT,
ALTER COLUMN "specialization" DROP NOT NULL,
ALTER COLUMN "qualifications" DROP NOT NULL,
ALTER COLUMN "experienceYears" DROP NOT NULL;

-- AlterTable
ALTER TABLE "users" DROP COLUMN "role",
ADD COLUMN     "address" TEXT,
ADD COLUMN     "contactNumber" TEXT;

-- DropEnum
DROP TYPE "DeveloperVerificationStatus";

-- CreateTable
CREATE TABLE "job_applications" (
    "id" TEXT NOT NULL,
    "jobOpeningId" TEXT NOT NULL,
    "userId" TEXT,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "contactNumber" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "resume" TEXT NOT NULL,
    "resumePublicId" TEXT NOT NULL,
    "additionalFiles" JSONB,
    "coverLetter" TEXT,
    "portfolioUrl" TEXT,
    "githubUrl" TEXT,
    "linkedinUrl" TEXT,
    "expectedSalary" DECIMAL(10,2),
    "availableFrom" TIMESTAMP(3),
    "status" "JobApplicationStatus" NOT NULL DEFAULT 'UNDER_REVIEW',
    "hiredAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "job_applications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "job_openings" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "position" "JobPosition" NOT NULL,
    "description" TEXT NOT NULL,
    "requirements" TEXT NOT NULL,
    "responsibilities" TEXT NOT NULL,
    "nice_to_have" TEXT NOT NULL,
    "employmentType" "EmploymentType" NOT NULL,
    "workplaceType" "WorkplaceType" NOT NULL,
    "location" TEXT,
    "salaryMin" DECIMAL(10,2),
    "salaryMax" DECIMAL(10,2),
    "experienceMin" INTEGER,
    "experienceMax" INTEGER,
    "skills" JSONB,
    "applicationDeadline" TIMESTAMP(3),
    "status" "JobOpeningStatus" NOT NULL DEFAULT 'PUBLISHED',
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT,

    CONSTRAINT "job_openings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project_managers" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "bio" TEXT,
    "experienceYears" INTEGER,
    "specialization" TEXT,
    "qualifications" TEXT,
    "joiningDate" TIMESTAMP(3),
    "employmentStatus" "EmploymentStatus" NOT NULL DEFAULT 'ACTIVE',
    "terminatedAt" TIMESTAMP(3),
    "terminationReason" TEXT,
    "portfolioUrl" TEXT,
    "githubUrl" TEXT,
    "linkedinUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "project_managers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "job_applications_jobOpeningId_idx" ON "job_applications"("jobOpeningId");

-- CreateIndex
CREATE INDEX "job_applications_status_idx" ON "job_applications"("status");

-- CreateIndex
CREATE INDEX "job_applications_email_idx" ON "job_applications"("email");

-- CreateIndex
CREATE INDEX "job_openings_position_idx" ON "job_openings"("position");

-- CreateIndex
CREATE INDEX "job_openings_status_idx" ON "job_openings"("status");

-- CreateIndex
CREATE UNIQUE INDEX "project_managers_userId_key" ON "project_managers"("userId");

-- CreateIndex
CREATE INDEX "developers_employmentStatus_idx" ON "developers"("employmentStatus");

-- AddForeignKey
ALTER TABLE "job_applications" ADD CONSTRAINT "job_applications_jobOpeningId_fkey" FOREIGN KEY ("jobOpeningId") REFERENCES "job_openings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_applications" ADD CONSTRAINT "job_applications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_openings" ADD CONSTRAINT "job_openings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_managers" ADD CONSTRAINT "project_managers_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
