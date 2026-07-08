import { type FormEvent, useEffect, useState } from 'react'
import { Plus } from 'lucide-react'

import { WEEKDAY_LABELS } from '../ClassesPage/scheduleData'
import { generalClassService } from '../../services/generalClassService'
import { ApiError } from '../../services/apiClient'
import { membershipService } from '../../services/membershipService'
import {
  GENERAL_CLASS_CATEGORIES,
  type GeneralClassCategory,
  type GeneralClassRecord,
} from '../../types/generalClass'
import { usePortalToast } from '../PortalToast/PortalToast'
import { AdminAccountConfirmModal } from './AdminAccountConfirmModal'

const STUDIOS = [
  'Strength Floor',
  'Cardio Hall',
  'Zen Room',
  'Studio A',
  'Studio B',
  'Box Arena',
  'Performance Zone',
] as const

type GeneralClassFormState = {
  title: string
  category: GeneralClassCategory
  description: string
  instructorId: string
  weekday: string
  timeRange: string
  duration: string
  studio: string
  isActive: boolean
}

const EMPTY_FORM: GeneralClassFormState = {
  title: '',
  category: GENERAL_CLASS_CATEGORIES[0],
  description: '',
  instructorId: '',
  weekday: '1',
  timeRange: '06:00 - 07:00',
  duration: '60 min',
  studio: STUDIOS[0],
  isActive: true,
}

