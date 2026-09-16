import type { Request, Response } from 'express';
import type { MemorialKind, MemorialScope, ISchoolMemorial } from '@dt-academy/types';
import type { Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma';
import { handleUploadResponse } from '../lib/resolveUpload';

const KINDS = new Set<MemorialKind>(['NOTE', 'BLOG', 'PHOTO', 'VIDEO']);
const SCOPES = new Set<MemorialScope>(['STUDENTS', 'BATCH']);

type MemorialRow = {
  id: string;
  kind: MemorialKind;
  scope: MemorialScope;
  title: string;
  note: string;
  mediaUrl: string | null;
  gradeLevel: number | null;
  academicYear: string | null;
  section: string | null;
  createdAt: Date;
  author: { name: string };
  students: Array<{
    studentId: string;
    student: { studentIdNumber: string; user: { name: string } };
  }>;
};

function mapMemorial(row: MemorialRow): ISchoolMemorial {
  return {
    _id: row.id,
    kind: row.kind,
    scope: row.scope,
    title: row.title,
    note: row.note,
    mediaUrl: row.mediaUrl ?? undefined,
    gradeLevel: row.gradeLevel ?? undefined,
    academicYear: row.academicYear ?? undefined,
    section: row.section ?? undefined,
    authorName: row.author.name,
    createdAt: row.createdAt.toISOString(),
    students: row.students.map((s) => ({
      studentId: s.studentId,
      studentName: s.student.user.name,
      studentIdNumber: s.student.studentIdNumber,
    })),
  };
}

const memorialInclude = {
  author: { select: { name: true } },
  students: {
    include: {
      student: { select: { studentIdNumber: true, user: { select: { name: true } } } },
    },
  },
} as const;

function batchMatch(
  m: { gradeLevel: number | null; academicYear: string | null; section: string | null },
  p: { gradeLevel: number; academicYear: string; section: string }
): boolean {
  return (
    m.gradeLevel === p.gradeLevel &&
    m.academicYear === p.academicYear &&
    (!m.section || m.section === p.section)
  );
}

export async function uploadMemorialMedia(req: Request, res: Response): Promise<void> {
  await handleUploadResponse(req, res, 'Choose a photo or video file.', 201);
}

export async function listMemorials(req: Request, res: Response): Promise<void> {
  if (!req.user) {
    res.status(401).json({ message: 'Authentication required' });
    return;
  }

  const studentId = typeof req.query.studentId === 'string' ? req.query.studentId : undefined;
  const where: Prisma.SchoolMemorialWhereInput = {};

  if (req.user.role === 'PARENT') {
    const profiles = await prisma.studentProfile.findMany({
      where: { parentId: req.user.id },
      select: { id: true, gradeLevel: true, academicYear: true, section: true },
    });
    const scoped = studentId ? profiles.filter((p) => p.id === studentId) : profiles;
    if (scoped.length === 0) {
      res.json({ memorials: [] });
      return;
    }
    where.OR = [
      { students: { some: { studentId: { in: scoped.map((p) => p.id) } } } },
      ...scoped.map((p) => ({
        scope: 'BATCH' as const,
        gradeLevel: p.gradeLevel,
        academicYear: p.academicYear,
      })),
    ];
    const rows = await prisma.schoolMemorial.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 100,
      include: memorialInclude,
    });
    res.json({
      memorials: rows
        .filter((m) => {
          if (m.scope === 'STUDENTS') return m.students.some((s) => scoped.some((p) => p.id === s.studentId));
          return scoped.some((p) => batchMatch(m, p));
        })
        .map(mapMemorial),
    });
    return;
  }

  if (req.user.role === 'STUDENT') {
    const profile = await prisma.studentProfile.findUnique({
      where: { userId: req.user.id },
      select: { id: true, gradeLevel: true, academicYear: true, section: true },
    });
    if (!profile) {
      res.json({ memorials: [] });
      return;
    }
    const rows = await prisma.schoolMemorial.findMany({
      where: {
        OR: [
          { students: { some: { studentId: profile.id } } },
          { scope: 'BATCH', gradeLevel: profile.gradeLevel, academicYear: profile.academicYear },
        ],
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
      include: memorialInclude,
    });
    res.json({
      memorials: rows
        .filter((m) => (m.scope === 'STUDENTS' ? true : batchMatch(m, profile)))
        .map(mapMemorial),
    });
    return;
  }

  if (studentId) {
    const profile = await prisma.studentProfile.findUnique({ where: { id: studentId } });
    if (!profile) {
      res.json({ memorials: [] });
      return;
    }
    const rows = await prisma.schoolMemorial.findMany({
      where: {
        OR: [
          { students: { some: { studentId } } },
          { scope: 'BATCH', gradeLevel: profile.gradeLevel, academicYear: profile.academicYear },
        ],
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
      include: memorialInclude,
    });
    res.json({
      memorials: rows
        .filter((m) => (m.scope === 'STUDENTS' ? true : batchMatch(m, profile)))
        .map(mapMemorial),
    });
    return;
  }

  const rows = await prisma.schoolMemorial.findMany({
    orderBy: { createdAt: 'desc' },
    take: 100,
    include: memorialInclude,
  });
  res.json({ memorials: rows.map(mapMemorial) });
}

export async function createMemorial(req: Request, res: Response): Promise<void> {
  if (!req.user) {
    res.status(401).json({ message: 'Authentication required' });
    return;
  }

  const kind = req.body?.kind as MemorialKind;
  const scope = req.body?.scope as MemorialScope;
  const title = typeof req.body?.title === 'string' ? req.body.title.trim() : '';
  const note = typeof req.body?.note === 'string' ? req.body.note.trim() : '';
  const mediaUrl = typeof req.body?.mediaUrl === 'string' ? req.body.mediaUrl.trim() : undefined;
  const academicYear = typeof req.body?.academicYear === 'string' ? req.body.academicYear.trim() : undefined;
  const section = typeof req.body?.section === 'string' ? req.body.section.trim() : undefined;
  const gradeRaw = req.body?.gradeLevel;
  const gradeLevel = gradeRaw === '' || gradeRaw == null ? null : Math.trunc(Number(gradeRaw));
  const studentIds: string[] = Array.isArray(req.body?.studentIds)
    ? req.body.studentIds.filter((id: unknown) => typeof id === 'string')
    : [];

  if (!KINDS.has(kind) || !SCOPES.has(scope) || title.length < 2 || note.length < 2) {
    res.status(400).json({ message: 'Kind, scope, title, and note are required.' });
    return;
  }
  if ((kind === 'PHOTO' || kind === 'VIDEO') && !mediaUrl) {
    res.status(400).json({ message: 'Upload a photo or video for this memorial.' });
    return;
  }
  if (scope === 'STUDENTS') {
    if (studentIds.length === 0) {
      res.status(400).json({ message: 'Select at least one student.' });
      return;
    }
    const found = await prisma.studentProfile.count({ where: { id: { in: studentIds } } });
    if (found !== studentIds.length) {
      res.status(400).json({ message: 'One or more students were not found.' });
      return;
    }
  } else {
    if (gradeLevel == null || !Number.isFinite(gradeLevel) || gradeLevel < 0 || gradeLevel > 9) {
      res.status(400).json({ message: 'Batch memorials need a grade.' });
      return;
    }
    if (!academicYear) {
      res.status(400).json({ message: 'Batch memorials need an academic year.' });
      return;
    }
  }

  const row = await prisma.schoolMemorial.create({
    data: {
      kind,
      scope,
      title: title.slice(0, 200),
      note: note.slice(0, 12000),
      mediaUrl: mediaUrl || null,
      gradeLevel: scope === 'BATCH' ? gradeLevel : null,
      academicYear: scope === 'BATCH' ? academicYear : null,
      section: scope === 'BATCH' && section ? section : null,
      authorId: req.user.id,
      students:
        scope === 'STUDENTS' ? { create: studentIds.map((id) => ({ studentId: id })) } : undefined,
    },
    include: memorialInclude,
  });

  res.status(201).json({ memorial: mapMemorial(row) });
}

export async function updateMemorial(req: Request, res: Response): Promise<void> {
  if (!req.user) {
    res.status(401).json({ message: 'Authentication required' });
    return;
  }
  const id = req.params.id;
  if (!id) {
    res.status(400).json({ message: 'Memorial id is required' });
    return;
  }
  const existing = await prisma.schoolMemorial.findUnique({ where: { id } });
  if (!existing) {
    res.status(404).json({ message: 'Memorial not found' });
    return;
  }

  const kind = req.body?.kind as MemorialKind;
  const scope = req.body?.scope as MemorialScope;
  const title = typeof req.body?.title === 'string' ? req.body.title.trim() : '';
  const note = typeof req.body?.note === 'string' ? req.body.note.trim() : '';
  const mediaUrl = typeof req.body?.mediaUrl === 'string' ? req.body.mediaUrl.trim() : undefined;
  const academicYear = typeof req.body?.academicYear === 'string' ? req.body.academicYear.trim() : undefined;
  const section = typeof req.body?.section === 'string' ? req.body.section.trim() : undefined;
  const gradeRaw = req.body?.gradeLevel;
  const gradeLevel = gradeRaw === '' || gradeRaw == null ? null : Math.trunc(Number(gradeRaw));
  const studentIds: string[] = Array.isArray(req.body?.studentIds)
    ? req.body.studentIds.filter((id: unknown) => typeof id === 'string')
    : [];

  if (!KINDS.has(kind) || !SCOPES.has(scope) || title.length < 2 || note.length < 2) {
    res.status(400).json({ message: 'Kind, scope, title, and note are required.' });
    return;
  }
  if ((kind === 'PHOTO' || kind === 'VIDEO') && !mediaUrl) {
    res.status(400).json({ message: 'Upload a photo or video for this memorial.' });
    return;
  }
  if (scope === 'STUDENTS') {
    if (studentIds.length === 0) {
      res.status(400).json({ message: 'Select at least one student.' });
      return;
    }
    const found = await prisma.studentProfile.count({ where: { id: { in: studentIds } } });
    if (found !== studentIds.length) {
      res.status(400).json({ message: 'One or more students were not found.' });
      return;
    }
  } else {
    if (gradeLevel == null || !Number.isFinite(gradeLevel) || gradeLevel < 0 || gradeLevel > 9) {
      res.status(400).json({ message: 'Batch memorials need a grade.' });
      return;
    }
    if (!academicYear) {
      res.status(400).json({ message: 'Batch memorials need an academic year.' });
      return;
    }
  }

  await prisma.schoolMemorialStudent.deleteMany({ where: { memorialId: id } });
  const row = await prisma.schoolMemorial.update({
    where: { id },
    data: {
      kind,
      scope,
      title: title.slice(0, 200),
      note: note.slice(0, 12000),
      mediaUrl: mediaUrl || null,
      gradeLevel: scope === 'BATCH' ? gradeLevel : null,
      academicYear: scope === 'BATCH' ? academicYear : null,
      section: scope === 'BATCH' && section ? section : null,
      students:
        scope === 'STUDENTS' ? { create: studentIds.map((sid) => ({ studentId: sid })) } : undefined,
    },
    include: memorialInclude,
  });

  res.json({ memorial: mapMemorial(row) });
}

export async function deleteMemorial(req: Request, res: Response): Promise<void> {
  const id = req.params.id;
  if (!id) {
    res.status(400).json({ message: 'Memorial id is required' });
    return;
  }
  const existing = await prisma.schoolMemorial.findUnique({ where: { id } });
  if (!existing) {
    res.status(404).json({ message: 'Memorial not found' });
    return;
  }
  await prisma.schoolMemorial.delete({ where: { id } });
  res.json({ ok: true });
}
