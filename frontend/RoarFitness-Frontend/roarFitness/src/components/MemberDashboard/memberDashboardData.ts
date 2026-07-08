import type { MemberProfile as ApiMemberProfile } from '../../types/api'
import type { AuthUser } from '../../types/auth'
import type { MemberAlert, MemberDashboardData } from '../../types/member'
import { formatAppDate } from '../../lib/formatters'
import { buildMemberId } from '../../utils/memberId'

const FINGERPRINT_ACTIVATION_ALERT: MemberAlert = {
  id: 'fingerprint-activation',
  title: 'Fingerprint Activation Required',
  message:
    'Please visit the front desk to complete your biometric enrollment. Access to the gym floor requires an active fingerprint profile.',
  tone: 'info',
}

function fingerprintAlerts(isFingerprintActivated?: boolean): MemberAlert[] {
  return isFingerprintActivated ? [] : [FINGERPRINT_ACTIVATION_ALERT]
}

function estimateExpiry(planId?: string): string | null {
  if (!planId) return null

  const expires = new Date()
  if (planId.includes('monthly')) {
    expires.setMonth(expires.getMonth() + 1)
  } else if (planId.includes('quarterly')) {
    expires.setMonth(expires.getMonth() + 3)
  } else if (planId.includes('annual') || planId.includes('elite')) {
    expires.setFullYear(expires.getFullYear() + 1)
  } else {
    expires.setMonth(expires.getMonth() + 1)
  }

  return expires.toISOString()
}

export function buildMemberDashboardDataFromProfile(
  profile: ApiMemberProfile,
  user: AuthUser,
): MemberDashboardData {
  const nameParts = profile.fullName.trim().split(/\s+/)
  const firstName = user.firstName || nameParts[0] || ''
  const lastName = user.lastName || nameParts.slice(1).join(' ') || ''

  const membership = profile.membership
  const status = membership?.isActive
    ? 'active'
    : membership
      ? 'expired'
      : 'pending'

  return {
    profile: {
      memberId: profile.identificationNumber,
      firstName,
      lastName,
      email: profile.email,
    },
    membership: {
      planId: membership?.packageName ?? 'unknown',
      planName: membership?.packageName ?? 'No active plan',
      status,
      expiresAt: membership?.endDate ?? null,
    },
    alerts: fingerprintAlerts(profile.isFingerprintActivated),
    isRestricted: Boolean(profile.isTerminated),
  }
}

/**
 * Builds dashboard view-model from the signed-in user (fallback when API is unavailable).
 */
export function getMemberDashboardData(user: AuthUser): MemberDashboardData {
  return {
    profile: {
      memberId: buildMemberId(user.email),
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
    },
    membership: {
      planId: user.planId ?? 'unknown',
      planName: user.planName ?? 'No active plan',
      status: user.planName ? 'active' : 'pending',
      expiresAt: estimateExpiry(user.planId),
    },
    alerts: [],
    isRestricted: false,
  }
}

export function formatMemberDate(iso: string | null): string {
  if (!iso) return '—'
  return formatAppDate(iso)
}

export function formatStatusLabel(status: string): string {
  return status.toUpperCase()
}
