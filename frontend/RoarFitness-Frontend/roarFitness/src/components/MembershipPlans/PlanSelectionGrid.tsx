import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Check } from 'lucide-react'
import { motion, useReducedMotion } from 'motion/react'

import { registerPath } from '../../routes/paths'
import { getPackageById, getPackages, loadPackagesFromApi } from '../../utils/packageStorage'
import {
  formatLKR,
  MEMBERSHIP_COPY,
  type MembershipPlan,
} from './constants'
import {
  createPlanCardReveal,
  MEMBERSHIP_VIEWPORT,
} from './membershipMotion'

interface PlanSelectionGridProps {
  compact?: boolean
}

export function PlanSelectionGrid({ compact = false }: PlanSelectionGridProps) {
  const navigate = useNavigate()
  const reduceMotion = useReducedMotion()
  const [searchParams] = useSearchParams()
  const [plans, setPlans] = useState(getPackages())

  useEffect(() => {
    loadPackagesFromApi().then(setPlans)
  }, [])

  const initialPlanId = searchParams.get('plan') ?? ''
  const initialPlan = getPackageById(initialPlanId)
  const [selectedId, setSelectedId] = useState(
    initialPlan?.id ?? plans.find((plan) => plan.isPopular)?.id ?? '',
  )

  useEffect(() => {
    if (!selectedId && plans.length > 0) {
      setSelectedId(plans.find((plan) => plan.isPopular)?.id ?? plans[0].id)
    }
  }, [plans, selectedId])

  const selectedPlan = useMemo(
    () => getPackageById(selectedId),
    [selectedId],
  )

  const handleContinue = () => {
    if (!selectedPlan) return
    navigate(registerPath(selectedPlan.id))
  }

  return (
    <div>
      <motion.ul
        className={`mx-auto grid w-full max-w-[64rem] grid-cols-1 gap-5 max-sm:justify-items-center sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 lg:items-stretch lg:gap-6 ${
          compact ? 'xl:gap-6' : 'gap-6 xl:gap-8'
        }`}
        initial="hidden"
        whileInView="visible"
        viewport={MEMBERSHIP_VIEWPORT}
        aria-label="Select a membership plan"
      >
        {plans.map((plan, index) => (
          <motion.li
            key={plan.id}
            className={`list-none h-full w-full max-sm:max-w-[17rem] ${
              index === plans.length - 1
                ? 'sm:col-span-2 sm:mx-auto sm:max-w-[17rem] lg:col-span-1 lg:max-w-none'
                : ''
            }`}
            variants={createPlanCardReveal(reduceMotion, index)}
          >
            <SelectablePlanCard
              plan={plan}
              index={index}
              isSelected={selectedId === plan.id}
              compact={compact}
              onSelect={() => setSelectedId(plan.id)}
            />
          </motion.li>
        ))}
      </motion.ul>

      <div
        className={`mx-auto flex max-w-md flex-col items-center gap-3 ${
          compact ? 'mt-6 sm:mt-8' : 'mt-10 gap-4 sm:mt-12'
        }`}
      >
        {selectedPlan && (
          <p
            className="text-center text-sm text-brand-muted"
            role="status"
            aria-live="polite"
          >
            Selected:{' '}
            <span className="font-medium text-brand-ink">
              {selectedPlan.name}
            </span>{' '}
            · {formatLKR(selectedPlan.price)}
            {selectedPlan.period}
          </p>
        )}
        <button
          type="button"
          onClick={handleContinue}
          disabled={!selectedPlan}
          className="inline-flex min-h-[48px] w-full items-center justify-center rounded-sm bg-brand-ink px-8 py-3.5 text-xs font-semibold uppercase tracking-[0.14em] text-white transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_10px_24px_rgba(10,10,10,0.18)] disabled:cursor-not-allowed disabled:opacity-50 sm:text-sm"
        >
          Continue to registration
        </button>
      </div>
    </div>
  )
}

interface SelectablePlanCardProps {
  plan: MembershipPlan
  index: number
  isSelected: boolean
  compact?: boolean
  onSelect: () => void
}

