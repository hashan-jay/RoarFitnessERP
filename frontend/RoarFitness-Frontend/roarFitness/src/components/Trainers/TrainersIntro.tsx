import { motion, type Variants } from 'motion/react'

import { TRAINERS_COPY } from './constants'
import { TRAINERS_VIEWPORT } from './trainersMotion'

interface TrainersIntroProps {
  eyebrowVariants: Variants
  headingVariants: Variants
  subtitleVariants: Variants
}

export function TrainersIntro({
  eyebrowVariants,
  headingVariants,
  subtitleVariants,
}: TrainersIntroProps) {
  return (
    <header
      className="relative mx-auto max-w-3xl px-2 text-center"
      aria-labelledby="trainers-heading"
    >
      <motion.div
        className="mb-6 flex items-center justify-center gap-3 sm:mb-8 sm:gap-4"
        variants={eyebrowVariants}
        initial="hidden"
        whileInView="visible"
        viewport={TRAINERS_VIEWPORT}
      >
        <span className="hidden h-px w-12 bg-gradient-to-r from-transparent to-white/20 sm:block" aria-hidden="true" />
        <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-white/70 sm:text-[11px] md:text-xs">
          {TRAINERS_COPY.eyebrow}
        </p>
        <span className="hidden h-px w-12 bg-gradient-to-l from-transparent to-white/20 sm:block" aria-hidden="true" />
      </motion.div>

      <motion.h2
        id="trainers-heading"
        className="text-[clamp(2.25rem,5vw,3.75rem)] font-medium leading-[1.05] tracking-[-0.025em] text-white"
        variants={headingVariants}
        initial="hidden"
        whileInView="visible"
        viewport={TRAINERS_VIEWPORT}
      >
        <span className="block">{TRAINERS_COPY.headingLead}</span>
        <span className="mt-1 block font-display text-[clamp(2.5rem,5.5vw,4.25rem)] font-normal uppercase leading-[0.92] tracking-[0.03em] text-white/95 sm:mt-2">
          {TRAINERS_COPY.headingAccent}
        </span>
      </motion.h2>

      <motion.p
        className="mx-auto mt-6 max-w-2xl text-sm leading-[1.75] text-features-body sm:mt-7 sm:text-[0.9375rem] md:text-base"
        variants={subtitleVariants}
        initial="hidden"
        whileInView="visible"
        viewport={TRAINERS_VIEWPORT}
      >
        {TRAINERS_COPY.subtitle}
      </motion.p>
    </header>
  )
}
