import { useReducedMotion } from 'motion/react'

import { MembershipPlansHeader } from './MembershipPlansHeader'
import { PlansGrid } from './PlansGrid'
import {
  createMembershipDescriptionReveal,
  createMembershipEyebrowReveal,
  createMembershipHeadlineReveal,
} from './membershipMotion'

/**
 * Editorial pricing section — centered intro with a balanced tier grid.
 */
export function MembershipPlans() {
  const reduceMotion = useReducedMotion()

  return (
    <section
      id="membership"
      className="relative overflow-hidden bg-surface font-sans text-brand-ink"
      aria-labelledby="membership-heading"
    >
      <div
        className="pointer-events-none absolute -right-24 top-1/4 h-80 w-80 rounded-full bg-brand-ink/[0.03] blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand-ink/10 to-transparent"
        aria-hidden="true"
      />

      <div className="relative z-10 mx-auto max-w-[90rem] px-5 py-16 sm:px-8 sm:py-20 md:py-24 lg:px-12 lg:py-28 xl:py-32">
        <MembershipPlansHeader
          eyebrowVariants={createMembershipEyebrowReveal(reduceMotion)}
          headlineVariants={createMembershipHeadlineReveal(reduceMotion)}
          descriptionVariants={createMembershipDescriptionReveal(reduceMotion)}
        />

        <div className="mt-12 sm:mt-14 md:mt-16 lg:mt-20">
          <PlansGrid />
        </div>
      </div>
    </section>
  )
}
