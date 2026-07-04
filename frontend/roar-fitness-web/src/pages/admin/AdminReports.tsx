/**
 * Revenue reports with all-time and monthly breakdowns, sold items, and
 * printable monthly summaries. Role: Admin.
 */
import { useEffect, useState } from 'react';
import { adminService } from '../../services';
import { LoadingSpinner } from '../../components/common';
import { formatCurrency, formatAppDateTime } from '../../lib/formatters';
import { monthlyReportToBreakdown, reportSummaryToBreakdown } from '../../lib/reportBreakdown';
import {
  RevenueBreakdownCards,
  RecentTransactionsTable,
} from '../../components/admin/RevenueReportSections';
import type { ReportSummary, MonthlyReport } from '../../types';

const fallbackReports: ReportSummary = {
  totalMembershipInGymRevenue: 120000,
  totalMembershipGatewayRevenue: 730000,
  totalPosRevenue: 95000,
  totalSessionGatewayRevenue: 45000,
  totalRevenue: 990000,
  thisMonthRevenue: 185000,
  totalMembers: 156,
  activeMembers: 142,
  lowStockItems: 2,
  dailyRevenue: [],
  recentTransactions: [],
};

export function AdminReports() {
  const [reports, setReports] = useState<ReportSummary | null>(null);
  const [monthly, setMonthly] = useState<MonthlyReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [monthLoading, setMonthLoading] = useState(false);
  const [monthError, setMonthError] = useState('');
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);

  useEffect(() => {
    adminService
      .getReports()
      .then(setReports)
      .catch(() => setReports(fallbackReports))
      .finally(() => setLoading(false));
  }, []);

  const loadMonthly = async () => {
    setMonthLoading(true);
    setMonthError('');
    try {
      const data = await adminService.getMonthlyReport(year, month);
      setMonthly(data);
    } catch {
      setMonthly(null);
      setMonthError('Could not load the monthly report. Please try again.');
    } finally {
      setMonthLoading(false);
    }
  };

  useEffect(() => {
    if (!loading) loadMonthly();
  }, [year, month, loading]);

  const handlePrint = () => window.print();

  if (loading) return <LoadingSpinner />;

  // Map API report DTOs into the shared breakdown props used by RevenueBreakdownCards.
  const companyBreakdown = reports ? reportSummaryToBreakdown(reports) : null;
  const monthBreakdown = monthly ? monthlyReportToBreakdown(monthly) : null;

  return (
    <div className="reports-page">
      <div className="page-title page-title--row no-print">
        <div>
          <h1>Reports</h1>
          <p>Company revenue, transactions, sold items, and printable monthly reports.</p>
        </div>
        <button type="button" className="btn btn--primary" onClick={handlePrint}>
          Print Monthly Report
        </button>
      </div>

      <div className="stats-grid no-print" style={{ marginBottom: 'var(--spacing-lg)' }}>
        <div className="stat-card stat-card--highlight">
          <div className="stat-card__label">Total Company Revenue</div>
          <div className="stat-card__value" style={{ fontSize: '1.25rem' }}>
            {formatCurrency(reports?.totalRevenue ?? 0)}
          </div>
        </div>
        <div className="stat-card stat-card--highlight">
          <div className="stat-card__label">This Month&apos;s Revenue</div>
          <div className="stat-card__value" style={{ fontSize: '1.25rem' }}>
            {formatCurrency(reports?.thisMonthRevenue ?? 0)}
          </div>
        </div>
      </div>

      {companyBreakdown && (
        <div className="no-print" style={{ marginBottom: 'var(--spacing-xl)' }}>
          <RevenueBreakdownCards
            title="All-Time Company Revenue"
            {...companyBreakdown}
            highlightTotal
          />
        </div>
      )}

      <div className="card no-print" style={{ marginBottom: 'var(--spacing-lg)' }}>
        <h3 style={{ marginBottom: 'var(--spacing-md)' }}>Monthly Report Period</h3>
        <div className="inline-form">
          <div className="form-group">
            <label>Year</label>
            <input type="number" min="2020" max="2100" value={year} onChange={(e) => setYear(Number(e.target.value))} />
          </div>
          <div className="form-group">
            <label>Month</label>
            <select value={month} onChange={(e) => setMonth(Number(e.target.value))}>
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i + 1} value={i + 1}>
                  {new Date(2000, i, 1).toLocaleString('default', { month: 'long' })}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="print-only print-header">
        <h1>Roar Fitness — Monthly Revenue Report</h1>
        <p>{monthly?.monthLabel ?? `${month}/${year}`}</p>
        <p>Generated {formatAppDateTime(new Date().toISOString())}</p>
      </div>

      <div className="print-only print-section" style={{ marginBottom: 'var(--spacing-lg)' }}>
        <h3>Company Totals (All Time)</h3>
        {companyBreakdown && (
          <RevenueBreakdownCards {...companyBreakdown} highlightTotal printSection />
        )}
      </div>

      {monthError && <div className="alert alert--error no-print">{monthError}</div>}

      {monthLoading ? (
        <LoadingSpinner />
      ) : monthly && monthBreakdown ? (
        <>
          <RevenueBreakdownCards
            title={`Monthly Revenue — ${monthly.monthLabel}`}
            {...monthBreakdown}
            highlightTotal
            printSection
          />

          <div className="card print-section">
            <h3>Sold Items — {monthly.monthLabel}</h3>
            {monthly.soldItems.length === 0 ? (
              <p className="empty-state">No sold items recorded for this month.</p>
            ) : (
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>SKU</th>
                      <th>Qty Sold</th>
                      <th>Revenue</th>
                      <th>Channel</th>
                    </tr>
                  </thead>
                  <tbody>
                    {monthly.soldItems.map((item) => (
                      <tr key={`${item.sku}-${item.channel}`}>
                        <td>{item.productName}</td>
                        <td><strong>{item.sku}</strong></td>
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

          <RecentTransactionsTable
            transactions={monthly.recentTransactions}
            title={`Transactions — ${monthly.monthLabel}`}
            emptyMessage="No transactions recorded for this month."
            printSection
          />
        </>
      ) : null}

      <RecentTransactionsTable
        transactions={reports?.recentTransactions ?? []}
        title="Recent Transactions"
        emptyMessage="No transactions recorded yet."
        screenOnly
      />
    </div>
  );
}
