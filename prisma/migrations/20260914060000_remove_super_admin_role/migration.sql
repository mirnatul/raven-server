-- Delete super admin users before removing the enum value
DELETE FROM "users" WHERE "role" = 'SUPER_ADMIN';

-- AlterEnum: recreate "Role" without SUPER_ADMIN
ALTER TABLE "users" ALTER COLUMN "role" DROP DEFAULT;

CREATE TYPE "Role_new" AS ENUM ('ADMIN', 'PROJECT_MANAGER', 'DEVELOPER', 'CLIENT');
ALTER TABLE "users" ALTER COLUMN "role" TYPE "Role_new" USING ("role"::text::"Role_new");
DROP TYPE "Role";
ALTER TYPE "Role_new" RENAME TO "Role";

ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'CLIENT';