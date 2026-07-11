import { type FormEvent, useEffect, useState } from 'react'

import { formatDate } from '../../lib/formatters'
import type { AdminInstructorListItem, InstructorListSection } from '../../types/api'
import { membershipService } from '../../services'
import { invalidateTrainerCache } from '../../utils/trainerStorage'
import { usePortalToast } from '../PortalToast/PortalToast'
import { AdminAccountConfirmModal } from './AdminAccountConfirmModal'
import { AdminInstructorAccountModal } from './AdminInstructorAccountModal'
import { KeyAccountButton } from './KeyAccountButton'

const TABS: { id: InstructorListSection; label: string }[] = [
  { id: 'all', label: 'All instructors' },
  { id: 'active', label: 'Active' },
  { id: 'terminated', label: 'Restricted' },
]

const EMPTY_FORM = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  password: '',
  confirmPassword: '',
  nicNumber: '',
  dateOfBirth: '',
  specialization: '',
  addressLine1: '',
  country: 'Sri Lanka',
  yearsExperience: '' as number | '',
  qualification1: '',
  qualification2: '',
  speciality1: '',
  speciality2: '',
  speciality3: '',
}

type ConfirmAction = { type: 'terminate' | 'reinstate'; instructor: AdminInstructorListItem }

export function AdminInstructorsPage() {
  const toast = usePortalToast()
  const [tab, setTab] = useState<InstructorListSection>('all')
  const [instructors, setInstructors] = useState<AdminInstructorListItem[]>([])
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [accountInstructor, setAccountInstructor] = useState<AdminInstructorListItem | null>(null)
  const [moreInfo, setMoreInfo] = useState<AdminInstructorListItem | null>(null)
  const [confirmAction, setConfirmAction] = useState<ConfirmAction | null>(null)
  const [confirmLoading, setConfirmLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  const refresh = async (section: InstructorListSection = tab) => {
    const next = await membershipService.listInstructors(section)
    setInstructors(next)
  }

  useEffect(() => {
    void refresh(tab)
  }, [tab])

  const handleCreate = async (event: FormEvent) => {
    event.preventDefault()

    if (form.password !== form.confirmPassword) {
      toast.error('Passwords do not match.')
      return
    }

    setSaving(true)
    try {
      const { confirmPassword: _, ...payload } = form
      const result = await membershipService.createInstructor({
        ...payload,
        email: payload.email.trim().toLowerCase(),
        yearsExperience:
          payload.yearsExperience === '' ? 0 : Number(payload.yearsExperience),
      })
      toast.success(`Instructor created: ${result.identificationNumber}`)
      setShowCreateForm(false)
      setForm(EMPTY_FORM)
      invalidateTrainerCache()
      await refresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Unable to create instructor.')
    } finally {
      setSaving(false)
    }
  }

  const handleConfirm = async () => {
    if (!confirmAction) return
    setConfirmLoading(true)

    try {
      if (confirmAction.type === 'terminate') {
        await membershipService.terminateInstructor(confirmAction.instructor.instructorId)
        toast.success(`${confirmAction.instructor.fullName} has been restricted.`)
        setAccountInstructor(null)
        invalidateTrainerCache()
        if (tab !== 'terminated') setTab('terminated')
        else await refresh('terminated')
      } else {
        await membershipService.reinstateInstructor(confirmAction.instructor.instructorId)
        toast.success(`${confirmAction.instructor.fullName} has been reinstated.`)
        invalidateTrainerCache()
        setTab('all')
      }
      setConfirmAction(null)
    } catch {
      toast.error(
        `Could not ${confirmAction.type === 'terminate' ? 'restrict' : 'reinstate'} instructor.`,
      )
    } finally {
      setConfirmLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-4 border-b border-portal-line pb-6">
        <div>
          <p className="text-xs font-medium text-portal-muted">Instructors</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-portal-ink sm:text-3xl">
            Instructor accounts
          </h1>
          <p className="mt-2 text-sm text-portal-muted">
            Manage gym instructors and critical account details.
          </p>
        </div>
        <button type="button" onClick={() => setShowCreateForm((open) => !open)} className={primaryBtnClass}>
          {showCreateForm ? 'Cancel' : '+ Create instructor'}
        </button>
      </header>

      <div className="flex flex-wrap gap-2">
        {TABS.map((entry) => (
          <button
            key={entry.id}
            type="button"
            onClick={() => setTab(entry.id)}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
              tab === entry.id
                ? 'bg-portal-ink text-white'
                : 'border border-portal-line bg-portal-card text-portal-ink hover:bg-portal-canvas'
            }`}
          >
            {entry.label}
          </button>
        ))}
      </div>

      {showCreateForm && (
        <form
          onSubmit={handleCreate}
          className="portal-widget-3d space-y-4 rounded-xl border border-portal-line bg-portal-card p-5"
        >
          <h2 className="text-sm font-semibold text-portal-ink">Create new instructor</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <input className={inputClass} placeholder="First name" required value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} />
            <input className={inputClass} placeholder="Last name" required value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} />
            <input className={inputClass} placeholder="Email" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            <input className={inputClass} placeholder="Contact number" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            <input className={inputClass} placeholder="Password" type="password" required minLength={8} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
            <input className={inputClass} placeholder="Confirm password" type="password" required minLength={8} value={form.confirmPassword} onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })} />
            <input className={inputClass} placeholder="Specialization" value={form.specialization} onChange={(e) => setForm({ ...form, specialization: e.target.value })} />
            <input className={inputClass} placeholder="NIC" value={form.nicNumber} onChange={(e) => setForm({ ...form, nicNumber: e.target.value })} />
            <div className="relative">
              <input
                className={`${inputClass} ${!form.dateOfBirth ? 'text-transparent' : ''}`}
                type="date"
                value={form.dateOfBirth}
                onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })}
              />
              {!form.dateOfBirth && (
                <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-sm text-portal-muted">
                  Date of Birth
                </span>
              )}
            </div>
            <input
              className={inputClass}
              type="number"
              min={0}
              placeholder="Years of Experience"
              value={form.yearsExperience}
              onChange={(e) =>
                setForm({
                  ...form,
                  yearsExperience:
                    e.target.value === '' ? '' : Math.max(0, Number(e.target.value) || 0),
                })
              }
            />
            <input className={inputClass} placeholder="Qualification 1" value={form.qualification1} onChange={(e) => setForm({ ...form, qualification1: e.target.value })} />
            <input className={inputClass} placeholder="Qualification 2" value={form.qualification2} onChange={(e) => setForm({ ...form, qualification2: e.target.value })} />
            <input className={inputClass} placeholder="Speciality 1" value={form.speciality1} onChange={(e) => setForm({ ...form, speciality1: e.target.value })} />
            <input className={inputClass} placeholder="Speciality 2" value={form.speciality2} onChange={(e) => setForm({ ...form, speciality2: e.target.value })} />
            <input className={inputClass} placeholder="Speciality 3" value={form.speciality3} onChange={(e) => setForm({ ...form, speciality3: e.target.value })} />
            <input className={`${inputClass} sm:col-span-2`} placeholder="Address" value={form.addressLine1} onChange={(e) => setForm({ ...form, addressLine1: e.target.value })} />
            <input className={inputClass} placeholder="Country" value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} />
          </div>
          <button type="submit" className={primaryBtnClass} disabled={saving}>
            {saving ? 'Creating…' : 'Create instructor'}
          </button>
        </form>
      )}

      <div className="overflow-x-auto rounded-xl border border-portal-line bg-portal-card">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-portal-line bg-portal-canvas text-xs font-semibold uppercase tracking-wide text-portal-muted">
            <tr>
              <th className="px-4 py-3" aria-label="Manage" />
              <th className="px-4 py-3">Instructor ID</th>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Contact</th>
              <th className="px-4 py-3">Specialization</th>
              {tab === 'terminated' && <th className="px-4 py-3">Restricted</th>}
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {instructors.length === 0 ? (
              <tr>
                <td colSpan={tab === 'terminated' ? 8 : 7} className="px-5 py-10 text-center text-sm text-portal-muted">
                  No instructors in this section.
                </td>
              </tr>
            ) : (
              instructors.map((instructor) => (
                <tr key={instructor.instructorId} className="border-b border-portal-line">
                  <td className="px-4 py-3">
                    {!instructor.isTerminated && (
                      <KeyAccountButton
                        label={`Manage account for ${instructor.fullName}`}
                        onClick={() => setAccountInstructor(instructor)}
                      />
                    )}
                  </td>
                  <td className="px-4 py-3 font-semibold text-portal-ink">{instructor.identificationNumber}</td>
                  <td className="px-4 py-3 text-portal-ink">{instructor.fullName}</td>
                  <td className="px-4 py-3 text-portal-muted">{instructor.email}</td>
                  <td className="px-4 py-3 text-portal-muted">{instructor.phone || '—'}</td>
                  <td className="px-4 py-3 text-portal-muted">{instructor.specialization || '—'}</td>
                  {tab === 'terminated' && (
                    <td className="px-4 py-3 text-portal-muted">
                      {instructor.terminatedAt ? formatDate(instructor.terminatedAt) : '—'}
                    </td>
                  )}
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      <button type="button" onClick={() => setMoreInfo(instructor)} className={secondaryBtnClass}>
                        More info
                      </button>
                      {tab === 'terminated' && (
                        <button
                          type="button"
                          onClick={() => setConfirmAction({ type: 'reinstate', instructor })}
                          className="rounded-lg border border-emerald-200 px-3 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-50"
                        >
                          Continue back
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {moreInfo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-portal-ink/40 p-4" onClick={() => setMoreInfo(null)}>
          <div className="portal-widget-3d w-full max-w-lg rounded-xl border border-portal-line bg-portal-card p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between gap-3">
              <h2 className="text-lg font-semibold text-portal-ink">{moreInfo.fullName}</h2>
              <button type="button" onClick={() => setMoreInfo(null)} className="text-portal-muted">×</button>
            </div>
            <dl className="mt-4 space-y-3 text-sm">
              <InfoRow label="Experience" value={moreInfo.yearsExperience ? `${moreInfo.yearsExperience} yrs` : undefined} />
              <InfoRow label="Qualifications" value={[moreInfo.qualification1, moreInfo.qualification2].filter(Boolean).join(', ') || undefined} />
              <InfoRow label="Specialities" value={[moreInfo.speciality1, moreInfo.speciality2, moreInfo.speciality3].filter(Boolean).join(', ') || undefined} />
              <InfoRow label="NIC" value={moreInfo.nicNumber} />
              <InfoRow label="Date of birth" value={moreInfo.dateOfBirth ? formatDate(moreInfo.dateOfBirth) : undefined} />
              <InfoRow label="Address" value={[moreInfo.addressLine1, moreInfo.country].filter(Boolean).join(', ') || undefined} />
              <InfoRow label="Hire date" value={moreInfo.hireDate ? formatDate(moreInfo.hireDate) : undefined} />
              <InfoRow label="Fingerprint" value={moreInfo.isFingerprintActivated ? 'Activated' : 'Not activated'} />
            </dl>
          </div>
        </div>
      )}

      {accountInstructor && (
        <AdminInstructorAccountModal
          instructor={accountInstructor}
          onClose={() => setAccountInstructor(null)}
          onSaved={(msg) => {
            toast.success(msg)
            invalidateTrainerCache()
            void refresh()
          }}
          onTerminateRequest={(instructor) => setConfirmAction({ type: 'terminate', instructor })}
        />
      )}

      {confirmAction && (
        <AdminAccountConfirmModal
          title={confirmAction.type === 'terminate' ? 'Restrict instructor' : 'Continue instructor'}
          message={
            confirmAction.type === 'terminate'
              ? `Do you really need to restrict ${confirmAction.instructor.fullName}?`
              : `Do you really like to continue ${confirmAction.instructor.fullName}?`
          }
          confirmTone={confirmAction.type === 'reinstate' ? 'success' : 'danger'}
          loading={confirmLoading}
          onCancel={() => !confirmLoading && setConfirmAction(null)}
          onConfirm={() => void handleConfirm()}
        />
      )}
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value?: string }) {
  return (
    <div>
      <dt className="text-xs font-medium text-portal-muted">{label}</dt>
      <dd className="mt-0.5 text-portal-ink">{value || '—'}</dd>
    </div>
  )
}

const inputClass =
  'w-full rounded-lg border border-portal-line bg-portal-canvas px-3 py-2.5 text-sm text-portal-ink outline-none focus:border-portal-ink'

const primaryBtnClass =
  'rounded-lg bg-portal-ink px-4 py-2 text-sm font-medium text-white transition hover:bg-black disabled:opacity-50'

const secondaryBtnClass =
  'rounded-lg border border-portal-line px-3 py-1.5 text-xs font-semibold text-portal-ink transition hover:bg-portal-canvas'
