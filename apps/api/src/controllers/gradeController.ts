import type { Request, Response } from 'express';
import { scoredResult, type IGradeSheetDetail, type IGradeSheetQueueItem } from '@dt-academy/types';
import { prisma } from '../lib/prisma';

function termOf(raw: unknown): number | null {
  const n = Math.trunc(Number(raw));
  if (n < 1 || n > 3) return null;
  return n;
}

function toDetail(sheet: {
  id: string;
  term: number;
  status: IGradeSheetDetail['status'];
  submittedAt: Date | null;
  approvedAt: Date | null;
  course: {
    id: string;
    name: string;
    code: string;
    gradeLevel: number;
    section: string;
    academicYear: string;
    teacher: { name: string };
  };
  inquiries: { id: string; reason: string; status: 'PENDING' | 'APPROVED' | 'REJECTED' }[];
  results: {
    studentId: string;
    testScore: number;
    quizScore: number;
    finalExamScore: number;
    totalScore: number;
    letterGrade: string;
    behavioralRemark: string | null;
    student: { studentIdNumber: string; user: { name: string } };
  }[];
}): IGradeSheetDetail {
  const open = sheet.inquiries.find((i) => i.status === 'PENDING');
  return {
    _id: sheet.id,
    courseId: sheet.course.id,
    courseName: sheet.course.name,
    courseCode: sheet.course.code,
    gradeLevel: sheet.course.gradeLevel,
    section: sheet.course.section,
    academicYear: sheet.course.academicYear,
    term: sheet.term,
    status: sheet.status,
    teacherName: sheet.course.teacher.name,
    submittedAt: sheet.submittedAt?.toISOString(),
    approvedAt: sheet.approvedAt?.toISOString(),
    openInquiry: open ? { _id: open.id, reason: open.reason, status: open.status } : undefined,
    rows: sheet.results
      .slice()
      .sort((a, b) => a.student.user.name.localeCompare(b.student.user.name))
      .map((r) => ({
        studentId: r.studentId,
        studentName: r.student.user.name,
        studentIdNumber: r.student.studentIdNumber,
        testScore: r.testScore,
        quizScore: r.quizScore,
        finalExamScore: r.finalExamScore,
        totalScore: r.totalScore,
        letterGrade: r.letterGrade,
        behavioralRemark: r.behavioralRemark ?? '',
      })),
  };
}

const sheetInclude = {
  course: { include: { teacher: { select: { name: true } } } },
  inquiries: { where: { status: 'PENDING' as const } },
  results: { include: { student: { include: { user: { select: { name: true } } } } } },
};

async function loadSheet(id: string) {
  return prisma.gradeSheet.findUnique({ where: { id }, include: sheetInclude });
}

async function ensureRows(sheetId: string, course: { gradeLevel: number; section: string; academicYear: string }) {
  const students = await prisma.studentProfile.findMany({
    where: {
      gradeLevel: course.gradeLevel,
      section: course.section,
      academicYear: course.academicYear,
    },
    select: { id: true },
  });
  const existing = await prisma.studentResult.findMany({
    where: { gradeSheetId: sheetId },
    select: { studentId: true },
  });
  const have = new Set(existing.map((r) => r.studentId));
  const missing = students.filter((s) => !have.has(s.id));
  if (missing.length) {
    await prisma.studentResult.createMany({
      data: missing.map((s) => ({ gradeSheetId: sheetId, studentId: s.id })),
    });
  }
}

export async function listMySheets(req: Request, res: Response): Promise<void> {
  if (!req.user) {
    res.status(401).json({ message: 'Authentication required' });
    return;
  }
  const term = termOf(req.query.term) ?? undefined;
  const courses = await prisma.course.findMany({
    where: { teacherId: req.user.id },
    include: {
      gradeSheets: {
        where: term ? { term } : undefined,
        orderBy: { term: 'desc' },
      },
    },
    orderBy: [{ gradeLevel: 'asc' }, { section: 'asc' }, { name: 'asc' }],
  });
  res.json({
    courses: courses.map((c) => ({
      _id: c.id,
      name: c.name,
      code: c.code,
      gradeLevel: c.gradeLevel,
      section: c.section,
      academicYear: c.academicYear,
      sheets: c.gradeSheets.map((s) => ({
        _id: s.id,
        term: s.term,
        status: s.status,
      })),
    })),
  });
}

