/**
 * Root application shell: routing for public site, auth, and role-gated portals.
 * Wraps the tree in AuthProvider and BrowserRouter with protected member/instructor/admin routes.
 */
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { PublicLayout } from './components/PublicLayout';
import { HomePage } from './pages/public/HomePage';
import { AboutPage } from './pages/public/AboutPage';
import { PackagesPage } from './pages/public/PackagesPage';
import { TrainersPage } from './pages/public/TrainersPage';
import { SessionsPage } from './pages/public/SessionsPage';
import { ContactPage } from './pages/public/ContactPage';
import { JoinUsPage } from './pages/public/JoinUsPage';
import { MockPaymentPage } from './pages/public/MockPaymentPage';
import { LoginPage } from './pages/auth/LoginPage';
import { MemberRoutes } from './pages/member/MemberRoutes';
import { InstructorRoutes } from './pages/instructor/InstructorRoutes';
import { AdminRoutes } from './pages/admin/AdminRoutes';

/** Application entry component with public and portal route definitions. */
export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<PublicLayout />}>
            <Route index element={<HomePage />} />
            <Route path="about" element={<AboutPage />} />
            <Route path="packages" element={<PackagesPage />} />
            <Route path="trainers" element={<TrainersPage />} />
            <Route path="sessions" element={<SessionsPage />} />
            <Route path="contact" element={<ContactPage />} />
            <Route path="join" element={<JoinUsPage />} />
          </Route>

          <Route path="login" element={<LoginPage />} />
          <Route path="payment/mock" element={<MockPaymentPage />} />

          <Route
            path="member/*"
            element={
              <ProtectedRoute allowedRoles={['Member']}>
                <MemberRoutes />
              </ProtectedRoute>
            }
          />

          <Route
            path="instructor/*"
            element={
              <ProtectedRoute allowedRoles={['Instructor']}>
                <InstructorRoutes />
              </ProtectedRoute>
            }
          />

          <Route
            path="admin/*"
            element={
              <ProtectedRoute allowedRoles={['Admin']}>
                <AdminRoutes />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
