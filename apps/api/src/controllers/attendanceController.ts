import type { Request, Response } from 'express';
import type { AttendanceStatus, IAttendanceDay } from '@dt-academy/types';
import { prisma } from '../lib/prisma';
import { parseDay, toIsoDate } from '../lib/familyMap';

const STATUSES = new Set<AttendanceStatus>(['PRESENT', 'ABSENT', 'LATE', 'EXCUSED']);

async function ownCourse(req: Request, courseId: string) {
  const course = await prisma.course.findUnique({ where: { id: courseId } });
  if (!course) return null;
  if (req.user?.role === 'TEACHER' && course.teacherId !== req.user.id) return null;
  return course;
}

export async function getAttendanceDay(req: Request, res: Response): Promise<void> {
  if (!req.user) {
    res.status(401).json({ message: 'Authentication required' });
    return;
  }
  const courseId = String(req.query.courseId ?? '');
  const date = parseDay(String(req.query.date ?? ''));
  if (!courseId || !date) {
    res.status(400).json({ message: 'courseId and date (YYYY-MM-DD) are required.' });
    return;
  }
  const course = await ownCourse(req, courseId);
  if (!course) {
    res.status(404).json({ message: 'Course not found.' });
    return;
  }

  const students = await prisma.studentProfile.findMany({
    where: {
      gradeLevel: course.gradeLevel,
      section: course.section,
      academicYear: course.academicYear,
    },
    include: { user: { select: { name: true } } },
    orderBy: { studentIdNumber: 'asc' },
  });
  const marks = await prisma.attendance.findMany({
    where: { courseId, date },
  });
  const byStudent = new Map(marks.map((m) => [m.studentId, m.status]));

  const body: IAttendanceDay = {
    courseId: course.id,
    courseName: course.name,
    date: toIsoDate(date),
    marks: students.map((s) => ({
      studentId: s.id,
      studentName: s.user.name,
      studentIdNumber: s.studentIdNumber,
      status: byStudent.get(s.id) ?? null,
    })),
  };
  res.json(body);
}

export async function saveAttendanceDay(req: Request, res: Response): Promise<void> {
  if (!req.user) {
    res.status(401).json({ message: 'Authentication required' });
    return;
  }
  const courseId = typeof req.body?.courseId === 'string' ? req.body.courseId : '';
  const date = parseDay(String(req.body?.date ?? ''));
  const rows = Array.isArray(req.body?.marks) ? req.body.marks : null;
  if (!courseId || !date || !rows) {
    res.status(400).json({ message: 'courseId, date, and marks are required.' });
    return;
  }
  const course = await ownCourse(req, courseId);
  if (!course) {
    res.status(404).json({ message: 'Course not found.' });
    return;
  }
  if (req.user.role !== 'TEACHER') {
    res.status(403).json({ message: 'Only the class teacher records the roll.' });
    return;
  }

  for (const row of rows) {
    const studentId = typeof row.studentId === 'string' ? row.studentId : '';
    const status = STATUSES.has(row.status) ? (row.status as AttendanceStatus) : null;
    if (!studentId || !status) continue;
    await prisma.attendance.upsert({
      where: { studentId_courseId_date: { studentId, courseId, date } },
      create: { studentId, courseId, date, status, recordedById: req.user.id },
      update: { status, recordedById: req.user.id },
    });
  }

  req.query.courseId = courseId;
  req.query.date = toIsoDate(date);
  await getAttendanceDay(req, res);
}
