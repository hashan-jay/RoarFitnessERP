import { InstructorAttendancePage } from '../components/InstructorDashboard/InstructorAttendancePage'
import { InstructorDashboardHome } from '../components/InstructorDashboard/InstructorDashboardHome'
import { InstructorMemberPlansPage } from '../components/InstructorDashboard/InstructorMemberPlansPage'
import { InstructorMyGeneralClassesPage } from '../components/InstructorDashboard/InstructorMyGeneralClassesPage'
import { InstructorProfilePage } from '../components/InstructorDashboard/InstructorProfilePage'
import { InstructorSessionsPage } from '../components/InstructorDashboard/InstructorSessionsPage'
import { InstructorTermsPage } from '../components/InstructorDashboard/InstructorTermsPage'

export function InstructorHomePage() {
  return <InstructorDashboardHome />
}

export function InstructorPlansPage() {
  return <InstructorMemberPlansPage />
}

export function InstructorSessionsRoutePage() {
  return <InstructorSessionsPage />
}

export function InstructorGeneralClassesRoutePage() {
  return <InstructorMyGeneralClassesPage />
}

export function InstructorAttendanceRoutePage() {
  return <InstructorAttendancePage />
}

export function InstructorProfileRoutePage() {
  return <InstructorProfilePage />
}

export function InstructorTermsRoutePage() {
  return <InstructorTermsPage />
}
