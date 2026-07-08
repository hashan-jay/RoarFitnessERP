import { type FormEvent, useEffect, useState } from 'react'
import { Plus } from 'lucide-react'

import type { MembershipPlan } from '../MembershipPlans/constants'
import { formatLKR } from '../MembershipPlans/constants'
import {
  createPackage,
  deletePackage,
  updatePackage,
} from '../../utils/packageStorageAdmin'
import { getPackages, loadPackagesFromApi, slugifyPackageId } from '../../utils/packageStorage'
import { usePortalToast } from '../PortalToast/PortalToast'
import { AdminAccountConfirmModal } from './AdminAccountConfirmModal'

const PERIODS: MembershipPlan['period'][] = ['/ Month', '/ Quarter', '/ Year']

const EMPTY_FORM = {
  id: '',
  name: '',
  price: '',
  period: '/ Month' as MembershipPlan['period'],
  description: '',
  features: '',
  isPopular: false,
}

export function AdminPackagesPage() {
  const toast = usePortalToast()
  const [packages, setPackages] = useState(() => getPackages())
  const [form, setForm] = useState(EMPTY_FORM)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [formModalOpen, setFormModalOpen] = useState(false)
  const [saveConfirmOpen, setSaveConfirmOpen] = useState(false)
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null)

  const refresh = async () => {
    const next = await loadPackagesFromApi()
    setPackages(next)
  }

  useEffect(() => {
    void refresh()
  }, [])

  const closeFormModal = () => {
    setFormModalOpen(false)
    setSaveConfirmOpen(false)
    setEditingId(null)
    setForm(EMPTY_FORM)
  }

  const openCreateModal = () => {
    setEditingId(null)
    setForm(EMPTY_FORM)
    setFormModalOpen(true)
  }

  const openEditModal = (plan: MembershipPlan) => {
    setEditingId(plan.id)
    setForm({
      id: plan.id,
      name: plan.name,
      price: String(plan.price),
      period: plan.period,
      description: plan.description,
      features: plan.features.join('\n'),
      isPopular: Boolean(plan.isPopular),
    })
    setFormModalOpen(true)
  }

  const buildPlanFromForm = (): MembershipPlan | null => {
    const price = Number(form.price)
    if (!form.name.trim() || !form.description.trim()) {
      toast.error('Name and description are required.')
      return null
    }
    if (!price || price < 0) {
      toast.error('Enter a valid price.')
      return null
    }

    const features = form.features
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)

    return {
      id: form.id.trim() || slugifyPackageId(form.name),
      name: form.name.trim(),
      price,
      period: form.period,
      description: form.description.trim(),
      features: features.length > 0 ? features : ['Full gym access'],
      cta: 'Join Now',
      isPopular: form.isPopular,
    }
  }

  const persistPackage = async () => {
    const plan = buildPlanFromForm()
    if (!plan) return false

    setSaving(true)
    try {
      if (editingId) {
        await updatePackage(editingId, plan)
        toast.success('Package updated.')
      } else {
        await createPackage(plan)
        toast.success('Package created.')
      }
      await refresh()
      closeFormModal()
      return true
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Unable to save package.')
      return false
    } finally {
      setSaving(false)
    }
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()

    if (editingId) {
      if (!buildPlanFromForm()) return
      setSaveConfirmOpen(true)
      return
    }

    await persistPackage()
  }

  const handleSaveConfirm = async () => {
    setSaveConfirmOpen(false)
    await persistPackage()
  }

  const handleDeleteConfirm = async () => {
    if (!deleteTargetId) return

    setSaving(true)
    try {
      await deletePackage(deleteTargetId)
      await refresh()
      if (editingId === deleteTargetId) closeFormModal()
      toast.success('Package deleted.')
      setDeleteTargetId(null)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Unable to delete package.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-4 border-b border-portal-line pb-6">
        <div>
          <p className="text-xs font-medium text-portal-muted">Packages</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-portal-ink sm:text-3xl">
            Membership packages
          </h1>
          <p className="mt-2 text-sm text-portal-muted">
            Manage plans shown on the website and used during registration.
          </p>
        </div>
        <button
          type="button"
          onClick={openCreateModal}
          className="inline-flex min-h-[42px] shrink-0 items-center justify-center gap-2 rounded-lg bg-portal-ink px-5 text-sm font-medium text-white transition hover:bg-black"
        >
          <Plus className="size-4" aria-hidden="true" />
          Create New Package
        </button>
      </header>

      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {packages.map((plan) => (
          <li
            key={plan.id}
            className="portal-widget-3d rounded-xl border border-portal-line bg-portal-card p-4"
          >
            <div className="flex items-start justify-between gap-2">
              <p className="text-sm font-semibold text-portal-ink">{plan.name}</p>
              {plan.isPopular && (
                <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold uppercase text-amber-800">
                  Popular
                </span>
              )}
            </div>
            <p className="mt-2 text-lg font-semibold text-portal-ink">
              {formatLKR(plan.price)}
              <span className="text-xs font-medium text-portal-muted">{plan.period}</span>
            </p>
            <p className="mt-2 text-xs text-portal-muted line-clamp-2">{plan.description}</p>
            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={() => openEditModal(plan)}
                className={secondaryBtnClass}
              >
                Edit
              </button>
              <button
                type="button"
                onClick={() => setDeleteTargetId(plan.id)}
                className="rounded-lg border border-rose-200 px-3 py-1.5 text-xs font-semibold text-rose-700 transition hover:bg-rose-50"
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>

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
            aria-labelledby="package-form-title"
          >
            <h2 id="package-form-title" className="text-lg font-semibold text-portal-ink">
              {editingId ? 'Edit package' : 'Create new package'}
            </h2>

            <form onSubmit={handleSubmit} className="mt-5 grid gap-3 sm:grid-cols-2">
              <input
                className={`${inputClass} sm:col-span-2`}
                placeholder="Package name"
                value={form.name}
                onChange={(event) => setForm({ ...form, name: event.target.value })}
              />
              <input
                className={inputClass}
                placeholder="Price (LKR)"
                type="number"
                min={0}
                value={form.price}
                onChange={(event) => setForm({ ...form, price: event.target.value })}
              />
              <select
                className={inputClass}
                value={form.period}
                onChange={(event) =>
                  setForm({
                    ...form,
                    period: event.target.value as MembershipPlan['period'],
                  })
                }
              >
                {PERIODS.map((period) => (
                  <option key={period} value={period}>
                    {period}
                  </option>
                ))}
              </select>
              <textarea
                className={`${inputClass} sm:col-span-2`}
                placeholder="Description"
                rows={2}
                value={form.description}
                onChange={(event) => setForm({ ...form, description: event.target.value })}
              />
              <textarea
                className={`${inputClass} sm:col-span-2`}
                placeholder="Features (one per line)"
                rows={4}
                value={form.features}
                onChange={(event) => setForm({ ...form, features: event.target.value })}
              />
              <label className="flex items-center gap-2 text-sm text-portal-ink sm:col-span-2">
                <input
                  type="checkbox"
                  checked={form.isPopular}
                  onChange={(event) =>
                    setForm({ ...form, isPopular: event.target.checked })
                  }
                />
                Mark as most popular
              </label>

              <div className="flex flex-wrap justify-end gap-3 pt-2 sm:col-span-2">
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
                  {saving ? 'Saving…' : editingId ? 'Save changes' : 'Create package'}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {saveConfirmOpen ? (
        <AdminAccountConfirmModal
          title="Save changes"
          message="Do you really want to save?"
          confirmLabel="Yes"
          cancelLabel="No"
          confirmTone="success"
          loading={saving}
          onCancel={() => !saving && setSaveConfirmOpen(false)}
          onConfirm={() => void handleSaveConfirm()}
        />
      ) : null}

      {deleteTargetId ? (
        <AdminAccountConfirmModal
          title="Delete package"
          message="Are you really want to delete this package?"
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

const inputClass =
  'w-full rounded-lg border border-portal-line bg-portal-canvas px-3 py-2.5 text-sm text-portal-ink outline-none focus:border-portal-ink'

const secondaryBtnClass =
  'rounded-lg border border-portal-line px-3 py-1.5 text-xs font-semibold text-portal-ink transition hover:bg-portal-canvas'
