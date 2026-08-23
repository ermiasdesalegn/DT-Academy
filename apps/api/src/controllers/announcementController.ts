import type { Request, Response } from 'express';
import type { AnnouncementAudience } from '@dt-academy/types';
import { prisma } from '../lib/prisma';
import { announcementVisible } from '../lib/announcements';
import { mapPortalAnnouncement } from '../lib/familyMap';

const AUDIENCES = new Set<AnnouncementAudience>(['ALL', 'PARENTS', 'TEACHERS', 'STUDENTS']);

export async function listAnnouncements(req: Request, res: Response): Promise<void> {
  if (!req.user) {
    res.status(401).json({ message: 'Authentication required' });
    return;
  }
  const rows = await prisma.announcement.findMany({
    orderBy: { createdAt: 'desc' },
    take: 80,
    include: { author: { select: { name: true } } },
  });

  let gradeLevels: number[] | undefined;
  if (req.user.role === 'TEACHER') {
    const courses = await prisma.course.findMany({
      where: { teacherId: req.user.id },
      select: { gradeLevel: true },
    });
    gradeLevels = [...new Set(courses.map((c) => c.gradeLevel))];
  } else if (req.user.role === 'PARENT') {
    const kids = await prisma.studentProfile.findMany({
      where: { parentId: req.user.id },
      select: { gradeLevel: true },
    });
    gradeLevels = kids.map((k) => k.gradeLevel);
  } else if (req.user.role === 'STUDENT') {
    const me = await prisma.studentProfile.findUnique({
      where: { userId: req.user.id },
      select: { gradeLevel: true },
    });
    gradeLevels = me ? [me.gradeLevel] : [];
  }

  const visible = rows.filter((a) =>
    announcementVisible(a, { role: req.user!.role, gradeLevels })
  );
  res.json({
    announcements: visible.map((a) => ({
      ...mapPortalAnnouncement(a),
      authorName: a.author.name,
    })),
  });
}

export async function createAnnouncement(req: Request, res: Response): Promise<void> {
  if (!req.user) {
    res.status(401).json({ message: 'Authentication required' });
    return;
  }
  const title = typeof req.body?.title === 'string' ? req.body.title.trim() : '';
  const content = typeof req.body?.content === 'string' ? req.body.content.trim() : '';
  const audience = req.body?.audience as AnnouncementAudience;
  const gradeRaw = req.body?.gradeLevel;
  const gradeLevel =
    gradeRaw === '' || gradeRaw == null || gradeRaw === 'all' ? null : Math.trunc(Number(gradeRaw));
  if (title.length < 3 || content.length < 8 || !AUDIENCES.has(audience)) {
    res.status(400).json({ message: 'Title, message, and audience are required.' });
    return;
  }
  if (gradeLevel != null && (!Number.isFinite(gradeLevel) || gradeLevel < 0 || gradeLevel > 9)) {
    res.status(400).json({ message: 'gradeLevel must be KG (0) through 8, or empty.' });
    return;
  }
  const row = await prisma.announcement.create({
    data: {
      title: title.slice(0, 200),
      content: content.slice(0, 8000),
      audience,
      gradeLevel,
      authorId: req.user.id,
    },
    include: { author: { select: { name: true } } },
  });
  res.status(201).json({
    announcement: { ...mapPortalAnnouncement(row), authorName: row.author.name },
  });
}
