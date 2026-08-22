-- CreateTable
CREATE TABLE "SiteContent" (
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
);
