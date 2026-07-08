import { type FormEvent, useEffect, useMemo, useState } from 'react'
import { X } from 'lucide-react'

import {
  calculateAgeFromDateOfBirth,
  formatAppDate,
  toDateInputValue,
} from '../../lib/formatters'
import { membershipService, memberPlanService } from '../../services'
import type {
  MemberFitnessPlan,
  MemberFitnessPlanSummary,
  MemberProfile,
  UpdateProfileRequest,
} from '../../types/api'
import type { MemberDashboardData } from '../../types/member'
import {
  isMemberMembershipExpired,
  MEMBERSHIP_RENEW_MESSAGES,
  MemberExpiredMembershipSection,
} from './MemberExpiredMembershipSection'
import { usePortalToast } from '../PortalToast/PortalToast'

interface MemberProfileSettingsProps {
  data: MemberDashboardData
}

export function MemberProfileSettings({ data }: MemberProfileSettingsProps) {
  const toast = usePortalToast()
  const membershipExpired = isMemberMembershipExpired(data)
  const [profile, setProfile] = useState<MemberProfile | null>(null)
  const [plans, setPlans] = useState<MemberFitnessPlanSummary[]>([])
  const [selectedPlan, setSelectedPlan] = useState<MemberFitnessPlan | null>(null)
  const [planLoading, setPlanLoading] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [form, setForm] = useState({
    phone: '',
    addressLine1: '',
    city: '',
    country: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    dateOfBirth: '',
  })

  const computedAge = useMemo(
    () => calculateAgeFromDateOfBirth(form.dateOfBirth || profile?.dateOfBirth),
    [form.dateOfBirth, profile?.dateOfBirth],
  )

  useEffect(() => {
    void (async () => {
      setLoading(true)
      const [profileResult, plansResult] = await Promise.allSettled([
        membershipService.getProfile(),
        memberPlanService.getMemberPlans(),
      ])

      if (profileResult.status === 'fulfilled') {
        const loadedProfile = profileResult.value
        setProfile(loadedProfile)
        setForm({
          phone: loadedProfile.phone ?? '',
          addressLine1: loadedProfile.addressLine1 ?? '',
          city: loadedProfile.city ?? '',
          country: loadedProfile.country ?? 'Sri Lanka',
          emergencyContactName: loadedProfile.emergencyContactName ?? '',
          emergencyContactPhone: loadedProfile.emergencyContactPhone ?? '',
          dateOfBirth: toDateInputValue(loadedProfile.dateOfBirth),
        })
      } else {
        toast.error('Could not load profile.')
      }

      if (plansResult.status === 'fulfilled') {
        setPlans(plansResult.value)
      }

      setLoading(false)
    })()
  }, [])

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()

    if (membershipExpired) {
      return
    }

    setSaving(true)

    const payload: UpdateProfileRequest = {
      phone: form.phone,
      addressLine1: form.addressLine1,
      city: form.city,
      country: form.country,
      emergencyContactName: form.emergencyContactName,
      emergencyContactPhone: form.emergencyContactPhone,
    }

    if (form.dateOfBirth) {
      payload.dateOfBirth = form.dateOfBirth
    }

    try {
      await membershipService.updateMemberProfile(payload)
      toast.success('Profile updated successfully.')
    } catch {
      toast.error('Failed to update profile.')
    } finally {
      setSaving(false)
    }
  }

  const openPlan = async (planId: number) => {
    setPlanLoading(true)
    try {
      const plan = await memberPlanService.getMemberPlan(planId)
      setSelectedPlan(plan)
    } catch {
      toast.error('Could not load plan details.')
    } finally {
      setPlanLoading(false)
    }
  }

  const displayName = profile?.fullName ?? `${data.profile.firstName} ${data.profile.lastName}`
  const memberId = profile?.identificationNumber ?? data.profile.memberId
  const email = profile?.email ?? data.profile.email

  return (
    <div className="space-y-8">
      <header className="border-b border-portal-line pb-6">
        <p className="text-xs font-medium text-portal-muted">Settings</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-portal-ink sm:text-3xl">
          Profile settings
        </h1>
        <p className="mt-2 text-sm text-portal-muted">
          Update your contact details and date of birth. Name, email, member ID, and NIC cannot be
          changed here — contact the gym if your NIC needs to be updated.
        </p>
      </header>

      <MemberExpiredMembershipSection
        expired={membershipExpired}
        message={MEMBERSHIP_RENEW_MESSAGES.profile}
      >
      {loading ? (
        <p className="text-sm text-portal-muted">Loading profile…</p>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          <section className="portal-widget-3d rounded-xl border border-portal-line bg-portal-card p-5 sm:p-6">
            <h2 className="text-base font-semibold text-portal-ink">Account information</h2>
            <dl className="mt-5 space-y-4">
              <div>
                <dt className="text-xs text-portal-muted">Full name</dt>
                <dd className="mt-1 text-sm font-medium text-portal-ink">{displayName}</dd>
              </div>
              <div>
                <dt className="text-xs text-portal-muted">Email</dt>
                <dd className="mt-1 text-sm font-medium text-portal-ink">{email}</dd>
              </div>
              <div>
                <dt className="text-xs text-portal-muted">Member ID</dt>
                <dd className="mt-1 font-mono text-sm font-medium text-portal-ink">{memberId}</dd>
              </div>
              <div>
                <dt className="text-xs text-portal-muted">NIC</dt>
                <dd className="mt-1 text-sm font-medium text-portal-ink">
                  {profile?.nicNumber?.trim() || '—'}
                </dd>
              </div>
            </dl>
          </section>

          <form
            onSubmit={handleSubmit}
            className="portal-widget-3d rounded-xl border border-portal-line bg-portal-card p-5 sm:p-6"
          >
            <h2 className="text-base font-semibold text-portal-ink">Editable details</h2>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <label className="block sm:col-span-2">
                <span className="mb-1.5 block text-xs text-portal-muted">Date of birth</span>
                <input
                  type="date"
                  value={form.dateOfBirth}
                  max={toDateInputValue(new Date().toISOString())}
                  onChange={(event) => setForm({ ...form, dateOfBirth: event.target.value })}
                  className="w-full rounded-lg border border-portal-line bg-portal-canvas px-3 py-2.5 text-sm text-portal-ink outline-none focus:border-portal-ink"
                />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-xs text-portal-muted">Age</span>
                <input
                  readOnly
                  value={computedAge != null ? `${computedAge} years` : '—'}
                  className="w-full rounded-lg border border-portal-line bg-portal-canvas px-3 py-2.5 text-sm text-portal-muted"
                />
              </label>
              <label className="block sm:col-span-2">
                <span className="mb-1.5 block text-xs text-portal-muted">Phone</span>
                <input
                  value={form.phone}
                  onChange={(event) => setForm({ ...form, phone: event.target.value })}
                  className="w-full rounded-lg border border-portal-line bg-portal-canvas px-3 py-2.5 text-sm text-portal-ink outline-none focus:border-portal-ink"
                />
              </label>
              <label className="block sm:col-span-2">
                <span className="mb-1.5 block text-xs text-portal-muted">Address</span>
                <input
                  value={form.addressLine1}
                  onChange={(event) => setForm({ ...form, addressLine1: event.target.value })}
                  className="w-full rounded-lg border border-portal-line bg-portal-canvas px-3 py-2.5 text-sm text-portal-ink outline-none focus:border-portal-ink"
                />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-xs text-portal-muted">City</span>
                <input
                  value={form.city}
                  onChange={(event) => setForm({ ...form, city: event.target.value })}
                  className="w-full rounded-lg border border-portal-line bg-portal-canvas px-3 py-2.5 text-sm text-portal-ink outline-none focus:border-portal-ink"
                />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-xs text-portal-muted">Country</span>
                <input
                  value={form.country}
                  onChange={(event) => setForm({ ...form, country: event.target.value })}
                  className="w-full rounded-lg border border-portal-line bg-portal-canvas px-3 py-2.5 text-sm text-portal-ink outline-none focus:border-portal-ink"
                />
              </label>
              <label className="block sm:col-span-2">
                <span className="mb-1.5 block text-xs text-portal-muted">Emergency contact name</span>
                <input
                  value={form.emergencyContactName}
                  onChange={(event) =>
                    setForm({ ...form, emergencyContactName: event.target.value })
                  }
                  className="w-full rounded-lg border border-portal-line bg-portal-canvas px-3 py-2.5 text-sm text-portal-ink outline-none focus:border-portal-ink"
                />
              </label>
              <label className="block sm:col-span-2">
                <span className="mb-1.5 block text-xs text-portal-muted">Emergency contact phone</span>
                <input
                  value={form.emergencyContactPhone}
                  onChange={(event) =>
                    setForm({ ...form, emergencyContactPhone: event.target.value })
                  }
                  className="w-full rounded-lg border border-portal-line bg-portal-canvas px-3 py-2.5 text-sm text-portal-ink outline-none focus:border-portal-ink"
                />
              </label>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="mt-5 inline-flex min-h-[42px] items-center justify-center rounded-lg bg-portal-ink px-4 text-sm font-medium text-white transition hover:bg-black disabled:opacity-50"
            >
              {saving ? 'Saving…' : 'Save changes'}
            </button>
          </form>
        </div>
      )}
      </MemberExpiredMembershipSection>

      <section className="portal-widget-3d rounded-xl border border-portal-line bg-portal-card p-5 sm:p-6">
        <h2 className="text-base font-semibold text-portal-ink">Approved plans</h2>
        <p className="mt-1 text-sm text-portal-muted">
          Workout and meal plans sent by your instructor.
        </p>

        {plans.length === 0 ? (
          <p className="mt-6 text-sm text-portal-muted">No approved plans yet.</p>
        ) : (
          <ul className="mt-6 divide-y divide-portal-line">
            {plans.map((plan) => (
              <li key={plan.planId} className="flex flex-wrap items-center justify-between gap-3 py-4 first:pt-0">
                <div>
                  <p className="text-sm font-semibold text-portal-ink">
                    {plan.planCategory} plan
                  </p>
                  <p className="mt-1 text-xs text-portal-muted">
                    {plan.instructorName} · Updated {formatAppDate(plan.updatedAt)}
                  </p>
                </div>
                <button
                  type="button"
                  disabled={planLoading}
                  onClick={() => void openPlan(plan.planId)}
                  className="rounded-lg border border-portal-line px-3.5 py-2 text-sm font-medium text-portal-ink transition hover:bg-portal-canvas disabled:opacity-50"
                >
                  View description
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      {selectedPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button
            type="button"
            className="absolute inset-0 bg-portal-ink/20"
            aria-label="Close plan details"
            onClick={() => setSelectedPlan(null)}
          />
          <div className="portal-widget-3d relative z-10 max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-xl border border-portal-line bg-portal-card p-6 shadow-xl">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-portal-ink">
                  {selectedPlan.planCategory} plan
                </h2>
                <p className="mt-1 text-sm text-portal-muted">
                  {selectedPlan.instructorName}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedPlan(null)}
                className="flex size-8 shrink-0 items-center justify-center rounded-lg text-portal-muted transition hover:bg-portal-canvas hover:text-portal-ink"
                aria-label="Close"
              >
                <X className="size-4" />
              </button>
            </div>
            <section className="mt-5 border-t border-portal-line pt-5">
              <h3 className="text-xs font-medium uppercase tracking-wide text-portal-muted">
                The plan
              </h3>
              <pre className="mt-3 whitespace-pre-wrap font-sans text-sm leading-relaxed text-portal-ink">
                {selectedPlan.description}
              </pre>
            </section>
            {selectedPlan.notes && (
              <section className="mt-5 border-t border-portal-line pt-5">
                <h3 className="text-xs font-medium uppercase tracking-wide text-portal-muted">
                  Notes
                </h3>
                <pre className="mt-3 whitespace-pre-wrap font-sans text-sm leading-relaxed text-portal-ink">
                  {selectedPlan.notes}
                </pre>
              </section>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
