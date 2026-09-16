-- CreateEnum
DO $$ BEGIN
  CREATE TYPE "MemorialKind" AS ENUM ('NOTE', 'BLOG', 'PHOTO', 'VIDEO');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "MemorialScope" AS ENUM ('STUDENTS', 'BATCH');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- CreateTable
CREATE TABLE IF NOT EXISTS "SchoolMemorial" (
  "id" TEXT NOT NULL,
  "kind" "MemorialKind" NOT NULL,
  "scope" "MemorialScope" NOT NULL,
  "title" TEXT NOT NULL,
  "note" TEXT NOT NULL,
  "mediaUrl" TEXT,
  "gradeLevel" INTEGER,
  "academicYear" TEXT,
  "section" TEXT,
  "authorId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "SchoolMemorial_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "SchoolMemorialStudent" (
  "memorialId" TEXT NOT NULL,
  "studentId" TEXT NOT NULL,
  CONSTRAINT "SchoolMemorialStudent_pkey" PRIMARY KEY ("memorialId","studentId")
);

CREATE INDEX IF NOT EXISTS "SchoolMemorial_authorId_idx" ON "SchoolMemorial"("authorId");
CREATE INDEX IF NOT EXISTS "SchoolMemorial_gradeLevel_academicYear_idx" ON "SchoolMemorial"("gradeLevel", "academicYear");
CREATE INDEX IF NOT EXISTS "SchoolMemorialStudent_studentId_idx" ON "SchoolMemorialStudent"("studentId");

DO $$ BEGIN
  ALTER TABLE "SchoolMemorial" ADD CONSTRAINT "SchoolMemorial_authorId_fkey"
    FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "SchoolMemorialStudent" ADD CONSTRAINT "SchoolMemorialStudent_memorialId_fkey"
    FOREIGN KEY ("memorialId") REFERENCES "SchoolMemorial"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "SchoolMemorialStudent" ADD CONSTRAINT "SchoolMemorialStudent_studentId_fkey"
    FOREIGN KEY ("studentId") REFERENCES "StudentProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
