import type { Request, Response } from 'express';
import type { UserRole } from '@dt-academy/types';
import { USER_ROLES, StudentProfile, User } from '../models';
import { toAuthUser } from '../utils/toAuthUser';

export async function listUsers(req: Request, res: Response): Promise<void> {
  const role = typeof req.query.role === 'string' ? (req.query.role as UserRole) : undefined;
  const status = typeof req.query.status === 'string' ? req.query.status : undefined;
  const gradeRaw = typeof req.query.grade === 'string' ? req.query.grade : undefined;

  if (role && !USER_ROLES.includes(role)) {
    res.status(400).json({ message: 'Invalid role filter' });
    return;
  }

  const filter: Record<string, unknown> = {};
  if (role) filter.role = role;

  if (status === 'true' || status === 'active') filter.isActive = true;
  if (status === 'false' || status === 'inactive') filter.isActive = false;

  let gradeUserIds: string[] | undefined;
  if (gradeRaw) {
    const gradeLevel = Number(gradeRaw);
    if (!Number.isInteger(gradeLevel) || gradeLevel < 1 || gradeLevel > 8) {
      res.status(400).json({ message: 'grade must be an integer from 1 to 8' });
      return;
    }
    const profiles = await StudentProfile.find({ gradeLevel }).select('userId');
    gradeUserIds = profiles.map((p) => p.userId.toString());
    filter._id = { $in: gradeUserIds };
    if (!role) filter.role = 'STUDENT';
  }

  const users = await User.find(filter).sort({ createdAt: -1 });
  res.json({ users: users.map(toAuthUser) });
}
