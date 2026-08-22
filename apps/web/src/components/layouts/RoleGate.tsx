import { Navigate, Outlet } from 'react-router-dom';
import type { UserRole } from '@dt-academy/types';
import { useAuthStore } from '../../store/authStore';
import { homePath } from '../../lib/homePath';

export function RoleGate({ allow }: { allow: UserRole[] }) {
  const user = useAuthStore((s) => s.user);
  if (!user) return <Navigate to="/login" replace />;
  if (!allow.includes(user.role)) return <Navigate to={homePath(user.role)} replace />;
  return <Outlet />;
}
