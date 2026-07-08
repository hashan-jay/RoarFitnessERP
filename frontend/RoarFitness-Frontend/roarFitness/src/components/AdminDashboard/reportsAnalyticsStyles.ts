import {
  Banknote,
  CreditCard,
  Dumbbell,
  ShoppingBag,
  Store,
  Wallet,
  type LucideIcon,
} from 'lucide-react'

import type { RevenueCategoryKey } from '../../lib/reportBreakdown'
import { REVENUE_CATEGORY_LABELS } from '../../lib/reportBreakdown'

export interface AnalyticsCardStyle {
  gradient: string
  border: string
  icon: LucideIcon
}

export const REVENUE_CATEGORY_STYLES: Record<RevenueCategoryKey, AnalyticsCardStyle> = {
  membershipInGymCash: {
    gradient: 'bg-gradient-to-br from-white via-violet-50/70 to-fuchsia-50/50',
    border: 'border-violet-100',
    icon: Banknote,
  },
  membershipInGymCard: {
    gradient: 'bg-gradient-to-br from-white via-purple-50/70 to-violet-50/50',
    border: 'border-purple-100',
    icon: CreditCard,
  },
  membershipGateway: {
    gradient: 'bg-gradient-to-br from-white via-fuchsia-50/70 to-pink-50/50',
    border: 'border-fuchsia-100',
    icon: Wallet,
  },
  posCash: {
    gradient: 'bg-gradient-to-br from-white via-sky-50/70 to-blue-50/50',
    border: 'border-sky-100',
    icon: Banknote,
  },
  posCard: {
    gradient: 'bg-gradient-to-br from-white via-cyan-50/70 to-sky-50/50',
    border: 'border-cyan-100',
    icon: CreditCard,
  },
  sessionGateway: {
    gradient: 'bg-gradient-to-br from-white via-emerald-50/70 to-teal-50/50',
    border: 'border-emerald-100',
    icon: Dumbbell,
  },
}

export const KPI_STRIP_STYLES = {
  total: {
    label: 'Total revenue',
    gradient: 'bg-gradient-to-br from-white via-slate-50 to-slate-100',
    border: 'border-portal-line',
    icon: Wallet,
  },
  membership: {
    label: 'Memberships',
    gradient: 'bg-gradient-to-br from-white via-violet-50/70 to-fuchsia-50/50',
    border: 'border-violet-100',
    icon: Wallet,
  },
  pos: {
    label: 'POS / Retail',
    gradient: 'bg-gradient-to-br from-white via-sky-50/70 to-blue-50/50',
    border: 'border-sky-100',
    icon: ShoppingBag,
  },
  session: {
    label: 'Sessions',
    gradient: 'bg-gradient-to-br from-white via-emerald-50/70 to-teal-50/50',
    border: 'border-emerald-100',
    icon: Store,
  },
  thisMonth: {
    label: 'This month',
    gradient: 'bg-gradient-to-br from-white via-amber-50/70 to-orange-50/50',
    border: 'border-amber-100',
    icon: Wallet,
  },
} as const

export type BreakdownTotals = {
  membershipInGymCash: number
  membershipInGymCard: number
  membershipGateway: number
  posCash: number
  posCard: number
  sessionGateway: number
  total: number
}

export function aggregateKpiValues(breakdown: BreakdownTotals) {
  return {
    total: breakdown.total,
    membership:
      breakdown.membershipInGymCash +
      breakdown.membershipInGymCard +
      breakdown.membershipGateway,
    pos: breakdown.posCash + breakdown.posCard,
    session: breakdown.sessionGateway,
  }
}

export interface RevenueCategorySlice {
  key: RevenueCategoryKey
  label: string
  amount: number
  color: string
}

export const REVENUE_CATEGORY_BAR_COLORS: Record<RevenueCategoryKey, string> = {
  membershipInGymCash: '#6366f1',
  membershipInGymCard: '#7c3aed',
  membershipGateway: '#8b5cf6',
  posCash: '#0ea5e9',
  posCard: '#06b6d4',
  sessionGateway: '#10b981',
}

export function buildRevenueCategorySlices(breakdown: BreakdownTotals): RevenueCategorySlice[] {
  const keys = Object.keys(REVENUE_CATEGORY_STYLES) as RevenueCategoryKey[]
  return keys.map((key) => ({
    key,
    label: REVENUE_CATEGORY_LABELS[key],
    amount: breakdown[key],
    color: REVENUE_CATEGORY_BAR_COLORS[key],
  }))
}
