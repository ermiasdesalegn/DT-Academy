import type { IAuthUser, IListedUser, IStudentProfile, UserRole } from '@dt-academy/types';

type UserRow = {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  role: UserRole;
  isActive: boolean;
  leftAt?: Date | null;
  leftReason?: string | null;
};

type ProfileRow = {
  id: string;
  userId: string;
  studentIdNumber: string;
  parentId: string;
  gradeLevel: number;
  section: string;
  academicYear: string;
  isActive: boolean;
  isFormer: boolean;
};

export function toAuthUser(user: UserRow): IAuthUser {
  return {
    _id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone ?? undefined,
    role: user.role,
    isActive: user.isActive,
    leftAt: user.leftAt ? user.leftAt.toISOString() : undefined,
    leftReason: user.leftReason ?? undefined,
  };
}

export function toStudentProfile(p: ProfileRow): IStudentProfile {
  return {
    _id: p.id,
    userId: p.userId,
    studentIdNumber: p.studentIdNumber,
    parentId: p.parentId,
    gradeLevel: p.gradeLevel,
    section: p.section,
    academicYear: p.academicYear,
    isActive: p.isActive,
    isFormer: p.isFormer,
  };
}

export function toListedUser(user: UserRow & { studentProfile?: ProfileRow | null }): IListedUser {
  const base = toAuthUser(user);
  if (!user.studentProfile) return base;
  return { ...base, studentProfile: toStudentProfile(user.studentProfile) };
}
