-- CreateTable
CREATE TABLE "hr_accounts" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "enterprise_id" TEXT NOT NULL,
    "job_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "hr_accounts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "hr_accounts_enterprise_id_fkey" FOREIGN KEY ("enterprise_id") REFERENCES "enterprises" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "hr_accounts_job_id_fkey" FOREIGN KEY ("job_id") REFERENCES "jobs" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_enterprises" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "owner_id" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "logo" TEXT,
    "website" TEXT,
    "industry" TEXT,
    "size" TEXT,
    "location" TEXT,
    "contact_email" TEXT,
    "contact_phone" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "enterprises_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "enterprises_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_enterprises" ("contact_email", "contact_phone", "created_at", "description", "id", "industry", "location", "logo", "name", "size", "updated_at", "user_id", "website") SELECT "contact_email", "contact_phone", "created_at", "description", "id", "industry", "location", "logo", "name", "size", "updated_at", "user_id", "website" FROM "enterprises";
DROP TABLE "enterprises";
ALTER TABLE "new_enterprises" RENAME TO "enterprises";
CREATE UNIQUE INDEX "enterprises_user_id_key" ON "enterprises"("user_id");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "hr_accounts_user_id_key" ON "hr_accounts"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "hr_accounts_job_id_key" ON "hr_accounts"("job_id");