function SelectablePlanCard({
  plan,
  index,
  isSelected,
  compact = false,
  onSelect,
}: SelectablePlanCardProps) {
  const isPopular = plan.isPopular === true
  const indexLabel = String(index + 1).padStart(2, '0')

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={isSelected}
      aria-label={`${plan.name}, ${formatLKR(plan.price)}${plan.period}${isSelected ? ', selected' : ''}`}
      className={`group relative flex h-full w-full flex-col overflow-hidden rounded-sm border text-left transition-all duration-500 ease-out focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-ink ${
        isSelected
          ? isPopular
            ? 'z-10 -translate-y-1 border-white ring-2 ring-white ring-offset-2 ring-offset-brand-ink shadow-[0_24px_52px_rgba(10,10,10,0.28)]'
            : 'z-10 -translate-y-1 border-brand-ink ring-2 ring-brand-ink/30 ring-offset-2 ring-offset-surface shadow-[0_20px_48px_rgba(10,10,10,0.14)]'
          : isPopular
            ? 'border-brand-ink/40 opacity-70 hover:opacity-90'
            : 'border-brand-ink/[0.08] opacity-70 hover:border-brand-ink/15 hover:opacity-90'
      } ${
        isPopular
          ? 'bg-brand-ink text-white shadow-[0_20px_48px_rgba(10,10,10,0.18)]'
          : 'bg-white shadow-[0_8px_28px_rgba(10,10,10,0.06)]'
      }`}
    >
      <span
        className={`absolute left-0 top-0 h-1 w-full ${
          isSelected
            ? isPopular
              ? 'bg-white'
              : 'bg-brand-ink'
            : isPopular
              ? 'bg-white/30'
              : 'bg-brand-ink/80'
        }`}
        aria-hidden="true"
      />

      {isSelected ? (
        <span
          className={`absolute right-4 top-4 z-10 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] shadow-sm sm:right-5 sm:top-5 sm:text-[11px] ${
            isPopular
              ? 'border border-white/25 bg-white text-brand-ink'
              : 'bg-brand-ink text-white'
          }`}
        >
          <Check className="size-3" strokeWidth={2.5} aria-hidden="true" />
          Selected
        </span>
      ) : (
        isPopular && (
          <span className="absolute right-5 top-5 z-10 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-white backdrop-blur-sm sm:text-[11px]">
            {MEMBERSHIP_COPY.popularBadge}
          </span>
        )
      )}

      <div
        className={`relative flex flex-col ${
          compact
            ? 'p-4 sm:p-5 lg:flex-1 lg:p-6'
            : 'p-5 sm:p-6 lg:flex-1 lg:p-7'
        }`}
      >
        <span
          className={`font-display leading-none tracking-[0.04em] ${
            compact ? 'text-3xl sm:text-4xl' : 'text-4xl sm:text-5xl'
          } ${isPopular ? 'text-white/15' : 'text-brand-ink/[0.07]'}`}
          aria-hidden="true"
        >
          {indexLabel}
        </span>

        <h3
          className={`mt-2 font-medium capitalize tracking-[-0.015em] ${
            compact ? 'text-lg sm:text-xl' : 'mt-3 text-xl sm:text-2xl'
          } ${isPopular ? 'text-white' : 'text-brand-ink'}`}
        >
          {plan.name}
        </h3>

        <div
          className={`mt-4 border-t pt-4 ${
            compact ? 'sm:mt-4 sm:pt-4' : 'mt-5 pt-5'
          } ${isPopular ? 'border-white/10' : 'border-brand-ink/[0.06]'}`}
        >
          <p
            className={`font-display leading-none tracking-[0.02em] ${
              compact
                ? 'text-[clamp(1.75rem,3.5vw,2.25rem)]'
                : 'text-[clamp(2rem,4vw,2.75rem)]'
            } ${isPopular ? 'text-white' : 'text-brand-ink'}`}
          >
            {formatLKR(plan.price)}
          </p>
          <p
            className={`mt-1.5 text-[11px] font-medium uppercase tracking-[0.12em] sm:text-xs ${
              isPopular ? 'text-white/60' : 'text-brand-muted'
            }`}
          >
            {plan.period}
          </p>
        </div>

        <p
          className={`mt-3 text-sm leading-[1.6] sm:text-[0.9375rem] ${
            compact ? 'line-clamp-2 sm:mt-3' : 'mt-4 sm:mt-5 leading-[1.65]'
          } ${isPopular ? 'text-white/70' : 'text-brand-muted'}`}
        >
          {plan.description}
        </p>
      </div>
    </button>
  )
}
