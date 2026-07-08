import { AdminDashboardHome } from '../components/AdminDashboard/AdminDashboardHome'
import { AdminInstructorsPage } from '../components/AdminDashboard/AdminInstructorsPage'
import { AdminInventoryPage } from '../components/AdminDashboard/AdminInventoryPage'
import { AdminMemberAttendancePage } from '../components/AdminDashboard/AdminMemberAttendancePage'
import { AdminMembersPage } from '../components/AdminDashboard/AdminMembersPage'
import { AdminMembershipRenewalsPage } from '../components/AdminDashboard/AdminMembershipRenewalsPage'
import { AdminPackagesPage } from '../components/AdminDashboard/AdminPackagesPage'
import { AdminPOSPage } from '../components/AdminDashboard/AdminPOSPage'
import { AdminReportsPage } from '../components/AdminDashboard/AdminReportsPage'
import { AdminSessionManagementPage } from '../components/AdminDashboard/AdminSessionManagementPage'
import { AdminGeneralClassesPage } from '../components/AdminDashboard/AdminGeneralClassesPage'
import { AdminVisitorInquiriesPage } from '../components/AdminDashboard/AdminVisitorInquiriesPage'

export function AdminHomePage() {
  return <AdminDashboardHome />
}

export function AdminSessionsPage() {
  return <AdminSessionManagementPage />
}

export function AdminGeneralClassesRoutePage() {
  return <AdminGeneralClassesPage />
}

export function AdminMembersRoutePage() {
  return <AdminMembersPage />
}

export function AdminMembershipRenewalsRoutePage() {
  return <AdminMembershipRenewalsPage />
}

export function AdminInstructorsRoutePage() {
  return <AdminInstructorsPage />
}

export function AdminPackagesRoutePage() {
  return <AdminPackagesPage />
}

export function AdminAttendanceRoutePage() {
  return <AdminMemberAttendancePage />
}

export function AdminInventoryRoutePage() {
  return <AdminInventoryPage />
}

export function AdminPOSRoutePage() {
  return <AdminPOSPage />
}

export function AdminReportsRoutePage() {
  return <AdminReportsPage />
}

export function AdminVisitorInquiriesRoutePage() {
  return <AdminVisitorInquiriesPage />
}
