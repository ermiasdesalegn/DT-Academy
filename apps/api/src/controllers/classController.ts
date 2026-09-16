import type { Request, Response } from 'express';
import type { IClassGroup, ICourse } from '@dt-academy/types';
import { prisma } from '../lib/prisma';
import { buildClassOverall } from '../lib/classOverall';

function mapCourse(row: {
  id: string;
  name: string;
  code: string;
  gradeLevel: number;
  section: string;
  teacherId: string;
  academicYear: string;
  teacher?: { name: string } | null;
}): ICourse {
  return {
    _id: row.id,
    name: row.name,
    code: row.code,
    gradeLevel: row.gradeLevel,
    section: row.section,
    teacherId: row.teacherId,
    academicYear: row.academicYear,
    teacherName: row.teacher?.name,
  };
}

export async function listClasses(_req: Request, res: Response): Promise<void> {
  const students = await prisma.studentProfile.findMany({
    select: { gradeLevel: true, section: true, academicYear: true },
  });
  const keys = new Map<string, { gradeLevel: number; section: string; academicYear: string; studentCount: number }>();
  for (const row of students) {
    const id = `${row.academicYear}|${row.gradeLevel}|${row.section}`;
    const cur = keys.get(id);
    if (cur) cur.studentCount += 1;
    else keys.set(id, { ...row, studentCount: 1 });
  }

  const homerooms = await prisma.homeroom.findMany({
    include: { teacher: { select: { id: true, name: true } } },
  });

  const classes: IClassGroup[] = [...keys.values()]
    .sort((a, b) => a.gradeLevel - b.gradeLevel || a.section.localeCompare(b.section))
    .map((row) => {
      const home = homerooms.find(
        (h) =>
          h.gradeLevel === row.gradeLevel &&
          h.section === row.section &&
          h.academicYear === row.academicYear
      );
      return {
        gradeLevel: row.gradeLevel,
        section: row.section,
        academicYear: row.academicYear,
        studentCount: row.studentCount,
        homeroomTeacherId: home?.teacherId,
        homeroomTeacherName: home?.teacher.name,
      };
    });

  res.json({ classes });
}

export async function setHomeroom(req: Request, res: Response): Promise<void> {
  const gradeLevel = Math.trunc(Number(req.body?.gradeLevel));
  const section = typeof req.body?.section === 'string' ? req.body.section.trim() : '';
  const academicYear = typeof req.body?.academicYear === 'string' ? req.body.academicYear.trim() : '';
  const teacherId = typeof req.body?.teacherId === 'string' ? req.body.teacherId : '';
  if (!section || !academicYear || !teacherId || !Number.isFinite(gradeLevel)) {
    res.status(400).json({ message: 'gradeLevel, section, academicYear, and teacherId are required' });
    return;
  }

  const teacher = await prisma.user.findUnique({ where: { id: teacherId } });
  if (!teacher || teacher.role !== 'TEACHER') {
    res.status(400).json({ message: 'Pick a teacher account.' });
    return;
  }

  const row = await prisma.homeroom.upsert({
    where: { gradeLevel_section_academicYear: { gradeLevel, section, academicYear } },
    create: { gradeLevel, section, academicYear, teacherId },
    update: { teacherId },
    include: { teacher: { select: { name: true } } },
  });

  res.json({
    class: {
      gradeLevel: row.gradeLevel,
      section: row.section,
      academicYear: row.academicYear,
      studentCount: 0,
      homeroomTeacherId: row.teacherId,
      homeroomTeacherName: row.teacher.name,
    },
  });
}

export async function getClassOverall(req: Request, res: Response): Promise<void> {
  const gradeLevel = Math.trunc(Number(req.query.gradeLevel));
  const section = typeof req.query.section === 'string' ? req.query.section : '';
  const academicYear = typeof req.query.academicYear === 'string' ? req.query.academicYear : '';
  const termRaw = req.query.term;
  const term = typeof termRaw === 'string' && termRaw ? Number(termRaw) : undefined;
  if (!section || !academicYear || !Number.isFinite(gradeLevel)) {
    res.status(400).json({ message: 'gradeLevel, section, and academicYear are required' });
    return;
  }

  if (req.user?.role === 'TEACHER') {
    const home = await prisma.homeroom.findUnique({
      where: { gradeLevel_section_academicYear: { gradeLevel, section, academicYear } },
    });
    if (!home || home.teacherId !== req.user.id) {
      res.status(403).json({ message: 'Only the class representative can open this roll.' });
      return;
    }
  }

  const overall = await buildClassOverall({
    gradeLevel,
    section,
    academicYear,
    term: Number.isInteger(term) ? term : undefined,
  });
  res.json({ overall });
}

export async function listClassCourses(req: Request, res: Response): Promise<void> {
  const gradeLevel = Math.trunc(Number(req.query.gradeLevel));
  const section = typeof req.query.section === 'string' ? req.query.section.trim() : '';
  const academicYear = typeof req.query.academicYear === 'string' ? req.query.academicYear.trim() : '';
  if (!section || !academicYear || !Number.isFinite(gradeLevel) || gradeLevel < 0 || gradeLevel > 9) {
    res.status(400).json({ message: 'gradeLevel, section, and academicYear are required' });
    return;
  }

  const rows = await prisma.course.findMany({
    where: { gradeLevel, section, academicYear },
    orderBy: { name: 'asc' },
    include: { teacher: { select: { name: true } } },
  });
  res.json({ courses: rows.map(mapCourse) });
}

