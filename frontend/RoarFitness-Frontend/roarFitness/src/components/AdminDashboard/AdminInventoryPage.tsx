import { Fragment, type FormEvent, useEffect, useState } from 'react'

import { formatCurrency } from '../../lib/formatters'
import { ApiError, inventoryService } from '../../services'
import { usePortalToast } from '../PortalToast/PortalToast'
import type {
  CreateProductRequest,
  Product,
  ProductCategory,
  UpdateProductRequest,
} from '../../types/api'

const EMPTY_FORM: CreateProductRequest = {
  categoryId: 0,
  sku: '',
  productName: '',
  description: '',
  unitPriceLKR: 0,
  initialQuantity: 0,
  reorderLevel: 5,
  imageUrl: '',
}

const inputClass =
  'w-full rounded-lg border border-portal-line bg-portal-canvas px-3 py-2.5 text-sm text-portal-ink outline-none focus:border-portal-ink'

const primaryBtnClass =
  'rounded-lg bg-portal-ink px-4 py-2 text-sm font-medium text-white transition hover:bg-black disabled:opacity-60'

const secondaryBtnClass =
  'rounded-lg border border-portal-line px-3 py-1.5 text-xs font-semibold text-portal-ink transition hover:bg-portal-canvas'

export function AdminInventoryPage() {
  const toast = usePortalToast()
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<ProductCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Product | null>(null)
  const [form, setForm] = useState<CreateProductRequest>(EMPTY_FORM)
  const [adjustingId, setAdjustingId] = useState<number | null>(null)
  const [adjustQty, setAdjustQty] = useState(0)
  const [adjustReason, setAdjustReason] = useState('')
  const [saving, setSaving] = useState(false)

  const loadData = async () => {
    setLoading(true)

    let itemsOk = false
    let catsOk = false

    try {
      setProducts(await inventoryService.getAll())
      itemsOk = true
    } catch (err) {
      setProducts([])
      toast.error(
        err instanceof ApiError ? err.message : 'Could not load inventory.',
      )
    }

    try {
      const cats = await inventoryService.getCategories()
      setCategories(cats)
      catsOk = true
      if (cats.length > 0) {
        setForm((prev) =>
          prev.categoryId ? prev : { ...prev, categoryId: cats[0].categoryId },
        )
      }
    } catch {
      setCategories([])
      if (itemsOk) {
        toast.error('Categories could not be loaded. Product list is still available.')
      }
    }

    if (!itemsOk && !catsOk) {
      toast.error('Could not load inventory data.')
    }

    setLoading(false)
  }

  useEffect(() => {
    void loadData()
  }, [])

  const openCreate = () => {
    if (categories.length === 0) {
      toast.error('No product categories are available. Restart the API or check the database seed.')
      return
    }
    setEditing(null)
    setForm({
      ...EMPTY_FORM,
      categoryId: categories[0].categoryId,
    })
    setModalOpen(true)
  }

  const openEdit = (product: Product) => {
    setEditing(product)
    setForm({
      categoryId: product.categoryId ?? categories[0]?.categoryId ?? 0,
      sku: product.sku,
      productName: product.productName,
      description: product.description ?? '',
      unitPriceLKR: product.unitPriceLKR,
      initialQuantity: product.quantityOnHand ?? 0,
      reorderLevel: product.reorderLevel ?? 5,
      imageUrl: product.imageUrl ?? '',
    })
    setModalOpen(true)
  }

  const handleSave = async (event: FormEvent) => {
    event.preventDefault()
    setSaving(true)

    const payload: CreateProductRequest = {
      ...form,
      sku: form.sku.trim(),
      productName: form.productName.trim(),
      description: form.description?.trim() || undefined,
      imageUrl: form.imageUrl?.trim() || undefined,
    }

    if (!payload.categoryId) {
      toast.error('Select a product category before saving.')
      setSaving(false)
      return
    }
    if (!payload.sku || !payload.productName) {
      toast.error('SKU and product name are required.')
      setSaving(false)
      return
    }
    if (payload.unitPriceLKR < 0) {
      toast.error('Unit price must be zero or greater.')
      setSaving(false)
      return
    }

    try {
      if (editing) {
        const update: UpdateProductRequest = {
          categoryId: payload.categoryId,
          sku: payload.sku,
          productName: payload.productName,
          description: payload.description,
          unitPriceLKR: payload.unitPriceLKR,
          reorderLevel: payload.reorderLevel,
          isActive: editing.isActive !== false,
          imageUrl: payload.imageUrl,
        }
        await inventoryService.update(editing.productId, update)
        toast.success('Product updated.')
      } else {
        await inventoryService.create(payload)
        toast.success('Product added to inventory.')
      }
      setModalOpen(false)
      await loadData()
    } catch (err) {
      toast.error(
        err instanceof ApiError
          ? err.message
          : 'Could not save product. Check SKU uniqueness and required fields.',
      )
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (product: Product) => {
    if (!window.confirm(`Remove "${product.productName}" from inventory?`)) return
    setSaving(true)
    try {
      await inventoryService.remove(product.productId)
      toast.success('Product removed.')
      await loadData()
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Could not remove product.')
    } finally {
      setSaving(false)
    }
  }

  const handleClear = async (product: Product) => {
    const reason = window.prompt(
      `Reason for clearing stock of "${product.productName}":`,
    )
    if (!reason?.trim()) return
    setSaving(true)
    try {
      await inventoryService.clearStock(product.productId, reason.trim())
      toast.success('Stock cleared.')
      await loadData()
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Could not clear stock.')
    } finally {
      setSaving(false)
    }
  }

  const handleAdjust = async (event: FormEvent, productId: number) => {
    event.preventDefault()
    if (!adjustReason.trim()) return
    setSaving(true)
    try {
      await inventoryService.adjust(productId, adjustQty, adjustReason.trim())
      toast.success('Inventory adjusted.')
      setAdjustingId(null)
      setAdjustQty(0)
      setAdjustReason('')
      await loadData()
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Could not adjust inventory.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-4 border-b border-portal-line pb-6">
        <div>
          <p className="text-xs font-medium text-portal-muted">Inventory</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-portal-ink sm:text-3xl">
            Stock management
          </h1>
          <p className="mt-2 text-sm text-portal-muted">
            Add, edit, and manage supplements and merchandise sold at the gym POS.
          </p>
        </div>
        <button type="button" onClick={openCreate} className={primaryBtnClass}>
          Add item
        </button>
      </header>

      <section className="portal-widget-3d overflow-hidden rounded-xl border border-portal-line bg-portal-card">
        {loading ? (
          <p className="p-5 text-sm text-portal-muted">Loading inventory…</p>
        ) : products.length === 0 ? (
          <p className="p-5 text-sm text-portal-muted">
            No inventory items found. Add your first product.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-portal-line bg-portal-canvas text-xs font-semibold uppercase tracking-wide text-portal-muted">
                <tr>
                  <th className="px-4 py-3">SKU</th>
                  <th className="px-4 py-3">Product</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Price</th>
                  <th className="px-4 py-3">Qty</th>
                  <th className="px-4 py-3">Reorder</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((item) => (
                  <Fragment key={item.productId}>
                    <tr
                      className={`border-b border-portal-line ${
                        item.isActive === false ? 'opacity-60' : ''
                      }`}
                    >
                      <td className="px-4 py-3 font-medium text-portal-ink">{item.sku}</td>
                      <td className="px-4 py-3 text-portal-ink">{item.productName}</td>
                      <td className="px-4 py-3 text-portal-muted">{item.categoryName ?? '—'}</td>
                      <td className="px-4 py-3 text-portal-ink">
                        {formatCurrency(item.unitPriceLKR)}
                      </td>
                      <td className="px-4 py-3 text-portal-ink">
                        {item.quantityOnHand ?? 0}
                      </td>
                      <td className="px-4 py-3 text-portal-muted">
                        {item.reorderLevel ?? 5}
                      </td>
                      <td className="px-4 py-3">
                        {item.isActive === false ? (
                          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase text-slate-600">
                            Removed
                          </span>
                        ) : (item.quantityOnHand ?? 0) <= (item.reorderLevel ?? 5) ? (
                          <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold uppercase text-amber-800">
                            Low stock
                          </span>
                        ) : (
                          <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold uppercase text-emerald-800">
                            OK
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => openEdit(item)}
                            className={secondaryBtnClass}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              setAdjustingId(
                                adjustingId === item.productId ? null : item.productId,
                              )
                            }
                            className={secondaryBtnClass}
                          >
                            Adjust
                          </button>
                          <button
                            type="button"
                            onClick={() => handleClear(item)}
                            className={secondaryBtnClass}
                          >
                            Clear
                          </button>
                          {item.isActive !== false && (
                            <button
                              type="button"
                              onClick={() => handleDelete(item)}
                              className="rounded-lg border border-rose-200 px-3 py-1.5 text-xs font-semibold text-rose-700 transition hover:bg-rose-50"
                            >
                              Remove
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                    {adjustingId === item.productId && (
                      <tr className="border-b border-portal-line bg-portal-canvas/60">
                        <td colSpan={8} className="px-4 py-4">
                          <form
                            onSubmit={(event) => handleAdjust(event, item.productId)}
                            className="flex flex-wrap items-end gap-3"
                          >
                            <div className="min-w-[8rem] flex-1">
                              <label className="mb-1 block text-xs font-medium text-portal-muted">
                                Qty change (+/-)
                              </label>
                              <input
                                type="number"
                                required
                                className={inputClass}
                                value={adjustQty || ''}
                                onChange={(event) =>
                                  setAdjustQty(Number(event.target.value))
                                }
                              />
                            </div>
                            <div className="min-w-[12rem] flex-[2]">
                              <label className="mb-1 block text-xs font-medium text-portal-muted">
                                Reason
                              </label>
                              <input
                                required
                                className={inputClass}
                                value={adjustReason}
                                onChange={(event) => setAdjustReason(event.target.value)}
                                placeholder="Restock, damage, etc."
                              />
                            </div>
                            <button type="submit" className={primaryBtnClass} disabled={saving}>
                              Save adjustment
                            </button>
                          </form>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-portal-ink/40 p-4"
          onClick={() => setModalOpen(false)}
        >
          <div
            className="portal-widget-3d max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl border border-portal-line bg-portal-card p-6 shadow-xl"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <h2 className="text-lg font-semibold text-portal-ink">
              {editing ? 'Edit product' : 'Add product'}
            </h2>
            <form onSubmit={handleSave} className="mt-4 space-y-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-portal-muted">
                  Category
                </label>
                <select
                  required
                  className={inputClass}
                  value={form.categoryId}
                  onChange={(event) =>
                    setForm({ ...form, categoryId: Number(event.target.value) })
                  }
                  disabled={categories.length === 0}
                >
                  {categories.length === 0 ? (
                    <option value={0}>No categories available</option>
                  ) : (
                    categories.map((category) => (
                      <option key={category.categoryId} value={category.categoryId}>
                        {category.categoryName}
                      </option>
                    ))
                  )}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-portal-muted">SKU</label>
                <input
                  required
                  className={inputClass}
                  value={form.sku}
                  onChange={(event) => setForm({ ...form, sku: event.target.value })}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-portal-muted">
                  Product name
                </label>
                <input
                  required
                  className={inputClass}
                  value={form.productName}
                  onChange={(event) =>
                    setForm({ ...form, productName: event.target.value })
                  }
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-portal-muted">
                  Description
                </label>
                <textarea
                  className={inputClass}
                  rows={2}
                  value={form.description}
                  onChange={(event) =>
                    setForm({ ...form, description: event.target.value })
                  }
                />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-medium text-portal-muted">
                    Unit price (LKR)
                  </label>
                  <input
                    type="number"
                    min={0}
                    step="0.01"
                    required
                    className={inputClass}
                    value={form.unitPriceLKR || ''}
                    onChange={(event) =>
                      setForm({ ...form, unitPriceLKR: Number(event.target.value) })
                    }
                  />
                </div>
                {!editing && (
                  <div>
                    <label className="mb-1 block text-xs font-medium text-portal-muted">
                      Initial quantity
                    </label>
                    <input
                      type="number"
                      min={0}
                      required
                      className={inputClass}
                      value={form.initialQuantity || ''}
                      onChange={(event) =>
                        setForm({ ...form, initialQuantity: Number(event.target.value) })
                      }
                    />
                  </div>
                )}
                <div className={editing ? '' : 'sm:col-span-2'}>
                  <label className="mb-1 block text-xs font-medium text-portal-muted">
                    Reorder level
                  </label>
                  <input
                    type="number"
                    min={0}
                    required
                    className={inputClass}
                    value={form.reorderLevel || ''}
                    onChange={(event) =>
                      setForm({ ...form, reorderLevel: Number(event.target.value) })
                    }
                  />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-portal-muted">
                  Image URL (optional)
                </label>
                <input
                  className={inputClass}
                  value={form.imageUrl}
                  onChange={(event) => setForm({ ...form, imageUrl: event.target.value })}
                  placeholder="https://..."
                />
              </div>
              <div className="flex flex-wrap gap-2 pt-2">
                <button type="submit" className={primaryBtnClass} disabled={saving}>
                  {editing ? 'Save changes' : 'Add product'}
                </button>
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className={secondaryBtnClass}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
