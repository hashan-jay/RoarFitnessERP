import { useEffect, useState, type ReactNode } from 'react'
import { CreditCard } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import {
  formatCurrency,
  formatDate,
} from '../../lib/formatters'
import {
  ApiError,
  membershipService,
  paymentService,
  publicService,
} from '../../services'
import { ROUTES } from '../../routes/paths'
import type { MemberProfile, MembershipPackage } from '../../types/api'
import type { MemberDashboardData } from '../../types/member'
import { savePendingPayment } from '../../utils/pendingPaymentStorage'
import { formatMemberDate, formatStatusLabel } from './memberDashboardData'
import { usePortalToast } from '../PortalToast/PortalToast'

interface MemberMembershipRenewPageProps {
  data: MemberDashboardData
}

function estimateNextStartDate(profile: MemberProfile | null): Date {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  if (profile?.queuedMembership?.endDate) {
    const queuedEnd = new Date(profile.queuedMembership.endDate)
    queuedEnd.setHours(0, 0, 0, 0)
    queuedEnd.setDate(queuedEnd.getDate() + 1)
    return queuedEnd
  }

  if (profile?.membership?.isActive && profile.membership.endDate) {
    const currentEnd = new Date(profile.membership.endDate)
    currentEnd.setHours(0, 0, 0, 0)
    currentEnd.setDate(currentEnd.getDate() + 1)
    return currentEnd
  }

  return today
}

