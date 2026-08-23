import type { Request, Response } from 'express';
import type { Prisma } from '@prisma/client';
import { USER_ROLES, type IListedUser, type UserRole } from '@dt-academy/types';
import { prisma } from '../lib/prisma';
import { toAuthUser } from '../utils/toAuthUser';
import bcrypt from 'bcryptjs';

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
  } else if (group === 'students') {
    where.role = 'STUDENT';
  } else if (group === 'parents') {
    where.role = 'PARENT';
  }

  if (status === 'true' || status === 'active') where.isActive = true;
  if (status === 'false' || status === 'inactive') where.isActive = false;

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

  const listed: IListedUser[] = users.map((user) => {
    const base = toAuthUser(user);
    if (!user.studentProfile) return base;
    const p = user.studentProfile;
    return {
      ...base,
      studentProfile: {
        _id: p.id,
        userId: p.userId,
        studentIdNumber: p.studentIdNumber,
        parentId: p.parentId,
        gradeLevel: p.gradeLevel,
        section: p.section,
        academicYear: p.academicYear,
        isActive: p.isActive,
      },
    };
  });

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
