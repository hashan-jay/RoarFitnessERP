import {
  BarChart3,
  CalendarDays,
  ClipboardCheck,
  Dumbbell,
  GraduationCap,
  LayoutDashboard,
  Mail,
  Package,
  ShoppingCart,
  Users,
  Warehouse,
  type LucideIcon,
} from 'lucide-react'

import { ROUTES } from '../../routes/paths'

export interface AdminNavItem {
  id: string
  label: string
  to: string
  icon: LucideIcon
}

const base = ROUTES.dashboardAdmin

export const ADMIN_NAV: AdminNavItem[] = [
  { id: 'dashboard', label: 'Dashboard', to: base, icon: LayoutDashboard },
  { id: 'members', label: 'Members', to: `${base}/members`, icon: Users },
  {
    id: 'instructors',
    label: 'Instructors',
    to: `${base}/instructors`,
    icon: GraduationCap,
  },
  { id: 'packages', label: 'Packages', to: `${base}/packages`, icon: Package },
  {
    id: 'general-classes',
    label: 'General Classes',
    to: `${base}/general-classes`,
    icon: Dumbbell,
  },
  {
    id: 'sessions',
    label: 'VIP Sessions',
    to: `${base}/sessions`,
    icon: CalendarDays,
  },
  { id: 'attendance', label: 'Attendance', to: `${base}/attendance`, icon: ClipboardCheck },
  { id: 'pos', label: 'POS', to: `${base}/pos`, icon: ShoppingCart },
  { id: 'inventory', label: 'Inventory', to: `${base}/inventory`, icon: Warehouse },
  { id: 'reports', label: 'Revenue Analytics', to: `${base}/reports`, icon: BarChart3 },
  {
    id: 'visitor-inquiries',
    label: 'Visitor Inquiries',
    to: `${base}/visitor-inquiries`,
    icon: Mail,
  },
]
