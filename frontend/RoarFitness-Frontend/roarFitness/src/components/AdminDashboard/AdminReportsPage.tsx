import { useEffect, useMemo, useState } from 'react'
import { motion, useReducedMotion } from 'motion/react'

import {
  monthlyReportToBreakdown,
  reportSummaryToBreakdown,
  REVENUE_CATEGORY_LABELS,
  type RevenueCategoryKey,
} from '../../lib/reportBreakdown'
import { formatAppDateTime, formatCurrency, getAppToday } from '../../lib/formatters'
import {
  createFadeUpReveal,
  createSectionDescriptionReveal,
  createSectionEyebrowReveal,
  createSectionHeadlineReveal,
  SECTION_VIEWPORT_TIGHT,
} from '../../motion/reveal'
import { ApiError, reportService } from '../../services'
import { usePortalToast } from '../PortalToast/PortalToast'
import type { MonthlyReport, ReportSummary } from '../../types/api'
import { ReportsAnalyticsCard } from './ReportsAnalyticsCard'
import { ReportsKpiStrip } from './ReportsKpiStrip'
import { ReportsRevenueCategoryChart } from './ReportsRevenueCategoryChart'
import { REVENUE_CATEGORY_STYLES, KPI_STRIP_STYLES } from './reportsAnalyticsStyles'
import { RevenueLineChart } from './RevenueLineChart'

type ReportTab = 'summary' | 'monthly'

const inputClass =
  'w-full rounded-lg border border-portal-line bg-portal-canvas px-3 py-2.5 text-sm text-portal-ink outline-none focus:border-portal-ink'

const primaryBtnClass =
  'rounded-lg bg-portal-ink px-4 py-2 text-sm font-medium text-white transition hover:bg-black disabled:opacity-60'

const CATEGORY_KEYS = Object.keys(REVENUE_CATEGORY_LABELS) as RevenueCategoryKey[]

