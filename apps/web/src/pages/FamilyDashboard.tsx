import { ParentDashboard } from './ParentDashboard';
import { StudentDashboard } from './StudentDashboard';
import { useAuthStore } from '../store/authStore';

export function FamilyDashboard() {
  const role = useAuthStore((s) => s.user?.role);
  return role === 'STUDENT' ? <StudentDashboard /> : <ParentDashboard />;
}
