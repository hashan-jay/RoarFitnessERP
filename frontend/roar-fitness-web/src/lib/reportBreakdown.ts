import type { MonthlyReport, ReportSummary } from '../types';

export function reportSummaryToBreakdown(reports: ReportSummary) {
  const membershipInGym = reports.totalMembershipInGymRevenue ?? 0;
  const membershipGateway = reports.totalMembershipGatewayRevenue ?? 0;
  const pos = reports.totalPosRevenue ?? 0;
  const sessionGateway = reports.totalSessionGatewayRevenue ?? 0;
  const computedTotal = membershipInGym + membershipGateway + pos + sessionGateway;

  return {
    membershipInGym,
    membershipGateway,
    pos,
    sessionGateway,
    total: reports.totalRevenue ?? computedTotal,
  };
}

export function monthlyReportToBreakdown(monthly: MonthlyReport) {
  const membershipInGym = monthly.membershipInGymRevenue ?? 0;
  const membershipGateway = monthly.membershipGatewayRevenue ?? 0;
  const pos = monthly.posRevenue ?? 0;
  const sessionGateway = monthly.sessionGatewayRevenue ?? 0;
  const computedTotal = membershipInGym + membershipGateway + pos + sessionGateway;

  return {
    membershipInGym,
    membershipGateway,
    pos,
    sessionGateway,
    total: monthly.totalRevenue ?? computedTotal,
  };
}
