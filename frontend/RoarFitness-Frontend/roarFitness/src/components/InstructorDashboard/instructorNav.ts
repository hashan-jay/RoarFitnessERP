import {
  CalendarDays,
  ClipboardList,
  Dumbbell,
  FileText,
  LayoutDashboard,
  UserCheck,
  UserRound,
  type LucideIcon,
} from 'lucide-react'

import { ROUTES } from '../../routes/paths'

export interface InstructorNavItem {
  id: string
  label: string
  to: string
  icon: LucideIcon
}

const base = ROUTES.dashboardInstructor

export const INSTRUCTOR_NAV: InstructorNavItem[] = [
  { id: 'dashboard', label: 'Dashboard', to: base, icon: LayoutDashboard },
  {
    id: 'plans',
    label: 'Workout / Meal Plans',
    to: `${base}/plans`,
    icon: ClipboardList,
  },
  {
    id: 'sessions',
    label: 'My Sessions',
    to: `${base}/sessions`,
    icon: CalendarDays,
  },
  {
    id: 'general-classes',
    label: 'My General Classes',
    to: `${base}/general-classes`,
    icon: Dumbbell,
  },
  {
    id: 'attendance',
    label: 'Attendance',
    to: `${base}/attendance`,
    icon: UserCheck,
  },
  { id: 'profile', label: 'Profile', to: `${base}/profile`, icon: UserRound },
  { id: 'terms', label: 'Terms', to: `${base}/terms`, icon: FileText },
]
