import { DEFAULT_SITE_CONTENT } from '@dt-academy/types';
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

  const existing = await prisma.siteContent.findUnique({ where: { id: 'default' } });
  if (!existing) {
    const { home, copyAm, homeAm, ...rest } = DEFAULT_SITE_CONTENT;
    await prisma.siteContent.create({
      data: { id: 'default', ...rest },
    });
    await prisma.$executeRawUnsafe(
      `UPDATE "SiteContent" SET "homeJson" = $1, "copyAmJson" = $2, "homeJsonAm" = $3 WHERE "id" = 'default'`,
      JSON.stringify(home),
      JSON.stringify(copyAm),
      JSON.stringify(homeAm)
    );
    return;
  }

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
