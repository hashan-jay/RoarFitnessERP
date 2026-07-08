import { Check } from 'lucide-react'

import { AppLink } from '../common/AppLink'
import { PrimaryCta } from '../PrimaryCta'
import { formatLKR, MEMBERSHIP_COPY, type MembershipPlan } from './constants'
import { joinPath } from '../../routes/paths'
interface PlanCardProps {
  plan: MembershipPlan
  index: number
  className?: string
}

const secondaryCtaClassName =
  'inline-flex min-h-[44px] w-full items-center justify-center rounded-sm border border-brand-ink/12 bg-white/80 px-5 py-3.5 text-xs font-semibold uppercase tracking-[0.14em] text-brand-ink transition-all duration-500 hover:-translate-y-0.5 hover:border-brand-ink hover:bg-brand-ink hover:text-white sm:px-6 sm:py-4 sm:text-sm sm:tracking-[0.15em]'

/** Tier card — light editorial frame or inverted Pro highlight */
export function PlanCard({ plan, index, className = '' }: PlanCardProps) {
  const isPopular = plan.isPopular === true
  const indexLabel = String(index + 1).padStart(2, '0')

  return (
    <article
      className={`group relative flex h-full w-full flex-col overflow-hidden rounded-sm border transition-all duration-500 ease-out ${className} ${
        isPopular
          ? 'border-brand-ink bg-brand-ink text-white shadow-[0_20px_48px_rgba(10,10,10,0.18)] hover:-translate-y-1 hover:shadow-[0_28px_56px_rgba(10,10,10,0.22)]'
          : 'border-brand-ink/[0.08] bg-white shadow-[0_8px_28px_rgba(10,10,10,0.06)] hover:-translate-y-1 hover:border-brand-ink/15 hover:shadow-[0_16px_40px_rgba(10,10,10,0.1)]'
      }`}
    >
      <span
        className={`absolute left-0 top-0 h-1 w-full ${
          isPopular ? 'bg-white/30' : 'bg-brand-ink/80'
        }`}
        aria-hidden="true"
      />

      {isPopular && (
        <span className="absolute right-5 top-5 z-10 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-white backdrop-blur-sm sm:text-[11px]">
          {MEMBERSHIP_COPY.popularBadge}
        </span>
      )}

      <div className="relative flex flex-col p-5 sm:p-6 lg:flex-1 lg:p-7">
        <span
          className={`font-display text-4xl leading-none tracking-[0.04em] sm:text-5xl ${
            isPopular ? 'text-white/15' : 'text-brand-ink/[0.07]'
          }`}
          aria-hidden="true"
        >
          {indexLabel}
        </span>

        <h3
          className={`mt-3 text-xl font-medium capitalize tracking-[-0.015em] sm:text-2xl ${
            isPopular ? 'text-white' : 'text-brand-ink'
          }`}
        >
          {plan.name}
        </h3>

        <div className={`mt-5 border-t pt-5 ${isPopular ? 'border-white/10' : 'border-brand-ink/[0.06]'}`}>
          <p
            className={`font-display text-[clamp(2rem,4vw,2.75rem)] leading-none tracking-[0.02em] ${
              isPopular ? 'text-white' : 'text-brand-ink'
            }`}
          >
            {formatLKR(plan.price)}
          </p>
          <p
            className={`mt-2 text-[11px] font-medium uppercase tracking-[0.12em] sm:text-xs ${
              isPopular ? 'text-white/60' : 'text-brand-muted'
            }`}
          >
            {plan.period}
          </p>
        </div>

        <p
          className={`mt-4 text-sm leading-[1.65] sm:mt-5 sm:text-[0.9375rem] ${
            isPopular ? 'text-white/70' : 'text-brand-muted'
          }`}
        >
          {plan.description}
        </p>
      </div>

      <div
        className={`flex flex-1 flex-col p-5 sm:p-6 ${
          isPopular ? 'border-t border-white/10' : 'border-t border-brand-ink/[0.06]'
        }`}
      >
        <ul className="mb-6 flex flex-col gap-3 sm:mb-8 sm:gap-3.5">
          {plan.features.map((feature) => (
            <li key={feature} className="flex items-start gap-2.5 sm:gap-3">
              <span
                className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
                  isPopular
                    ? 'bg-white/15 text-white'
                    : 'bg-brand-ink/[0.06] text-brand-ink'
                }`}
              >
                <Check className="h-3 w-3" strokeWidth={2.25} aria-hidden="true" />
              </span>
              <span
                className={`min-w-0 flex-1 text-sm leading-snug sm:text-[0.9375rem] ${
                  isPopular ? 'text-white/85' : 'text-brand-ink/80'
                }`}
              >
                {feature}
              </span>
            </li>
          ))}
        </ul>

        <div className="mt-auto w-full">
          {isPopular ? (
            <PrimaryCta
              to={joinPath(plan.id)}
              className="!max-w-none w-full justify-center"
            >
              {plan.cta}
            </PrimaryCta>
          ) : (
            <AppLink to={joinPath(plan.id)} className={secondaryCtaClassName}>
              {plan.cta}
            </AppLink>
          )}
        </div>
      </div>
    </article>
  )
}
