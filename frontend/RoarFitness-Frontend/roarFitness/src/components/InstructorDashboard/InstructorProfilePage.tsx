import { useEffect, useState } from 'react'

import { trainerChristian } from '../../assets/images/trainers'
import { formatAppDate } from '../../lib/formatters'
import { membershipService } from '../../services'
import type { InstructorProfile } from '../../types/api'
import { useAuth } from '../../context/AuthContext'
import { usePortalToast } from '../PortalToast/PortalToast'

function resolveProfilePhotoPreview(url?: string | null): string {
  if (!url) return trainerChristian
  if (url.startsWith('http://') || url.startsWith('https://')) return url
  return url
}

function displayValue(value?: string | number | null): string {
  if (value === null || value === undefined) return '—'
  if (typeof value === 'string' && !value.trim()) return '—'
  return String(value)
}

function ProfileField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-portal-muted">{label}</dt>
      <dd className="mt-1 text-sm font-medium text-portal-ink">{value}</dd>
    </div>
  )
}

export function InstructorProfilePage() {
  const { user } = useAuth()
  const toast = usePortalToast()
  const [profile, setProfile] = useState<InstructorProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    void (async () => {
      setLoading(true)
      try {
        const loaded = await membershipService.getInstructorProfile()
        setProfile(loaded)
      } catch {
        toast.error('Could not load instructor profile.')
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  if (!user) return null

  const displayName = profile?.fullName ?? `${user.firstName} ${user.lastName}`
  const email = profile?.email ?? user.email
  const photoUrl = resolveProfilePhotoPreview(profile?.profilePhotoUrl)

  return (
    <div className="space-y-6">
      <header className="border-b border-portal-line pb-6">
        <p className="text-xs font-medium text-portal-muted">Profile</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-portal-ink sm:text-3xl">
          Your account
        </h1>
        <p className="mt-2 text-sm text-portal-muted">
          View your instructor profile details. Contact an administrator if any information needs
          to be updated.
        </p>
      </header>

      {loading ? (
        <p className="text-sm text-portal-muted">Loading profile…</p>
      ) : (
        <div className="space-y-6">
          <section className="portal-widget-3d rounded-xl border border-sky-100 bg-gradient-to-br from-white via-sky-50/50 to-blue-50/30 p-5 sm:p-6">
            <div className="flex flex-wrap items-start gap-5">
              <div className="aspect-[5/6] w-28 overflow-hidden rounded-lg border border-portal-line bg-white shadow-sm">
                <img
                  src={photoUrl}
                  alt={`${displayName} profile`}
                  className="h-full w-full object-cover object-top"
                />
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="text-lg font-semibold text-portal-ink">{displayName}</h2>
                <p className="mt-1 text-sm text-portal-muted">
                  {displayValue(profile?.specialization ?? 'Instructor')}
                </p>
                <p className="mt-2 font-mono text-xs text-portal-muted">
                  {displayValue(profile?.identificationNumber)}
                </p>
              </div>
            </div>
          </section>

          <div className="grid gap-6 lg:grid-cols-2">
            <section className="portal-widget-3d rounded-xl border border-portal-line bg-portal-card p-5 sm:p-6">
              <h2 className="text-base font-semibold text-portal-ink">Account information</h2>
              <dl className="mt-5 grid gap-4 sm:grid-cols-2">
                <ProfileField label="Full name" value={displayName} />
                <ProfileField label="Email" value={email} />
                <ProfileField
                  label="Instructor ID"
                  value={displayValue(profile?.identificationNumber)}
                />
                <ProfileField label="Contact number" value={displayValue(profile?.phone)} />
                <ProfileField label="NIC" value={displayValue(profile?.nicNumber)} />
                <ProfileField
                  label="Date of birth"
                  value={
                    profile?.dateOfBirth ? formatAppDate(profile.dateOfBirth) : '—'
                  }
                />
                <ProfileField
                  label="Age"
                  value={profile?.age != null ? `${profile.age} years` : '—'}
                />
                <ProfileField
                  label="Hire date"
                  value={profile?.hireDate ? formatAppDate(profile.hireDate) : '—'}
                />
              </dl>
            </section>

            <section className="portal-widget-3d rounded-xl border border-portal-line bg-portal-card p-5 sm:p-6">
              <h2 className="text-base font-semibold text-portal-ink">Professional details</h2>
              <dl className="mt-5 grid gap-4 sm:grid-cols-2">
                <ProfileField
                  label="Specialization / role"
                  value={displayValue(profile?.specialization)}
                />
                <ProfileField
                  label="Years of experience"
                  value={displayValue(profile?.yearsExperience)}
                />
                <div className="sm:col-span-2">
                  <ProfileField label="Bio" value={displayValue(profile?.bio)} />
                </div>
                <ProfileField
                  label="Qualification 1"
                  value={displayValue(profile?.qualification1)}
                />
                <ProfileField
                  label="Qualification 2"
                  value={displayValue(profile?.qualification2)}
                />
                <ProfileField label="Speciality 1" value={displayValue(profile?.speciality1)} />
                <ProfileField label="Speciality 2" value={displayValue(profile?.speciality2)} />
                <ProfileField label="Speciality 3" value={displayValue(profile?.speciality3)} />
              </dl>
            </section>

            <section className="portal-widget-3d rounded-xl border border-portal-line bg-portal-card p-5 sm:p-6 lg:col-span-2">
              <h2 className="text-base font-semibold text-portal-ink">Address & access</h2>
              <dl className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <ProfileField label="Address" value={displayValue(profile?.addressLine1)} />
                <ProfileField label="City" value={displayValue(profile?.city)} />
                <ProfileField label="Country" value={displayValue(profile?.country)} />
                <ProfileField
                  label="Fingerprint access"
                  value={profile?.isFingerprintActivated ? 'Activated' : 'Not activated'}
                />
                <ProfileField label="Portal access" value="Instructor portal (role-based)" />
              </dl>
            </section>
          </div>

          <p className="rounded-xl border border-portal-line bg-portal-canvas px-4 py-3 text-sm text-portal-muted">
            Profile details are managed by admin. If something is incorrect, please contact the gym
            administrator to request an update.
          </p>
        </div>
      )}
    </div>
  )
}
