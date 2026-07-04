/**
 * Instructor portal route tree. Wraps instructor screens in the shared
 * dashboard layout with sidebar navigation. Role: Instructor.
 */
import { Routes, Route, Navigate } from 'react-router-dom';
import { DashboardLayout } from '../../components/DashboardLayout';
import { InstructorDashboard } from './InstructorDashboard';
import { InstructorAttendance } from './InstructorAttendance';
import { InstructorProfileSettings } from './InstructorProfileSettings';
import { InstructorTerms } from './InstructorTerms';
import { InstructorSessions } from './InstructorSessions';
import { InstructorMemberPlans } from './InstructorMemberPlans';
import { HealthPage } from '../shared/HealthPage';

const instructorNav = [
  { to: '/instructor', label: 'Dashboard', icon: '📊' },
  { to: '/instructor/plans', label: 'Member Plans', icon: '📝' },
  { to: '/instructor/sessions', label: 'My Sessions', icon: '📅' },
  { to: '/instructor/health', label: 'Health', icon: '❤️' },
  { to: '/instructor/attendance', label: 'Attendance', icon: '📋' },
  { to: '/instructor/profile', label: 'Profile', icon: '👤' },
  { to: '/instructor/terms', label: 'Terms', icon: '📄' },
];

export function InstructorRoutes() {
  return (
    <DashboardLayout title="Instructor Portal" navItems={instructorNav}>
      <Routes>
        <Route index element={<InstructorDashboard />} />
        <Route path="plans" element={<InstructorMemberPlans />} />
        <Route path="sessions" element={<InstructorSessions />} />
        <Route path="health" element={<HealthPage audience="instructor" />} />
        <Route path="attendance" element={<InstructorAttendance />} />
        <Route path="profile" element={<InstructorProfileSettings />} />
        <Route path="terms" element={<InstructorTerms />} />
        <Route path="*" element={<Navigate to="/instructor" replace />} />
      </Routes>
    </DashboardLayout>
  );
}
