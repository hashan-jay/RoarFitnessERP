import { motion, type Variants } from 'motion/react'

import { SHOWCASE_COPY } from './constants'

const VIEWPORT = {
  once: true,
  amount: 0.25,
  margin: '0px 0px -6% 0px',
} as const

interface ShowcaseHeaderProps {
  eyebrowVariants: Variants
  headlineVariants: Variants
  subtitleVariants: Variants
}

export function ShowcaseHeader({
  eyebrowVariants,
  headlineVariants,
  subtitleVariants,
}: ShowcaseHeaderProps) {
  return (
    <header
      className="relative mx-auto max-w-3xl text-center"
      aria-labelledby="showcase-heading"
    >
      <motion.div
        className="mb-6 flex items-center justify-center gap-3 sm:mb-7 sm:gap-4"
        variants={eyebrowVariants}
        initial="hidden"
        whileInView="visible"
        viewport={VIEWPORT}
      >
        <span
          className="hidden h-px w-10 bg-gradient-to-r from-transparent to-brand-ink/20 sm:block lg:w-14"
          aria-hidden="true"
        />
        <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-brand-muted sm:text-[11px]">
          {SHOWCASE_COPY.eyebrow}
        </p>
        <span
          className="hidden h-px w-10 bg-gradient-to-l from-transparent to-brand-ink/20 sm:block lg:w-14"
          aria-hidden="true"
        />
      </motion.div>

      <motion.h2
        id="showcase-heading"
        variants={headlineVariants}
        initial="hidden"
        whileInView="visible"
        viewport={VIEWPORT}
      >
        <span className="block text-[clamp(1.5rem,2.8vw,2rem)] font-medium leading-[1.2] tracking-[-0.02em] text-brand-ink/85 lg:text-[2rem]">
          {SHOWCASE_COPY.headlineLead}
        </span>
        <span className="mt-2 block font-display text-[clamp(2rem,4.5vw,3rem)] font-normal uppercase leading-[0.92] tracking-[0.03em] text-brand-ink sm:mt-2.5 lg:text-[3rem]">
          {SHOWCASE_COPY.headlineAccent}
        </span>
      </motion.h2>

      <motion.p
        className="mx-auto mt-5 max-w-xl text-sm leading-[1.75] text-brand-muted sm:mt-6 sm:text-[0.9375rem]"
        variants={subtitleVariants}
        initial="hidden"
        whileInView="visible"
        viewport={VIEWPORT}
      >
        {SHOWCASE_COPY.subtitle}
      </motion.p>
    </header>
  )
}
