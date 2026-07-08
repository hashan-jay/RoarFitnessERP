import { motion, type Variants } from 'motion/react'

import { CONTACT_COPY } from './constants'
import { CONTACT_VIEWPORT } from './contactMotion'

interface ContactHeaderProps {
  eyebrowVariants: Variants
  headlineVariants: Variants
  descriptionVariants: Variants
}

export function ContactHeader({
  eyebrowVariants,
  headlineVariants,
  descriptionVariants,
}: ContactHeaderProps) {
  return (
    <header
      className="relative flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between lg:gap-10"
      aria-labelledby="contact-heading"
    >
      <div className="relative max-w-xl lg:text-left">
        <motion.div
          className="mb-6 flex items-center gap-3 sm:mb-7 sm:gap-4"
          variants={eyebrowVariants}
          initial="hidden"
          whileInView="visible"
          viewport={CONTACT_VIEWPORT}
        >
          <span
            className="hidden h-px w-10 bg-gradient-to-r from-brand-ink/25 to-transparent sm:block lg:w-14"
            aria-hidden="true"
          />
          <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-brand-muted sm:text-[11px]">
            {CONTACT_COPY.eyebrow}
          </p>
          <span className="font-display text-sm tracking-[0.2em] text-brand-ink/30">
            {CONTACT_COPY.studioCode}
          </span>
        </motion.div>

        <motion.h2
          id="contact-heading"
          variants={headlineVariants}
          initial="hidden"
          whileInView="visible"
          viewport={CONTACT_VIEWPORT}
        >
          <span className="block text-[clamp(1.5rem,2.8vw,2rem)] font-medium leading-[1.2] tracking-[-0.02em] text-brand-ink/85 lg:text-[2rem]">
            {CONTACT_COPY.headlineLead}
          </span>
          <span className="mt-2 block font-display text-[clamp(2.25rem,5.5vw,3.5rem)] font-normal uppercase leading-[0.9] tracking-[0.04em] text-brand-ink sm:mt-2.5 lg:text-[3.5rem]">
            {CONTACT_COPY.headlineAccent}
          </span>
        </motion.h2>

        <motion.p
          className="mt-6 max-w-md text-sm leading-[1.8] text-brand-muted sm:mt-7 sm:text-[0.9375rem] md:text-base"
          variants={descriptionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={CONTACT_VIEWPORT}
        >
          {CONTACT_COPY.description}
        </motion.p>
      </div>

      <motion.div
        className="flex shrink-0 flex-wrap items-center gap-x-6 gap-y-3 border-y border-brand-ink/[0.08] py-4 lg:border-y-0 lg:border-l lg:py-0 lg:pl-8"
        variants={descriptionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={CONTACT_VIEWPORT}
        aria-label="Studio quick facts"
      >
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-brand-muted">
            Location
          </p>
          <p className="mt-1 text-sm font-medium text-brand-ink">Colombo 07</p>
        </div>
        <div className="hidden h-8 w-px bg-brand-ink/10 sm:block" aria-hidden="true" />
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-brand-muted">
            Hours
          </p>
          <p className="mt-1 text-sm font-medium text-brand-ink">Open 7 days</p>
        </div>
        <div className="hidden h-8 w-px bg-brand-ink/10 sm:block" aria-hidden="true" />
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-brand-muted">
            Response
          </p>
          <p className="mt-1 text-sm font-medium text-brand-ink">Within 24 hrs</p>
        </div>
      </motion.div>
    </header>
  )
}
