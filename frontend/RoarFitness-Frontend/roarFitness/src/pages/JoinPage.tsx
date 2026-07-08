import { MembershipPlansHeader } from '../components/MembershipPlans/MembershipPlansHeader'
import { PlanSelectionGrid } from '../components/MembershipPlans/PlanSelectionGrid'
import {
  createMembershipDescriptionReveal,
  createMembershipEyebrowReveal,
  createMembershipHeadlineReveal,
} from '../components/MembershipPlans/membershipMotion'
import { useReducedMotion } from 'motion/react'
import { AppLink } from '../components/common/AppLink'
import { ROUTES } from '../routes/paths'

const JOIN_COPY = {
  eyebrow: 'JOIN ROAR FITNESS',
  headlineLead: 'Select Your',
  headlineAccent: 'Membership Plan',
  description:
    'Choose the plan that fits your goals. You will complete registration and payment on the next steps.',
} as const

export function JoinPage() {
  const reduceMotion = useReducedMotion()

  return (
    <div className="flex h-dvh min-h-0 flex-col overflow-hidden bg-surface font-sans text-brand-ink">
      <header className="shrink-0 border-b border-brand-ink/[0.08] bg-white/80 px-5 py-3.5 sm:px-8 sm:py-4">
        <div className="mx-auto flex max-w-[90rem] items-center justify-between">
          <AppLink
            to={ROUTES.home}
            className="text-[10px] font-semibold uppercase tracking-[0.18em] text-brand-muted transition-colors hover:text-brand-ink"
          >
            ← Back to home
          </AppLink>
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-brand-muted">
            Step 1 of 3
          </p>
        </div>
      </header>

      <main className="relative flex min-h-0 flex-1 flex-col overflow-y-auto">
        <div
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(10,10,10,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(10,10,10,0.02)_1px,transparent_1px)] bg-[size:48px_48px] [mask-image:radial-gradient(ellipse_at_50%_0%,black_8%,transparent_70%)]"
          aria-hidden="true"
        />

        <div className="relative z-10 mx-auto flex w-full max-w-[90rem] flex-1 flex-col justify-center px-5 py-6 sm:px-8 sm:py-8 lg:px-12 lg:py-10">
          <MembershipPlansHeader
            compact
            eyebrowVariants={createMembershipEyebrowReveal(reduceMotion)}
            headlineVariants={createMembershipHeadlineReveal(reduceMotion)}
            descriptionVariants={createMembershipDescriptionReveal(reduceMotion)}
            copy={JOIN_COPY}
          />

          <div className="mt-6 sm:mt-8 lg:mt-10">
            <PlanSelectionGrid compact />
          </div>
        </div>
      </main>
    </div>
  )
}
