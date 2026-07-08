import { type FormEvent, useEffect, useMemo, useState } from 'react'

import { parsePlanPackageId } from '../../adapters/packageAdapter'
import { formatDate } from '../../lib/formatters'
import type { AdminMemberListItem, MemberListSection } from '../../types/api'
import { membershipService } from '../../services'
import { getPackages, loadPackagesFromApi } from '../../utils/packageStorage'
import { AdminAccountConfirmModal } from './AdminAccountConfirmModal'
import { AdminMemberAccountModal } from './AdminMemberAccountModal'
import { AdminMembersNav } from './AdminMembersNav'
import { AdminMembershipRenewModal } from './AdminMembershipRenewModal'
import { MembershipRenewBillReceipt } from './MembershipRenewBillReceipt'
import type { MembershipRenewBill } from '../../types/api'
import { usePortalToast } from '../PortalToast/PortalToast'
import { KeyAccountButton } from './KeyAccountButton'

const TABS: { id: MemberListSection; label: string }[] = [
  { id: 'all', label: 'All members' },
  { id: 'active', label: 'Active' },
  { id: 'inactive', label: 'Inactive' },
  { id: 'terminated', label: 'Restricted' },
]

const EMPTY_CREATE_FORM = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  password: '',
  confirmPassword: '',
  nicNumber: '',
  dateOfBirth: '',
  gender: '',
  addressLine1: '',
  city: 'Colombo',
  country: 'Sri Lanka',
  emergencyContactName: '',
  emergencyContactPhone: '',
  planId: '',
}

type ConfirmAction = { type: 'terminate' | 'reinstate'; member: AdminMemberListItem }