export async function getOrCreateSheet(req: Request, res: Response): Promise<void> {
  if (!req.user) {
    res.status(401).json({ message: 'Authentication required' });
    return;
  }
  const courseId = String(req.params.courseId ?? '');
  const term = termOf(req.query.term) ?? termOf(req.body?.term);
  if (!term) {
    res.status(400).json({ message: 'term must be 1, 2, or 3.' });
    return;
  }
  const course = await prisma.course.findUnique({ where: { id: courseId } });
  if (!course || course.teacherId !== req.user.id) {
    res.status(404).json({ message: 'Course not found.' });
    return;
  }

  let sheet = await prisma.gradeSheet.findUnique({
    where: {
      courseId_term_academicYear: { courseId, term, academicYear: course.academicYear },
    },
  });
  if (!sheet) {
    sheet = await prisma.gradeSheet.create({
      data: {
        courseId,
        teacherId: req.user.id,
        academicYear: course.academicYear,
        term,
        status: 'DRAFT',
      },
    });
  }
  await ensureRows(sheet.id, course);
  const full = await loadSheet(sheet.id);
  res.json({ sheet: toDetail(full!) });
}

export async function updateSheetResults(req: Request, res: Response): Promise<void> {
  if (!req.user) {
    res.status(401).json({ message: 'Authentication required' });
    return;
  }
  const sheet = await prisma.gradeSheet.findUnique({
    where: { id: String(req.params.id) },
    include: { course: true },
  });
  if (!sheet || sheet.course.teacherId !== req.user.id) {
    res.status(404).json({ message: 'Sheet not found.' });
    return;
  }
  if (sheet.status !== 'DRAFT') {
    res.status(400).json({ message: 'Only a draft sheet can be edited.' });
    return;
  }
  const rows = Array.isArray(req.body?.rows) ? req.body.rows : null;
  if (!rows) {
    res.status(400).json({ message: 'rows is required.' });
    return;
  }

  for (const row of rows) {
    const studentId = typeof row.studentId === 'string' ? row.studentId : '';
    if (!studentId) continue;
    const scored = scoredResult(Number(row.testScore), Number(row.quizScore), Number(row.finalExamScore));
    const remark = typeof row.behavioralRemark === 'string' ? row.behavioralRemark.trim().slice(0, 500) : '';
    await prisma.studentResult.updateMany({
      where: { gradeSheetId: sheet.id, studentId },
      data: {
        ...scored,
        behavioralRemark: remark || null,
      },
    });
  }

  const full = await loadSheet(sheet.id);
  res.json({ sheet: toDetail(full!) });
}

export async function submitSheet(req: Request, res: Response): Promise<void> {
  if (!req.user) {
    res.status(401).json({ message: 'Authentication required' });
    return;
  }
  const sheet = await prisma.gradeSheet.findUnique({
    where: { id: String(req.params.id) },
    include: { course: true },
  });
  if (!sheet || sheet.course.teacherId !== req.user.id) {
    res.status(404).json({ message: 'Sheet not found.' });
    return;
  }
  if (sheet.status !== 'DRAFT') {
    res.status(400).json({ message: 'Only a draft can be submitted.' });
    return;
  }
  const updated = await prisma.gradeSheet.update({
    where: { id: sheet.id },
    data: { status: 'PENDING_APPROVAL', submittedAt: new Date() },
  });
  const full = await loadSheet(updated.id);
  res.json({ sheet: toDetail(full!) });
}

export async function inquireSheet(req: Request, res: Response): Promise<void> {
  if (!req.user) {
    res.status(401).json({ message: 'Authentication required' });
    return;
  }
  const reason = typeof req.body?.reason === 'string' ? req.body.reason.trim() : '';
  if (reason.length < 8) {
    res.status(400).json({ message: 'Write a short reason (at least 8 characters).' });
    return;
  }
  const sheet = await prisma.gradeSheet.findUnique({
    where: { id: String(req.params.id) },
    include: { course: true, inquiries: { where: { status: 'PENDING' } } },
  });
  if (!sheet || sheet.course.teacherId !== req.user.id) {
    res.status(404).json({ message: 'Sheet not found.' });
    return;
  }
  if (sheet.status !== 'APPROVED') {
    res.status(400).json({ message: 'Ask to unlock only after the Director has signed the sheet.' });
    return;
  }
  if (sheet.inquiries.length) {
    res.status(400).json({ message: 'An unlock request is already waiting.' });
    return;
  }
  await prisma.$transaction([
    prisma.inquiry.create({
      data: { gradeSheetId: sheet.id, teacherId: req.user.id, reason },
    }),
    prisma.gradeSheet.update({
      where: { id: sheet.id },
      data: { status: 'UNLOCK_REQUESTED' },
    }),
  ]);
  const full = await loadSheet(sheet.id);
  res.json({ sheet: toDetail(full!) });
}

