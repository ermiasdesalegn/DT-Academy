import type { Request, Response } from 'express';
import type { Prisma } from '@prisma/client';
import { USER_ROLES, type UserRole } from '@dt-academy/types';
import { prisma } from '../lib/prisma';
import { toAuthUser } from '../utils/toAuthUser';

export async function listUsers(req: Request, res: Response): Promise<void> {
  const role = typeof req.query.role === 'string' ? (req.query.role as UserRole) : undefined;
  const status = typeof req.query.status === 'string' ? req.query.status : undefined;
  const gradeRaw = typeof req.query.grade === 'string' ? req.query.grade : undefined;

  if (role && !USER_ROLES.includes(role)) {
    res.status(400).json({ message: 'Invalid role filter' });
    return;
  }

  const where: Prisma.UserWhereInput = {};
  if (role) where.role = role;

  if (status === 'true' || status === 'active') where.isActive = true;
  if (status === 'false' || status === 'inactive') where.isActive = false;

  if (gradeRaw) {
    const gradeLevel = Number(gradeRaw);
    if (!Number.isInteger(gradeLevel) || gradeLevel < 1 || gradeLevel > 8) {
      res.status(400).json({ message: 'grade must be an integer from 1 to 8' });
      return;
    }
    const profiles = await prisma.studentProfile.findMany({
      where: { gradeLevel },
      select: { userId: true },
    });
    where.id = { in: profiles.map((p) => p.userId) };
    if (!role) where.role = 'STUDENT';
  }

  const users = await prisma.user.findMany({
    where,
    orderBy: { createdAt: 'desc' },
  });
  res.json({ users: users.map(toAuthUser) });
}
