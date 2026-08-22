import type { IAuthUser, UserRole } from '@dt-academy/types';

export function toAuthUser(user: {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  role: UserRole;
  isActive: boolean;
}): IAuthUser {
  return {
    _id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone ?? undefined,
    role: user.role,
    isActive: user.isActive,
  };
}
