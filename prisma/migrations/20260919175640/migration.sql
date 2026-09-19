/*
  Warnings:

  - You are about to alter the column `proposedPrice` on the `ProjectRequest` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Integer`.
  - Made the column `proposedPrice` on table `ProjectRequest` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "ProjectRequest" ALTER COLUMN "proposedPrice" SET NOT NULL,
ALTER COLUMN "proposedPrice" SET DATA TYPE INTEGER;
