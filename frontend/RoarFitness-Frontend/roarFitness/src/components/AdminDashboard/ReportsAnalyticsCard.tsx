import { motion, useReducedMotion } from 'motion/react'
import type { LucideIcon } from 'lucide-react'

import { createFadeUpReveal, SECTION_VIEWPORT_TIGHT } from '../../motion/reveal'

interface ReportsAnalyticsCardProps {
  label: string
  value: string
  gradient: string
  border: string
  icon?: LucideIcon
  index?: number
  highlight?: boolean
  loading?: boolean
}

export function ReportsAnalyticsCard({
  label,
  value,
  gradient,
  border,
  icon: Icon,
  index = 0,
  highlight = false,
  loading = false,
}: ReportsAnalyticsCardProps) {
  const reduceMotion = useReducedMotion()

  return (
    <motion.div
      className={`portal-widget-3d rounded-xl border px-4 py-4 ${gradient} ${border} ${
        highlight ? 'ring-1 ring-portal-ink/5' : ''
      }`}
      variants={createFadeUpReveal(reduceMotion, index, { y: 24, step: 0.08, start: 0.04 })}
      initial="hidden"
      whileInView="visible"
      viewport={SECTION_VIEWPORT_TIGHT}
    >
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-medium text-portal-muted">{label}</p>
        {Icon && <Icon className="size-4 shrink-0 text-portal-muted" aria-hidden="true" />}
      </div>
      <p
        className={`mt-2 font-semibold tracking-tight text-portal-ink ${
          highlight ? 'text-2xl sm:text-3xl' : 'text-lg'
        }`}
      >
        {loading ? '…' : value}
      </p>
    </motion.div>
  )
}
