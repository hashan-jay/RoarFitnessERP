import { type FormEvent, useEffect, useMemo, useState } from 'react'

import { formatCurrency, formatAppDateTime } from '../../lib/formatters'
import { reportSummaryToBreakdown } from '../../lib/reportBreakdown'
import { reportService } from '../../services'
import { usePortalToast } from '../PortalToast/PortalToast'

const SOURCE_LABELS: Record<string, string> = {
  membership: 'Membership',
  pos: 'POS / Retail',
  session: 'Sessions',
}

interface FinanceTransaction {
  id: string
  source: string
  amount: number
  label: string
  createdAt: string
  readOnly: boolean
}

function mapCategoryToSource(category: string): string {
  const lower = category.toLowerCase()
  if (lower.includes('membership')) return 'membership'
  if (lower.includes('session')) return 'session'
  return 'pos'
}

export function AdminFinancePage() {
  const toast = usePortalToast()
  const [transactions, setTransactions] = useState<FinanceTransaction[]>([])
  const [summary, setSummary] = useState({
    total: 0,
    membership: 0,
    pos: 0,
    session: 0,
    count: 0,
  })
  const [label, setLabel] = useState('')
  const [amount, setAmount] = useState('')
  const [source, setSource] = useState('pos')
  const [loading, setLoading] = useState(true)

  const refresh = async () => {
    setLoading(true)
    try {
      const data = await reportService.getSummary()
      const breakdown = reportSummaryToBreakdown(data)

      setSummary({
        total: breakdown.total,
        membership: breakdown.membershipInGymCash + breakdown.membershipInGymCard + breakdown.membershipGateway,
        pos: breakdown.posCash + breakdown.posCard,
        session: breakdown.sessionGateway,
        count: data.recentTransactions.length,
      })
      setTransactions(
        data.recentTransactions.map((transaction) => ({
          id: String(transaction.transactionId),
          source: mapCategoryToSource(transaction.category),
          amount: transaction.amountLKR,
          label: transaction.description || transaction.reference,
          createdAt: transaction.transactionDate,
          readOnly: true,
        })),
      )
    } catch {
      toast.error('Could not load financial reports.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void refresh()
  }, [])

  const handleAddPos = (event: FormEvent) => {
    event.preventDefault()
    toast.error('Manual POS entries are recorded through sales in the admin portal.')
  }

  const visibleTransactions = useMemo(() => transactions, [transactions])

  return (
    <div className="space-y-6">
      <header className="border-b border-portal-line pb-6">
        <p className="text-xs font-medium text-portal-muted">Finance</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-portal-ink sm:text-3xl">
          Financial analytics
        </h1>
        <p className="mt-2 text-sm text-portal-muted">
          Track gym membership revenue, session fees, and POS retail sales in one
          place — ready for POS integration.
        </p>
      </header>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryCard
          label="Total revenue"
          value={loading ? '…' : formatCurrency(summary.total)}
          gradient="bg-gradient-to-br from-white via-slate-50 to-slate-100"
          border="border-portal-line"
        />
        <SummaryCard
          label="Memberships"
          value={loading ? '…' : formatCurrency(summary.membership)}
          gradient="bg-gradient-to-br from-white via-violet-50/70 to-fuchsia-50/50"
          border="border-violet-100"
        />
        <SummaryCard
          label="POS / Retail"
          value={loading ? '…' : formatCurrency(summary.pos)}
          gradient="bg-gradient-to-br from-white via-sky-50/70 to-blue-50/50"
          border="border-sky-100"
        />
        <SummaryCard
          label="Sessions"
          value={loading ? '…' : formatCurrency(summary.session)}
          gradient="bg-gradient-to-br from-white via-emerald-50/70 to-teal-50/50"
          border="border-emerald-100"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
        <form
          onSubmit={handleAddPos}
          className="portal-widget-3d space-y-3 rounded-xl border border-portal-line bg-portal-card p-5"
        >
          <h2 className="text-sm font-semibold text-portal-ink">
            Record sale / POS entry
          </h2>
          <p className="text-xs text-portal-muted">
            Use this for gym counter or POS sales until live POS sync is connected.
          </p>
          <select
            className={inputClass}
            value={source}
            onChange={(event) => setSource(event.target.value)}
          >
            <option value="pos">POS / Retail</option>
            <option value="membership">Membership</option>
            <option value="session">Session</option>
          </select>
          <input
            className={inputClass}
            placeholder="Label (e.g. Protein shake)"
            value={label}
            onChange={(event) => setLabel(event.target.value)}
          />
          <input
            className={inputClass}
            placeholder="Amount (LKR)"
            type="number"
            min={1}
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
          />
          <button
            type="submit"
            className="rounded-lg bg-portal-ink px-4 py-2 text-sm font-medium text-white transition hover:bg-black"
          >
            Add transaction
          </button>
        </form>

        <section className="portal-widget-3d rounded-xl border border-portal-line bg-portal-card p-5">
          <h2 className="text-sm font-semibold text-portal-ink">
            Recent transactions ({summary.count})
          </h2>
          {loading ? (
            <p className="mt-4 text-sm text-portal-muted">Loading transactions…</p>
          ) : visibleTransactions.length === 0 ? (
            <p className="mt-4 text-sm text-portal-muted">
              No transactions yet. Membership payments and approved sessions are
              recorded automatically.
            </p>
          ) : (
            <ul className="mt-4 max-h-[28rem] space-y-2 overflow-y-auto">
              {visibleTransactions.map((transaction) => (
                <li
                  key={transaction.id}
                  className="flex items-start justify-between gap-3 rounded-lg border border-portal-line bg-portal-canvas px-3 py-2.5"
                >
                  <div>
                    <p className="text-sm font-medium text-portal-ink">
                      {transaction.label}
                    </p>
                    <p className="text-xs text-portal-muted">
                      {SOURCE_LABELS[transaction.source] ?? transaction.source} ·{' '}
                      {formatAppDateTime(transaction.createdAt)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-portal-ink">
                      {formatCurrency(transaction.amount)}
                    </p>
                    {!transaction.readOnly && (
                      <button
                        type="button"
                        onClick={() => refresh()}
                        className="mt-1 text-[10px] font-semibold uppercase tracking-wide text-rose-600"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  )
}

function SummaryCard({
  label,
  value,
  gradient,
  border,
}: {
  label: string
  value: string
  gradient: string
  border: string
}) {
  return (
    <div
      className={`portal-widget-3d rounded-xl border px-4 py-4 ${gradient} ${border}`}
    >
      <p className="text-xs font-medium text-portal-muted">{label}</p>
      <p className="mt-2 text-lg font-semibold text-portal-ink">{value}</p>
    </div>
  )
}

const inputClass =
  'w-full rounded-lg border border-portal-line bg-portal-canvas px-3 py-2.5 text-sm text-portal-ink outline-none focus:border-portal-ink'
