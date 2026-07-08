import { formatCurrency, formatDate, formatAppDateTime } from '../../lib/formatters'
import { downloadHtmlBill } from '../../lib/downloadBill'
import type { MembershipRenewBill } from '../../types/api'

interface MembershipRenewBillReceiptProps {
  bill: MembershipRenewBill
  onClose: () => void
}

export function MembershipRenewBillReceipt({ bill, onClose }: MembershipRenewBillReceiptProps) {
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
    downloadHtmlBill(`${bill.billReference}.html`, renderMembershipRenewBillHtml(bill))
  }

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-portal-ink/40 p-4 print:hidden">
        <div className="portal-widget-3d max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl border border-portal-line bg-portal-card p-6 shadow-xl">
          <h2 className="text-lg font-semibold text-portal-ink">Membership renewed</h2>
          <p className="mt-1 text-sm text-portal-muted">
            Bill reference: <strong>{bill.billReference}</strong>
          </p>
          <p className="mt-2 text-xs text-portal-muted">
            Give the printed bill to the member. Payment time: {formatAppDateTime(bill.saleDate)}.
          </p>

          <div className="mt-5 rounded-lg border border-portal-line bg-portal-canvas p-4">
            <MembershipRenewBillDocument bill={bill} />
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
        <MembershipRenewBillDocument bill={bill} />
      </div>
    </>
  )
}

export function MembershipRenewBillDocument({ bill }: { bill: MembershipRenewBill }) {
  return (
    <div className="pos-bill-document">
      <div className="pos-bill-document__header">
        <h1>Roar Fitness</h1>
        <p>Membership Renewal Receipt</p>
      </div>

      <div className="pos-bill-document__meta">
        <div>
          <span>Bill No.</span>
          <strong>{bill.billReference}</strong>
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
        <div>
          <span>Member ID</span>
          <strong>{bill.identificationNumber}</strong>
        </div>
        <div>
          <span>Member</span>
          <strong>{bill.memberName}</strong>
        </div>
        {bill.phone && (
          <div>
            <span>Contact</span>
            <strong>{bill.phone}</strong>
          </div>
        )}
        {bill.nicNumber && (
          <div>
            <span>NIC</span>
            <strong>{bill.nicNumber}</strong>
          </div>
        )}
      </div>

      <table className="pos-bill-document__table">
        <thead>
          <tr>
            <th>Package</th>
            <th>Duration</th>
            <th>Amount</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>{bill.packageName}</td>
            <td>{bill.durationDays} days</td>
            <td>{formatCurrency(bill.amountLKR)}</td>
          </tr>
        </tbody>
      </table>

      <div className="pos-bill-document__meta">
        <div>
          <span>Membership start</span>
          <strong>{formatDate(bill.membershipStartDate)}</strong>
        </div>
        <div>
          <span>Membership end</span>
          <strong>{formatDate(bill.membershipEndDate)}</strong>
        </div>
      </div>

      <div className="pos-bill-document__totals">
        <div className="pos-bill-document__grand">
          <span>Total paid</span>
          <strong>{formatCurrency(bill.amountLKR)}</strong>
        </div>
      </div>

      <p className="pos-bill-document__footer">
        Thank you for renewing at Roar Fitness. Please retain this bill for your records.
      </p>
    </div>
  )
}

function renderMembershipRenewBillHtml(bill: MembershipRenewBill): string {
  return `
    <h1>Roar Fitness</h1>
    <p>Membership Renewal Receipt</p>
    <div class="meta">
      <div><span>Bill No.</span><strong>${bill.billReference}</strong></div>
      <div><span>Payment Ref.</span><strong>${bill.paymentReference}</strong></div>
      <div><span>Date &amp; time</span><strong>${formatAppDateTime(bill.saleDate)}</strong></div>
      <div><span>Payment</span><strong>${bill.paymentMethod}</strong></div>
      <div><span>Member ID</span><strong>${bill.identificationNumber}</strong></div>
      <div><span>Member</span><strong>${bill.memberName}</strong></div>
    </div>
    <table>
      <thead><tr><th>Package</th><th>Duration</th><th>Amount</th></tr></thead>
      <tbody>
        <tr>
          <td>${bill.packageName}</td>
          <td>${bill.durationDays} days</td>
          <td>${formatCurrency(bill.amountLKR)}</td>
        </tr>
      </tbody>
    </table>
    <div class="meta">
      <div><span>Membership Start</span><strong>${formatDate(bill.membershipStartDate)}</strong></div>
      <div><span>Membership End</span><strong>${formatDate(bill.membershipEndDate)}</strong></div>
    </div>
    <div class="total">Total Paid: ${formatCurrency(bill.amountLKR)}</div>
  `
}
