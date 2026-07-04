/**
 * Member portal route tree. Wraps member screens in the shared dashboard
 * layout with sidebar navigation. Role: Member.
 */
import { Routes, Route, Navigate } from 'react-router-dom';
import { DashboardLayout } from '../../components/DashboardLayout';
import { MemberDashboard } from './MemberDashboard';
import { MemberProfileSettings } from './MemberProfileSettings';
import { MemberTerms } from './MemberTerms';
import { MemberSpecialSessions } from './MemberSpecialSessions';
import { MemberMyPlans } from './MemberMyPlans';
import { HealthPage } from '../shared/HealthPage';

const memberNav = [
  { to: '/member', label: 'Dashboard', icon: '📊' },
  { to: '/member/plans', label: 'My Plans', icon: '📝' },
  { to: '/member/sessions', label: 'Special Sessions', icon: '📅' },
  { to: '/member/health', label: 'Health', icon: '❤️' },
  { to: '/member/profile', label: 'Profile', icon: '👤' },
  { to: '/member/terms', label: 'Terms', icon: '📄' },
];

export function MemberRoutes() {
  return (
    <DashboardLayout title="Member Portal" navItems={memberNav}>
      <Routes>
        <Route index element={<MemberDashboard />} />
        <Route path="plans" element={<MemberMyPlans />} />
        <Route path="sessions" element={<MemberSpecialSessions />} />
        <Route path="health" element={<HealthPage audience="member" />} />
        <Route path="profile" element={<MemberProfileSettings />} />
        <Route path="terms" element={<MemberTerms />} />
        <Route path="*" element={<Navigate to="/member" replace />} />
      </Routes>
    </DashboardLayout>
  );
}
