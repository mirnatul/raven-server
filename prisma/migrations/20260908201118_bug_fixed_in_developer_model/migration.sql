/*
  Warnings:

  - The primary key for the `developers` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- AlterTable
ALTER TABLE "developers" DROP CONSTRAINT "developers_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "developers_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "developers_id_seq";