/**
 * Report response normalizers for admin dashboard API payloads.
 */
import type { ReportSummary, MonthlyReport, RecentTransaction } from '../types';

function pickNumber(raw: Record<string, unknown>, ...keys: string[]): number {
  for (const key of keys) {
    const value = raw[key];
    if (typeof value === 'number' && Number.isFinite(value)) return value;
    if (typeof value === 'string' && value.trim() !== '') {
      const parsed = Number(value);
      if (Number.isFinite(parsed)) return parsed;
    }
  }
  return 0;
}

function normalizeTransactions(raw: unknown): RecentTransaction[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((item, index) => {
    const tx = item as Record<string, unknown>;
    return {
      transactionId: pickNumber(tx, 'transactionId', 'TransactionId') || index + 1,
      reference: String(tx.reference ?? tx.Reference ?? tx.paymentReference ?? ''),
      category: String(tx.category ?? tx.Category ?? 'Transaction'),
      description: String(tx.description ?? tx.Description ?? ''),
      amountLKR: pickNumber(tx, 'amountLKR', 'AmountLKR'),
      transactionDate: String(tx.transactionDate ?? tx.TransactionDate ?? new Date().toISOString()),
      status: String(tx.status ?? tx.Status ?? 'Completed'),
    };
  });
}

export function normalizeReportSummary(raw: Record<string, unknown>): ReportSummary {
  const membershipInGym = pickNumber(
    raw,
    'totalMembershipInGymRevenue',
    'TotalMembershipInGymRevenue'
  );
  let membershipGateway = pickNumber(
    raw,
    'totalMembershipGatewayRevenue',
    'TotalMembershipGatewayRevenue'
  );
  const pos = pickNumber(raw, 'totalPosRevenue', 'TotalPosRevenue');
  const sessionGateway = pickNumber(
    raw,
    'totalSessionGatewayRevenue',
    'TotalSessionGatewayRevenue',
    'totalSessionRevenue',
    'TotalSessionRevenue'
  );

  const legacyMembership = pickNumber(raw, 'totalMembershipRevenue', 'TotalMembershipRevenue');
  if (membershipGateway === 0 && legacyMembership > 0) {
    membershipGateway = legacyMembership;
  }

  const computedTotal = membershipInGym + membershipGateway + pos + sessionGateway;
  const totalRevenue = pickNumber(raw, 'totalRevenue', 'TotalRevenue') || computedTotal;
  const thisMonthRevenue = pickNumber(raw, 'thisMonthRevenue', 'ThisMonthRevenue');

  return {
    totalMembershipInGymRevenue: membershipInGym,
    totalMembershipGatewayRevenue: membershipGateway,
    totalPosRevenue: pos,
    totalSessionGatewayRevenue: sessionGateway,
    totalRevenue,
    thisMonthRevenue,
    totalMembers: pickNumber(raw, 'totalMembers', 'TotalMembers'),
    activeMembers: pickNumber(raw, 'activeMembers', 'ActiveMembers', 'activeMemberships', 'ActiveMemberships'),
    lowStockItems: pickNumber(raw, 'lowStockItems', 'LowStockItems'),
    dailyRevenue: Array.isArray(raw.dailyRevenue ?? raw.DailyRevenue)
      ? ((raw.dailyRevenue ?? raw.DailyRevenue) as ReportSummary['dailyRevenue'])
      : [],
    recentTransactions: normalizeTransactions(raw.recentTransactions ?? raw.RecentTransactions ?? raw.recentOrders),
  };
}

function normalizeSoldItems(raw: unknown): MonthlyReport['soldItems'] {
  if (!Array.isArray(raw)) return [];
  return raw.map((item) => {
    const row = item as Record<string, unknown>;
    return {
      productName: String(row.productName ?? row.ProductName ?? ''),
      sku: String(row.sku ?? row.SKU ?? ''),
      quantitySold: pickNumber(row, 'quantitySold', 'QuantitySold'),
      revenueLKR: pickNumber(row, 'revenueLKR', 'RevenueLKR'),
      channel: String(row.channel ?? row.Channel ?? ''),
    };
  });
}

export function normalizeMonthlyReport(raw: Record<string, unknown>): MonthlyReport {
  const membershipInGym = pickNumber(raw, 'membershipInGymRevenue', 'MembershipInGymRevenue');
  let membershipGateway = pickNumber(raw, 'membershipGatewayRevenue', 'MembershipGatewayRevenue');
  const pos = pickNumber(raw, 'posRevenue', 'PosRevenue');
  const sessionGateway = pickNumber(
    raw,
    'sessionGatewayRevenue',
    'SessionGatewayRevenue',
    'sessionRevenue',
    'SessionRevenue'
  );

  const legacyMembership = pickNumber(raw, 'membershipRevenue', 'MembershipRevenue');
  if (membershipGateway === 0 && legacyMembership > 0) {
    membershipGateway = legacyMembership;
  }

  const computedTotal = membershipInGym + membershipGateway + pos + sessionGateway;

  return {
    year: pickNumber(raw, 'year', 'Year') || new Date().getFullYear(),
    month: pickNumber(raw, 'month', 'Month') || new Date().getMonth() + 1,
    monthLabel: String(raw.monthLabel ?? raw.MonthLabel ?? ''),
    membershipInGymRevenue: membershipInGym,
    membershipGatewayRevenue: membershipGateway,
    posRevenue: pos,
    sessionGatewayRevenue: sessionGateway,
    totalRevenue: pickNumber(raw, 'totalRevenue', 'TotalRevenue') || computedTotal,
    soldItems: normalizeSoldItems(raw.soldItems ?? raw.SoldItems),
    recentTransactions: normalizeTransactions(raw.recentTransactions ?? raw.RecentTransactions),
  };
}
