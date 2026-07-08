import { useMemo } from 'react'
import { motion, useReducedMotion } from 'motion/react'

import { formatCurrency } from '../../lib/formatters'
import {
  createFadeUpReveal,
  createMediaRevealAt,
  EASE_OUT,
  SECTION_VIEWPORT_TIGHT,
} from '../../motion/reveal'
import type { DailyRevenue } from '../../types/api'

interface RevenueLineChartProps {
  days: DailyRevenue[]
  title: string
  animationIndex?: number
}

const CHART_WIDTH = 720
const CHART_HEIGHT = 280
const PADDING = { top: 24, right: 20, bottom: 40, left: 72 }

function dayNumber(dateStr: string): number {
  if (!dateStr) return 0
  const iso = dateStr.includes('T') ? dateStr : `${dateStr.slice(0, 10)}T12:00:00+05:30`
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Colombo',
    day: '2-digit',
  }).formatToParts(new Date(iso))
  return Number(parts.find((part) => part.type === 'day')?.value ?? 0)
}

export function RevenueLineChart({ days, title, animationIndex = 0 }: RevenueLineChartProps) {
  const reduceMotion = useReducedMotion()

  const sortedDays = useMemo(
    () => [...days].sort((a, b) => a.date.localeCompare(b.date)),
    [days],
  )

  const maxTotal = useMemo(
    () => Math.max(...sortedDays.map((day) => day.total), 1),
    [sortedDays],
  )

  const monthTotal = useMemo(
    () => sortedDays.reduce((sum, day) => sum + day.total, 0),
    [sortedDays],
  )

  const plotWidth = CHART_WIDTH - PADDING.left - PADDING.right
  const plotHeight = CHART_HEIGHT - PADDING.top - PADDING.bottom

  const points = useMemo(() => {
    if (sortedDays.length === 0) return []
    const step = sortedDays.length > 1 ? plotWidth / (sortedDays.length - 1) : 0
    return sortedDays.map((day, index) => {
      const x = PADDING.left + step * index
      const y = PADDING.top + plotHeight - (day.total / maxTotal) * plotHeight
      return { x, y, day, index }
    })
  }, [sortedDays, maxTotal, plotHeight, plotWidth])

  const linePath = points
    .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`)
    .join(' ')

  const areaPath =
    points.length > 0
      ? `${linePath} L ${points[points.length - 1].x} ${PADDING.top + plotHeight} L ${points[0].x} ${PADDING.top + plotHeight} Z`
      : ''

  const yTicks = [0, 0.25, 0.5, 0.75, 1].map((ratio) => ({
    ratio,
    value: maxTotal * ratio,
    y: PADDING.top + plotHeight - ratio * plotHeight,
  }))

  if (sortedDays.length === 0) {
    return (
      <motion.section
        className="portal-widget-3d rounded-xl border border-portal-line bg-portal-card p-5"
        variants={createFadeUpReveal(reduceMotion, animationIndex, { y: 28 })}
        initial="hidden"
        whileInView="visible"
        viewport={SECTION_VIEWPORT_TIGHT}
      >
        <h2 className="text-sm font-semibold text-portal-ink">{title}</h2>
        <p className="mt-4 text-sm text-portal-muted">No daily revenue recorded.</p>
      </motion.section>
    )
  }

  return (
    <motion.section
      className="portal-widget-3d rounded-xl border border-slate-200 bg-gradient-to-br from-white via-slate-50/80 to-slate-100/60 p-5"
      variants={createMediaRevealAt(reduceMotion, animationIndex * 0.06, { y: 28, scale: 0.98 })}
      initial="hidden"
      whileInView="visible"
      viewport={SECTION_VIEWPORT_TIGHT}
    >
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-portal-ink">{title}</h2>
          <p className="mt-1 text-xs text-portal-muted">
            Daily total revenue · Month total {formatCurrency(monthTotal)}
          </p>
        </div>
      </div>

      <motion.div
        className="mt-4 overflow-x-auto"
        initial={reduceMotion ? false : { opacity: 0 }}
        whileInView={reduceMotion ? undefined : { opacity: 1 }}
        viewport={SECTION_VIEWPORT_TIGHT}
        transition={{ duration: 0.5, delay: 0.15, ease: EASE_OUT }}
      >
        <svg
          viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
          className="min-w-full"
          role="img"
          aria-label={`Daily total revenue line chart for ${title}`}
        >
          {yTicks.map((tick) => (
            <g key={tick.ratio}>
              <line
                x1={PADDING.left}
                x2={CHART_WIDTH - PADDING.right}
                y1={tick.y}
                y2={tick.y}
                stroke="#e5e7eb"
                strokeDasharray="4 4"
              />
              <text
                x={PADDING.left - 8}
                y={tick.y + 4}
                textAnchor="end"
                className="fill-portal-muted text-[10px]"
              >
                {formatCurrency(tick.value)}
              </text>
            </g>
          ))}

          <line
            x1={PADDING.left}
            x2={PADDING.left}
            y1={PADDING.top}
            y2={PADDING.top + plotHeight}
            stroke="#111827"
            strokeWidth={1.5}
          />
          <line
            x1={PADDING.left}
            x2={CHART_WIDTH - PADDING.right}
            y1={PADDING.top + plotHeight}
            y2={PADDING.top + plotHeight}
            stroke="#111827"
            strokeWidth={1.5}
          />

          {areaPath && (
            <motion.path
              d={areaPath}
              fill="rgba(17, 24, 39, 0.08)"
              stroke="none"
              initial={reduceMotion ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.35, ease: EASE_OUT }}
            />
          )}

          {linePath && (
            <motion.path
              d={linePath}
              fill="none"
              stroke="#111827"
              strokeWidth={2.5}
              strokeLinejoin="round"
              strokeLinecap="round"
              initial={reduceMotion ? false : { pathLength: 0, opacity: 0.4 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 1.2, delay: 0.2, ease: EASE_OUT }}
            />
          )}

          {points.map((point) => (
            <g key={point.day.date}>
              <motion.circle
                cx={point.x}
                cy={point.y}
                r={4}
                fill="#111827"
                initial={reduceMotion ? false : { scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{
                  duration: 0.35,
                  delay: reduceMotion ? 0 : 0.25 + point.index * 0.03,
                  ease: EASE_OUT,
                }}
              />
              <title>{`Day ${dayNumber(point.day.date)}: ${formatCurrency(point.day.total)}`}</title>
              <text
                x={point.x}
                y={CHART_HEIGHT - 12}
                textAnchor="middle"
                className="fill-portal-muted text-[10px]"
              >
                {dayNumber(point.day.date)}
              </text>
            </g>
          ))}

          <text
            x={16}
            y={CHART_HEIGHT / 2}
            transform={`rotate(-90 16 ${CHART_HEIGHT / 2})`}
            textAnchor="middle"
            className="fill-portal-muted text-[11px] font-medium"
          >
            Revenue (LKR)
          </text>
          <text
            x={CHART_WIDTH / 2}
            y={CHART_HEIGHT - 2}
            textAnchor="middle"
            className="fill-portal-muted text-[11px] font-medium"
          >
            Day of month
          </text>
        </svg>
      </motion.div>
    </motion.section>
  )
}
