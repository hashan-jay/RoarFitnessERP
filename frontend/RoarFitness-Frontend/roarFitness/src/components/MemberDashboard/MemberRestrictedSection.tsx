import type { ReactNode } from 'react'
import { AlertCircle } from 'lucide-react'

import type { MemberDashboardData } from '../../types/member'

export const RESTRICTED_ACCOUNT_MESSAGE =
  'You have been restricted. Please contact the gym reception for more info.'

export function isMemberRestricted(data: MemberDashboardData): boolean {
  return data.isRestricted
}

interface MemberRestrictedAccountBannerProps {
  message?: string
}

/** Red warning banner for admin-restricted member accounts. */
export function MemberRestrictedAccountBanner({
  message = RESTRICTED_ACCOUNT_MESSAGE,
}: MemberRestrictedAccountBannerProps) {
  return (
    <div
      role="alert"
      className="flex gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3.5 text-sm leading-relaxed text-red-950"
    >
      <AlertCircle className="mt-0.5 size-4 shrink-0 text-red-700" aria-hidden="true" />
      <p className="font-medium">{message}</p>
    </div>
  )
}

interface MemberRestrictedSectionProps {
  restricted: boolean
  children: ReactNode
}

/** Greys out section content when the member account has been restricted by admin. */
export function MemberRestrictedSection({
  restricted,
  children,
}: MemberRestrictedSectionProps) {
  if (!restricted) {
    return <>{children}</>
  }

  return (
    <div
      className="pointer-events-none select-none opacity-45 grayscale"
      aria-disabled="true"
    >
      {children}
    </div>
  )
}
