import { formatCurrency, formatAppDateTime } from '../../lib/formatters'
import { downloadHtmlBill } from '../../lib/downloadBill'
import type { PosBill } from '../../types/api'

interface PosBillReceiptProps {
  bill: PosBill
  onClose: () => void
}

export function PosBillReceipt({ bill, onClose }: PosBillReceiptProps) {
  const handlePrint = () => {
    document.body.classList.add('printing-pos-bill')
    window.print()
    window.addEventListener(
      'afterprint',
      () => document.body.classList.remove('printing-pos-bill'),
      { once: true },
    )
  }

  const handleSave = () => {
    downloadHtmlBill(`${bill.billReference}.html`, renderPosBillHtml(bill))
  }

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-portal-ink/40 p-4 print:hidden">
        <div className="portal-widget-3d max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl border border-portal-line bg-portal-card p-6 shadow-xl">
          <h2 className="text-lg font-semibold text-portal-ink">Sale complete</h2>
          <p className="mt-1 text-sm text-portal-muted">
            Bill reference: <strong>{bill.billReference}</strong>
          </p>
          <p className="mt-2 text-xs text-portal-muted">
            Give the printed bill to the customer. Sale time: {formatAppDateTime(bill.saleDate)}.
          </p>

          <div className="mt-5 rounded-lg border border-portal-line bg-portal-canvas p-4">
            <PosBillDocument bill={bill} />
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="rounded-lg bg-portal-ink px-4 py-2 text-sm font-medium text-white hover:bg-black"
            >
              Print bill
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="rounded-lg border border-portal-line px-4 py-2 text-sm font-medium text-portal-ink hover:bg-portal-canvas"
            >
              Save bill to PC
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-portal-line px-4 py-2 text-sm font-medium text-portal-ink hover:bg-portal-canvas"
            >
              Close
            </button>
          </div>
        </div>
      </div>

      <div className="pos-bill-print-source" aria-hidden="true">
        <PosBillDocument bill={bill} />
      </div>
    </>
  )
}

export function PosBillDocument({ bill }: { bill: PosBill }) {
  return (
    <div className="pos-bill-document">
      <div className="pos-bill-document__header">
        <h1>Roar Fitness</h1>
        <p>Official POS Receipt</p>
      </div>

      <div className="pos-bill-document__meta">
        <div>
          <span>Bill No.</span>
          <strong>{bill.billReference}</strong>
        </div>
        <div>
          <span>Order Ref.</span>
          <strong>{bill.orderReference}</strong>
        </div>
        <div>
          <span>Payment Ref.</span>
          <strong>{bill.paymentReference}</strong>
        </div>
        <div>
          <span>Date &amp; time</span>
          <strong>{formatAppDateTime(bill.saleDate)}</strong>
        </div>
        <div>
          <span>Payment</span>
          <strong>{bill.paymentMethod}</strong>
        </div>
      </div>

      <table className="pos-bill-document__table">
        <thead>
          <tr>
            <th>Item</th>
            <th>SKU</th>
            <th>Qty</th>
            <th>Unit</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          {bill.items.map((item) => (
            <tr key={`${item.sku}-${item.quantity}`}>
              <td>{item.productName}</td>
              <td>{item.sku}</td>
              <td>{item.quantity}</td>
              <td>{formatCurrency(item.unitPriceLKR)}</td>
              <td>{formatCurrency(item.lineTotal)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="pos-bill-document__totals">
        <div>
          <span>Subtotal</span>
          <strong>{formatCurrency(bill.subtotalLKR)}</strong>
        </div>
        <div className="pos-bill-document__grand">
          <span>Total paid</span>
          <strong>{formatCurrency(bill.totalLKR)}</strong>
        </div>
      </div>

      <p className="pos-bill-document__footer">
        Thank you for shopping at Roar Fitness. Please retain this bill for your records.
      </p>
    </div>
  )
}

function renderPosBillHtml(bill: PosBill): string {
  const rows = bill.items
    .map(
      (item) =>
        `<tr><td>${item.productName}</td><td>${item.sku}</td><td>${item.quantity}</td><td>${formatCurrency(item.unitPriceLKR)}</td><td>${formatCurrency(item.lineTotal)}</td></tr>`,
    )
    .join('')

  return `
    <h1>Roar Fitness</h1>
    <p>Official POS Receipt</p>
    <div class="meta">
      <div><span>Bill No.</span><strong>${bill.billReference}</strong></div>
      <div><span>Order Ref.</span><strong>${bill.orderReference}</strong></div>
      <div><span>Payment Ref.</span><strong>${bill.paymentReference}</strong></div>
      <div><span>Date &amp; time</span><strong>${formatAppDateTime(bill.saleDate)}</strong></div>
      <div><span>Payment</span><strong>${bill.paymentMethod}</strong></div>
    </div>
    <table>
      <thead><tr><th>Item</th><th>SKU</th><th>Qty</th><th>Unit</th><th>Total</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>
    <div class="total">Total Paid: ${formatCurrency(bill.totalLKR)}</div>
  `
}
