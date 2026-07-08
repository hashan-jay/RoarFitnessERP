import { type FormEvent, useState } from 'react'

import type { AdminMemberListItem, AdminUpdateMemberAccountRequest } from '../../types/api'
import { membershipService } from '../../services'
import { usePortalToast } from '../PortalToast/PortalToast'

interface AdminMemberAccountModalProps {
  member: AdminMemberListItem
  onClose: () => void
  onSaved: (message: string) => void
  onTerminateRequest: (member: AdminMemberListItem) => void
}

const inputClass =
  'w-full rounded-lg border border-portal-line bg-portal-canvas px-3 py-2.5 text-sm text-portal-ink outline-none focus:border-portal-ink'

export function AdminMemberAccountModal({
  member,
  onClose,
  onSaved,
  onTerminateRequest,
}: AdminMemberAccountModalProps) {
  const toast = usePortalToast()
  const [form, setForm] = useState<AdminUpdateMemberAccountRequest>({
    firstName: member.firstName,
    lastName: member.lastName,
    email: member.email,
    nicNumber: member.nicNumber ?? '',
    password: '',
    memberPermissionConfirmed: false,
  })
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()

    if (!form.memberPermissionConfirmed) {
      toast.error('Member permission is required before changing account details.')
      return
    }

    setSaving(true)
    try {
      await membershipService.updateMemberAccount(member.memberId, {
        ...form,
        password: form.password?.trim() ? form.password : undefined,
      })
      onSaved(`Account updated for ${member.fullName}.`)
      onClose()
    } catch {
      toast.error('Could not update member account. Check email uniqueness and password length (min 8).')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-portal-ink/40 p-4"
      onClick={onClose}
    >
      <div
        className="portal-widget-3d max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl border border-portal-line bg-portal-card p-6 shadow-xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-portal-ink">
              Manage member — {member.fullName}
            </h2>
            <p className="mt-1 text-xs text-portal-muted">{member.identificationNumber}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-portal-line px-2 py-1 text-sm text-portal-muted hover:bg-portal-canvas"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-portal-muted">First name</label>
              <input
                required
                className={inputClass}
                value={form.firstName}
                onChange={(event) => setForm({ ...form, firstName: event.target.value })}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-portal-muted">Last name</label>
              <input
                required
                className={inputClass}
                value={form.lastName}
                onChange={(event) => setForm({ ...form, lastName: event.target.value })}
              />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-portal-muted">Email</label>
              <input
                type="email"
                required
                className={inputClass}
                value={form.email}
                onChange={(event) => setForm({ ...form, email: event.target.value })}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-portal-muted">NIC</label>
              <input
                className={inputClass}
                value={form.nicNumber ?? ''}
                onChange={(event) => setForm({ ...form, nicNumber: event.target.value })}
              />
              <p className="mt-1 text-xs text-portal-muted">
                Only admins can update a member&apos;s NIC, upon request.
              </p>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-portal-muted">
              New password (optional, min 8 characters)
            </label>
            <input
              type="password"
              minLength={8}
              className={inputClass}
              value={form.password ?? ''}
              onChange={(event) => setForm({ ...form, password: event.target.value })}
              placeholder="Leave blank to keep current password"
            />
          </div>

          <label className="flex items-start gap-2 text-sm text-portal-ink">
            <input
              type="checkbox"
              className="mt-1"
              checked={form.memberPermissionConfirmed}
              onChange={(event) =>
                setForm({ ...form, memberPermissionConfirmed: event.target.checked })
              }
            />
            Member has given permission for these emergency account changes
          </label>

          <div className="flex flex-wrap justify-end gap-2 border-t border-portal-line pt-4">
            <button
              type="button"
              onClick={() => onTerminateRequest(member)}
              className="rounded-lg border border-rose-200 px-4 py-2 text-sm font-medium text-rose-700 hover:bg-rose-50"
            >
              Restrict
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-portal-line px-4 py-2 text-sm font-medium text-portal-ink hover:bg-portal-canvas"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-portal-ink px-4 py-2 text-sm font-medium text-white hover:bg-black disabled:opacity-60"
            >
              {saving ? 'Saving…' : 'Save changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
