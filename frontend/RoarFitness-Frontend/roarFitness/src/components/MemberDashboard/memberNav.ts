import {
  CalendarDays,
  ClipboardList,
  CreditCard,
  Dumbbell,
  FileText,
  LayoutDashboard,
  UserRound,
  type LucideIcon,
} from 'lucide-react'

import { ROUTES } from '../../routes/paths'

export interface MemberNavItem {
  id: string
  label: string
  to: string
  icon: LucideIcon
}

export const MEMBER_NAV: MemberNavItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    to: ROUTES.dashboard,
    icon: LayoutDashboard,
  },
  {
    id: 'plans',
    label: 'Workout / Meal Plans',
    to: `${ROUTES.dashboard}/plans`,
    icon: ClipboardList,
  },
  {
    id: 'general-classes',
    label: 'General Classes',
    to: `${ROUTES.dashboard}/general-classes`,
    icon: CalendarDays,
  },
  {
    id: 'sessions',
    label: 'VIP Sessions',
    to: `${ROUTES.dashboard}/sessions`,
    icon: Dumbbell,
  },
  {
    id: 'renew',
    label: 'Membership',
    to: `${ROUTES.dashboard}/renew`,
    icon: CreditCard,
  },
  {
    id: 'profile',
    label: 'Profile',
    to: `${ROUTES.dashboard}/profile`,
    icon: UserRound,
  },
  {
    id: 'terms',
    label: 'Terms',
    to: `${ROUTES.dashboard}/terms`,
    icon: FileText,
  },
]
