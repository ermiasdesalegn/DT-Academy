import { Navigate, Outlet, Route, Routes } from 'react-router-dom';
import { AppShell } from './components/layouts/AppShell';
import { RoleGate } from './components/layouts/RoleGate';
import { homePath } from './lib/homePath';
import { useAuthStore } from './store/authStore';
import { LoginPage } from './pages/LoginPage';
import { StaffDashboard } from './pages/StaffDashboard';
import { TeacherDashboard } from './pages/TeacherDashboard';
import { ParentDashboard } from './pages/ParentDashboard';
import { StudentDashboard } from './pages/StudentDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { AdmitStudentPage } from './pages/AdmitStudentPage';
import { useEffect, useState } from 'react';

function Boot() {
  const hydrate = useAuthStore((s) => s.hydrate);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    void hydrate().finally(() => setReady(true));
  }, [hydrate]);

  if (!ready) {
    return <div className="p-10 text-center text-sm text-slate-500">Loading…</div>;
  }

  return <Outlet />;
}

function GuestOnly() {
  const user = useAuthStore((s) => s.user);
  if (user) return <Navigate to={homePath(user.role)} replace />;
  return <Outlet />;
}

export default function App() {
  return (
    <Routes>
      <Route element={<Boot />}>
        <Route element={<GuestOnly />}>
          <Route path="/login" element={<LoginPage />} />
        </Route>
        <Route element={<AppShell />}>
          <Route element={<RoleGate allow={['DIRECTOR']} />}>
            <Route path="/director" element={<StaffDashboard />} />
          </Route>
          <Route element={<RoleGate allow={['TEACHER']} />}>
            <Route path="/teacher" element={<TeacherDashboard />} />
          </Route>
          <Route element={<RoleGate allow={['PARENT']} />}>
            <Route path="/parent" element={<ParentDashboard />} />
          </Route>
          <Route element={<RoleGate allow={['STUDENT']} />}>
            <Route path="/student" element={<StudentDashboard />} />
          </Route>
          <Route element={<RoleGate allow={['DIRECTOR', 'IT_ADMIN', 'MANAGER']} />}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/admit" element={<AdmitStudentPage />} />
          </Route>
        </Route>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Route>
    </Routes>
  );
}
