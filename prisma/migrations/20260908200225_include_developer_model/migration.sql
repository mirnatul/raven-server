-- CreateEnum
CREATE TYPE "DeveloperVerificationStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateTable
CREATE TABLE "developers" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "address" TEXT,
    "specialization" TEXT NOT NULL,
    "licenseNumber" TEXT NOT NULL,
    "qualifications" TEXT NOT NULL,
    "experienceYears" INTEGER NOT NULL,
    "bio" TEXT,
    "consultationFee" DECIMAL(10,2),
    "contactNumber" TEXT,
    "verificationStatus" "DeveloperVerificationStatus" NOT NULL DEFAULT 'PENDING',
    "rejectionReason" TEXT,
    "reviewedBy" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "resume" TEXT,
    "additionalFiles" TEXT[],
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "developers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "developers_email_key" ON "developers"("email");

-- CreateIndex
CREATE UNIQUE INDEX "developers_licenseNumber_key" ON "developers"("licenseNumber");

-- CreateIndex
CREATE UNIQUE INDEX "developers_userId_key" ON "developers"("userId");

-- CreateIndex
CREATE INDEX "idx_developer_email" ON "developers"("email");

-- AddForeignKey
ALTER TABLE "developers" ADD CONSTRAINT "developers_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;