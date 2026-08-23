import { Navigate, Outlet, Route, Routes } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { WebsiteLayout } from './components/layouts/WebsiteLayout';
import { ProtectedRoute } from './components/layouts/ProtectedRoute';
import { StaffLayout } from './components/layouts/StaffLayout';
import { RoleGate } from './components/layouts/RoleGate';
import { homePath } from './lib/homePath';
import { useAuthStore } from './store/authStore';
import { LoginPage } from './pages/LoginPage';
import { HomePage } from './pages/public/Home';
import { AboutPage } from './pages/public/About';
import { AcademicsPage } from './pages/public/Academics';
import { AdmissionsPage } from './pages/public/Admissions';
import { ContactPage } from './pages/public/Contact';
import { ServicePage } from './pages/public/Service';
import { BlogPage } from './pages/public/Blog';
import { BlogPostPage } from './pages/public/BlogPost';
import { FaqPage } from './pages/public/Faq';
import { StaffDashboard } from './pages/StaffDashboard';
import { TeacherDashboard } from './pages/TeacherDashboard';
import { FamilyDashboard } from './pages/FamilyDashboard';
import { PayTuitionPage } from './pages/PayTuitionPage';
import { AdminDashboard } from './pages/AdminDashboard';
import { AdmitStudentPage } from './pages/AdmitStudentPage';
import { WebsiteContentPage } from './pages/WebsiteContentPage';
import { TuitionOfficePage } from './pages/TuitionOfficePage';
import { ClassesOfficePage } from './pages/ClassesOfficePage';

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
        <Route element={<ProtectedRoute />}>
          <Route element={<StaffLayout />}>
            <Route element={<RoleGate allow={['DIRECTOR']} />}>
              <Route path="/admin/dashboard" element={<StaffDashboard />} />
            </Route>
            <Route element={<RoleGate allow={['TEACHER']} />}>
              <Route path="/admin/teaching" element={<TeacherDashboard />} />
            </Route>
            <Route element={<RoleGate allow={['DIRECTOR', 'IT_ADMIN']} />}>
              <Route path="/admin/website" element={<WebsiteContentPage />} />
              <Route path="/admin/tuition" element={<TuitionOfficePage />} />
              <Route path="/admin/classes" element={<ClassesOfficePage />} />
            </Route>
            <Route element={<RoleGate allow={['DIRECTOR', 'IT_ADMIN', 'MANAGER']} />}>
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/admissions" element={<AdmitStudentPage />} />
            </Route>
          </Route>
        </Route>

        <Route element={<WebsiteLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/academics" element={<AcademicsPage />} />
          <Route path="/admissions" element={<AdmissionsPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/service" element={<ServicePage />} />
          <Route path="/blog" element={<BlogPage />} />
          <Route path="/blog/:slug" element={<BlogPostPage />} />
          <Route path="/faq" element={<FaqPage />} />

          <Route element={<ProtectedRoute />}>
            <Route element={<RoleGate allow={['PARENT', 'STUDENT']} />}>
              <Route path="/portal/dashboard" element={<FamilyDashboard />} />
              <Route path="/portal/pay/return" element={<PayTuitionPage />} />
              <Route path="/portal/pay" element={<PayTuitionPage />} />
            </Route>
          </Route>
        </Route>

        <Route element={<GuestOnly />}>
          <Route path="/login" element={<LoginPage />} />
        </Route>

        <Route path="/director" element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="/admin/admit" element={<Navigate to="/admin/admissions" replace />} />
        <Route path="/teacher" element={<Navigate to="/admin/teaching" replace />} />
        <Route path="/parent" element={<Navigate to="/portal/dashboard" replace />} />
        <Route path="/parent/pay" element={<Navigate to="/portal/pay" replace />} />
        <Route path="/student" element={<Navigate to="/portal/dashboard" replace />} />
        <Route path="/portal/student" element={<Navigate to="/portal/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
