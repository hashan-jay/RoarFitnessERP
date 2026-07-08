import { motion, type Variants } from 'motion/react'

import { FEATURES_COPY } from './constants'
import { FEATURES_VIEWPORT } from './featuresMotion'

interface FeaturesStatementProps {
  variants: Variants
}

/** Editorial manifesto — left-aligned with display emphasis on key phrases */
export function FeaturesStatement({ variants }: FeaturesStatementProps) {
  const { statement } = FEATURES_COPY

  return (
    <motion.h2
      id="features-heading"
      className="relative mx-auto max-w-[56rem] text-center text-[clamp(1.3rem,2.4vw,1.9rem)] font-normal leading-[1.28] tracking-[-0.02em] lg:mx-0 lg:max-w-none lg:text-left lg:text-[1.75rem] lg:leading-[1.24] xl:text-[1.9rem]"
      variants={variants}
      initial="hidden"
      whileInView="visible"
      viewport={FEATURES_VIEWPORT}
    >
      <span
        className="absolute -left-4 top-3 hidden h-[calc(100%-0.75rem)] w-px bg-gradient-to-b from-white/30 via-white/10 to-transparent lg:block"
        aria-hidden="true"
      />

      <span className="text-features-muted">{statement.lead} </span>
      <span className="font-display text-[1.06em] font-normal tracking-[0.01em] text-white">
        {statement.highlight1}
      </span>
      <span className="text-features-muted">{statement.middle} </span>
      <span className="font-display text-[1.06em] font-normal tracking-[0.01em] text-white">
        {statement.highlight2}
      </span>
      <span className="text-features-muted">{statement.trail}</span>
      <span className="font-display text-[1.06em] font-normal tracking-[0.01em] text-white">
        {statement.highlight3}
      </span>
    </motion.h2>
  )
}
