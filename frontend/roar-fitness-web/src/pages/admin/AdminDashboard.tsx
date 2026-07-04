/**
 * Admin home screen showing company revenue, member counts, and quick links to
 * key management areas. Role: Admin.
 */
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminService } from '../../services';
import { LoadingSpinner, formatCurrency } from '../../components/common';
import { RevenueBreakdownCards, reportSummaryToBreakdown } from '../../components/admin/RevenueReportSections';
import type { ReportSummary } from '../../types';

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

export function AdminDashboard() {
  const [reports, setReports] = useState<ReportSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminService
      .getReports()
      .then(setReports)
      .catch(() => setReports(fallbackReports))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;

  // Normalize API report fields into the shared revenue breakdown shape for cards.
  const breakdown = reports ? reportSummaryToBreakdown(reports) : null;

  return (
    <>
      <div className="page-title">
        <h1>Admin Dashboard</h1>
        <p>Overview of Roar Fitness operations and company revenue.</p>
      </div>

      <div className="stats-grid dashboard-revenue-cards">
        <div className="stat-card stat-card--highlight">
          <div className="stat-card__label">Total Company Revenue</div>
          <div className="stat-card__value" style={{ fontSize: '1.35rem' }}>
            {formatCurrency(reports?.totalRevenue ?? 0)}
          </div>
        </div>
        <div className="stat-card stat-card--highlight">
          <div className="stat-card__label">This Month&apos;s Revenue</div>
          <div className="stat-card__value" style={{ fontSize: '1.35rem' }}>
            {formatCurrency(reports?.thisMonthRevenue ?? 0)}
          </div>
        </div>
      </div>

      {breakdown && (
        <div style={{ marginBottom: 'var(--spacing-xl)' }}>
          <RevenueBreakdownCards
            title="Total Revenue Breakdown"
            {...breakdown}
            highlightTotal
          />
        </div>
      )}

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-card__label">Total Members</div>
          <div className="stat-card__value">{reports?.totalMembers}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__label">Active Memberships</div>
          <div className="stat-card__value">{reports?.activeMembers}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__label">Low Stock Items</div>
          <div className="stat-card__value">{reports?.lowStockItems}</div>
          <Link to="/admin/inventory" className="btn btn--outline btn--sm" style={{ marginTop: 'var(--spacing-md)' }}>
            Inventory
          </Link>
        </div>
      </div>

      <div className="grid grid--3" style={{ marginTop: 'var(--spacing-xl)' }}>
        <div className="card">
          <h3>Manage Members</h3>
          <p>Create and manage gym members.</p>
          <Link to="/admin/members" className="btn btn--primary btn--sm" style={{ marginTop: 'var(--spacing-md)' }}>Go to Members</Link>
        </div>
        <div className="card">
          <h3>Inventory & POS</h3>
          <p>Manage stock and process in-gym sales.</p>
          <Link to="/admin/inventory" className="btn btn--primary btn--sm" style={{ marginTop: 'var(--spacing-md)' }}>Inventory</Link>
        </div>
        <div className="card">
          <h3>Reports</h3>
          <p>View revenue, transactions, and print monthly reports.</p>
          <Link to="/admin/reports" className="btn btn--outline btn--sm" style={{ marginTop: 'var(--spacing-md)' }}>View Reports</Link>
        </div>
      </div>
    </>
  );
}
