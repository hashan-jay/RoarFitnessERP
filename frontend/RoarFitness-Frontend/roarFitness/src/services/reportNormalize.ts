import { normalizeDailyRevenue } from '../lib/reportBreakdown'
import type { MonthlyReport, RecentTransaction, ReportSummary } from '../types/api'

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

function normalizeTransactions(raw: unknown): RecentTransaction[] {
  if (!Array.isArray(raw)) return []
  return raw.map((item, index) => {
    const tx = item as Record<string, unknown>
    return {
      transactionId: pickNumber(tx, 'transactionId', 'TransactionId') || index + 1,
      reference: String(tx.reference ?? tx.Reference ?? tx.paymentReference ?? ''),
      category: String(tx.category ?? tx.Category ?? 'Transaction'),
      description: String(tx.description ?? tx.Description ?? ''),
      amountLKR: pickNumber(tx, 'amountLKR', 'AmountLKR'),
      transactionDate: String(tx.transactionDate ?? tx.TransactionDate ?? new Date().toISOString()),
      status: String(tx.status ?? tx.Status ?? 'Completed'),
    }
  })
}

export function normalizeReportSummary(raw: Record<string, unknown>): ReportSummary {
  let membershipInGymCash = pickNumber(
    raw,
    'totalMembershipInGymCashRevenue',
    'TotalMembershipInGymCashRevenue',
  )
  let membershipInGymCard = pickNumber(
    raw,
    'totalMembershipInGymCardRevenue',
    'TotalMembershipInGymCardRevenue',
  )
  const legacyInGym = pickNumber(raw, 'totalMembershipInGymRevenue', 'TotalMembershipInGymRevenue')
  if (membershipInGymCash === 0 && membershipInGymCard === 0 && legacyInGym > 0) {
    membershipInGymCash = legacyInGym
  }

  let membershipGateway = pickNumber(
    raw,
    'totalMembershipGatewayRevenue',
    'TotalMembershipGatewayRevenue',
  )
  let posCash = pickNumber(raw, 'totalPosCashRevenue', 'TotalPosCashRevenue')
  let posCard = pickNumber(raw, 'totalPosCardRevenue', 'TotalPosCardRevenue')
  const legacyPos = pickNumber(raw, 'totalPosRevenue', 'TotalPosRevenue')
  if (posCash === 0 && posCard === 0 && legacyPos > 0) {
    posCash = legacyPos
  }

  const sessionGateway = pickNumber(
    raw,
    'totalSessionGatewayRevenue',
    'TotalSessionGatewayRevenue',
    'totalSessionRevenue',
    'TotalSessionRevenue',
  )

  const legacyMembership = pickNumber(raw, 'totalMembershipRevenue', 'TotalMembershipRevenue')
  if (membershipGateway === 0 && legacyMembership > 0) {
    membershipGateway = legacyMembership
  }

  const computedTotal =
    membershipInGymCash + membershipInGymCard + membershipGateway + posCash + posCard + sessionGateway
  const totalRevenue = pickNumber(raw, 'totalRevenue', 'TotalRevenue') || computedTotal
  const thisMonthRevenue = pickNumber(raw, 'thisMonthRevenue', 'ThisMonthRevenue')

  return {
    totalMembershipInGymCashRevenue: membershipInGymCash,
    totalMembershipInGymCardRevenue: membershipInGymCard,
    totalMembershipGatewayRevenue: membershipGateway,
    totalPosCashRevenue: posCash,
    totalPosCardRevenue: posCard,
    totalSessionGatewayRevenue: sessionGateway,
    totalRevenue,
    thisMonthRevenue,
    totalMembers: pickNumber(raw, 'totalMembers', 'TotalMembers'),
    activeMembers: pickNumber(raw, 'activeMembers', 'ActiveMembers', 'activeMemberships', 'ActiveMemberships'),
    lowStockItems: pickNumber(raw, 'lowStockItems', 'LowStockItems'),
    dailyRevenue: normalizeDailyRevenue(raw.dailyRevenue ?? raw.DailyRevenue),
    recentTransactions: normalizeTransactions(
      raw.recentTransactions ?? raw.RecentTransactions ?? raw.recentOrders,
    ),
  }
}

function normalizeSoldItems(raw: unknown): MonthlyReport['soldItems'] {
  if (!Array.isArray(raw)) return []
  return raw.map((item) => {
    const row = item as Record<string, unknown>
    return {
      productName: String(row.productName ?? row.ProductName ?? ''),
      sku: String(row.sku ?? row.SKU ?? ''),
      quantitySold: pickNumber(row, 'quantitySold', 'QuantitySold'),
      revenueLKR: pickNumber(row, 'revenueLKR', 'RevenueLKR'),
      channel: String(row.channel ?? row.Channel ?? ''),
    }
  })
}

export function normalizeMonthlyReport(raw: Record<string, unknown>): MonthlyReport {
  let membershipInGymCash = pickNumber(raw, 'membershipInGymCashRevenue', 'MembershipInGymCashRevenue')
  let membershipInGymCard = pickNumber(raw, 'membershipInGymCardRevenue', 'MembershipInGymCardRevenue')
  const legacyInGym = pickNumber(raw, 'membershipInGymRevenue', 'MembershipInGymRevenue')
  if (membershipInGymCash === 0 && membershipInGymCard === 0 && legacyInGym > 0) {
    membershipInGymCash = legacyInGym
  }

  let membershipGateway = pickNumber(raw, 'membershipGatewayRevenue', 'MembershipGatewayRevenue')
  let posCash = pickNumber(raw, 'posCashRevenue', 'PosCashRevenue')
  let posCard = pickNumber(raw, 'posCardRevenue', 'PosCardRevenue')
  const legacyPos = pickNumber(raw, 'posRevenue', 'PosRevenue')
  if (posCash === 0 && posCard === 0 && legacyPos > 0) {
    posCash = legacyPos
  }

  const sessionGateway = pickNumber(
    raw,
    'sessionGatewayRevenue',
    'SessionGatewayRevenue',
    'sessionRevenue',
    'SessionRevenue',
  )

  const legacyMembership = pickNumber(raw, 'membershipRevenue', 'MembershipRevenue')
  if (membershipGateway === 0 && legacyMembership > 0) {
    membershipGateway = legacyMembership
  }

  const computedTotal =
    membershipInGymCash + membershipInGymCard + membershipGateway + posCash + posCard + sessionGateway

  return {
    year: pickNumber(raw, 'year', 'Year') || new Date().getFullYear(),
    month: pickNumber(raw, 'month', 'Month') || new Date().getMonth() + 1,
    monthLabel: String(raw.monthLabel ?? raw.MonthLabel ?? ''),
    membershipInGymCashRevenue: membershipInGymCash,
    membershipInGymCardRevenue: membershipInGymCard,
    membershipGatewayRevenue: membershipGateway,
    posCashRevenue: posCash,
    posCardRevenue: posCard,
    sessionGatewayRevenue: sessionGateway,
    totalRevenue: pickNumber(raw, 'totalRevenue', 'TotalRevenue') || computedTotal,
    dailyRevenue: normalizeDailyRevenue(raw.dailyRevenue ?? raw.DailyRevenue),
    soldItems: normalizeSoldItems(raw.soldItems ?? raw.SoldItems),
    recentTransactions: normalizeTransactions(raw.recentTransactions ?? raw.RecentTransactions),
  }
}