export async function upsertClassCourse(req: Request, res: Response): Promise<void> {
  const gradeLevel = Math.trunc(Number(req.body?.gradeLevel));
  const section = typeof req.body?.section === 'string' ? req.body.section.trim() : '';
  const academicYear = typeof req.body?.academicYear === 'string' ? req.body.academicYear.trim() : '';
  const teacherId = typeof req.body?.teacherId === 'string' ? req.body.teacherId.trim() : '';
  const name = typeof req.body?.name === 'string' ? req.body.name.trim() : '';
  const code = typeof req.body?.code === 'string' ? req.body.code.trim().toUpperCase() : '';

  if (
    !section ||
    !academicYear ||
    !teacherId ||
    name.length < 2 ||
    code.length < 2 ||
    !Number.isFinite(gradeLevel) ||
    gradeLevel < 0 ||
    gradeLevel > 9
  ) {
    res.status(400).json({ message: 'name, code, gradeLevel, section, academicYear, and teacherId are required' });
    return;
  }

  const teacher = await prisma.user.findUnique({ where: { id: teacherId } });
  if (!teacher || teacher.role !== 'TEACHER' || teacher.leftAt) {
    res.status(400).json({ message: 'Pick a teacher account.' });
    return;
  }

  const row = await prisma.course.upsert({
    where: {
      code_academicYear_gradeLevel_section: { code, academicYear, gradeLevel, section },
    },
    create: {
      name: name.slice(0, 120),
      code: code.slice(0, 16),
      gradeLevel,
      section,
      academicYear,
      teacherId,
    },
    update: {
      name: name.slice(0, 120),
      teacherId,
    },
    include: { teacher: { select: { name: true } } },
  });

  res.json({ course: mapCourse(row) });
}

/** Copy subjects + teachers from one class onto every other KG–8 class in the same year. */
export async function applyClassCourseTemplate(req: Request, res: Response): Promise<void> {
  const gradeLevel = Math.trunc(Number(req.body?.gradeLevel));
  const section = typeof req.body?.section === 'string' ? req.body.section.trim() : '';
  const academicYear = typeof req.body?.academicYear === 'string' ? req.body.academicYear.trim() : '';

  if (!section || !academicYear || !Number.isFinite(gradeLevel) || gradeLevel < 0 || gradeLevel > 8) {
    res.status(400).json({ message: 'Source gradeLevel (KG–8), section, and academicYear are required' });
    return;
  }

  const source = await prisma.course.findMany({
    where: { gradeLevel, section, academicYear },
  });
  if (source.length === 0) {
    res.status(400).json({ message: 'Save subjects on this class first, then apply them to the others.' });
    return;
  }

  const students = await prisma.studentProfile.findMany({
    where: { academicYear, gradeLevel: { gte: 0, lte: 8 }, isFormer: false },
    select: { gradeLevel: true, section: true },
    distinct: ['gradeLevel', 'section'],
  });

  const targets = students.filter(
    (c) => !(c.gradeLevel === gradeLevel && c.section === section)
  );

  let upserted = 0;
  for (const target of targets) {
    for (const course of source) {
      await prisma.course.upsert({
        where: {
          code_academicYear_gradeLevel_section: {
            code: course.code,
            academicYear,
            gradeLevel: target.gradeLevel,
            section: target.section,
          },
        },
        create: {
          name: course.name,
          code: course.code,
          gradeLevel: target.gradeLevel,
          section: target.section,
          academicYear,
          teacherId: course.teacherId,
        },
        update: {
          name: course.name,
          teacherId: course.teacherId,
        },
      });
      upserted += 1;
    }
  }

  res.json({
    ok: true,
    sourceCount: source.length,
    targetClasses: targets.length,
    upserted,
  });
}

export async function getTeachingHome(req: Request, res: Response): Promise<void> {
  if (!req.user) {
    res.status(401).json({ message: 'Authentication required' });
    return;
  }

  const homerooms = await prisma.homeroom.findMany({
    where: { teacherId: req.user.id },
    orderBy: [{ gradeLevel: 'asc' }, { section: 'asc' }],
  });

  const courses = await prisma.course.findMany({
    where: { teacherId: req.user.id },
    orderBy: { name: 'asc' },
  });

  const first = homerooms[0];
  const overall = first
    ? await buildClassOverall({
        gradeLevel: first.gradeLevel,
        section: first.section,
        academicYear: first.academicYear,
      })
    : null;

  res.json({
    homerooms: homerooms.map((h) => ({
      gradeLevel: h.gradeLevel,
      section: h.section,
      academicYear: h.academicYear,
    })),
    courses: courses.map((c) => ({
      _id: c.id,
      name: c.name,
      gradeLevel: c.gradeLevel,
      section: c.section,
      academicYear: c.academicYear,
    })),
    overall,
  });
}