export function MemberMembershipRenewPage({ data }: MemberMembershipRenewPageProps) {
  const navigate = useNavigate()
  const toast = usePortalToast()
  const { membership } = data
  const [profile, setProfile] = useState<MemberProfile | null>(null)
  const [packages, setPackages] = useState<MembershipPackage[]>([])
  const [loading, setLoading] = useState(true)
  const [renewPackageId, setRenewPackageId] = useState(0)
  const [renewing, setRenewing] = useState(false)

  useEffect(() => {
    Promise.all([membershipService.getProfile(), publicService.getPackages()])
      .then(([loadedProfile, pkgs]) => {
        setProfile(loadedProfile)
        setPackages(pkgs)
        if (pkgs.length > 0) setRenewPackageId(pkgs[0].packageId)
      })
      .catch(() => toast.error('Could not load membership details.'))
      .finally(() => setLoading(false))
  }, [])

  const selectedPackage = packages.find((pkg) => pkg.packageId === renewPackageId)
  const nextStartDate = estimateNextStartDate(profile)
  const nextEndDate = selectedPackage
    ? new Date(nextStartDate.getTime() + selectedPackage.durationDays * 86400000)
    : null
  const isActive = profile?.membership?.isActive ?? membership.status === 'active'

  const handleRenew = async () => {
    const pkg = packages.find((item) => item.packageId === renewPackageId)
    const email = profile?.email ?? data.profile.email
    if (!pkg || !email) return

    setRenewing(true)

    try {
      const payment = await paymentService.initMembershipRenewal(
        { amountLKR: pkg.priceLKR, email },
        pkg.packageId,
      )

      savePendingPayment({
        kind: 'membership-renewal',
        paymentReference: payment.paymentReference,
        packageId: pkg.packageId,
        amountLKR: pkg.priceLKR,
        title: pkg.packageName,
        description: isActive
          ? 'Queued membership — starts after your current plan expires.'
          : 'Membership renewal — access restored when the new period starts.',
        cardholderName:
          profile?.fullName ?? `${data.profile.firstName} ${data.profile.lastName}`.trim(),
        returnPath: `${ROUTES.dashboard}/renew`,
        returnLabel: 'Back to membership',
      })
      navigate(ROUTES.payment)
    } catch (err) {
      toast.error(
        err instanceof ApiError
          ? err.message
          : 'Could not start payment. Ensure the API is running and try again.',
      )
      setRenewing(false)
    }
  }

  return (
    <div className="space-y-8">
      <header className="border-b border-portal-line pb-6">
        <p className="text-xs font-medium text-portal-muted">Membership</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-portal-ink sm:text-3xl">
          Renew membership
        </h1>
        <p className="mt-2 max-w-xl text-sm text-portal-muted">
          Buy or renew your membership online. If your current plan is still active, the new
          period starts the day after it expires.
        </p>
      </header>

      {loading ? (
        <p className="text-sm text-portal-muted">Loading membership details…</p>
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-3">
            <InfoTile label="Current plan" value={profile?.membership?.packageName ?? membership.planName} />
            <InfoTile
              label="Status"
              value={
                <span
                  className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                    isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                  }`}
                >
                  {formatStatusLabel(isActive ? 'active' : 'expired')}
                </span>
              }
            />
            <InfoTile
              label={isActive ? 'Expires' : 'Expired'}
              value={formatMemberDate(
                profile?.membership?.endDate ?? membership.expiresAt,
              )}
            />
          </div>

          {profile?.queuedMembership && (
            <div className="portal-widget-3d rounded-xl border border-sky-100 bg-gradient-to-br from-white via-sky-50/70 to-blue-50/50 p-5">
              <h2 className="text-sm font-semibold text-portal-ink">Queued membership</h2>
              <p className="mt-2 text-sm text-portal-muted">
                {profile.queuedMembership.packageName} ·{' '}
                {formatDate(profile.queuedMembership.startDate)} –{' '}
                {formatDate(profile.queuedMembership.endDate)}
              </p>
            </div>
          )}

          <section className="portal-widget-3d rounded-xl border border-portal-line bg-portal-card p-5 sm:p-6">
            <h2 className="text-base font-semibold text-portal-ink">
              {isActive ? 'Buy next membership' : 'Pay & renew online'}
            </h2>
            <p className="mt-2 text-sm text-portal-muted">
              {isActive
                ? 'Your current membership stays active until its expiry date. The package you buy now will automatically start on the next day.'
                : 'Choose a membership package and pay by card. Access is restored when the new period starts today.'}
            </p>

            <label className="mt-5 block">
              <span className="mb-1.5 block text-xs text-portal-muted">Membership package</span>
              <select
                value={renewPackageId}
                onChange={(event) => setRenewPackageId(Number(event.target.value))}
                className="w-full rounded-lg border border-portal-line bg-portal-canvas px-3 py-2.5 text-sm text-portal-ink outline-none focus:border-portal-ink"
              >
                {packages.map((pkg) => (
                  <option key={pkg.packageId} value={pkg.packageId}>
                    {pkg.packageName} — {formatCurrency(pkg.priceLKR)} ({pkg.durationDays} days)
                  </option>
                ))}
              </select>
            </label>

            {selectedPackage && nextEndDate && (
              <p className="mt-4 text-sm text-portal-muted">
                New period: {formatDate(nextStartDate.toISOString())} to{' '}
                {formatDate(nextEndDate.toISOString())}
              </p>
            )}

            <p className="mt-3 text-sm text-portal-muted">
              Card payments only. To pay with cash or card at reception, ask the admin desk to
              process your membership.
            </p>

            <button
              type="button"
              disabled={renewing || packages.length === 0}
              onClick={() => void handleRenew()}
              className="mt-5 inline-flex min-h-[42px] items-center justify-center gap-2 rounded-lg bg-portal-ink px-4 text-sm font-medium text-white transition hover:bg-black disabled:opacity-50"
            >
              <CreditCard className="size-4" aria-hidden="true" />
              {renewing ? 'Opening payment…' : 'Proceed to card payment'}
            </button>
          </section>
        </>
      )}
    </div>
  )
}

function InfoTile({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="portal-widget-3d rounded-xl border border-portal-line bg-portal-card px-4 py-4">
      <p className="text-xs text-portal-muted">{label}</p>
      <div className="mt-2 text-base font-semibold text-portal-ink">{value}</div>
    </div>
  )
}
