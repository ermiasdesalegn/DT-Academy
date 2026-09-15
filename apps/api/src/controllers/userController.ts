import type { Request, Response } from 'express';
import type { Prisma } from '@prisma/client';
import {
  USER_ROLES,
  type IListedUser,
  type IPersonHistory,
  type UserRole,
} from '@dt-academy/types';
import { prisma } from '../lib/prisma';
import { toAuthUser, toListedUser, toStudentProfile } from '../utils/toAuthUser';
import { toIsoDate } from '../lib/familyMap';
import bcrypt from 'bcryptjs';

const FORMER_ROLES: UserRole[] = ['STUDENT', 'TEACHER'];

function isFormerWhere(): Prisma.UserWhereInput {
  return {
    OR: [{ leftAt: { not: null } }, { studentProfile: { isFormer: true } }],
  };
}

function isCurrentWhere(): Prisma.UserWhereInput {
  return {
    leftAt: null,
    OR: [{ studentProfile: null }, { studentProfile: { isFormer: false } }],
  };
}

export async function listUsers(req: Request, res: Response): Promise<void> {
  const role = typeof req.query.role === 'string' ? (req.query.role as UserRole) : undefined;
  const status = typeof req.query.status === 'string' ? req.query.status : undefined;
  const gradeRaw = typeof req.query.grade === 'string' ? req.query.grade : undefined;
  const group = typeof req.query.group === 'string' ? req.query.group : undefined;

  if (role && !USER_ROLES.includes(role)) {
    res.status(400).json({ message: 'Invalid role filter' });
    return;
  }

  const where: Prisma.UserWhereInput = {};
  if (role) where.role = role;

  if (group === 'staff') {
    where.role = { in: ['DIRECTOR', 'IT_ADMIN', 'MANAGER', 'TEACHER'] };
    Object.assign(where, isCurrentWhere());
  } else if (group === 'students') {
    where.role = 'STUDENT';
    Object.assign(where, isCurrentWhere());
  } else if (group === 'parents') {
    where.role = 'PARENT';
  } else if (group === 'former-students') {
    where.role = 'STUDENT';
    Object.assign(where, isFormerWhere());
  } else if (group === 'former-teachers') {
    where.role = 'TEACHER';
    Object.assign(where, isFormerWhere());
  } else if (group === 'all' || !group) {
    if (status !== 'former' && status !== 'inactive' && status !== 'all') {
      Object.assign(where, isCurrentWhere());
    }
  }

  if (status === 'true' || status === 'active') {
    where.isActive = true;
    Object.assign(where, isCurrentWhere());
  } else if (status === 'false' || status === 'inactive') {
    where.isActive = false;
    Object.assign(where, isCurrentWhere());
  } else if (status === 'former') {
    Object.assign(where, isFormerWhere());
  }

  if (gradeRaw) {
    const gradeLevel = Number(gradeRaw);
    if (!Number.isInteger(gradeLevel) || gradeLevel < 0 || gradeLevel > 9) {
      res.status(400).json({ message: 'grade must be an integer from 0 (KG) to 9 (Prep)' });
      return;
    }
    const profiles = await prisma.studentProfile.findMany({
      where: { gradeLevel },
      select: { userId: true },
    });
    where.id = { in: profiles.map((p) => p.userId) };
    if (!role && group !== 'staff' && group !== 'parents') where.role = 'STUDENT';
  }

  const users = await prisma.user.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: { studentProfile: true },
  });

  const listed: IListedUser[] = users.map((user) => toListedUser(user));
  res.json({ users: listed });
}

export async function setUserPassword(req: Request, res: Response): Promise<void> {
  const id = req.params.id;
  const password = typeof req.body?.password === 'string' ? req.body.password.trim() : '';
  if (!id || password.length < 8) {
    res.status(400).json({ message: 'Password must be at least 8 characters' });
    return;
  }

  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) {
    res.status(404).json({ message: 'User not found' });
    return;
  }

  await prisma.user.update({
    where: { id },
    data: { passwordHash: await bcrypt.hash(password, 12) },
  });

  res.json({ user: toAuthUser(user) });
}

export async function markUserFormer(req: Request, res: Response): Promise<void> {
  const id = req.params.id;
  const reason = typeof req.body?.reason === 'string' ? req.body.reason.trim().slice(0, 500) : undefined;
  if (!id) {
    res.status(400).json({ message: 'User id is required' });
    return;
  }

  const user = await prisma.user.findUnique({
    where: { id },
    include: { studentProfile: true },
  });
  if (!user) {
    res.status(404).json({ message: 'User not found' });
    return;
  }
  if (!FORMER_ROLES.includes(user.role)) {
    res.status(400).json({ message: 'Only students and teachers can be marked former' });
    return;
  }
  if (user.leftAt || user.studentProfile?.isFormer) {
    res.status(409).json({ message: 'This person is already marked former' });
    return;
  }

  const leftAt = new Date();
  const updated = await prisma.user.update({
    where: { id },
    data: {
      isActive: false,
      leftAt,
      leftReason: reason || null,
      ...(user.role === 'STUDENT'
        ? { studentProfile: { update: { isFormer: true } } }
        : {}),
    },
    include: { studentProfile: true },
  });

  res.json({ user: toListedUser(updated) });
}

