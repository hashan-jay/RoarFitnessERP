import { useEffect, useState } from 'react'

import { formatCurrency, formatDate } from '../../lib/formatters'
import { ApiError, membershipRenewService, publicService } from '../../services'
import type { AdminMemberListItem, MembershipPackage, MembershipRenewBill } from '../../types/api'
import { usePortalToast } from '../PortalToast/PortalToast'

type Step = 'package' | 'payment'

interface AdminMembershipRenewModalProps {
  member: AdminMemberListItem
  onClose: () => void
  onBillGenerated: (bill: MembershipRenewBill) => void
}

export function AdminMembershipRenewModal({ member, onClose, onBillGenerated }: AdminMembershipRenewModalProps) {
  const toast = usePortalToast()
  const [packages, setPackages] = useState<MembershipPackage[]>([])
  const [loadingPackages, setLoadingPackages] = useState(true)
  const [step, setStep] = useState<Step>('package')
  const [packageId, setPackageId] = useState(0)
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'Card'>('Cash')
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    publicService
      .getPackages()
      .then((pkgs) => {
        setPackages(pkgs)
        if (pkgs.length > 0) setPackageId(pkgs[0].packageId)
      })
      .catch(() => setPackages([]))
      .finally(() => setLoadingPackages(false))
  }, [])

  const selectedPackage = packages.find((pkg) => pkg.packageId === packageId)

  const handleCompletePayment = async (method: 'Cash' | 'Card') => {
    if (!packageId) return
    setPaymentMethod(method)
    setProcessing(true)
    try {
      const result = await membershipRenewService.renewMembershipInGym(
        member.memberId,
        packageId,
        method,
      )
      onBillGenerated(result)
      onClose()
    } catch (err) {
      toast.error(
        err instanceof ApiError ? err.message : 'Payment could not be completed.',
      )
    } finally {
      setProcessing(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-portal-ink/40 p-4">
      <div
        className="portal-widget-3d max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl border border-portal-line bg-portal-card p-6 shadow-xl"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-portal-ink">
              Renew membership — {member.fullName}
            </h2>
            <p className="mt-1 text-sm text-portal-muted">{member.identificationNumber}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-portal-line px-2 py-1 text-sm text-portal-muted hover:text-portal-ink"
          >
            Close
          </button>
        </div>

        {loadingPackages ? (
          <p className="mt-6 text-sm text-portal-muted">Loading packages…</p>
        ) : step === 'package' ? (
          <div className="mt-5 space-y-4">
            <label className="block">
              <span className="mb-1.5 block text-xs text-portal-muted">Package</span>
              <select
                className={inputClass}
                value={packageId}
                onChange={(event) => setPackageId(Number(event.target.value))}
              >
                {packages.map((pkg) => (
                  <option key={pkg.packageId} value={pkg.packageId}>
                    {pkg.packageName} — {formatCurrency(pkg.priceLKR)}
                  </option>
                ))}
              </select>
            </label>
            {selectedPackage && (
              <p className="text-sm text-portal-muted">
                {selectedPackage.durationDays} days · {formatCurrency(selectedPackage.priceLKR)}
              </p>
            )}
            <button
              type="button"
              onClick={() => setStep('payment')}
              disabled={!packageId}
              className={primaryBtnClass}
            >
              Continue to payment
            </button>
          </div>
        ) : (
          <div className="mt-5 space-y-4">
            <p className="text-sm text-portal-muted">
              Collect payment at the front desk for{' '}
              <strong className="text-portal-ink">{selectedPackage?.packageName}</strong>
              {' '}({formatCurrency(selectedPackage?.priceLKR ?? 0)}).
            </p>
            <div className="flex gap-2">
              {(['Cash', 'Card'] as const).map((method) => (
                <button
                  key={method}
                  type="button"
                  disabled={processing}
                  onClick={() => void handleCompletePayment(method)}
                  className={`flex-1 rounded-lg border px-3 py-2.5 text-sm font-medium transition disabled:opacity-50 ${
                    paymentMethod === method
                      ? 'border-portal-ink bg-portal-accent-soft text-portal-ink'
                      : 'border-portal-line text-portal-muted hover:border-portal-ink/30'
                  }`}
                >
                  {processing && paymentMethod === method
                    ? 'Processing…'
                    : `Paid by ${method}`}
                </button>
              ))}
            </div>
            {member.membershipEndDate && (
              <p className="text-xs text-portal-muted">
                Previous expiry: {formatDate(member.membershipEndDate)}
              </p>
            )}
            <div className="flex gap-2">
              <button type="button" onClick={() => setStep('package')} className={secondaryBtnClass}>
                Back
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

const inputClass =
  'w-full rounded-lg border border-portal-line bg-portal-canvas px-3 py-2.5 text-sm text-portal-ink outline-none focus:border-portal-ink'

const primaryBtnClass =
  'rounded-lg bg-portal-ink px-4 py-2 text-sm font-medium text-white transition hover:bg-black disabled:opacity-50'

const secondaryBtnClass =
  'rounded-lg border border-portal-line px-4 py-2 text-sm font-medium text-portal-ink transition hover:bg-portal-canvas'
