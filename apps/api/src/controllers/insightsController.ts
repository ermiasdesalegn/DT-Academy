import type { Request, Response } from 'express';
import type { IInsights } from '@dt-academy/types';
import { MONTH_NAMES } from '@dt-academy/types';
import { prisma } from '../lib/prisma';

function money(n: unknown): number {
  if (n == null) return 0;
  return Number(n);
}

function gradeLabel(level: number): string {
  if (level === 0) return 'KG';
  if (level === 9) return 'Prep';
  return `G${level}`;
}

export async function getInsights(_req: Request, res: Response): Promise<void> {
  const [
    studentTotal,
    activePaid,
    teachers,
    officeAdmin,
    parents,
    studentLoginsEnabled,
    parentIds,
    byYearRows,
    byGradeRows,
    payStatus,
    payMethod,
    payMonth,
    sheetStatus,
  ] = await Promise.all([
    prisma.studentProfile.count(),
    prisma.studentProfile.count({ where: { isActive: true } }),
    prisma.user.count({ where: { role: 'TEACHER' } }),
    prisma.user.count({ where: { role: { in: ['DIRECTOR', 'IT_ADMIN', 'MANAGER'] } } }),
    prisma.user.count({ where: { role: 'PARENT' } }),
    prisma.user.count({ where: { role: 'STUDENT', isActive: true } }),
    prisma.studentProfile.findMany({ select: { parentId: true }, distinct: ['parentId'] }),
    prisma.studentProfile.groupBy({ by: ['academicYear'], _count: { _all: true }, orderBy: { academicYear: 'asc' } }),
    prisma.studentProfile.groupBy({ by: ['gradeLevel'], _count: { _all: true }, orderBy: { gradeLevel: 'asc' } }),
    prisma.payment.groupBy({ by: ['status'], _count: { _all: true }, _sum: { amount: true } }),
    prisma.payment.groupBy({ by: ['method'], _count: { _all: true }, _sum: { amount: true } }),
    prisma.payment.groupBy({ by: ['month', 'status'], _count: { _all: true }, _sum: { amount: true } }),
    prisma.gradeSheet.groupBy({ by: ['status'], _count: { _all: true } }),
  ]);

  const statusCount = (s: string) => payStatus.find((r) => r.status === s)?._count._all ?? 0;
  const statusSum = (s: string) => money(payStatus.find((r) => r.status === s)?._sum.amount);
  const sheetCount = (s: string) => sheetStatus.find((r) => r.status === s)?._count._all ?? 0;

  const byMonth = MONTH_NAMES.map((label, i) => {
    const month = i + 1;
    const rows = payMonth.filter((r) => r.month === month);
    const verified = rows.filter((r) => r.status === 'VERIFIED').reduce((a, r) => a + r._count._all, 0);
    const pending = rows.filter((r) => r.status === 'PENDING').reduce((a, r) => a + r._count._all, 0);
    const amountEtb = rows.filter((r) => r.status === 'VERIFIED').reduce((a, r) => a + money(r._sum.amount), 0);
    return { month, label, verified, pending, amountEtb };
  });

  const body: IInsights = {
    students: {
      total: studentTotal,
      activePaid,
      lockedOverdue: studentTotal - activePaid,
    },
    staff: {
      total: teachers + officeAdmin,
      teachers,
      officeAdmin,
    },
    family: {
      parents,
      parentsWithChildren: parentIds.length,
      studentLoginsEnabled,
    },
    byYear: byYearRows.map((r) => ({
      key: r.academicYear,
      label: r.academicYear,
      count: r._count._all,
    })),
    byGrade: byGradeRows.map((r) => ({
      key: String(r.gradeLevel),
      label: gradeLabel(r.gradeLevel),
      count: r._count._all,
    })),
    payments: {
      pending: statusCount('PENDING'),
      verified: statusCount('VERIFIED'),
      rejected: statusCount('REJECTED'),
      verifiedAmountEtb: statusSum('VERIFIED'),
      pendingAmountEtb: statusSum('PENDING'),
      byMethod: payMethod.map((r) => ({
        method: r.method,
        count: r._count._all,
        amountEtb: money(r._sum.amount),
      })),
      byMonth,
    },
    grades: {
      draft: sheetCount('DRAFT'),
      pendingApproval: sheetCount('PENDING_APPROVAL'),
      approved: sheetCount('APPROVED'),
      unlockRequested: sheetCount('UNLOCK_REQUESTED'),
    },
  };

  res.json(body);
}
