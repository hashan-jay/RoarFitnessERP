import { motion, type Variants } from 'motion/react'

import { MEMBERSHIP_COPY } from './constants'
import { MEMBERSHIP_VIEWPORT } from './membershipMotion'

interface MembershipPlansHeaderProps {
  eyebrowVariants: Variants
  headlineVariants: Variants
  descriptionVariants: Variants
  compact?: boolean
  copy?: {
    eyebrow: string
    headlineLead: string
    headlineAccent: string
    description: string
  }
}

export function MembershipPlansHeader({
  eyebrowVariants,
  headlineVariants,
  descriptionVariants,
  compact = false,
  copy = MEMBERSHIP_COPY,
}: MembershipPlansHeaderProps) {
  return (
    <header className="relative mx-auto max-w-[50rem] px-2 text-center sm:px-4">
      <motion.div
        className={`flex items-center justify-center gap-3 sm:gap-4 ${
          compact ? 'mb-4 sm:mb-5' : 'mb-8 sm:mb-9 md:mb-10'
        }`}
        variants={eyebrowVariants}
        initial="hidden"
        whileInView="visible"
        viewport={MEMBERSHIP_VIEWPORT}
      >
        <span className="text-brand-ink/25" aria-hidden="true">
          ·
        </span>
        <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-brand-muted sm:text-[11px]">
          {copy.eyebrow}
        </p>
        <span className="text-brand-ink/25" aria-hidden="true">
          ·
        </span>
      </motion.div>

      <motion.h2
        id="membership-heading"
        className="relative mx-auto max-w-[36rem]"
        variants={headlineVariants}
        initial="hidden"
        whileInView="visible"
        viewport={MEMBERSHIP_VIEWPORT}
      >
        <span
          className={`block font-medium leading-[1.2] tracking-[-0.02em] text-brand-ink/80 ${
            compact
              ? 'text-[clamp(1.25rem,2vw,1.75rem)]'
              : 'text-[clamp(1.625rem,2.8vw,2.15rem)] lg:text-[2.15rem]'
          }`}
        >
          {copy.headlineLead}
        </span>
        <span
          className={`mt-2 block font-display font-normal leading-[0.92] tracking-[0.02em] text-brand-ink sm:mt-2.5 ${
            compact
              ? 'text-[clamp(1.75rem,3.5vw,2.5rem)]'
              : 'text-[clamp(2.25rem,5vw,3.25rem)] lg:text-[3.25rem]'
          }`}
        >
          {copy.headlineAccent}
        </span>
      </motion.h2>

      <motion.div
        className={`relative mx-auto max-w-lg ${
          compact ? 'mt-4 sm:mt-5' : 'mt-8 sm:mt-9 md:mt-10'
        }`}
        variants={descriptionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={MEMBERSHIP_VIEWPORT}
      >
        <span
          className="pointer-events-none absolute -top-3 left-1/2 h-6 w-px -translate-x-1/2 bg-gradient-to-b from-brand-ink/20 to-transparent"
          aria-hidden="true"
        />
        <p
          className={`border-y border-brand-ink/[0.08] text-sm leading-[1.75] text-brand-muted sm:text-[0.9375rem] ${
            compact
              ? 'py-3 sm:py-4'
              : 'py-5 sm:py-6 md:text-base'
          }`}
        >
          {copy.description}
        </p>
      </motion.div>
    </header>
  )
}
