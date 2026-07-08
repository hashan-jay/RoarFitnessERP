import { type ChangeEvent, type FormEvent, useState } from 'react'

import { trainerChristian } from '../../assets/images/trainers'
import type {
  AdminInstructorListItem,
  AdminUpdateInstructorAccountRequest,
} from '../../types/api'
import { membershipService, ApiError } from '../../services'
import { invalidateTrainerCache } from '../../utils/trainerStorage'
import { usePortalToast } from '../PortalToast/PortalToast'

interface AdminInstructorAccountModalProps {
  instructor: AdminInstructorListItem
  onClose: () => void
  onSaved: (message: string) => void
  onTerminateRequest: (instructor: AdminInstructorListItem) => void
}

const inputClass =
  'w-full rounded-lg border border-portal-line bg-portal-canvas px-3 py-2.5 text-sm text-portal-ink outline-none focus:border-portal-ink'

const PHOTO_UPLOAD_GUIDANCE =
  'Portrait photo with a 5:6 aspect ratio (recommended 750×900 px, minimum 500×600 px). JPG, PNG, or WebP, max 5 MB.'

function resolveProfilePhotoPreview(url?: string | null): string {
  if (!url) return trainerChristian
  if (url.startsWith('http://') || url.startsWith('https://')) return url
  return url
}

