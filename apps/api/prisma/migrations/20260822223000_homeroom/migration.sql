CREATE TABLE IF NOT EXISTS "Homeroom" (
  "id" TEXT NOT NULL,
  "gradeLevel" INTEGER NOT NULL,
  "section" TEXT NOT NULL,
  "academicYear" TEXT NOT NULL,
  "teacherId" TEXT NOT NULL,
  CONSTRAINT "Homeroom_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "Homeroom_gradeLevel_section_academicYear_key"
  ON "Homeroom" ("gradeLevel", "section", "academicYear");
