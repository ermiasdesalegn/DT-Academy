import type { Request, Response } from 'express';
import type { IFamilyChild, IPortalAnnouncement } from '@dt-academy/types';
import { prisma } from '../lib/prisma';
import { announcementVisible } from '../lib/announcements';
import { attendanceSince, mapFamilyChild, mapPortalAnnouncement } from '../lib/familyMap';

const portalInclude = {
  user: { select: { name: true } },
  payments: { orderBy: { createdAt: 'desc' as const } },
  results: {
    include: {
      gradeSheet: {
        include: {
          course: { include: { teacher: { select: { name: true } } } },
        },
      },
    },
  },
  attendance: {
    where: { date: { gte: attendanceSince() } },
    include: { course: { select: { name: true } } },
    orderBy: { date: 'desc' as const },
    take: 60,
  },
};

async function coursesFor(rows: { gradeLevel: number; section: string; academicYear: string }[]) {
  if (rows.length === 0) return [];
  return prisma.course.findMany({
    where: { OR: rows.map((r) => ({ gradeLevel: r.gradeLevel, section: r.section, academicYear: r.academicYear })) },
    include: { teacher: { select: { name: true } } },
  });
}

async function listAnnouncementsFor(role: 'PARENT' | 'STUDENT', gradeLevels: number[]): Promise<IPortalAnnouncement[]> {
  const rows = await prisma.announcement.findMany({ orderBy: { createdAt: 'desc' }, take: 40 });
  return rows
    .filter((a) => announcementVisible(a, { role, gradeLevels }))
    .map(mapPortalAnnouncement);
}

export async function listMyChildren(req: Request, res: Response): Promise<void> {
  if (!req.user) {
    res.status(401).json({ message: 'Authentication required' });
    return;
  }

  const rows = await prisma.studentProfile.findMany({
    where: { parentId: req.user.id },
    orderBy: { studentIdNumber: 'asc' },
    include: portalInclude,
  });

  const courses = await coursesFor(rows);
  const children: IFamilyChild[] = rows.map((row) => mapFamilyChild(row, courses));
  const announcements = await listAnnouncementsFor(
    'PARENT',
    rows.map((r) => r.gradeLevel)
  );

  res.json({ children, announcements });
}

export async function getMyStudent(req: Request, res: Response): Promise<void> {
  if (!req.user) {
    res.status(401).json({ message: 'Authentication required' });
    return;
  }

  const row = await prisma.studentProfile.findUnique({
    where: { userId: req.user.id },
    include: portalInclude,
  });

  if (!row) {
    res.status(404).json({ message: 'No student profile is attached to this login.' });
    return;
  }

  const courses = await coursesFor([row]);
  const announcements = await listAnnouncementsFor('STUDENT', [row.gradeLevel]);
  res.json({ child: mapFamilyChild(row, courses), announcements });
}