export async function listSheetQueue(_req: Request, res: Response): Promise<void> {
  const rows = await prisma.gradeSheet.findMany({
    where: { status: { in: ['PENDING_APPROVAL', 'UNLOCK_REQUESTED'] } },
    include: {
      course: { include: { teacher: { select: { name: true } } } },
      inquiries: { where: { status: 'PENDING' }, take: 1 },
    },
    orderBy: { submittedAt: 'asc' },
  });
  const queue: IGradeSheetQueueItem[] = rows.map((s) => ({
    _id: s.id,
    courseName: s.course.name,
    courseCode: s.course.code,
    gradeLevel: s.course.gradeLevel,
    section: s.course.section,
    academicYear: s.academicYear,
    term: s.term,
    status: s.status,
    teacherName: s.course.teacher.name,
    submittedAt: s.submittedAt?.toISOString(),
    inquiryReason: s.inquiries[0]?.reason,
    inquiryId: s.inquiries[0]?.id,
  }));
  res.json({ queue });
}

export async function getSheetForDirector(req: Request, res: Response): Promise<void> {
  const full = await loadSheet(String(req.params.id));
  if (!full) {
    res.status(404).json({ message: 'Sheet not found.' });
    return;
  }
  res.json({ sheet: toDetail(full) });
}

export async function approveSheet(req: Request, res: Response): Promise<void> {
  if (!req.user) {
    res.status(401).json({ message: 'Authentication required' });
    return;
  }
  const sheet = await prisma.gradeSheet.findUnique({ where: { id: String(req.params.id) } });
  if (!sheet) {
    res.status(404).json({ message: 'Sheet not found.' });
    return;
  }
  if (sheet.status !== 'PENDING_APPROVAL') {
    res.status(400).json({ message: 'Only a submitted sheet can be signed.' });
    return;
  }
  await prisma.gradeSheet.update({
    where: { id: sheet.id },
    data: { status: 'APPROVED', approvedById: req.user.id, approvedAt: new Date() },
  });
  const full = await loadSheet(sheet.id);
  res.json({ sheet: toDetail(full!) });
}

export async function returnSheet(req: Request, res: Response): Promise<void> {
  const sheet = await prisma.gradeSheet.findUnique({ where: { id: String(req.params.id) } });
  if (!sheet) {
    res.status(404).json({ message: 'Sheet not found.' });
    return;
  }
  if (sheet.status !== 'PENDING_APPROVAL') {
    res.status(400).json({ message: 'Only a submitted sheet can be returned.' });
    return;
  }
  await prisma.gradeSheet.update({
    where: { id: sheet.id },
    data: { status: 'DRAFT' },
  });
  const full = await loadSheet(sheet.id);
  res.json({ sheet: toDetail(full!) });
}

export async function resolveInquiry(req: Request, res: Response): Promise<void> {
  if (!req.user) {
    res.status(401).json({ message: 'Authentication required' });
    return;
  }
  const action = req.body?.action === 'reject' ? 'reject' : req.body?.action === 'approve' ? 'approve' : null;
  if (!action) {
    res.status(400).json({ message: 'action must be approve or reject.' });
    return;
  }
  const inquiry = await prisma.inquiry.findUnique({
    where: { id: String(req.params.id) },
    include: { gradeSheet: true },
  });
  if (!inquiry || inquiry.status !== 'PENDING') {
    res.status(404).json({ message: 'Inquiry not found.' });
    return;
  }
  if (inquiry.gradeSheet.status !== 'UNLOCK_REQUESTED') {
    res.status(400).json({ message: 'This sheet is not waiting for an unlock.' });
    return;
  }

  if (action === 'approve') {
    await prisma.$transaction([
      prisma.inquiry.update({
        where: { id: inquiry.id },
        data: { status: 'APPROVED', resolvedById: req.user.id },
      }),
      prisma.gradeSheet.update({
        where: { id: inquiry.gradeSheetId },
        data: { status: 'DRAFT', approvedById: null, approvedAt: null },
      }),
    ]);
  } else {
    await prisma.$transaction([
      prisma.inquiry.update({
        where: { id: inquiry.id },
        data: { status: 'REJECTED', resolvedById: req.user.id },
      }),
      prisma.gradeSheet.update({
        where: { id: inquiry.gradeSheetId },
        data: { status: 'APPROVED' },
      }),
    ]);
  }
  const full = await loadSheet(inquiry.gradeSheetId);
  res.json({ sheet: toDetail(full!) });
}