export function AdminMembersPage() {
  const toast = usePortalToast()
  const [packages, setPackages] = useState(() => getPackages())
  const [tab, setTab] = useState<MemberListSection>('all')
  const [search, setSearch] = useState('')
  const [members, setMembers] = useState<AdminMemberListItem[]>([])
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [createForm, setCreateForm] = useState({ ...EMPTY_CREATE_FORM, planId: packages[0]?.id ?? '' })
  const [accountMember, setAccountMember] = useState<AdminMemberListItem | null>(null)
  const [moreInfo, setMoreInfo] = useState<AdminMemberListItem | null>(null)
  const [renewMember, setRenewMember] = useState<AdminMemberListItem | null>(null)
  const [renewBill, setRenewBill] = useState<MembershipRenewBill | null>(null)
  const [confirmAction, setConfirmAction] = useState<ConfirmAction | null>(null)
  const [confirmLoading, setConfirmLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  const refresh = async (section: MemberListSection = tab) => {
    const [nextMembers, nextPackages] = await Promise.all([
      membershipService.listMembers(section),
      loadPackagesFromApi(),
    ])
    setMembers(nextMembers)
    setPackages(nextPackages)
  }

  useEffect(() => {
    void refresh(tab)
  }, [tab])

  const filteredMembers = useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query) return members
    return members.filter(
      (member) =>
        member.fullName.toLowerCase().includes(query) ||
        member.email.toLowerCase().includes(query) ||
        member.identificationNumber.toLowerCase().includes(query),
    )
  }, [members, search])

  const handleCreate = async (event: FormEvent) => {
    event.preventDefault()

    if (createForm.password !== createForm.confirmPassword) {
      toast.error('Passwords do not match.')
      return
    }

    const plan = packages.find((entry) => entry.id === createForm.planId)
    if (!plan) {
      toast.error('Select a package.')
      return
    }

    setSaving(true)
    try {
      const { confirmPassword: _, planId: __, ...payload } = createForm
      const result = await membershipService.createMember({
        ...payload,
        email: payload.email.trim().toLowerCase(),
        packageId: parsePlanPackageId(plan.id),
      })
      toast.success(`Member created: ${result.identificationNumber}`)
      setShowCreateForm(false)
      setCreateForm({ ...EMPTY_CREATE_FORM, planId: packages[0]?.id ?? '' })
      await refresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Unable to create member.')
    } finally {
      setSaving(false)
    }
  }

  const handleConfirm = async () => {
    if (!confirmAction) return
    setConfirmLoading(true)

    try {
      if (confirmAction.type === 'terminate') {
        await membershipService.terminateMember(confirmAction.member.memberId)
        toast.success(`${confirmAction.member.fullName} has been restricted.`)
        setAccountMember(null)
        if (tab !== 'terminated') setTab('terminated')
        else await refresh('terminated')
      } else {
        await membershipService.reinstateMember(confirmAction.member.memberId)
        toast.success(`${confirmAction.member.fullName} has been reinstated.`)
        setTab('all')
      }
      setConfirmAction(null)
    } catch {
      toast.error(
        `Could not ${confirmAction.type === 'terminate' ? 'restrict' : 'reinstate'} member.`,
      )
    } finally {
      setConfirmLoading(false)
    }
  }

  const showMembershipColumn = tab === 'active' || tab === 'all' || tab === 'inactive'

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-4 border-b border-portal-line pb-6">
        <div>
          <p className="text-xs font-medium text-portal-muted">Members</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-portal-ink sm:text-3xl">
            Member accounts
          </h1>
          <p className="mt-2 text-sm text-portal-muted">
            Manage gym members, memberships, and critical account details.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowCreateForm((open) => !open)}
          className={primaryBtnClass}
        >
          {showCreateForm ? 'Cancel' : '+ Create member'}
        </button>
      </header>

      <AdminMembersNav />

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

      <input
        className="w-full max-w-md rounded-lg border border-portal-line bg-portal-canvas px-3 py-2.5 text-sm text-portal-ink"
        placeholder="Search by member ID or name…"
        value={search}
        onChange={(event) => setSearch(event.target.value)}
      />

      {showCreateForm && (
        <form
          onSubmit={handleCreate}
          className="portal-widget-3d space-y-4 rounded-xl border border-portal-line bg-portal-card p-5"
        >
          <h2 className="text-sm font-semibold text-portal-ink">Create new member</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <input className={inputClass} placeholder="First name" required value={createForm.firstName} onChange={(e) => setCreateForm({ ...createForm, firstName: e.target.value })} />
            <input className={inputClass} placeholder="Last name" required value={createForm.lastName} onChange={(e) => setCreateForm({ ...createForm, lastName: e.target.value })} />
            <input className={inputClass} placeholder="Email" type="email" required value={createForm.email} onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })} />
            <input className={inputClass} placeholder="Contact number" value={createForm.phone} onChange={(e) => setCreateForm({ ...createForm, phone: e.target.value })} />
            <input className={inputClass} placeholder="Password" type="password" required minLength={8} value={createForm.password} onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })} />
            <input className={inputClass} placeholder="Confirm password" type="password" required minLength={8} value={createForm.confirmPassword} onChange={(e) => setCreateForm({ ...createForm, confirmPassword: e.target.value })} />
            <input className={inputClass} placeholder="NIC" value={createForm.nicNumber} onChange={(e) => setCreateForm({ ...createForm, nicNumber: e.target.value })} />
            <input className={inputClass} type="date" value={createForm.dateOfBirth} onChange={(e) => setCreateForm({ ...createForm, dateOfBirth: e.target.value })} />
            <select className={inputClass} value={createForm.gender} onChange={(e) => setCreateForm({ ...createForm, gender: e.target.value })}>
              <option value="">Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
            <input className={inputClass} placeholder="City" value={createForm.city} onChange={(e) => setCreateForm({ ...createForm, city: e.target.value })} />
            <input className={`${inputClass} sm:col-span-2`} placeholder="Address" value={createForm.addressLine1} onChange={(e) => setCreateForm({ ...createForm, addressLine1: e.target.value })} />
            <input className={inputClass} placeholder="Emergency contact name" value={createForm.emergencyContactName} onChange={(e) => setCreateForm({ ...createForm, emergencyContactName: e.target.value })} />
            <input className={inputClass} placeholder="Emergency contact number" value={createForm.emergencyContactPhone} onChange={(e) => setCreateForm({ ...createForm, emergencyContactPhone: e.target.value })} />
            <select className={`${inputClass} sm:col-span-2`} value={createForm.planId} onChange={(e) => setCreateForm({ ...createForm, planId: e.target.value })}>
              {packages.map((plan) => (
                <option key={plan.id} value={plan.id}>
                  {plan.name} — LKR {plan.price.toLocaleString('en-LK')}
                </option>
              ))}
            </select>
          </div>
          <button type="submit" className={primaryBtnClass} disabled={saving}>
            {saving ? 'Creating…' : 'Create member'}
          </button>
        </form>
      )}

      <div className="overflow-x-auto rounded-xl border border-portal-line bg-portal-card">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-portal-line bg-portal-canvas text-xs font-semibold uppercase tracking-wide text-portal-muted">
            <tr>
              <th className="px-4 py-3" aria-label="Manage" />
              <th className="px-4 py-3">Member ID</th>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Contact</th>
              {showMembershipColumn && <th className="px-4 py-3">Membership</th>}
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredMembers.length === 0 ? (
              <tr>
                <td colSpan={showMembershipColumn ? 8 : 7} className="px-5 py-10 text-center text-sm text-portal-muted">
                  No members in this section.
                </td>
              </tr>
            ) : (
              filteredMembers.map((member) => (
                <tr key={member.memberId} className="border-b border-portal-line">
                  <td className="px-4 py-3">
                    {!member.isTerminated && (
                      <KeyAccountButton
                        label={`Manage account for ${member.fullName}`}
                        onClick={() => setAccountMember(member)}
                      />
                    )}
                  </td>
                  <td className="px-4 py-3 font-semibold text-portal-ink">{member.identificationNumber}</td>
                  <td className="px-4 py-3 text-portal-ink">{member.fullName}</td>
                  <td className="px-4 py-3 text-portal-muted">{member.email}</td>
                  <td className="px-4 py-3 text-portal-muted">{member.phone || '—'}</td>
                  {showMembershipColumn && (
                    <td className="px-4 py-3 text-portal-muted">
                      {member.hasActiveMembership && member.membershipStartDate && member.membershipEndDate ? (
                        <>
                          <span className="font-medium text-portal-ink">{member.activePackageName}</span>
                          <br />
                          <span className="text-xs">
                            {formatDate(member.membershipStartDate)} – {formatDate(member.membershipEndDate)}
                          </span>
                        </>
                      ) : member.hasActiveMembership ? (
                        <span className="font-medium text-portal-ink">{member.activePackageName ?? 'Active'}</span>
                      ) : (
                        '—'
                      )}
                    </td>
                  )}
                  <td className="px-4 py-3">
                    {member.isTerminated ? (
                      <span className="rounded-full bg-rose-50 px-2 py-0.5 text-[10px] font-semibold text-rose-700">
                        Restricted
                      </span>
                    ) : member.hasActiveMembership ? (
                      <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                        Active
                      </span>
                    ) : (
                      <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-700">
                        Inactive
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      <button type="button" onClick={() => setMoreInfo(member)} className={secondaryBtnClass}>
                        More info
                      </button>
                      {!member.isTerminated && !member.hasActiveMembership && (
                        <button type="button" onClick={() => setRenewMember(member)} className={primaryBtnClass}>
                          Renew
                        </button>
                      )}
                      {tab === 'terminated' && (
                        <button
                          type="button"
                          onClick={() => setConfirmAction({ type: 'reinstate', member })}
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
              <InfoRow label="NIC" value={moreInfo.nicNumber} />
              <InfoRow label="Date of birth" value={moreInfo.dateOfBirth ? formatDate(moreInfo.dateOfBirth) : undefined} />
              <InfoRow label="Gender" value={moreInfo.gender} />
              <InfoRow label="Address" value={[moreInfo.addressLine1, moreInfo.city, moreInfo.country].filter(Boolean).join(', ') || undefined} />
              <InfoRow
                label="Emergency contact"
                value={
                  moreInfo.emergencyContactName
                    ? `${moreInfo.emergencyContactName}${moreInfo.emergencyContactPhone ? ` · ${moreInfo.emergencyContactPhone}` : ''}`
                    : undefined
                }
              />
              <InfoRow
                label="Fingerprint"
                value={moreInfo.isFingerprintActivated ? 'Activated' : 'Not activated'}
              />
              {moreInfo.isTerminated && (
                <InfoRow label="Restricted" value={moreInfo.terminatedAt ? formatDate(moreInfo.terminatedAt) : undefined} />
              )}
            </dl>
          </div>
        </div>
      )}

      {accountMember && (
        <AdminMemberAccountModal
          member={accountMember}
          onClose={() => setAccountMember(null)}
          onSaved={(msg) => {
            toast.success(msg)
            void refresh()
          }}
          onTerminateRequest={(member) => setConfirmAction({ type: 'terminate', member })}
        />
      )}

      {renewMember && (
        <AdminMembershipRenewModal
          member={renewMember}
          onClose={() => setRenewMember(null)}
          onBillGenerated={(bill) => {
            setRenewBill(bill)
            setRenewMember(null)
            toast.success(
              `Membership renewed for ${bill.memberName}. Bill ${bill.billReference} generated.`,
            )
            void refresh()
          }}
        />
      )}

      {renewBill && (
        <MembershipRenewBillReceipt bill={renewBill} onClose={() => setRenewBill(null)} />
      )}

      {confirmAction && (
        <AdminAccountConfirmModal
          title={confirmAction.type === 'terminate' ? 'Restrict member' : 'Continue member'}
          message={
            confirmAction.type === 'terminate'
              ? `Do you really need to restrict ${confirmAction.member.fullName}?`
              : `Do you really like to continue ${confirmAction.member.fullName}?`
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
