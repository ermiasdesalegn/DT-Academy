import type { IAuthUser, UserRole } from '@dt-academy/types';

export function toAuthUser(user: {
  _id: { toString(): string };
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  isActive: boolean;
}): IAuthUser {
  return {
    _id: user._id.toString(),
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    isActive: user.isActive,
  };
}
