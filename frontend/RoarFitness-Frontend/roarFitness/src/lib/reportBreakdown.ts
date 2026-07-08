import type { DailyRevenue, MonthlyReport, RecentTransaction, ReportSummary } from '../types/api'

export const REVENUE_CATEGORY_LABELS = {
  membershipInGymCash: 'Membership Fees at Gym (Cash)',
  membershipInGymCard: 'Membership Fees at Gym (Card)',
  membershipGateway: 'Membership (Payment Gateway)',
  posCash: 'In-Gym POS (Cash)',
  posCard: 'In-Gym POS (Card)',
  sessionGateway: 'Session Fees (Payment Gateway)',
} as const

export type RevenueCategoryKey = keyof typeof REVENUE_CATEGORY_LABELS

export function reportSummaryToBreakdown(reports: ReportSummary) {
  const membershipInGymCash = reports.totalMembershipInGymCashRevenue ?? 0
  const membershipInGymCard = reports.totalMembershipInGymCardRevenue ?? 0
  const membershipGateway = reports.totalMembershipGatewayRevenue ?? 0
  const posCash = reports.totalPosCashRevenue ?? 0
  const posCard = reports.totalPosCardRevenue ?? 0
  const sessionGateway = reports.totalSessionGatewayRevenue ?? 0
  const computedTotal =
    membershipInGymCash + membershipInGymCard + membershipGateway + posCash + posCard + sessionGateway

  return {
    membershipInGymCash,
    membershipInGymCard,
    membershipGateway,
    posCash,
    posCard,
    sessionGateway,
    total: reports.totalRevenue ?? computedTotal,
  }
}

export function monthlyReportToBreakdown(monthly: MonthlyReport) {
  const membershipInGymCash = monthly.membershipInGymCashRevenue ?? 0
  const membershipInGymCard = monthly.membershipInGymCardRevenue ?? 0
  const membershipGateway = monthly.membershipGatewayRevenue ?? 0
  const posCash = monthly.posCashRevenue ?? 0
  const posCard = monthly.posCardRevenue ?? 0
  const sessionGateway = monthly.sessionGatewayRevenue ?? 0
  const computedTotal =
    membershipInGymCash + membershipInGymCard + membershipGateway + posCash + posCard + sessionGateway

  return {
    membershipInGymCash,
    membershipInGymCard,
    membershipGateway,
    posCash,
    posCard,
    sessionGateway,
    total: monthly.totalRevenue ?? computedTotal,
  }
}

export function filterTransactionsByCategory(
  transactions: RecentTransaction[],
  category: string,
): RecentTransaction[] {
  return transactions.filter((tx) => tx.category === category)
}

function pickNumber(raw: Record<string, unknown>, ...keys: string[]): number {
  for (const key of keys) {
    const value = raw[key]
    if (typeof value === 'number' && Number.isFinite(value)) return value
    if (typeof value === 'string' && value.trim() !== '') {
      const parsed = Number(value)
      if (Number.isFinite(parsed)) return parsed
    }
  }
  return 0
}

export function normalizeDailyRevenue(raw: unknown): DailyRevenue[] {
  if (!Array.isArray(raw)) return []

  return raw.map((item) => {
    const row = item as Record<string, unknown>
    const membershipInGymCash = pickNumber(row, 'membershipInGymCash', 'MembershipInGymCash')
    const membershipInGymCard = pickNumber(row, 'membershipInGymCard', 'MembershipInGymCard')
    const legacyMembershipInGym = pickNumber(row, 'membershipInGym', 'MembershipInGym')
    const membershipGateway = pickNumber(row, 'membershipGateway', 'MembershipGateway')
    const posCash = pickNumber(row, 'posCash', 'PosCash')
    const posCard = pickNumber(row, 'posCard', 'PosCard')
    const legacyPos = pickNumber(row, 'pos', 'Pos')
    const sessionGateway = pickNumber(row, 'sessionGateway', 'SessionGateway', 'session', 'Session')

    const resolvedMembershipInGymCash =
      membershipInGymCash || (membershipInGymCard === 0 ? legacyMembershipInGym : membershipInGymCash)
    const resolvedPosCash = posCash || (posCard === 0 ? legacyPos : posCash)
    const total =
      pickNumber(row, 'total', 'Total') ||
      resolvedMembershipInGymCash +
        membershipInGymCard +
        membershipGateway +
        resolvedPosCash +
        posCard +
        sessionGateway

    return {
      date: String(row.date ?? row.Date ?? ''),
      total,
      membershipInGymCash: resolvedMembershipInGymCash,
      membershipInGymCard,
      membershipGateway,
      posCash: resolvedPosCash,
      posCard,
      sessionGateway,
    }
  })
}
