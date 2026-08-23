import type { Request, Response } from 'express';
import type { IFamilyChild } from '@dt-academy/types';
import { academicYearNumber } from '@dt-academy/types';
import { prisma } from '../lib/prisma';
import { buildTuitionMonths } from '../lib/tuitionMonths';

export async function listMyChildren(req: Request, res: Response): Promise<void> {
  if (!req.user) {
    res.status(401).json({ message: 'Authentication required' });
    return;
  }

  const rows = await prisma.studentProfile.findMany({
    where: { parentId: req.user.id },
    orderBy: { studentIdNumber: 'asc' },
    include: {
      user: { select: { name: true } },
      payments: { orderBy: { createdAt: 'desc' } },
      results: {
        include: {
          gradeSheet: {
            include: {
              course: { include: { teacher: { select: { name: true } } } },
            },
          },
        },
      },
    },
  });

  const classKeys = rows.map((r) => ({
    gradeLevel: r.gradeLevel,
    section: r.section,
    academicYear: r.academicYear,
  }));

  const courses =
    classKeys.length === 0
      ? []
      : await prisma.course.findMany({
          where: { OR: classKeys },
          include: { teacher: { select: { name: true } } },
        });

  const children: IFamilyChild[] = rows.map((row) => {
    const year = academicYearNumber(row.academicYear);
    const yearPayments = row.payments.filter((p) => academicYearNumber(p.academicYear) === year);
    const pending = row.payments.find((p) => p.status === 'PENDING');
    const classCourses = courses.filter(
      (c) =>
        c.gradeLevel === row.gradeLevel &&
        c.section === row.section &&
        c.academicYear === row.academicYear
    );
    const approvedResults = row.results.filter((r) => r.gradeSheet.status === 'APPROVED');

    return {
      name: row.user.name,
      profile: {
        _id: row.id,
        userId: row.userId,
        studentIdNumber: row.studentIdNumber,
        parentId: row.parentId,
        gradeLevel: row.gradeLevel,
        section: row.section,
        academicYear: row.academicYear,
        isActive: row.isActive,
      },
      pendingPayment: pending
        ? {
            amount: Number(pending.amount),
            method: pending.method,
            referencePNR: pending.referencePNR,
          }
        : undefined,
      tuitionMonths: buildTuitionMonths(year, yearPayments),
      teachers: classCourses.map((c) => ({
        subject: c.name,
        teacherName: c.teacher.name,
      })),
      results: approvedResults.map((r) => ({
            subject: r.gradeSheet.course.name,
            teacherName: r.gradeSheet.course.teacher.name,
            term: r.gradeSheet.term,
            letterGrade: r.letterGrade,
            totalScore: r.totalScore,
          })),
    };
  });

  res.json({ children });
}
