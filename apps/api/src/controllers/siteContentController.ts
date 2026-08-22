import type { Request, Response } from 'express';
import { DEFAULT_SITE_CONTENT, type ISiteContent } from '@dt-academy/types';
import { ensureSiteContentTable } from '../lib/ensureSiteContent';
import { prisma } from '../lib/prisma';

const KEYS: (keyof ISiteContent)[] = [
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
];

function toDto(row: ISiteContent): ISiteContent {
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
  };
}

async function ensureRow() {
  await ensureSiteContentTable();
  const existing = await prisma.siteContent.findUnique({ where: { id: 'default' } });
  if (existing) return existing;
  return prisma.siteContent.create({
    data: { id: 'default', ...DEFAULT_SITE_CONTENT },
  });
}

function parseBody(body: unknown): ISiteContent | null {
  if (!body || typeof body !== 'object') return null;
  const src = body as Record<string, unknown>;
  const next: Partial<ISiteContent> = {};
  for (const key of KEYS) {
    const value = src[key];
    if (typeof value !== 'string') return null;
    const trimmed = value.trim();
    if (!trimmed || trimmed.length > 4000) return null;
    next[key] = trimmed;
  }
  return next as ISiteContent;
}

export async function getSiteContent(_req: Request, res: Response): Promise<void> {
  try {
    const row = await ensureRow();
    res.json(toDto(row));
  } catch {
    res.json(DEFAULT_SITE_CONTENT);
  }
}

export async function updateSiteContent(req: Request, res: Response): Promise<void> {
  const parsed = parseBody(req.body);
  if (!parsed) {
    res.status(400).json({ message: 'Fill every field. Text must be under 4,000 characters.' });
    return;
  }
  await ensureRow();
  const row = await prisma.siteContent.update({
    where: { id: 'default' },
    data: parsed,
  });
  res.json(toDto(row));
}