export function AdminGeneralClassesPage() {
  const toast = usePortalToast()
  const [classes, setClasses] = useState<GeneralClassRecord[]>([])
  const [instructors, setInstructors] = useState<
    Array<{ instructorId: number; fullName: string; specialization?: string | null }>
  >([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [form, setForm] = useState<GeneralClassFormState>(EMPTY_FORM)
  const [formModalOpen, setFormModalOpen] = useState(false)
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null)

  const refresh = async () => {
    setLoading(true)

    const [classResult, instructorResult] = await Promise.allSettled([
      generalClassService.getAdminList(),
      membershipService.listInstructors('active'),
    ])

    if (classResult.status === 'fulfilled') {
      setClasses(classResult.value)
    } else {
      setClasses([])
      const message =
        classResult.reason instanceof ApiError
          ? classResult.reason.message
          : 'Could not load general classes.'
      toast.error(message)
    }

    if (instructorResult.status === 'fulfilled') {
      setInstructors(
        instructorResult.value.map((entry) => ({
          instructorId: entry.instructorId,
          fullName: entry.fullName,
          specialization: entry.specialization,
        })),
      )
    } else {
      setInstructors([])
      toast.error('Could not load instructors for the dropdown.')
    }

    setLoading(false)
  }

  useEffect(() => {
    void refresh()
  }, [])

  const closeFormModal = () => {
    setFormModalOpen(false)
    setEditingId(null)
    setForm(EMPTY_FORM)
  }

  const openCreateModal = () => {
    setEditingId(null)
    setForm(EMPTY_FORM)
    setFormModalOpen(true)
  }

  const openEditModal = (record: GeneralClassRecord) => {
    setEditingId(record.generalClassId)
    setForm({
      title: record.title,
      category: GENERAL_CLASS_CATEGORIES.includes(
        record.category as GeneralClassCategory,
      )
        ? (record.category as GeneralClassCategory)
        : GENERAL_CLASS_CATEGORIES[0],
      description: record.description,
      instructorId: String(record.instructorId),
      weekday: String(record.weekday),
      timeRange: record.timeRange,
      duration: record.duration,
      studio: STUDIOS.includes(record.studio as (typeof STUDIOS)[number])
        ? record.studio
        : STUDIOS[0],
      isActive: record.isActive ?? true,
    })
    setFormModalOpen(true)
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()

    const instructorId = Number(form.instructorId)
    const weekday = Number(form.weekday)

    if (!form.title.trim() || !form.description.trim()) {
      toast.error('Title and description are required.')
      return
    }
    if (!instructorId) {
      toast.error('Select an instructor.')
      return
    }
    if (!form.timeRange.trim() || !form.duration.trim() || !form.studio.trim()) {
      toast.error('Time, duration, and studio are required.')
      return
    }

    const payload = {
      title: form.title.trim(),
      category: form.category,
      description: form.description.trim(),
      instructorId,
      weekday,
      timeRange: form.timeRange.trim(),
      duration: form.duration.trim(),
      studio: form.studio.trim(),
    }

    setSaving(true)
    try {
      if (editingId) {
        await generalClassService.update(editingId, { ...payload, isActive: form.isActive })
        toast.success('General class updated.')
      } else {
        await generalClassService.create(payload)
        toast.success('General class created.')
      }
      await refresh()
      closeFormModal()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Unable to save general class.')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteConfirm = async () => {
    if (deleteTargetId === null) return

    setSaving(true)
    try {
      await generalClassService.remove(deleteTargetId)
      await refresh()
      if (editingId === deleteTargetId) closeFormModal()
      toast.success('General class removed.')
      setDeleteTargetId(null)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Unable to remove general class.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-4 border-b border-portal-line pb-6">
        <div>
          <p className="text-xs font-medium text-portal-muted">Schedule</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-portal-ink sm:text-3xl">
            General Classes
          </h1>
          <p className="mt-2 text-sm text-portal-muted">
            Create and manage recurring weekly classes shown on the public website Classes page.
          </p>
        </div>
        <button
          type="button"
          onClick={openCreateModal}
          className="inline-flex min-h-[42px] shrink-0 items-center justify-center gap-2 rounded-lg bg-portal-ink px-5 text-sm font-medium text-white transition hover:bg-black"
        >
          <Plus className="size-4" aria-hidden="true" />
          Create New Class
        </button>
      </header>

      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-portal-ink">Weekly schedule</h2>
        {loading ? (
          <p className="text-sm text-portal-muted">Loading general classes…</p>
        ) : classes.length === 0 ? (
          <div className="portal-widget-3d rounded-xl border border-dashed border-portal-line bg-portal-card px-5 py-12 text-center">
            <p className="text-sm font-medium text-portal-ink">No general classes yet</p>
            <p className="mt-1 text-sm text-portal-muted">
              Click &ldquo;Create New Class&rdquo; to add your first recurring weekly class.
            </p>
          </div>
        ) : (
          <ul className="space-y-3">
            {classes.map((record) => (
              <li
                key={record.generalClassId}
                className="portal-widget-3d rounded-xl border border-orange-100 bg-gradient-to-br from-white via-orange-50/40 to-amber-50/30 p-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-sky-700">
                      {record.category}
                      {!record.isActive ? ' · Inactive' : ''}
                    </p>
                    <h3 className="mt-2 text-lg font-semibold text-portal-ink">{record.title}</h3>
                    <p className="mt-1 text-sm text-portal-muted">
                      Every {WEEKDAY_LABELS[record.weekday] ?? 'weekday'} · {record.timeRange} ·{' '}
                      {record.duration} · {record.studio}
                    </p>
                    <p className="mt-1 text-sm text-portal-muted">
                      Instructor: {record.instructorName}
                    </p>
                    <p className="mt-2 text-sm leading-relaxed text-portal-muted">
                      {record.description}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => openEditModal(record)}
                      className="rounded-lg border border-portal-line px-3 py-2 text-xs font-medium text-portal-ink"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteTargetId(record.generalClassId)}
                      className="rounded-lg border border-rose-200 px-3 py-2 text-xs font-medium text-rose-700"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {formModalOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-portal-ink/40 p-4"
          onClick={() => !saving && closeFormModal()}
        >
          <div
            className="portal-widget-3d max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl border border-portal-line bg-portal-card p-6 shadow-xl"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="general-class-form-title"
          >
            <h2 id="general-class-form-title" className="text-lg font-semibold text-portal-ink">
              {editingId ? 'Edit general class' : 'Create new class'}
            </h2>

            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block sm:col-span-2">
                  <span className="mb-1.5 block text-xs text-portal-muted">Title</span>
                  <input
                    value={form.title}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, title: event.target.value }))
                    }
                    placeholder="Morning Strength Flow"
                    className="w-full rounded-lg border border-portal-line bg-portal-canvas px-3 py-2.5 text-sm outline-none focus:border-portal-ink"
                  />
                </label>

                <label className="block">
                  <span className="mb-1.5 block text-xs text-portal-muted">Category</span>
                  <select
                    value={form.category}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        category: event.target.value as GeneralClassCategory,
                      }))
                    }
                    className="w-full rounded-lg border border-portal-line bg-portal-canvas px-3 py-2.5 text-sm outline-none focus:border-portal-ink"
                  >
                    {GENERAL_CLASS_CATEGORIES.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="block">
                  <span className="mb-1.5 block text-xs text-portal-muted">Instructor</span>
                  <select
                    value={form.instructorId}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, instructorId: event.target.value }))
                    }
                    className="w-full rounded-lg border border-portal-line bg-portal-canvas px-3 py-2.5 text-sm outline-none focus:border-portal-ink"
                  >
                    <option value="">Select instructor</option>
                    {instructors.map((entry) => (
                      <option key={entry.instructorId} value={entry.instructorId}>
                        {entry.fullName}
                        {entry.specialization ? ` · ${entry.specialization}` : ''}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="block">
                  <span className="mb-1.5 block text-xs text-portal-muted">
                    Weekday (repeats weekly)
                  </span>
                  <select
                    value={form.weekday}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, weekday: event.target.value }))
                    }
                    className="w-full rounded-lg border border-portal-line bg-portal-canvas px-3 py-2.5 text-sm outline-none focus:border-portal-ink"
                  >
                    {WEEKDAY_LABELS.map((label, index) => (
                      <option key={label} value={index}>
                        {label}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="block">
                  <span className="mb-1.5 block text-xs text-portal-muted">Time</span>
                  <input
                    value={form.timeRange}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, timeRange: event.target.value }))
                    }
                    placeholder="06:00 - 07:00"
                    className="w-full rounded-lg border border-portal-line bg-portal-canvas px-3 py-2.5 text-sm outline-none focus:border-portal-ink"
                  />
                </label>

                <label className="block">
                  <span className="mb-1.5 block text-xs text-portal-muted">Duration</span>
                  <input
                    value={form.duration}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, duration: event.target.value }))
                    }
                    placeholder="60 min"
                    className="w-full rounded-lg border border-portal-line bg-portal-canvas px-3 py-2.5 text-sm outline-none focus:border-portal-ink"
                  />
                </label>

                <label className="block">
                  <span className="mb-1.5 block text-xs text-portal-muted">Studio</span>
                  <select
                    value={form.studio}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, studio: event.target.value }))
                    }
                    className="w-full rounded-lg border border-portal-line bg-portal-canvas px-3 py-2.5 text-sm outline-none focus:border-portal-ink"
                  >
                    {STUDIOS.map((entry) => (
                      <option key={entry} value={entry}>
                        {entry}
                      </option>
                    ))}
                  </select>
                </label>

                {editingId ? (
                  <label className="flex items-center gap-2 self-end">
                    <input
                      type="checkbox"
                      checked={form.isActive}
                      onChange={(event) =>
                        setForm((current) => ({ ...current, isActive: event.target.checked }))
                      }
                      className="size-4 rounded border-portal-line"
                    />
                    <span className="text-sm text-portal-ink">Active on public schedule</span>
                  </label>
                ) : null}
              </div>

              <label className="block">
                <span className="mb-1.5 block text-xs text-portal-muted">Description</span>
                <textarea
                  value={form.description}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, description: event.target.value }))
                  }
                  rows={3}
                  className="w-full resize-none rounded-lg border border-portal-line bg-portal-canvas px-3 py-2.5 text-sm outline-none focus:border-portal-ink"
                />
              </label>

              <div className="flex flex-wrap justify-end gap-3 pt-2">
                <button
                  type="button"
                  disabled={saving}
                  onClick={closeFormModal}
                  className="inline-flex min-h-[42px] items-center justify-center rounded-lg border border-portal-line px-5 text-sm font-medium text-portal-ink"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex min-h-[42px] items-center justify-center rounded-lg bg-portal-ink px-5 text-sm font-medium text-white transition hover:bg-black disabled:opacity-60"
                >
                  {saving ? 'Saving…' : editingId ? 'Save changes' : 'Create class'}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {deleteTargetId !== null ? (
        <AdminAccountConfirmModal
          title="Delete class"
          message="Are you really want to delete this class?"
          confirmLabel="Yes"
          cancelLabel="No"
          confirmTone="danger"
          loading={saving}
          onCancel={() => !saving && setDeleteTargetId(null)}
          onConfirm={() => void handleDeleteConfirm()}
        />
      ) : null}
    </div>
  )
}
