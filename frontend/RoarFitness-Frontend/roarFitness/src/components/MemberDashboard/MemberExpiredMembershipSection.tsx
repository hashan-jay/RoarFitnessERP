import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { AlertCircle } from 'lucide-react'

import { ROUTES } from '../../routes/paths'
import type { MemberDashboardData } from '../../types/member'

export const MEMBERSHIP_RENEW_MESSAGES = {
  plans: 'Please renew your membership to access Workout / Meal plan requests from instructors.',
  vipSessions: 'Please renew your membership to enroll in VIP Sessions.',
  profile: 'Please renew your membership to update profile details.',
} as const

export function isMemberMembershipExpired(data: MemberDashboardData): boolean {
  return data.membership.status !== 'active'
}

interface MemberExpiredMembershipSectionProps {
  expired: boolean
  message: string
  children: ReactNode
}

/** Shows a renew banner and greys out section content when membership is expired. */
export function MemberExpiredMembershipSection({
  expired,
  message,
  children,
}: MemberExpiredMembershipSectionProps) {
  if (!expired) {
    return <>{children}</>
  }

  return (
    <div className="space-y-5">
      <div
        role="status"
        className="flex gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3.5 text-sm leading-relaxed text-amber-950"
      >
        <AlertCircle className="mt-0.5 size-4 shrink-0 text-amber-700" aria-hidden="true" />
        <p>
          {message}{' '}
          <Link
            to={`${ROUTES.dashboard}/renew`}
            className="font-semibold text-amber-950 underline underline-offset-2"
          >
            Renew membership
          </Link>
        </p>
      </div>

      <div
        className="pointer-events-none select-none opacity-45 grayscale"
        aria-disabled="true"
      >
        {children}
      </div>
    </div>
  )
}
