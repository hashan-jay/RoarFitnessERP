import { useEffect, useMemo, useState } from 'react'

import { formatCurrency } from '../../lib/formatters'
import { ApiError, inventoryService, posService } from '../../services'
import { usePortalToast } from '../PortalToast/PortalToast'
import type { PosBill, Product } from '../../types/api'
import { PosBillReceipt } from './PosBillReceipt'

interface CartEntry {
  product: Product
  quantity: number
}

const inputClass =
  'w-full rounded-lg border border-portal-line bg-portal-canvas px-3 py-2.5 text-sm text-portal-ink outline-none focus:border-portal-ink'

const primaryBtnClass =
  'rounded-lg bg-portal-ink px-4 py-2 text-sm font-medium text-white transition hover:bg-black disabled:opacity-60'

const secondaryBtnClass =
  'rounded-lg border border-portal-line px-3 py-1.5 text-xs font-semibold text-portal-ink transition hover:bg-portal-canvas'

export function AdminPOSPage() {
  const toast = usePortalToast()
  const [products, setProducts] = useState<Product[]>([])
  const [cart, setCart] = useState<CartEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'Card'>('Cash')
  const [processing, setProcessing] = useState(false)
  const [bill, setBill] = useState<PosBill | null>(null)

  const loadProducts = async () => {
    setLoading(true)
    try {
      const items = await inventoryService.getAll()
      setProducts(items.filter((product) => product.isActive !== false))
    } catch (err) {
      setProducts([])
      toast.error(err instanceof ApiError ? err.message : 'Could not load products.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadProducts()
  }, [])

  const addToCart = (product: Product) => {
    const stock = product.quantityOnHand ?? 0
    if (stock <= 0) return

    setCart((prev) => {
      const existing = prev.find((entry) => entry.product.productId === product.productId)
      if (existing) {
        const nextQty = existing.quantity + 1
        if (nextQty > stock) return prev
        return prev.map((entry) =>
          entry.product.productId === product.productId
            ? { ...entry, quantity: nextQty }
            : entry,
        )
      }
      return [...prev, { product, quantity: 1 }]
    })
  }

  const updateQty = (productId: number, delta: number) => {
    setCart((prev) =>
      prev
        .map((entry) => {
          if (entry.product.productId !== productId) return entry
          const stock = entry.product.quantityOnHand ?? 0
          const nextQty = entry.quantity + delta
          if (nextQty > stock) return entry
          return { ...entry, quantity: nextQty }
        })
        .filter((entry) => entry.quantity > 0),
    )
  }

  const total = useMemo(
    () => cart.reduce((sum, entry) => sum + entry.product.unitPriceLKR * entry.quantity, 0),
    [cart],
  )

  const handleCheckout = async () => {
    if (cart.length === 0) return
    setProcessing(true)
    setBill(null)

    const items = cart.map((entry) => ({
      productId: entry.product.productId,
      quantity: entry.quantity,
    }))

    try {
      const result = await posService.createSale(items, paymentMethod)
      setBill(result.bill)
      toast.success(`Sale complete. Bill ${result.bill.billReference} generated.`)
      setCart([])
      await loadProducts()
    } catch (err) {
      toast.error(
        err instanceof ApiError
          ? err.message
          : 'Sale could not be completed. Ensure stock is available.',
      )
    } finally {
      setProcessing(false)
    }
  }

  return (
    <div className="space-y-6">
      <header className="border-b border-portal-line pb-6">
        <p className="text-xs font-medium text-portal-muted">Point of sale</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-portal-ink sm:text-3xl">
          In-gym retail
        </h1>
        <p className="mt-2 text-sm text-portal-muted">
          Sell supplements and merchandise at the counter with instant billing.
        </p>
      </header>

      <div className="grid gap-4 lg:grid-cols-[1fr_22rem]">
        <section className="space-y-4">
          <h2 className="text-sm font-semibold text-portal-ink">Products</h2>
          {loading ? (
            <p className="text-sm text-portal-muted">Loading products…</p>
          ) : products.length === 0 ? (
            <p className="portal-widget-3d rounded-xl border border-portal-line bg-portal-card p-5 text-sm text-portal-muted">
              No active products available for sale.
            </p>
          ) : (
            <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {products.map((product) => {
                const stock = product.quantityOnHand ?? 0
                const outOfStock = stock <= 0
                return (
                  <li
                    key={product.productId}
                    className="portal-widget-3d flex flex-col rounded-xl border border-portal-line bg-portal-card p-4"
                  >
                    {product.imageUrl ? (
                      <img
                        src={product.imageUrl}
                        alt=""
                        className="mb-3 h-28 w-full rounded-lg object-cover"
                      />
                    ) : (
                      <div className="mb-3 flex h-28 items-center justify-center rounded-lg bg-portal-canvas text-xs text-portal-muted">
                        No image
                      </div>
                    )}
                    <p className="text-sm font-semibold text-portal-ink">{product.productName}</p>
                    <p className="mt-1 text-xs text-portal-muted">{product.sku}</p>
                    <p className="mt-2 text-base font-semibold text-portal-ink">
                      {formatCurrency(product.unitPriceLKR)}
                    </p>
                    <p className="mt-1 text-xs text-portal-muted">Stock: {stock}</p>
                    <button
                      type="button"
                      onClick={() => addToCart(product)}
                      disabled={outOfStock}
                      className={`mt-4 ${primaryBtnClass} w-full`}
                    >
                      {outOfStock ? 'Out of stock' : 'Add to cart'}
                    </button>
                  </li>
                )
              })}
            </ul>
          )}
        </section>

        <aside className="portal-widget-3d flex flex-col rounded-xl border border-portal-line bg-portal-card p-5">
          <h2 className="text-sm font-semibold text-portal-ink">Current sale</h2>
          <div className="mt-4 flex-1 space-y-2">
            {cart.length === 0 ? (
              <p className="text-sm text-portal-muted">No items in sale.</p>
            ) : (
              cart.map((entry) => (
                <div
                  key={entry.product.productId}
                  className="flex items-start justify-between gap-3 rounded-lg border border-portal-line bg-portal-canvas px-3 py-2.5"
                >
                  <div>
                    <p className="text-sm font-medium text-portal-ink">
                      {entry.product.productName}
                    </p>
                    <p className="text-xs text-portal-muted">
                      {formatCurrency(entry.product.unitPriceLKR)} each
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => updateQty(entry.product.productId, -1)}
                      className={secondaryBtnClass}
                    >
                      −
                    </button>
                    <span className="min-w-[1.5rem] text-center text-sm font-semibold text-portal-ink">
                      {entry.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => updateQty(entry.product.productId, 1)}
                      className={secondaryBtnClass}
                    >
                      +
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {cart.length > 0 && (
            <div className="mt-4 space-y-3 border-t border-portal-line pt-4">
              <div>
                <label className="mb-1 block text-xs font-medium text-portal-muted">
                  Payment method
                </label>
                <select
                  className={inputClass}
                  value={paymentMethod}
                  onChange={(event) =>
                    setPaymentMethod(event.target.value as 'Cash' | 'Card')
                  }
                >
                  <option value="Cash">Cash</option>
                  <option value="Card">Card</option>
                </select>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-portal-muted">Total</span>
                <span className="text-lg font-semibold text-portal-ink">
                  {formatCurrency(total)}
                </span>
              </div>
              <button
                type="button"
                onClick={handleCheckout}
                disabled={processing}
                className={`${primaryBtnClass} w-full`}
              >
                {processing ? 'Processing…' : 'Complete sale'}
              </button>
            </div>
          )}
        </aside>
      </div>

      {bill && <PosBillReceipt bill={bill} onClose={() => setBill(null)} />}
    </div>
  )
}
