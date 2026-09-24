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
    prisma.studentProfile.count({ where: { isFormer: false } }),
    prisma.studentProfile.count({ where: { isActive: true, isFormer: false } }),
    prisma.user.count({ where: { role: 'TEACHER', leftAt: null } }),
    prisma.user.count({ where: { role: { in: ['DIRECTOR', 'IT_ADMIN', 'MANAGER'] } } }),
    prisma.user.count({ where: { role: 'PARENT' } }),
    prisma.user.count({ where: { role: 'STUDENT', isActive: true, leftAt: null } }),
    prisma.studentProfile.findMany({ where: { isFormer: false }, select: { parentId: true }, distinct: ['parentId'] }),
    prisma.studentProfile.groupBy({
      by: ['academicYear'],
      where: { isFormer: false },
      _count: { _all: true },
      orderBy: { academicYear: 'asc' },
    }),
    prisma.studentProfile.groupBy({
      by: ['gradeLevel'],
      where: { isFormer: false },
      _count: { _all: true },
      orderBy: { gradeLevel: 'asc' },
    }),
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

  try {
    const absentRecords = await prisma.attendance.groupBy({
      by: ['studentId'],
      where: { status: 'ABSENT' },
      _count: { _all: true }
    });
    const highAbsenceIds = absentRecords.filter(r => r._count._all >= 3).map(r => r.studentId);
    
    const badGrades = await prisma.studentResult.findMany({
      where: { totalScore: { lt: 50 } },
      select: { studentId: true },
      distinct: ['studentId']
    });
    const badGradeIds = badGrades.map(g => g.studentId);
    
    const atRiskIds = Array.from(new Set([...highAbsenceIds, ...badGradeIds]));
    
    if (atRiskIds.length > 0) {
      const atRiskProfiles = await prisma.studentProfile.findMany({
        where: { id: { in: atRiskIds }, isFormer: false },
        include: { user: true }
      });
      
      body.atRiskStudents = atRiskProfiles.map(p => {
        let reason = '';
        if (highAbsenceIds.includes(p.id) && badGradeIds.includes(p.id)) {
          reason = 'High absences & failing grades';
        } else if (highAbsenceIds.includes(p.id)) {
          reason = 'High absences (\u2265 3)';
        } else {
          reason = 'Failing one or more classes (< 50%)';
        }
        
        return {
          studentId: p.id,
          studentName: p.user.name,
          gradeLevel: p.gradeLevel,
          riskReason: reason
        };
      });
    } else {
      body.atRiskStudents = [];
    }
  } catch (err) {
    // Graceful fallback if any query fails
    body.atRiskStudents = [];
  }

  res.json(body);
}