export async function restoreUser(req: Request, res: Response): Promise<void> {
  const id = req.params.id;
  if (!id) {
    res.status(400).json({ message: 'User id is required' });
    return;
  }

  const user = await prisma.user.findUnique({
    where: { id },
    include: { studentProfile: true },
  });
  if (!user) {
    res.status(404).json({ message: 'User not found' });
    return;
  }
  if (!FORMER_ROLES.includes(user.role)) {
    res.status(400).json({ message: 'Only students and teachers can be restored this way' });
    return;
  }
  if (!user.leftAt && !user.studentProfile?.isFormer) {
    res.status(409).json({ message: 'This person is not marked former' });
    return;
  }

  const allowLogin =
    user.role === 'TEACHER' || (user.role === 'STUDENT' && (user.studentProfile?.gradeLevel ?? 0) >= 5);

  const updated = await prisma.user.update({
    where: { id },
    data: {
      isActive: allowLogin,
      leftAt: null,
      leftReason: null,
      ...(user.role === 'STUDENT'
        ? { studentProfile: { update: { isFormer: false } } }
        : {}),
    },
    include: { studentProfile: true },
  });

  res.json({ user: toListedUser(updated) });
}

export async function getUserHistory(req: Request, res: Response): Promise<void> {
  const id = req.params.id;
  if (!id) {
    res.status(400).json({ message: 'User id is required' });
    return;
  }

  const user = await prisma.user.findUnique({
    where: { id },
    include: { studentProfile: true },
  });
  if (!user) {
    res.status(404).json({ message: 'User not found' });
    return;
  }
  if (user.role !== 'STUDENT' && user.role !== 'TEACHER') {
    res.status(400).json({ message: 'History is only available for students and teachers' });
    return;
  }

  const emptySummary = { present: 0, absent: 0, late: 0, excused: 0, total: 0 };
  const body: IPersonHistory = {
    user: toListedUser(user),
    results: [],
    attendance: [],
    attendanceSummary: emptySummary,
    coursesTaught: [],
    sheets: [],
    attendanceRecordedCount: 0,
  };

  if (user.role === 'STUDENT' && user.studentProfile) {
    const profileId = user.studentProfile.id;
    const [results, attendance] = await Promise.all([
      prisma.studentResult.findMany({
        where: { studentId: profileId, gradeSheet: { status: 'APPROVED' } },
        include: {
          gradeSheet: {
            include: { course: { include: { teacher: { select: { name: true } } } } },
          },
        },
        orderBy: [{ gradeSheet: { academicYear: 'desc' } }, { gradeSheet: { term: 'desc' } }],
      }),
      prisma.attendance.findMany({
        where: { studentId: profileId },
        include: { course: { select: { name: true } } },
        orderBy: { date: 'desc' },
        take: 200,
      }),
    ]);

    body.results = results.map((r) => ({
      subject: r.gradeSheet.course.name,
      teacherName: r.gradeSheet.course.teacher.name,
      term: r.gradeSheet.term,
      academicYear: r.gradeSheet.academicYear,
      letterGrade: r.letterGrade,
      totalScore: r.totalScore,
    }));
    body.attendance = attendance.map((a) => ({
      courseName: a.course.name,
      date: toIsoDate(a.date),
      status: a.status,
    }));
    const summary = { ...emptySummary, total: attendance.length };
    for (const a of attendance) {
      if (a.status === 'PRESENT') summary.present += 1;
      else if (a.status === 'ABSENT') summary.absent += 1;
      else if (a.status === 'LATE') summary.late += 1;
      else if (a.status === 'EXCUSED') summary.excused += 1;
    }
    body.attendanceSummary = summary;
  }

  if (user.role === 'TEACHER') {
    const [courses, sheets, recordedCount] = await Promise.all([
      prisma.course.findMany({
        where: { teacherId: id },
        orderBy: [{ academicYear: 'desc' }, { name: 'asc' }],
      }),
      prisma.gradeSheet.findMany({
        where: { teacherId: id },
        include: { course: { select: { name: true, code: true } } },
        orderBy: [{ academicYear: 'desc' }, { term: 'desc' }],
      }),
      prisma.attendance.count({ where: { recordedById: id } }),
    ]);

    body.coursesTaught = courses.map((c) => ({
      name: c.name,
      code: c.code,
      gradeLevel: c.gradeLevel,
      section: c.section,
      academicYear: c.academicYear,
    }));
    body.sheets = sheets.map((s) => ({
      courseName: s.course.name,
      courseCode: s.course.code,
      term: s.term,
      academicYear: s.academicYear,
      status: s.status,
      submittedAt: s.submittedAt?.toISOString(),
      approvedAt: s.approvedAt?.toISOString(),
    }));
    body.attendanceRecordedCount = recordedCount;
  }

  res.json(body);
}

export { toStudentProfile };
