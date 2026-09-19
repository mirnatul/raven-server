/*
  Warnings:

  - You are about to alter the column `amount` on the `payments` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,2)` to `Integer`.
  - You are about to alter the column `refundAmount` on the `payments` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,2)` to `Integer`.
  - Made the column `refundAmount` on table `payments` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "payments" ALTER COLUMN "amount" SET DATA TYPE INTEGER,
ALTER COLUMN "refundAmount" SET NOT NULL,
ALTER COLUMN "refundAmount" SET DATA TYPE INTEGER;
