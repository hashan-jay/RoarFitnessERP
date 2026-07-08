import { motion, type Variants } from 'motion/react'

import { TESTIMONIALS_COPY } from './constants'
import { TESTIMONIALS_VIEWPORT } from './testimonialsMotion'

interface TestimonialsHeaderProps {
  eyebrowVariants: Variants
  headlineVariants: Variants
  descriptionVariants: Variants
}

export function TestimonialsHeader({
  eyebrowVariants,
  headlineVariants,
  descriptionVariants,
}: TestimonialsHeaderProps) {
  return (
    <header className="relative mx-auto max-w-[50rem] px-2 text-center sm:px-4">
      <motion.div
        className="mb-8 flex items-center justify-center gap-3 sm:mb-9 sm:gap-4 md:mb-10"
        variants={eyebrowVariants}
        initial="hidden"
        whileInView="visible"
        viewport={TESTIMONIALS_VIEWPORT}
      >
        <span className="text-brand-ink/25" aria-hidden="true">
          ·
        </span>
        <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-brand-muted sm:text-[11px]">
          {TESTIMONIALS_COPY.eyebrow}
        </p>
        <span className="text-brand-ink/25" aria-hidden="true">
          ·
        </span>
      </motion.div>

      <motion.h2
        id="testimonials-heading"
        className="relative mx-auto max-w-[36rem]"
        variants={headlineVariants}
        initial="hidden"
        whileInView="visible"
        viewport={TESTIMONIALS_VIEWPORT}
      >
        <span className="block text-[clamp(1.625rem,2.8vw,2.15rem)] font-medium leading-[1.2] tracking-[-0.02em] text-brand-ink/80 lg:text-[2.15rem]">
          {TESTIMONIALS_COPY.headlineLead}
        </span>
        <span className="mt-2 block font-display text-[clamp(2.25rem,5vw,3.25rem)] font-normal leading-[0.92] tracking-[0.02em] text-brand-ink sm:mt-2.5 lg:text-[3.25rem]">
          {TESTIMONIALS_COPY.headlineAccent}
        </span>
      </motion.h2>

      <motion.div
        className="relative mx-auto mt-8 max-w-lg sm:mt-9 md:mt-10"
        variants={descriptionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={TESTIMONIALS_VIEWPORT}
      >
        <span
          className="pointer-events-none absolute -top-3 left-1/2 h-6 w-px -translate-x-1/2 bg-gradient-to-b from-brand-ink/20 to-transparent"
          aria-hidden="true"
        />
        <p className="border-y border-brand-ink/[0.08] py-5 text-sm leading-[1.75] text-brand-muted sm:py-6 sm:text-[0.9375rem] md:text-base">
          {TESTIMONIALS_COPY.description}
        </p>
      </motion.div>
    </header>
  )
}
