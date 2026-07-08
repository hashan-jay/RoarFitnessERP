/** Member portal models — swap mock sources for API responses later */

export type MembershipStatus = 'active' | 'pending' | 'expired' | 'cancelled'

export interface MemberProfile {
  memberId: string
  firstName: string
  lastName: string
  email: string
}

export interface MemberMembership {
  planId: string
  planName: string
  status: MembershipStatus
  expiresAt: string | null
}

export interface MemberAlert {
  id: string
  title: string
  message: string
  tone: 'info' | 'warning'
}

export interface MemberDashboardData {
  profile: MemberProfile
  membership: MemberMembership
  alerts: MemberAlert[]
  isRestricted: boolean
}
