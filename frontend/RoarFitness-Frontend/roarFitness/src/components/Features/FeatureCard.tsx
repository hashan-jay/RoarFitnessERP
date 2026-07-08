import { motion, type Variants } from 'motion/react'

import type { FeatureItem } from './constants'
import { FEATURES_VIEWPORT } from './featuresMotion'

interface FeatureCardProps {
  feature: FeatureItem
  index: number
  titleVariants: Variants
}

/** Numbered capability row — icon portal with left-aligned copy */
export function FeatureCard({
  feature,
  index,
  titleVariants,
}: FeatureCardProps) {
  const Icon = feature.icon
  const indexLabel = String(index + 1).padStart(2, '0')

  return (
    <article className="group/feature flex gap-5 py-8 sm:gap-6 sm:py-10 lg:gap-8 lg:py-11">
      <span
        className="shrink-0 font-display text-[clamp(1.75rem,3vw,2.5rem)] leading-none tracking-[0.04em] text-white/15 transition-colors duration-500 group-hover/feature:text-white/25"
        aria-hidden="true"
      >
        {indexLabel}
      </span>

      <div className="flex min-w-0 flex-1 flex-col gap-4 sm:flex-row sm:items-start sm:gap-5 lg:gap-6">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-white transition-all duration-500 group-hover/feature:border-white/20 group-hover/feature:bg-white/[0.08] sm:h-14 sm:w-14">
          <Icon
            className="h-6 w-6 sm:h-7 sm:w-7"
            strokeWidth={1.65}
            aria-hidden="true"
          />
        </div>

        <div className="min-w-0 flex-1 text-left">
          <motion.h3
            className="text-lg font-medium capitalize leading-snug tracking-[-0.01em] text-white sm:text-xl"
            variants={titleVariants}
            initial="hidden"
            whileInView="visible"
            viewport={FEATURES_VIEWPORT}
          >
            {feature.title}
          </motion.h3>

          <p className="mt-2 max-w-md text-sm leading-relaxed text-features-body sm:mt-3 sm:text-[0.9375rem] sm:leading-[1.65]">
            {feature.description}
          </p>
        </div>
      </div>
    </article>
  )
}
