/**
 * Reusable revenue breakdown cards, report normalizers, and transaction tables
 * for admin dashboard and reports pages. Role: Admin.
 */
import { formatCurrency, formatAppDateTime } from '../../lib/formatters';
import type { RecentTransaction } from '../../types';

const REVENUE_FORMULA =
  'Total Revenue = Membership (In-Gym) + Membership (Payment Gateway) + In-Gym POS + Session Fees (Payment Gateway)';

interface RevenueBreakdownCardsProps {
  title?: string;
  membershipInGym: number;
  membershipGateway: number;
  pos: number;
  sessionGateway: number;
  total: number;
  highlightTotal?: boolean;
  printSection?: boolean;
}

export function RevenueBreakdownCards({
  title,
  membershipInGym,
  membershipGateway,
  pos,
  sessionGateway,
  total,
  highlightTotal = false,
  printSection = false,
}: RevenueBreakdownCardsProps) {
  const sectionClass = printSection ? 'print-section' : '';

  return (
    <div className={sectionClass}>
      {title && <h3 style={{ marginBottom: 'var(--spacing-md)' }}>{title}</h3>}
      <p className="revenue-formula">{REVENUE_FORMULA}</p>
      <div className="stats-grid">
        <div className={`stat-card ${highlightTotal ? 'stat-card--highlight' : ''}`}>
          <div className="stat-card__label">Total Revenue</div>
          <div className="stat-card__value" style={{ fontSize: '1.25rem' }}>
            {formatCurrency(total)}
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-card__label">Membership (In-Gym)</div>
          <div className="stat-card__value" style={{ fontSize: '1.05rem' }}>
            {formatCurrency(membershipInGym)}
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-card__label">Membership (Payment Gateway)</div>
          <div className="stat-card__value" style={{ fontSize: '1.05rem' }}>
            {formatCurrency(membershipGateway)}
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-card__label">In-Gym POS</div>
          <div className="stat-card__value" style={{ fontSize: '1.05rem' }}>
            {formatCurrency(pos)}
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-card__label">Session Fees (Payment Gateway)</div>
          <div className="stat-card__value" style={{ fontSize: '1.05rem' }}>
            {formatCurrency(sessionGateway)}
          </div>
        </div>
      </div>
    </div>
  );
}

interface RecentTransactionsTableProps {
  transactions: RecentTransaction[];
  title?: string;
  emptyMessage?: string;
  printSection?: boolean;
  screenOnly?: boolean;
}

export function RecentTransactionsTable({
  transactions,
  title = 'Recent Transactions',
  emptyMessage = 'No transactions recorded yet.',
  printSection = false,
  screenOnly = false,
}: RecentTransactionsTableProps) {
  return (
    <div className={`card ${printSection ? 'print-section' : ''} ${screenOnly ? 'no-print' : ''}`}>
      <h3 style={{ marginBottom: 'var(--spacing-lg)' }}>{title}</h3>
      {transactions.length === 0 ? (
        <p className="empty-state">{emptyMessage}</p>
      ) : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Reference</th>
                <th>Date</th>
                <th>Category</th>
                <th>Description</th>
                <th>Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx) => (
                <tr key={tx.transactionId}>
                  <td><strong>{tx.reference}</strong></td>
                  <td>{formatAppDateTime(tx.transactionDate)}</td>
                  <td>{tx.category}</td>
                  <td>{tx.description}</td>
                  <td>{formatCurrency(tx.amountLKR)}</td>
                  <td><span className="badge badge--success">{tx.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
