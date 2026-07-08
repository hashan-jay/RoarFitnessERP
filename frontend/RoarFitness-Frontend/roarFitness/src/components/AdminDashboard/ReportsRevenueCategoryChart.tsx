import { ShoppingBag } from 'lucide-react'
import { motion, useReducedMotion } from 'motion/react'

import { formatCurrency } from '../../lib/formatters'
import { createFadeUpReveal, EASE_OUT, SECTION_VIEWPORT_TIGHT } from '../../motion/reveal'
import {
  buildRevenueCategorySlices,
  type BreakdownTotals,
} from './reportsAnalyticsStyles'

interface ReportsRevenueCategoryChartProps {
  breakdown: BreakdownTotals
  title?: string
  subtitle?: string
  animationIndex?: number
}

export function ReportsRevenueCategoryChart({
  breakdown,
  title = 'All-time performance',
  subtitle = 'Comparative revenue by category',
  animationIndex = 0,
}: ReportsRevenueCategoryChartProps) {
  const reduceMotion = useReducedMotion()
  const slices = buildRevenueCategorySlices(breakdown)
  const maxAmount = Math.max(...slices.map((slice) => slice.amount), 1)

  return (
    <motion.section
      className="portal-widget-3d rounded-xl border border-portal-line bg-portal-card p-5 sm:p-6"
      variants={createFadeUpReveal(reduceMotion, animationIndex, { y: 28, step: 0.08 })}
      initial="hidden"
      whileInView="visible"
      viewport={SECTION_VIEWPORT_TIGHT}
    >
      <div className="flex items-start gap-3">
        <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-600 ring-1 ring-violet-100">
          <ShoppingBag className="size-5" aria-hidden="true" />
        </span>
        <div>
          <h2 className="text-sm font-semibold text-portal-ink">{title}</h2>
          <p className="mt-0.5 text-xs text-portal-muted">{subtitle}</p>
        </div>
      </div>

      <ul className="mt-6 space-y-5" aria-label="Revenue by category">
        {slices.map((slice, index) => {
          const barWidth = maxAmount > 0 ? (slice.amount / maxAmount) * 100 : 0

          return (
            <motion.li
              key={slice.key}
              variants={createFadeUpReveal(reduceMotion, index, {
                y: 18,
                step: 0.07,
                start: 0.06,
              })}
              initial="hidden"
              whileInView="visible"
              viewport={SECTION_VIEWPORT_TIGHT}
            >
              <div className="mb-2 flex items-center justify-between gap-3 text-xs sm:text-sm">
                <span className="font-medium text-portal-ink">{slice.label}</span>
                <span className="shrink-0 font-semibold tabular-nums text-portal-ink">
                  {formatCurrency(slice.amount)}
                </span>
              </div>
              <div
                className="h-2.5 overflow-hidden rounded-full bg-slate-100"
                role="presentation"
                aria-hidden="true"
              >
                <motion.div
                  className="h-full rounded-full shadow-sm"
                  style={{ backgroundColor: slice.color }}
                  initial={reduceMotion ? { width: `${barWidth}%` } : { width: 0 }}
                  whileInView={{ width: `${barWidth}%` }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{
                    duration: reduceMotion ? 0 : 0.85,
                    ease: EASE_OUT,
                    delay: reduceMotion ? 0 : index * 0.08,
                  }}
                />
              </div>
            </motion.li>
          )
        })}
      </ul>
    </motion.section>
  )
}