export function AdminReportsPage() {
  const toast = usePortalToast()
  const reduceMotion = useReducedMotion()
  const today = getAppToday()
  const [tab, setTab] = useState<ReportTab>('summary')
  const [summary, setSummary] = useState<ReportSummary | null>(null)
  const [monthly, setMonthly] = useState<MonthlyReport | null>(null)
  const [loadingSummary, setLoadingSummary] = useState(true)
  const [loadingMonthly, setLoadingMonthly] = useState(false)
  const [year, setYear] = useState(today.year)
  const [month, setMonth] = useState(today.month)

  const loadSummary = async () => {
    setLoadingSummary(true)
    try {
      setSummary(await reportService.getSummary())
    } catch (err) {
      setSummary(null)
      toast.error(err instanceof ApiError ? err.message : 'Could not load report summary.')
    } finally {
      setLoadingSummary(false)
    }
  }

  const loadMonthly = async (selectedYear: number, selectedMonth: number) => {
    setLoadingMonthly(true)
    try {
      setMonthly(await reportService.getMonthly(selectedYear, selectedMonth))
    } catch (err) {
      setMonthly(null)
      toast.error(err instanceof ApiError ? err.message : 'Could not load monthly report.')
    } finally {
      setLoadingMonthly(false)
    }
  }

  useEffect(() => {
    void loadSummary()
  }, [])

  useEffect(() => {
    if (tab === 'monthly') {
      void loadMonthly(year, month)
    }
  }, [tab, year, month])

  const summaryBreakdown = useMemo(
    () => (summary ? reportSummaryToBreakdown(summary) : null),
    [summary],
  )

  const monthlyBreakdown = useMemo(
    () => (monthly ? monthlyReportToBreakdown(monthly) : null),
    [monthly],
  )

  const handlePrintMonthlyReport = () => {
    document.body.classList.add('printing-monthly-report')
    window.print()
    window.addEventListener(
      'afterprint',
      () => document.body.classList.remove('printing-monthly-report'),
      { once: true },
    )
  }

  const headerMotion = reduceMotion
    ? { initial: 'visible' as const, animate: 'visible' as const }
    : { initial: 'hidden' as const, animate: 'visible' as const }

  return (
    <div className="reports-page space-y-6">
      <header className="no-print border-b border-portal-line pb-6">
        <motion.p
          className="text-xs font-medium text-portal-muted"
          variants={createSectionEyebrowReveal(reduceMotion)}
          {...headerMotion}
        >
          Revenue Analytics
        </motion.p>
        <motion.h1
          className="mt-1 text-2xl font-semibold tracking-tight text-portal-ink sm:text-3xl"
          variants={createSectionHeadlineReveal(reduceMotion)}
          {...headerMotion}
        >
          Revenue Analytics
        </motion.h1>
        <motion.p
          className="mt-2 max-w-2xl text-sm text-portal-muted"
          variants={createSectionDescriptionReveal(reduceMotion)}
          {...headerMotion}
        >
          Track revenue by category, review transactions, and explore monthly trends with animated
          analytics cards and charts.
        </motion.p>
      </header>

      <div className="no-print flex flex-wrap items-center gap-2">
        {(['summary', 'monthly'] as const).map((tabId, index) => (
          <motion.button
            key={tabId}
            type="button"
            onClick={() => setTab(tabId)}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
              tab === tabId
                ? 'bg-portal-ink text-white shadow-sm'
                : 'border border-portal-line text-portal-ink hover:bg-portal-canvas'
            }`}
            variants={createFadeUpReveal(reduceMotion, index, { y: 12, step: 0.06 })}
            initial="hidden"
            animate="visible"
          >
            {tabId === 'summary' ? 'Summary' : 'Monthly'}
          </motion.button>
        ))}

        {tab === 'monthly' && monthly && monthlyBreakdown && (
          <motion.button
            type="button"
            onClick={handlePrintMonthlyReport}
            className={`${primaryBtnClass} ml-auto`}
            variants={createFadeUpReveal(reduceMotion, 2, { y: 12 })}
            initial="hidden"
            animate="visible"
          >
            Print Monthly Report
          </motion.button>
        )}
      </div>

      {tab === 'summary' && (
        <div className="space-y-6">
          {loadingSummary ? (
            <p className="text-sm text-portal-muted">Loading summary…</p>
          ) : summary && summaryBreakdown ? (
            <>
              <ReportsKpiStrip breakdown={summaryBreakdown} startIndex={0} />

              <ReportsRevenueCategoryChart
                breakdown={summaryBreakdown}
                title="All-time performance"
                subtitle="Comparative revenue by category"
                animationIndex={4}
              />

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {CATEGORY_KEYS.map((key, index) => {
                  const style = REVENUE_CATEGORY_STYLES[key]
                  return (
                    <ReportsAnalyticsCard
                      key={key}
                      label={REVENUE_CATEGORY_LABELS[key]}
                      value={formatCurrency(summaryBreakdown[key])}
                      gradient={style.gradient}
                      border={style.border}
                      icon={style.icon}
                      index={4 + index}
                    />
                  )
                })}
              </div>

              <ReportsAnalyticsCard
                label={KPI_STRIP_STYLES.thisMonth.label}
                value={formatCurrency(summary.thisMonthRevenue)}
                gradient={KPI_STRIP_STYLES.thisMonth.gradient}
                border={KPI_STRIP_STYLES.thisMonth.border}
                icon={KPI_STRIP_STYLES.thisMonth.icon}
                index={10}
                highlight
              />

              {summary.dailyRevenue.length > 0 && (
                <RevenueLineChart
                  days={summary.dailyRevenue}
                  title="This month — daily revenue trend"
                  animationIndex={11}
                />
              )}

              <motion.section
                className="portal-widget-3d rounded-xl border border-portal-line bg-portal-card p-5"
                variants={createFadeUpReveal(reduceMotion, 12, { y: 28 })}
                initial="hidden"
                whileInView="visible"
                viewport={SECTION_VIEWPORT_TIGHT}
              >
                <h2 className="text-sm font-semibold text-portal-ink">Recent transactions</h2>
                {summary.recentTransactions.length === 0 ? (
                  <p className="mt-4 text-sm text-portal-muted">No recent transactions.</p>
                ) : (
                  <ul className="mt-4 max-h-[28rem] space-y-2 overflow-y-auto">
                    {summary.recentTransactions.map((transaction, index) => (
                      <motion.li
                        key={transaction.transactionId}
                        className="flex items-start justify-between gap-3 rounded-lg border border-portal-line bg-portal-canvas px-3 py-2.5 transition hover:border-portal-ink/20 hover:bg-white"
                        variants={createFadeUpReveal(reduceMotion, index, {
                          y: 16,
                          step: 0.04,
                          start: 0.02,
                        })}
                        initial="hidden"
                        whileInView="visible"
                        viewport={SECTION_VIEWPORT_TIGHT}
                      >
                        <div>
                          <p className="text-sm font-medium text-portal-ink">
                            {transaction.description || transaction.reference}
                          </p>
                          <p className="text-xs text-portal-muted">
                            {transaction.category} ·{' '}
                            {formatAppDateTime(transaction.transactionDate)}
                          </p>
                        </div>
                        <p className="text-sm font-semibold text-portal-ink">
                          {formatCurrency(transaction.amountLKR)}
                        </p>
                      </motion.li>
                    ))}
                  </ul>
                )}
              </motion.section>
            </>
          ) : (
            <p className="text-sm text-portal-muted">Summary data is unavailable.</p>
          )}
        </div>
      )}

      {tab === 'monthly' && (
        <div className="space-y-6">
          <motion.section
            className="no-print portal-widget-3d rounded-xl border border-portal-line bg-portal-card p-5"
            variants={createFadeUpReveal(reduceMotion, 0, { y: 20 })}
            initial="hidden"
            whileInView="visible"
            viewport={SECTION_VIEWPORT_TIGHT}
          >
            <h2 className="text-sm font-semibold text-portal-ink">Report period</h2>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-medium text-portal-muted">Year</label>
                <input
                  type="number"
                  min={2020}
                  max={2100}
                  className={inputClass}
                  value={year}
                  onChange={(event) => setYear(Number(event.target.value))}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-portal-muted">Month</label>
                <select
                  className={inputClass}
                  value={month}
                  onChange={(event) => setMonth(Number(event.target.value))}
                >
                  {Array.from({ length: 12 }, (_, index) => {
                    const monthNumber = index + 1
                    return (
                      <option key={monthNumber} value={monthNumber}>
                        {new Date(2000, index, 1).toLocaleString('default', { month: 'long' })}
                      </option>
                    )
                  })}
                </select>
              </div>
            </div>
          </motion.section>

          {loadingMonthly ? (
            <p className="text-sm text-portal-muted">Loading monthly report…</p>
          ) : monthly && monthlyBreakdown ? (
            <>
              <ReportsKpiStrip breakdown={monthlyBreakdown} startIndex={1} />

              <ReportsRevenueCategoryChart
                breakdown={monthlyBreakdown}
                title="Monthly performance"
                subtitle={`Comparative revenue by category — ${monthly.monthLabel}`}
                animationIndex={5}
              />

              <div className="print-section grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {CATEGORY_KEYS.map((key, index) => {
                  const style = REVENUE_CATEGORY_STYLES[key]
                  return (
                    <ReportsAnalyticsCard
                      key={key}
                      label={REVENUE_CATEGORY_LABELS[key]}
                      value={formatCurrency(monthlyBreakdown[key])}
                      gradient={style.gradient}
                      border={style.border}
                      icon={style.icon}
                      index={5 + index}
                    />
                  )
                })}
              </div>

              <ReportsAnalyticsCard
                label={`Total — ${monthly.monthLabel}`}
                value={formatCurrency(monthlyBreakdown.total)}
                gradient={KPI_STRIP_STYLES.total.gradient}
                border={KPI_STRIP_STYLES.total.border}
                icon={KPI_STRIP_STYLES.total.icon}
                index={11}
                highlight
              />

              <RevenueLineChart
                days={monthly.dailyRevenue}
                title={`Daily revenue — ${monthly.monthLabel}`}
                animationIndex={12}
              />

              <motion.section
                className="print-section portal-widget-3d overflow-hidden rounded-xl border border-portal-line bg-portal-card"
                variants={createFadeUpReveal(reduceMotion, 13, { y: 28 })}
                initial="hidden"
                whileInView="visible"
                viewport={SECTION_VIEWPORT_TIGHT}
              >
                <div className="border-b border-portal-line px-5 py-4">
                  <h2 className="text-sm font-semibold text-portal-ink">
                    Sold items — {monthly.monthLabel}
                  </h2>
                </div>
                {monthly.soldItems.length === 0 ? (
                  <p className="p-5 text-sm text-portal-muted">
                    No sold items recorded for this month.
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-left text-sm">
                      <thead className="border-b border-portal-line bg-portal-canvas text-xs font-semibold uppercase tracking-wide text-portal-muted">
                        <tr>
                          <th className="px-4 py-3">Product</th>
                          <th className="px-4 py-3">SKU</th>
                          <th className="px-4 py-3">Qty sold</th>
                          <th className="px-4 py-3">Revenue</th>
                          <th className="px-4 py-3">Channel</th>
                        </tr>
                      </thead>
                      <tbody>
                        {monthly.soldItems.map((item) => (
                          <tr key={`${item.sku}-${item.channel}`} className="border-b border-portal-line">
                            <td className="px-4 py-3 text-portal-ink">{item.productName}</td>
                            <td className="px-4 py-3 font-medium text-portal-ink">{item.sku}</td>
                            <td className="px-4 py-3 text-portal-muted">{item.quantitySold}</td>
                            <td className="px-4 py-3 text-portal-ink">
                              {formatCurrency(item.revenueLKR)}
                            </td>
                            <td className="px-4 py-3 text-portal-muted">{item.channel}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </motion.section>

              {monthly.recentTransactions.length > 0 && (
                <motion.section
                  className="print-section portal-widget-3d rounded-xl border border-portal-line bg-portal-card p-5"
                  variants={createFadeUpReveal(reduceMotion, 14, { y: 28 })}
                  initial="hidden"
                  whileInView="visible"
                  viewport={SECTION_VIEWPORT_TIGHT}
                >
                  <h2 className="text-sm font-semibold text-portal-ink">
                    Transactions — {monthly.monthLabel}
                  </h2>
                  <ul className="mt-4 space-y-2">
                    {monthly.recentTransactions.map((transaction, index) => (
                      <motion.li
                        key={transaction.transactionId}
                        className="flex items-start justify-between gap-3 rounded-lg border border-portal-line bg-portal-canvas px-3 py-2.5 transition hover:border-portal-ink/20 hover:bg-white"
                        variants={createFadeUpReveal(reduceMotion, index, {
                          y: 14,
                          step: 0.03,
                          start: 0.02,
                        })}
                        initial="hidden"
                        whileInView="visible"
                        viewport={SECTION_VIEWPORT_TIGHT}
                      >
                        <div>
                          <p className="text-sm font-medium text-portal-ink">
                            {transaction.description || transaction.reference}
                          </p>
                          <p className="text-xs text-portal-muted">
                            {transaction.category} ·{' '}
                            {formatAppDateTime(transaction.transactionDate)}
                          </p>
                        </div>
                        <p className="text-sm font-semibold text-portal-ink">
                          {formatCurrency(transaction.amountLKR)}
                        </p>
                      </motion.li>
                    ))}
                  </ul>
                </motion.section>
              )}
            </>
          ) : (
            <p className="text-sm text-portal-muted">Monthly data is unavailable.</p>
          )}
        </div>
      )}

      {monthly && monthlyBreakdown && (
        <div className="monthly-report-print-source print-only" aria-hidden="true">
          <div className="print-header">
            <h1>Roar Fitness — Monthly Revenue Report</h1>
            <p>{monthly.monthLabel}</p>
            <p>Generated {formatAppDateTime(new Date().toISOString())}</p>
          </div>

          <div className="print-section">
            <h2>Revenue breakdown</h2>
            <ul className="print-breakdown-list">
              {CATEGORY_KEYS.map((key) => (
                <li key={key}>
                  <span>{REVENUE_CATEGORY_LABELS[key]}</span>
                  <strong>{formatCurrency(monthlyBreakdown[key])}</strong>
                </li>
              ))}
              <li className="print-breakdown-total">
                <span>Total</span>
                <strong>{formatCurrency(monthlyBreakdown.total)}</strong>
              </li>
            </ul>
          </div>

          {monthly.soldItems.length > 0 && (
            <div className="print-section">
              <h2>Sold items</h2>
              <table className="print-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>SKU</th>
                    <th>Qty</th>
                    <th>Revenue</th>
                    <th>Channel</th>
                  </tr>
                </thead>
                <tbody>
                  {monthly.soldItems.map((item) => (
                    <tr key={`print-${item.sku}-${item.channel}`}>
                      <td>{item.productName}</td>
                      <td>{item.sku}</td>
                      <td>{item.quantitySold}</td>
                      <td>{formatCurrency(item.revenueLKR)}</td>
                      <td>{item.channel}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
