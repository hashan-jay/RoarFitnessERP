import { Check } from 'lucide-react'

import { AppLink } from '../common/AppLink'
import { formatLKR } from '../MembershipPlans/constants'
import { getPackageById } from '../../utils/packageStorage'
import { joinPath } from '../../routes/paths'

interface SelectedPlanBannerProps {
  planId: string
}

export function SelectedPlanBanner({ planId }: SelectedPlanBannerProps) {
  const plan = getPackageById(planId)

  if (!plan) return null

  return (
    <div className="mb-6 rounded-[1px] border border-brand-ink/[0.1] bg-surface/60 px-4 py-4 sm:px-5 sm:py-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-brand-muted">
            Selected membership
          </p>
          <p className="mt-1.5 text-base font-medium text-brand-ink sm:text-lg">
            {plan.name}
          </p>
          <p className="mt-1 text-sm text-brand-muted">
            {formatLKR(plan.price)}
            {plan.period}
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-brand-ink/10 bg-white px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-brand-ink">
          <Check className="size-3" aria-hidden="true" />
          Confirmed
        </span>
      </div>
      <AppLink
        to={joinPath(planId)}
        className="mt-3 inline-block text-[10px] font-semibold uppercase tracking-[0.14em] text-brand-muted transition-colors hover:text-brand-ink sm:text-[11px]"
      >
        Change plan
      </AppLink>
    </div>
  )
}
