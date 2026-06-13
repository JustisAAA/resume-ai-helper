-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "name" TEXT,
    "avatar" TEXT,
    "role" TEXT NOT NULL DEFAULT 'USER',
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "resumes" (
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
    CONSTRAINT "resumes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "interviews" (
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
    "feedback" JSONB,
    "score" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'CREATED',
    "started_at" DATETIME,
    "completed_at" DATETIME,
    "report_id" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "interviews_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "interviews_resume_id_fkey" FOREIGN KEY ("resume_id") REFERENCES "resumes" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "reports" (
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
    CONSTRAINT "reports_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "reports_resume_id_fkey" FOREIGN KEY ("resume_id") REFERENCES "resumes" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "reports_interview_id_fkey" FOREIGN KEY ("interview_id") REFERENCES "interviews" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "interviews_report_id_key" ON "interviews"("report_id");

-- CreateIndex
CREATE UNIQUE INDEX "reports_interview_id_key" ON "reports"("interview_id");
