import type { Request, Response } from 'express';
import type { IInsights } from '@dt-academy/types';
import { prisma } from '../lib/prisma';

export async function getInsights(_req: Request, res: Response): Promise<void> {
  const [studentTotal, activePaid, teachers, officeAdmin] = await Promise.all([
    prisma.studentProfile.count(),
    prisma.studentProfile.count({ where: { isActive: true } }),
    prisma.user.count({ where: { role: 'TEACHER' } }),
    prisma.user.count({ where: { role: { in: ['DIRECTOR', 'IT_ADMIN', 'MANAGER'] } } }),
  ]);

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
  };

  res.json(body);
}
