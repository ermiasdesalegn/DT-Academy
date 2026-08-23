import type { Request, Response } from 'express';
import {
  DEFAULT_HOME_PAGE_AM,
  DEFAULT_SITE_CONTENT,
  mergeHomePage,
  mergeSiteCopyAm,
  type IHomePage,
  type ISiteContent,
  type ISiteLocaleCopy,
} from '@dt-academy/types';
import { ensureSiteContentTable } from '../lib/ensureSiteContent';
import { prisma } from '../lib/prisma';

const COPY_KEYS = [
  'schoolName',
  'city',
  'country',
  'addressLine',
  'phone',
  'hours',
  'heroTagline',
  'heroTitle',
  'heroBlurb',
  'welcomeBody',
  'aboutBody',
  'footerBlurb',
] as const;

type SiteCopy = Pick<ISiteContent, (typeof COPY_KEYS)[number]>;

async function readJsonColumn(column: 'homeJson' | 'homeJsonAm' | 'copyAmJson', id = 'default'): Promise<unknown> {
  try {
    const rows = await prisma.$queryRawUnsafe<{ value: string | null }[]>(
      `SELECT "${column}" AS value FROM "SiteContent" WHERE "id" = $1`,
      id
    );
    const raw = rows[0]?.value;
    if (!raw || raw === '{}') return undefined;
    return JSON.parse(raw) as unknown;
  } catch {
    return undefined;
  }
}

function toDto(row: SiteCopy, home: IHomePage, copyAm: ISiteLocaleCopy, homeAm: IHomePage): ISiteContent {
  return {
    schoolName: row.schoolName,
    city: row.city,
    country: row.country,
    addressLine: row.addressLine,
    phone: row.phone,
    hours: row.hours,
    heroTagline: row.heroTagline,
    heroTitle: row.heroTitle,
    heroBlurb: row.heroBlurb,
    welcomeBody: row.welcomeBody,
    aboutBody: row.aboutBody,
    footerBlurb: row.footerBlurb,
    home,
    copyAm,
    homeAm,
  };
}

async function ensureRow() {
  await ensureSiteContentTable();
  const existing = await prisma.siteContent.findUnique({ where: { id: 'default' } });
  if (existing) return existing;
  const { home: _h, copyAm: _c, homeAm: _a, ...rest } = DEFAULT_SITE_CONTENT;
  return prisma.siteContent.create({
    data: { id: 'default', ...rest },
  });
}

function parseBody(body: unknown): {
  copy: SiteCopy;
  home: IHomePage;
  copyAm: ISiteLocaleCopy;
  homeAm: IHomePage;
} | null {
  if (!body || typeof body !== 'object') return null;
  const src = body as Record<string, unknown>;
  const next: Partial<SiteCopy> = {};
  for (const key of COPY_KEYS) {
    const value = src[key];
    if (typeof value !== 'string') return null;
    const trimmed = value.trim();
    if (!trimmed || trimmed.length > 8000) return null;
    next[key] = trimmed;
  }
  return {
    copy: next as SiteCopy,
    home: mergeHomePage(src.home),
    copyAm: mergeSiteCopyAm(src.copyAm),
    homeAm: mergeHomePage(src.homeAm, DEFAULT_HOME_PAGE_AM),
  };
}

export async function getSiteContent(_req: Request, res: Response): Promise<void> {
  try {
    const row = await ensureRow();
    const home = mergeHomePage(await readJsonColumn('homeJson'));
    const copyAm = mergeSiteCopyAm(await readJsonColumn('copyAmJson'));
    const homeAm = mergeHomePage(await readJsonColumn('homeJsonAm'), DEFAULT_HOME_PAGE_AM);
    res.json(toDto(row, home, copyAm, homeAm));
  } catch {
    res.json(DEFAULT_SITE_CONTENT);
  }
}

export async function updateSiteContent(req: Request, res: Response): Promise<void> {
  const parsed = parseBody(req.body);
  if (!parsed) {
    res.status(400).json({ message: 'Fill every text field. Homepage content must be valid.' });
    return;
  }
  await ensureRow();
  const row = await prisma.siteContent.update({
    where: { id: 'default' },
    data: parsed.copy,
  });
  await prisma.$executeRawUnsafe(
    `UPDATE "SiteContent" SET "homeJson" = $1, "copyAmJson" = $2, "homeJsonAm" = $3 WHERE "id" = 'default'`,
    JSON.stringify(parsed.home),
    JSON.stringify(parsed.copyAm),
    JSON.stringify(parsed.homeAm)
  );
  res.json(toDto(row, parsed.home, parsed.copyAm, parsed.homeAm));
}

export async function uploadSiteImage(req: Request, res: Response): Promise<void> {
  const file = req.file;
  if (!file) {
    res.status(400).json({ message: 'Choose a JPEG, PNG, WebP, or GIF image under 8 MB.' });
    return;
  }
  res.json({ url: `/api/uploads/${file.filename}` });
}
