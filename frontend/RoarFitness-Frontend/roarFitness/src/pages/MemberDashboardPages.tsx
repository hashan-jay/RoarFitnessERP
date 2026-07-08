import { useOutletContext } from 'react-router-dom'

import { MemberAttendanceCalendar } from '../components/MemberDashboard/MemberAttendanceCalendar'
import { MemberDashboardHome } from '../components/MemberDashboard/MemberDashboardHome'
import { MemberGeneralClassesPage } from '../components/MemberDashboard/MemberGeneralClassesPage'
import { MemberMembershipRenewPage } from '../components/MemberDashboard/MemberMembershipRenewPage'
import { MemberPlansRequests } from '../components/MemberDashboard/MemberPlansRequests'
import { MemberProfileSettings } from '../components/MemberDashboard/MemberProfileSettings'
import { MemberSpecialSessionsPage } from '../components/MemberDashboard/MemberSpecialSessionsPage'
import { MemberTermsContent } from '../components/MemberDashboard/MemberTermsPage'
import type { MemberDashboardData } from '../types/member'

export function MemberDashboardHomePage() {
  const data = useOutletContext<MemberDashboardData>()
  return <MemberDashboardHome data={data} />
}

export function MemberPlansPage() {
  const data = useOutletContext<MemberDashboardData>()
  return <MemberPlansRequests data={data} />
}

export function MemberGeneralClassesRoutePage() {
  return <MemberGeneralClassesPage />
}

export function MemberSessionsPage() {
  const data = useOutletContext<MemberDashboardData>()
  return <MemberSpecialSessionsPage data={data} />
}

export function MemberRenewPage() {
  const data = useOutletContext<MemberDashboardData>()
  return <MemberMembershipRenewPage data={data} />
}

export function MemberProfilePage() {
  const data = useOutletContext<MemberDashboardData>()
  return <MemberProfileSettings data={data} />
}

export function MemberAttendancePage() {
  return <MemberAttendanceCalendar />
}

export function MemberTermsPage() {
  return <MemberTermsContent />
}
