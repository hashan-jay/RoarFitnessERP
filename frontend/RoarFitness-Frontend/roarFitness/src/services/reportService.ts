import { api } from './apiClient'
import type { MonthlyReport, ReportSummary } from '../types/api'
import { normalizeMonthlyReport, normalizeReportSummary } from './reportNormalize'

export const reportService = {
  getSummary: async (): Promise<ReportSummary> => {
    const raw = await api.get<Record<string, unknown>>('/reports/summary', true)
    return normalizeReportSummary(raw)
  },

  getMonthly: async (year: number, month: number): Promise<MonthlyReport> => {
    const raw = await api.get<Record<string, unknown>>(
      `/reports/monthly?year=${year}&month=${month}`,
      true,
    )
    return normalizeMonthlyReport(raw)
  },
}
