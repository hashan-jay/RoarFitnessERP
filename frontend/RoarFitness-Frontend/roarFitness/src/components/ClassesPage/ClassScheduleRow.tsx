import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

import { AppLink } from '../common/AppLink'
import { ROUTES } from '../../routes/paths'
import { getClassTypeStyles, VIP_SESSION_STYLES } from './classesPageStyles'
import { CLASSES_PAGE_COPY } from './scheduleData'
import type { ClassSession } from './scheduleUtils'
import { getStartTime } from './scheduleUtils'
import { formatCurrency } from '../../lib/formatters'

interface ClassScheduleRowProps {
  session: ClassSession
  index: number
  isLast: boolean
  showSignUp?: boolean
}

export function ClassScheduleRow({
  session,
  index,
  isLast,
  showSignUp = true,
}: ClassScheduleRowProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const isVip = Boolean(session.isVipSession)
  const typeStyles = getClassTypeStyles(session.classType)

  return (
    <article className="relative pl-8 sm:pl-10">
      <div
        className={`absolute left-[0.6875rem] top-0 w-px sm:left-[0.8125rem] ${
          isLast ? 'h-8' : 'h-full'
        } bg-brand-ink/10`}
        aria-hidden="true"
      />
      <div
        className={`absolute left-0 top-1.5 size-[1.375rem] rounded-full border-2 border-white sm:top-2 sm:size-6 ${
          isVip ? VIP_SESSION_STYLES.dot : typeStyles.stripe
        } shadow-[0_0_0_1px_rgba(10,10,10,0.08)]`}
        aria-hidden="true"
      />

      <div
        className={`group relative overflow-hidden rounded-[1px] border transition-all duration-300 hover:-translate-y-0.5 ${
          isVip
            ? `${VIP_SESSION_STYLES.card} hover:border-[#c9a227]/50 hover:shadow-[0_16px_36px_rgba(201,162,39,0.16)]`
            : 'border-brand-ink/[0.08] bg-white hover:border-brand-ink/15 hover:shadow-[0_12px_28px_rgba(10,10,10,0.07)]'
        } ${isLast ? 'mb-0' : 'mb-4 sm:mb-5'}`}
      >
        <div className={`absolute inset-y-0 left-0 w-1 ${typeStyles.stripe}`} aria-hidden="true" />

        <div className="grid gap-4 p-4 pl-5 sm:grid-cols-[5.5rem_minmax(0,1fr)_minmax(0,7.5rem)_auto] sm:items-start sm:gap-5 sm:p-5 sm:pl-6 lg:grid-cols-[6rem_minmax(0,1fr)_minmax(0,8.5rem)_7.5rem] lg:gap-7">
          <div className="sm:pt-0.5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-brand-muted sm:text-[11px]">
              {String(index + 1).padStart(2, '0')}
            </p>
            <p className="mt-1 text-lg font-medium tabular-nums tracking-[-0.02em] text-brand-ink sm:text-xl">
              {getStartTime(session.time)}
            </p>
            <p className="mt-0.5 text-[11px] text-brand-muted sm:text-xs">{session.duration}</p>
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`inline-flex rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.1em] ${typeStyles.pill} ${typeStyles.pillText}`}
              >
                {isVip ? CLASSES_PAGE_COPY.vipSessionLabel : session.classType}
              </span>
            </div>

            <h3 className="mt-2 text-base font-medium leading-snug tracking-[-0.01em] text-brand-ink sm:text-[1.125rem]">
              {session.className}
            </h3>
            <p className="mt-1 text-sm text-brand-muted">{session.instructorName}</p>

            <button
              type="button"
              onClick={() => setIsExpanded((expanded) => !expanded)}
              className="mt-2.5 inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-brand-ink/70 transition-colors duration-300 hover:text-brand-ink sm:text-[11px]"
              aria-expanded={isExpanded}
            >
              {isExpanded ? CLASSES_PAGE_COPY.hideDetails : CLASSES_PAGE_COPY.showDetails}
              <ChevronDown
                className={`size-3.5 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}
                aria-hidden="true"
              />
            </button>

            {isExpanded ? (
              <div className="mt-3 max-w-xl border-t border-brand-ink/[0.06] pt-3 text-sm leading-relaxed text-brand-muted">
                <p className="font-medium text-brand-ink">{session.instructorRole}</p>
                <p className="mt-2">{session.description}</p>
                <p className="mt-2 tabular-nums">{session.time}</p>
                {isVip && session.feePerPersonLKR != null ? (
                  <p className="mt-2">
                    {formatCurrency(session.feePerPersonLKR)} per person
                    {session.spotsRemaining != null
                      ? ` · ${session.spotsRemaining} spot${session.spotsRemaining === 1 ? '' : 's'} left`
                      : null}
                  </p>
                ) : null}
              </div>
            ) : null}
          </div>

          <div className="text-[10px] font-semibold uppercase leading-[1.35] tracking-[0.14em] text-brand-muted sm:text-[11px] sm:leading-[1.4]">
            {session.studio.split(' ').map((word) => (
              <span key={word} className="block">
                {word}
              </span>
            ))}
          </div>

          <div className="sm:flex sm:flex-col sm:items-end sm:justify-start sm:gap-2 sm:pt-1">
            {isVip ? (
              <>
                <span className="inline-flex min-h-[40px] w-full items-center justify-center border border-[#c9a227]/40 bg-[#c9a227]/10 px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#8a6508] sm:w-auto sm:min-w-[6.75rem] sm:text-[11px]">
                  {CLASSES_PAGE_COPY.vipMembershipRequired}
                </span>
                <AppLink
                  to={ROUTES.plans}
                  className="inline-flex min-h-[40px] w-full items-center justify-center border border-brand-ink bg-brand-ink px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-brand-ink/90 sm:w-auto sm:min-w-[6.75rem] sm:text-[11px]"
                >
                  {CLASSES_PAGE_COPY.vipJoinCta}
                </AppLink>
                <p className="max-w-[9rem] text-center text-[10px] leading-snug text-brand-muted sm:text-[11px]">
                  {CLASSES_PAGE_COPY.vipMembershipNote}
                </p>
              </>
            ) : showSignUp ? (
              <AppLink
                to={ROUTES.register}
                className="inline-flex min-h-[40px] w-full items-center justify-center border border-brand-ink bg-brand-ink px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-brand-ink/90 sm:w-auto sm:min-w-[6.75rem] sm:text-[11px]"
              >
                {CLASSES_PAGE_COPY.signUpCta}
              </AppLink>
            ) : null}
          </div>
        </div>
      </div>
    </article>
  )
}
