import { useEffect, useState } from 'react'
import { Clock, UserRound, Users } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import {
  formatCurrency,
  formatSessionRange,
} from '../../lib/formatters'
import { isSessionExpired } from '../../lib/sessionUtils'
import { useAuth } from '../../context/AuthContext'
import { ApiError, paymentService, sessionService } from '../../services'
import { ROUTES } from '../../routes/paths'
import type { SpecialSession } from '../../types/api'
import { savePendingPayment } from '../../utils/pendingPaymentStorage'
import type { MemberDashboardData } from '../../types/member'
import {
  isMemberMembershipExpired,
  MEMBERSHIP_RENEW_MESSAGES,
  MemberExpiredMembershipSection,
} from './MemberExpiredMembershipSection'
import { usePortalToast } from '../PortalToast/PortalToast'

interface MemberSpecialSessionsPageProps {
  data: MemberDashboardData
}

type SessionTab = 'available' | 'mine'

export function MemberSpecialSessionsPage({ data }: MemberSpecialSessionsPageProps) {
  const navigate = useNavigate()
  const toast = usePortalToast()
  const { user } = useAuth()
  const membershipExpired = isMemberMembershipExpired(data)
  const [tab, setTab] = useState<SessionTab>('available')
  const [available, setAvailable] = useState<SpecialSession[]>([])
  const [mine, setMine] = useState<SpecialSession[]>([])
  const [loading, setLoading] = useState(true)
  const [enrollingId, setEnrollingId] = useState<number | null>(null)

  const load = async () => {
    setLoading(true)
    try {
      const [availableSessions, mySessions] = await Promise.all([
        sessionService.getAvailableSessions(),
        sessionService.getMySessions(),
      ])
      setAvailable(availableSessions)
      setMine(mySessions)
    } catch {
      toast.error('Could not load special sessions.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [])

  const handleEnroll = async (session: SpecialSession) => {
    if (membershipExpired) {
      return
    }

    setEnrollingId(session.sessionId)
    try {
      const payment = await paymentService.initSessionPayment(session.sessionId)

      savePendingPayment({
        kind: 'session',
        paymentReference: payment.paymentReference,
        sessionId: session.sessionId,
        amountLKR: session.feePerPersonLKR,
        title: session.title,
        description: `${session.instructorName} · ${formatSessionRange(session.startDateTime, session.endDateTime)}`,
        cardholderName: user ? `${user.firstName} ${user.lastName}`.trim() : 'Member',
        returnPath: `${ROUTES.dashboard}/sessions`,
        returnLabel: 'Back to VIP Sessions',
      })
      navigate(ROUTES.payment)
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Could not start enrollment payment.')
      setEnrollingId(null)
    }
  }

  const sessions = tab === 'available' ? available : mine

  return (
    <div className="space-y-8">
      <header className="border-b border-portal-line pb-6">
        <p className="text-xs font-medium text-portal-muted">VIP Sessions</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-portal-ink sm:text-3xl">
          VIP Sessions
        </h1>
        <p className="mt-2 max-w-xl text-sm text-portal-muted">
          Book instructor-led special sessions. Pay online to secure your spot.
        </p>
      </header>

      <MemberExpiredMembershipSection
        expired={membershipExpired}
        message={MEMBERSHIP_RENEW_MESSAGES.vipSessions}
      >
      <div className="flex gap-1 border-b border-portal-line pb-px">
        <TabButton
          label="Available"
          active={tab === 'available'}
          onClick={() => setTab('available')}
        />
        <TabButton
          label="My Sessions"
          active={tab === 'mine'}
          onClick={() => setTab('mine')}
        />
      </div>

      {loading ? (
        <p className="text-sm text-portal-muted">Loading sessions…</p>
      ) : sessions.length === 0 ? (
        <div className="portal-widget-3d rounded-xl border border-dashed border-portal-line bg-portal-card px-5 py-12 text-center">
          <p className="text-sm text-portal-muted">
            {tab === 'available'
              ? 'No special sessions available right now.'
              : 'You have not enrolled in any sessions yet.'}
          </p>
        </div>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {sessions.map((session) => {
            const expired = isSessionExpired(session)
            const enrollDisabled =
              expired || session.spotsRemaining <= 0 || enrollingId === session.sessionId

            return (
              <li
                key={session.sessionId}
                className={`portal-widget-3d rounded-xl border p-5 ${
                  tab === 'mine' && expired
                    ? 'border-portal-line bg-portal-canvas opacity-75'
                    : 'border-orange-100 bg-gradient-to-br from-white via-orange-50/40 to-amber-50/30'
                }`}
              >
                <h3 className="text-base font-semibold text-portal-ink">{session.title}</h3>
                <p className="mt-2 line-clamp-2 text-sm text-portal-muted">{session.description}</p>

                <ul className="mt-4 space-y-2 text-xs text-portal-muted">
                  <li className="inline-flex w-full items-center gap-1.5">
                    <Clock className="size-3.5 shrink-0" aria-hidden="true" />
                    {formatSessionRange(session.startDateTime, session.endDateTime)}
                  </li>
                  <li className="inline-flex w-full items-center gap-1.5">
                    <UserRound className="size-3.5 shrink-0" aria-hidden="true" />
                    {session.instructorName}
                  </li>
                  <li className="inline-flex w-full items-center gap-1.5">
                    <Users className="size-3.5 shrink-0" aria-hidden="true" />
                    {session.spotsRemaining} spot{session.spotsRemaining === 1 ? '' : 's'} remaining ·{' '}
                    {formatCurrency(session.feePerPersonLKR)}
                  </li>
                </ul>

                <div className="mt-5">
                  {tab === 'available' ? (
                    <button
                      type="button"
                      disabled={enrollDisabled}
                      onClick={() => void handleEnroll(session)}
                      className="inline-flex min-h-[36px] w-full items-center justify-center rounded-lg bg-portal-ink px-4 text-sm font-medium text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {enrollingId === session.sessionId
                        ? 'Opening payment…'
                        : expired
                          ? 'Expired'
                          : session.spotsRemaining <= 0
                            ? 'Full'
                            : 'Enroll'}
                    </button>
                  ) : (
                    <span className="inline-flex rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                      Enrolled
                    </span>
                  )}
                </div>
              </li>
            )
          })}
        </ul>
      )}
      </MemberExpiredMembershipSection>
    </div>
  )
}

function TabButton({
  label,
  active,
  onClick,
}: {
  label: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`shrink-0 border-b-2 px-3 py-2.5 text-sm font-medium transition ${
        active
          ? 'border-portal-ink text-portal-ink'
          : 'border-transparent text-portal-muted hover:text-portal-ink'
      }`}
    >
      {label}
    </button>
  )
}
