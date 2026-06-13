-- CreateTable
CREATE TABLE "enterprises" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
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
    CONSTRAINT "enterprises_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "jobs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "enterprise_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "requirements" TEXT,
    "salary_range" TEXT,
    "location" TEXT,
    "type" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "keywords" JSONB NOT NULL,
    "images" JSONB NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "jobs_enterprise_id_fkey" FOREIGN KEY ("enterprise_id") REFERENCES "enterprises" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "applications" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "job_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "resume_id" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "cover_letter" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "applications_job_id_fkey" FOREIGN KEY ("job_id") REFERENCES "jobs" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "applications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "applications_resume_id_fkey" FOREIGN KEY ("resume_id") REFERENCES "resumes" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "messages" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sender_id" TEXT NOT NULL,
    "receiver_id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "messages_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "messages_receiver_id_fkey" FOREIGN KEY ("receiver_id") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "complaints" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "reporter_id" TEXT NOT NULL,
    "target_id" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "handler_id" TEXT,
    "handled_at" DATETIME,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "complaints_reporter_id_fkey" FOREIGN KEY ("reporter_id") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "complaints_target_id_fkey" FOREIGN KEY ("target_id") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "complaints_handler_id_fkey" FOREIGN KEY ("handler_id") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "credit_records" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "change" INTEGER NOT NULL,
    "reason" TEXT NOT NULL,
    "related_complaint_id" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "credit_records_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_interviews" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "resume_id" TEXT,
    "title" TEXT NOT NULL,
    "position" TEXT,
    "difficulty" TEXT NOT NULL DEFAULT 'MEDIUM',
    "language" TEXT NOT NULL DEFAULT 'ZH_CN',
    "ai_role" TEXT NOT NULL DEFAULT 'PROFESSIONAL',
    "questions" JSONB NOT NULL,
    "answers" JSONB,
    "messages" JSONB,
    "feedback" JSONB,
    "score" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'CREATED',
    "started_at" DATETIME,
    "completed_at" DATETIME,
    "report_id" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "interviews_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "interviews_resume_id_fkey" FOREIGN KEY ("resume_id") REFERENCES "resumes" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_interviews" ("ai_role", "answers", "completed_at", "created_at", "difficulty", "feedback", "id", "language", "position", "questions", "report_id", "resume_id", "score", "started_at", "status", "title", "updated_at", "user_id") SELECT "ai_role", "answers", "completed_at", "created_at", "difficulty", "feedback", "id", "language", "position", "questions", "report_id", "resume_id", "score", "started_at", "status", "title", "updated_at", "user_id" FROM "interviews";
DROP TABLE "interviews";
ALTER TABLE "new_interviews" RENAME TO "interviews";
CREATE UNIQUE INDEX "interviews_report_id_key" ON "interviews"("report_id");
CREATE TABLE "new_reports" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "resume_id" TEXT,
    "interview_id" TEXT,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" JSONB NOT NULL,
    "summary" TEXT NOT NULL,
    "score" INTEGER,
    "recommendations" JSONB,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "reports_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "reports_resume_id_fkey" FOREIGN KEY ("resume_id") REFERENCES "resumes" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "reports_interview_id_fkey" FOREIGN KEY ("interview_id") REFERENCES "interviews" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_reports" ("content", "created_at", "id", "interview_id", "recommendations", "resume_id", "score", "summary", "title", "type", "updated_at", "user_id") SELECT "content", "created_at", "id", "interview_id", "recommendations", "resume_id", "score", "summary", "title", "type", "updated_at", "user_id" FROM "reports";
DROP TABLE "reports";
ALTER TABLE "new_reports" RENAME TO "reports";
CREATE UNIQUE INDEX "reports_interview_id_key" ON "reports"("interview_id");
CREATE TABLE "new_resumes" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" JSONB,
    "raw_text" TEXT,
    "file_name" TEXT,
    "file_url" TEXT,
    "file_type" TEXT,
    "analysis" JSONB,
    "score" INTEGER,
    "analyzed_at" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "resumes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_resumes" ("analysis", "analyzed_at", "content", "created_at", "file_name", "file_type", "file_url", "id", "is_default", "raw_text", "score", "status", "title", "updated_at", "user_id") SELECT "analysis", "analyzed_at", "content", "created_at", "file_name", "file_type", "file_url", "id", "is_default", "raw_text", "score", "status", "title", "updated_at", "user_id" FROM "resumes";
DROP TABLE "resumes";
ALTER TABLE "new_resumes" RENAME TO "resumes";
CREATE TABLE "new_users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "name" TEXT,
    "avatar" TEXT,
    "role" TEXT NOT NULL DEFAULT 'USER',
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "credit_score" INTEGER NOT NULL DEFAULT 100,
    "is_banned" BOOLEAN NOT NULL DEFAULT false,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);
INSERT INTO "new_users" ("avatar", "created_at", "email", "id", "name", "password_hash", "role", "status", "updated_at") SELECT "avatar", "created_at", "email", "id", "name", "password_hash", "role", "status", "updated_at" FROM "users";
DROP TABLE "users";
ALTER TABLE "new_users" RENAME TO "users";
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "enterprises_user_id_key" ON "enterprises"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "applications_job_id_user_id_key" ON "applications"("job_id", "user_id");

-- CreateIndex
CREATE INDEX "messages_sender_id_receiver_id_idx" ON "messages"("sender_id", "receiver_id");

-- CreateIndex
CREATE INDEX "messages_created_at_idx" ON "messages"("created_at");

-- CreateIndex
CREATE INDEX "complaints_status_idx" ON "complaints"("status");

-- CreateIndex
CREATE INDEX "complaints_created_at_idx" ON "complaints"("created_at");

-- CreateIndex
CREATE INDEX "credit_records_user_id_created_at_idx" ON "credit_records"("user_id", "created_at");
