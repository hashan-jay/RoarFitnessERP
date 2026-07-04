/**
 * POS bill receipt modal with screen preview and print-only document. Used after
 * admin in-gym sales complete. Role: Admin.
 */
import { formatCurrency, formatDate } from '../../lib/formatters';
import type { PosBill } from '../../types';

interface PosBillReceiptProps {
  bill: PosBill;
  onClose: () => void;
}

export function PosBillReceipt({ bill, onClose }: PosBillReceiptProps) {
  /** Scope print styles to the receipt document, then restore body class. */
  const handlePrint = () => {
    document.body.classList.add('printing-pos-bill');
    window.print();
    window.addEventListener(
      'afterprint',
      () => document.body.classList.remove('printing-pos-bill'),
      { once: true }
    );
  };

  return (
    <>
      <div className="modal-overlay pos-bill-overlay">
        <div className="modal-card pos-bill-modal">
          <div className="pos-bill-screen">
            <div className="pos-bill-screen__header">
              <h2>Sale Complete</h2>
              <p>
                Bill reference: <strong>{bill.billReference}</strong>
              </p>
              <p style={{ color: 'var(--color-text-muted)', marginTop: 'var(--spacing-sm)' }}>
                Give the printed bill to the customer. References are stored in the system.
              </p>
            </div>
            <div className="pos-bill-screen__actions">
              <button type="button" className="btn btn--primary" onClick={handlePrint}>
                Print Bill
              </button>
              <button type="button" className="btn btn--outline" onClick={onClose}>
                Close
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="pos-bill-print-source" aria-hidden="true">
        <PosBillDocument bill={bill} />
      </div>
    </>
  );
}

export function PosBillDocument({ bill }: { bill: PosBill }) {
  return (
    <div className="pos-bill-document">
      <div className="pos-bill-document__header">
        <h1>Roar Fitness</h1>
        <p>Official POS Receipt</p>
      </div>

      <div className="pos-bill-document__meta">
        <div><span>Bill No.</span><strong>{bill.billReference}</strong></div>
        <div><span>Order Ref.</span><strong>{bill.orderReference}</strong></div>
        <div><span>Payment Ref.</span><strong>{bill.paymentReference}</strong></div>
        <div><span>Date</span><strong>{formatDate(bill.saleDate)}</strong></div>
        <div><span>Payment</span><strong>{bill.paymentMethod}</strong></div>
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
        <div><span>Subtotal</span><strong>{formatCurrency(bill.subtotalLKR)}</strong></div>
        <div className="pos-bill-document__grand">
          <span>Total Paid</span>
          <strong>{formatCurrency(bill.totalLKR)}</strong>
        </div>
      </div>

      <p className="pos-bill-document__footer">
        Thank you for shopping at Roar Fitness. Please retain this bill for your records.
      </p>
    </div>
  );
}
