-- AlterTable
ALTER TABLE "applications" ADD COLUMN "ai_analysis" JSONB;

-- AlterTable
ALTER TABLE "jobs" ADD COLUMN "interview_config" JSONB;
