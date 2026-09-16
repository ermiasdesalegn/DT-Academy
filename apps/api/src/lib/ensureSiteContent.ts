import { DEFAULT_BLOG_POSTS, DEFAULT_BLOG_POSTS_AM, DEFAULT_SITE_CONTENT } from '@dt-academy/types';
import { prisma } from '../lib/prisma';

function stripDash(text: string): string {
  return text.replaceAll(' — ', '. ').replaceAll('—', '. ');
}

export async function ensureSiteContentTable(): Promise<void> {
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "SiteContent" (
      "id" TEXT NOT NULL,
      "schoolName" TEXT NOT NULL,
      "city" TEXT NOT NULL,
      "country" TEXT NOT NULL,
      "addressLine" TEXT NOT NULL,
      "phone" TEXT NOT NULL,
      "hours" TEXT NOT NULL,
      "heroTagline" TEXT NOT NULL,
      "heroTitle" TEXT NOT NULL,
      "heroBlurb" TEXT NOT NULL,
      "welcomeBody" TEXT NOT NULL,
      "aboutBody" TEXT NOT NULL,
      "footerBlurb" TEXT NOT NULL,
      "updatedAt" TIMESTAMP(3) NOT NULL,
      CONSTRAINT "SiteContent_pkey" PRIMARY KEY ("id")
    )
  `);
  await prisma.$executeRawUnsafe(`
    ALTER TABLE "SiteContent" ADD COLUMN IF NOT EXISTS "homeJson" TEXT NOT NULL DEFAULT '{}'
  `);
  await prisma.$executeRawUnsafe(`
    ALTER TABLE "SiteContent" ADD COLUMN IF NOT EXISTS "copyAmJson" TEXT NOT NULL DEFAULT '{}'
  `);
  await prisma.$executeRawUnsafe(`
    ALTER TABLE "SiteContent" ADD COLUMN IF NOT EXISTS "homeJsonAm" TEXT NOT NULL DEFAULT '{}'
  `);
  await prisma.$executeRawUnsafe(`
    ALTER TABLE "SiteContent" ADD COLUMN IF NOT EXISTS "blogJson" TEXT NOT NULL DEFAULT '{}'
  `);
  await prisma.$executeRawUnsafe(`
    ALTER TABLE "SiteContent" ADD COLUMN IF NOT EXISTS "blogJsonAm" TEXT NOT NULL DEFAULT '{}'
  `);

  const existing = await prisma.siteContent.findUnique({ where: { id: 'default' } });
  if (!existing) {
    const { home, copyAm, homeAm, blog, blogAm, ...rest } = DEFAULT_SITE_CONTENT;
    await prisma.siteContent.create({
      data: { id: 'default', ...rest },
    });
    await prisma.$executeRawUnsafe(
      `UPDATE "SiteContent" SET "homeJson" = $1, "copyAmJson" = $2, "homeJsonAm" = $3, "blogJson" = $4, "blogJsonAm" = $5 WHERE "id" = 'default'`,
      JSON.stringify(home),
      JSON.stringify(copyAm),
      JSON.stringify(homeAm),
      JSON.stringify(blog),
      JSON.stringify(blogAm)
    );
    return;
  }

  await seedBlogIfEmpty();

  const cleaned = {
    heroBlurb: stripDash(existing.heroBlurb),
    welcomeBody: stripDash(existing.welcomeBody),
    aboutBody: stripDash(existing.aboutBody),
    footerBlurb: stripDash(existing.footerBlurb),
  };
  if (
    cleaned.heroBlurb !== existing.heroBlurb ||
    cleaned.welcomeBody !== existing.welcomeBody ||
    cleaned.aboutBody !== existing.aboutBody ||
    cleaned.footerBlurb !== existing.footerBlurb
  ) {
    await prisma.siteContent.update({ where: { id: 'default' }, data: cleaned });
  }
}

async function seedBlogIfEmpty(): Promise<void> {
  try {
    const rows = await prisma.$queryRawUnsafe<{ value: string | null }[]>(
      `SELECT "blogJson" AS value FROM "SiteContent" WHERE "id" = 'default'`
    );
    const raw = rows[0]?.value;
    if (raw && raw !== '{}' && raw !== '[]') return;
    await prisma.$executeRawUnsafe(
      `UPDATE "SiteContent" SET "blogJson" = $1, "blogJsonAm" = $2 WHERE "id" = 'default'`,
      JSON.stringify(DEFAULT_BLOG_POSTS),
      JSON.stringify(DEFAULT_BLOG_POSTS_AM)
    );
  } catch {
    /* column may not exist yet on a racing first boot */
  }
}

export async function ensurePaymentMonthColumn(): Promise<void> {
  await prisma.$executeRawUnsafe(`
    ALTER TABLE "Payment" ADD COLUMN IF NOT EXISTS "month" INTEGER NOT NULL DEFAULT 0
  `);
  await prisma.$executeRawUnsafe(`
    ALTER TABLE "Payment" ADD COLUMN IF NOT EXISTS "coveredMonths" TEXT NOT NULL DEFAULT ''
  `);
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "PaymentStatusLog" (
      "id" TEXT NOT NULL,
      "studentId" TEXT NOT NULL,
      "academicYear" TEXT NOT NULL,
      "month" INTEGER NOT NULL,
      "fromStatus" TEXT NOT NULL,
      "toStatus" TEXT NOT NULL,
      "note" TEXT,
      "actorId" TEXT NOT NULL,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "PaymentStatusLog_pkey" PRIMARY KEY ("id")
    )
  `);
  await prisma.$executeRawUnsafe(`
    ALTER TABLE "Payment" ADD COLUMN IF NOT EXISTS "providerRef" TEXT
  `);
  await prisma.$executeRawUnsafe(`
    ALTER TABLE "Payment" ADD COLUMN IF NOT EXISTS "payerPhone" TEXT
  `);
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "Homeroom" (
      "id" TEXT NOT NULL,
      "gradeLevel" INTEGER NOT NULL,
      "section" TEXT NOT NULL,
      "academicYear" TEXT NOT NULL,
      "teacherId" TEXT NOT NULL,
      CONSTRAINT "Homeroom_pkey" PRIMARY KEY ("id")
    )
  `);
  await prisma.$executeRawUnsafe(`
    CREATE UNIQUE INDEX IF NOT EXISTS "Homeroom_gradeLevel_section_academicYear_key"
    ON "Homeroom" ("gradeLevel", "section", "academicYear")
  `);
}

export async function ensureFormerPeopleColumns(): Promise<void> {
  await prisma.$executeRawUnsafe(`
    ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "leftAt" TIMESTAMP(3)
  `);
  await prisma.$executeRawUnsafe(`
    ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "leftReason" TEXT
  `);
  await prisma.$executeRawUnsafe(`
    ALTER TABLE "StudentProfile" ADD COLUMN IF NOT EXISTS "isFormer" BOOLEAN NOT NULL DEFAULT false
  `);
}

export async function ensureSchoolMemorialsTables(): Promise<void> {
  await prisma.$executeRawUnsafe(`
    DO $$ BEGIN
      CREATE TYPE "MemorialKind" AS ENUM ('NOTE', 'BLOG', 'PHOTO', 'VIDEO');
    EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  `);
  await prisma.$executeRawUnsafe(`
    DO $$ BEGIN
      CREATE TYPE "MemorialScope" AS ENUM ('STUDENTS', 'BATCH');
    EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  `);
  await prisma.$executeRawUnsafe(`
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
    )
  `);
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "SchoolMemorialStudent" (
      "memorialId" TEXT NOT NULL,
      "studentId" TEXT NOT NULL,
      CONSTRAINT "SchoolMemorialStudent_pkey" PRIMARY KEY ("memorialId","studentId")
    )
  `);
  await prisma.$executeRawUnsafe(
    `CREATE INDEX IF NOT EXISTS "SchoolMemorial_authorId_idx" ON "SchoolMemorial"("authorId")`
  );
  await prisma.$executeRawUnsafe(
    `CREATE INDEX IF NOT EXISTS "SchoolMemorial_gradeLevel_academicYear_idx" ON "SchoolMemorial"("gradeLevel", "academicYear")`
  );
  await prisma.$executeRawUnsafe(
    `CREATE INDEX IF NOT EXISTS "SchoolMemorialStudent_studentId_idx" ON "SchoolMemorialStudent"("studentId")`
  );
  await prisma.$executeRawUnsafe(`
    DO $$ BEGIN
      ALTER TABLE "SchoolMemorial" ADD CONSTRAINT "SchoolMemorial_authorId_fkey"
        FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  `);
  await prisma.$executeRawUnsafe(`
    DO $$ BEGIN
      ALTER TABLE "SchoolMemorialStudent" ADD CONSTRAINT "SchoolMemorialStudent_memorialId_fkey"
        FOREIGN KEY ("memorialId") REFERENCES "SchoolMemorial"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  `);
  await prisma.$executeRawUnsafe(`
    DO $$ BEGIN
      ALTER TABLE "SchoolMemorialStudent" ADD CONSTRAINT "SchoolMemorialStudent_studentId_fkey"
        FOREIGN KEY ("studentId") REFERENCES "StudentProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  `);
}

export async function ensureJoinRequestsTable(): Promise<void> {
  await prisma.$executeRawUnsafe(`
    DO $$ BEGIN
      CREATE TYPE "JoinRequestStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');
    EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  `);
  await prisma.$executeRawUnsafe(`
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
    )
  `);
  await prisma.$executeRawUnsafe(
    `CREATE INDEX IF NOT EXISTS "JoinRequest_status_createdAt_idx" ON "JoinRequest"("status", "createdAt")`
  );
  await prisma.$executeRawUnsafe(`
    DO $$ BEGIN
      ALTER TABLE "JoinRequest" ADD CONSTRAINT "JoinRequest_reviewedById_fkey"
        FOREIGN KEY ("reviewedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  `);
}
