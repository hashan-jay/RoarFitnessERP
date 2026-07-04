/**
 * Admin portal route tree. Wraps all admin screens in the shared dashboard layout
 * with sidebar navigation. Role: Admin.
 */
import { Routes, Route, Navigate } from 'react-router-dom';
import { DashboardLayout } from '../../components/DashboardLayout';
import { AdminDashboard } from './AdminDashboard';
import { AdminMembers } from './AdminMembers';
import { AdminInstructors } from './AdminInstructors';
import { AdminInventory } from './AdminInventory';
import { AdminPOS } from './AdminPOS';
import { AdminReports } from './AdminReports';
import { AdminSessionManagement } from './AdminSessionManagement';
import { AdminPackages } from './AdminPackages';

const adminNav = [
  { to: '/admin', label: 'Dashboard', icon: '📊' },
  { to: '/admin/members', label: 'Members', icon: '👥' },
  { to: '/admin/packages', label: 'Packages', icon: '🎫' },
  { to: '/admin/instructors', label: 'Instructors', icon: '🏋️' },
  { to: '/admin/sessions', label: 'Session Management', icon: '📅' },
  { to: '/admin/inventory', label: 'Inventory', icon: '📦' },
  { to: '/admin/pos', label: 'POS', icon: '💳' },
  { to: '/admin/reports', label: 'Reports', icon: '📈' },
];

export function AdminRoutes() {
  return (
    <DashboardLayout title="Admin Portal" navItems={adminNav}>
      <Routes>
        <Route index element={<AdminDashboard />} />
        <Route path="members" element={<AdminMembers />} />
        <Route path="packages" element={<AdminPackages />} />
        <Route path="instructors" element={<AdminInstructors />} />
        <Route path="inventory" element={<AdminInventory />} />
        <Route path="pos" element={<AdminPOS />} />
        <Route path="sessions" element={<AdminSessionManagement />} />
        <Route path="reports" element={<AdminReports />} />
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Routes>
    </DashboardLayout>
  );
}