export function AdminInstructorAccountModal({
  instructor,
  onClose,
  onSaved,
  onTerminateRequest,
}: AdminInstructorAccountModalProps) {
  const toast = usePortalToast()
  const [form, setForm] = useState<AdminUpdateInstructorAccountRequest>({
    firstName: instructor.firstName,
    lastName: instructor.lastName,
    email: instructor.email,
    phone: instructor.phone ?? '',
    nicNumber: instructor.nicNumber ?? '',
    dateOfBirth: instructor.dateOfBirth?.slice(0, 10) ?? '',
    specialization: instructor.specialization ?? '',
    addressLine1: instructor.addressLine1 ?? '',
    country: instructor.country ?? '',
    yearsExperience: instructor.yearsExperience ?? 0,
    qualification1: instructor.qualification1 ?? '',
    qualification2: instructor.qualification2 ?? '',
    speciality1: instructor.speciality1 ?? '',
    speciality2: instructor.speciality2 ?? '',
    speciality3: instructor.speciality3 ?? '',
    password: '',
    instructorPermissionConfirmed: false,
  })
  const [photoPreview, setPhotoPreview] = useState(resolveProfilePhotoPreview(instructor.profilePhotoUrl))
  const [saving, setSaving] = useState(false)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)

  const handlePhotoChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return

    setUploadingPhoto(true)
    try {
      const result = await membershipService.uploadInstructorPhoto(instructor.instructorId, file)
      setPhotoPreview(resolveProfilePhotoPreview(result.photoUrl))
      invalidateTrainerCache()
      onSaved(`Profile photo updated for ${instructor.fullName}.`)
    } catch (err) {
      toast.error(
        err instanceof ApiError
          ? err.message
          : 'Could not upload photo. Use JPG, PNG, or WebP up to 5 MB with a 5:6 portrait ratio.',
      )
    } finally {
      setUploadingPhoto(false)
    }
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()

    if (!form.instructorPermissionConfirmed) {
      toast.error('Instructor permission is required before changing account details.')
      return
    }

    setSaving(true)
    try {
      await membershipService.updateInstructorAccount(instructor.instructorId, {
        ...form,
        dateOfBirth: form.dateOfBirth || undefined,
        password: form.password?.trim() ? form.password : undefined,
      })
      onSaved(`Account updated for ${instructor.fullName}.`)
      onClose()
    } catch {
      toast.error(
        'Could not update instructor account. Check email uniqueness and password length (min 8).',
      )
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
              Manage instructor — {instructor.fullName}
            </h2>
            <p className="mt-1 text-xs text-portal-muted">{instructor.identificationNumber}</p>
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
          <div className="rounded-lg border border-portal-line bg-portal-canvas/60 p-4">
            <p className="text-xs font-medium text-portal-muted">Public website profile photo</p>
            <div className="mt-3 flex flex-wrap items-start gap-4">
              <div className="aspect-[5/6] w-24 overflow-hidden rounded-lg border border-portal-line bg-portal-card">
                <img
                  src={photoPreview}
                  alt={`${instructor.fullName} profile`}
                  className="h-full w-full object-cover object-top"
                />
              </div>
              <div className="min-w-0 flex-1 space-y-2">
                <p className="text-xs text-portal-muted">{PHOTO_UPLOAD_GUIDANCE}</p>
                <label className="inline-flex cursor-pointer rounded-lg border border-portal-line bg-portal-card px-3 py-2 text-sm font-medium text-portal-ink hover:bg-portal-canvas">
                  {uploadingPhoto ? 'Uploading…' : 'Change profile photo'}
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="sr-only"
                    disabled={uploadingPhoto}
                    onChange={(event) => void handlePhotoChange(event)}
                  />
                </label>
              </div>
            </div>
          </div>

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
              <label className="mb-1 block text-xs font-medium text-portal-muted">Contact number</label>
              <input
                className={inputClass}
                value={form.phone ?? ''}
                onChange={(event) => setForm({ ...form, phone: event.target.value })}
              />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-portal-muted">NIC</label>
              <input
                className={inputClass}
                value={form.nicNumber ?? ''}
                onChange={(event) => setForm({ ...form, nicNumber: event.target.value })}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-portal-muted">Date of birth</label>
              <input
                type="date"
                className={inputClass}
                value={form.dateOfBirth ?? ''}
                onChange={(event) => setForm({ ...form, dateOfBirth: event.target.value })}
              />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-portal-muted">Specialization / role</label>
              <input
                className={inputClass}
                value={form.specialization ?? ''}
                onChange={(event) => setForm({ ...form, specialization: event.target.value })}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-portal-muted">Years of experience</label>
              <input
                type="number"
                min={0}
                className={inputClass}
                value={form.yearsExperience}
                onChange={(event) =>
                  setForm({ ...form, yearsExperience: Math.max(0, Number(event.target.value) || 0) })
                }
              />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-portal-muted">Qualification 1</label>
              <input
                className={inputClass}
                value={form.qualification1 ?? ''}
                onChange={(event) => setForm({ ...form, qualification1: event.target.value })}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-portal-muted">Qualification 2</label>
              <input
                className={inputClass}
                value={form.qualification2 ?? ''}
                onChange={(event) => setForm({ ...form, qualification2: event.target.value })}
              />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-portal-muted">Speciality 1</label>
              <input
                className={inputClass}
                value={form.speciality1 ?? ''}
                onChange={(event) => setForm({ ...form, speciality1: event.target.value })}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-portal-muted">Speciality 2</label>
              <input
                className={inputClass}
                value={form.speciality2 ?? ''}
                onChange={(event) => setForm({ ...form, speciality2: event.target.value })}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-portal-muted">Speciality 3</label>
              <input
                className={inputClass}
                value={form.speciality3 ?? ''}
                onChange={(event) => setForm({ ...form, speciality3: event.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-portal-muted">Address</label>
            <input
              className={inputClass}
              value={form.addressLine1 ?? ''}
              onChange={(event) => setForm({ ...form, addressLine1: event.target.value })}
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-portal-muted">Country</label>
            <input
              className={inputClass}
              value={form.country ?? ''}
              onChange={(event) => setForm({ ...form, country: event.target.value })}
            />
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
              checked={form.instructorPermissionConfirmed}
              onChange={(event) =>
                setForm({ ...form, instructorPermissionConfirmed: event.target.checked })
              }
            />
            Instructor has given permission for these emergency account changes
          </label>

          <div className="flex flex-wrap justify-end gap-2 border-t border-portal-line pt-4">
            <button
              type="button"
              onClick={() => onTerminateRequest(instructor)}
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
