import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { isFamilyRole } from './nav';
import { FamilyLayout } from './FamilyLayout';
import { StaffLayout } from './StaffLayout';

export function AppShell() {
  const user = useAuthStore((s) => s.user);
  if (!user) return <Navigate to="/login" replace />;
  return isFamilyRole(user.role) ? <FamilyLayout /> : <StaffLayout />;
}
