/**
 * Admin dashboard and monthly revenue reports.
 * API: /reports (authenticated).
 */
import { api } from './apiClient';
import type { ReportSummary, MonthlyReport } from '../types';
import { normalizeMonthlyReport, normalizeReportSummary } from './reportNormalize';

/** Fetches and normalizes admin report summaries and monthly breakdowns. */
export const reportService = {
  getSummary: async (): Promise<ReportSummary> => {
    const raw = await api.get<Record<string, unknown>>('/reports/summary', true);
    return normalizeReportSummary(raw);
  },

  getMonthly: async (year: number, month: number): Promise<MonthlyReport> => {
    const raw = await api.get<Record<string, unknown>>(
      `/reports/monthly?year=${year}&month=${month}`,
      true
    );
    return normalizeMonthlyReport(raw);
  },
};
