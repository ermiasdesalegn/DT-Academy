-- CreateEnum
DO $$ BEGIN
  CREATE TYPE "JoinRequestStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- CreateTable
CREATE TABLE IF NOT EXISTS "JoinRequest" (
  "id" TEXT NOT NULL,
  "studentName" TEXT NOT NULL,
  "parentName" TEXT NOT NULL,
  "parentPhone" TEXT NOT NULL,
  "parentEmail" TEXT,
  "gradeLevel" INTEGER NOT NULL,
  "section" TEXT,
  "academicYear" TEXT,
  "note" TEXT NOT NULL,
  "status" "JoinRequestStatus" NOT NULL DEFAULT 'PENDING',
  "reviewedAt" TIMESTAMP(3),
  "reviewedById" TEXT,
  "rejectReason" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "JoinRequest_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "JoinRequest_status_createdAt_idx" ON "JoinRequest"("status", "createdAt");

DO $$ BEGIN
  ALTER TABLE "JoinRequest" ADD CONSTRAINT "JoinRequest_reviewedById_fkey"
    FOREIGN KEY ("reviewedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
