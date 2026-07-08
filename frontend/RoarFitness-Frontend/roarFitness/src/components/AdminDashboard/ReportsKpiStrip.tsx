import { formatCurrency } from '../../lib/formatters'
import {
  aggregateKpiValues,
  KPI_STRIP_STYLES,
  type BreakdownTotals,
} from './reportsAnalyticsStyles'
import { ReportsAnalyticsCard } from './ReportsAnalyticsCard'

interface ReportsKpiStripProps {
  breakdown: BreakdownTotals
  loading?: boolean
  startIndex?: number
}

export function ReportsKpiStrip({
  breakdown,
  loading = false,
  startIndex = 0,
}: ReportsKpiStripProps) {
  const kpis = aggregateKpiValues(breakdown)
  const items = [
    { key: 'total', value: kpis.total, ...KPI_STRIP_STYLES.total },
    { key: 'membership', value: kpis.membership, ...KPI_STRIP_STYLES.membership },
    { key: 'pos', value: kpis.pos, ...KPI_STRIP_STYLES.pos },
    { key: 'session', value: kpis.session, ...KPI_STRIP_STYLES.session },
  ] as const

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((item, index) => (
        <ReportsAnalyticsCard
          key={item.key}
          label={item.label}
          value={formatCurrency(item.value)}
          gradient={item.gradient}
          border={item.border}
          icon={item.icon}
          index={startIndex + index}
          loading={loading}
        />
      ))}
    </div>
  )
}
