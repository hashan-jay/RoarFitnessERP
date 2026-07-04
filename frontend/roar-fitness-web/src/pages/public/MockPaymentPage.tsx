/**
 * Development-only mock payment gateway. Confirms membership or session
 * payments based on URL query params and redirects to the appropriate portal.
 */
import { useState, type FormEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { paymentService, ApiError } from '../../services';
import { formatCurrency } from '../../components/common';

export function MockPaymentPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [cardNumber, setCardNumber] = useState('4111 1111 1111 1111');
  const [cardName, setCardName] = useState('');
  const [expiry, setExpiry] = useState('12/28');
  const [cvv, setCvv] = useState('123');
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');

  const paymentReference = params.get('ref') ?? '';
  const amount = Number(params.get('amount') ?? 0);
  const packageId = Number(params.get('packageId') ?? 0);
  const sessionId = Number(params.get('sessionId') ?? 0);
  const purpose = params.get('purpose') ?? (sessionId > 0 ? 'session' : 'membership');
  const item = params.get('item')?.replace(/\+/g, ' ') ?? 'Roar Fitness Payment';

  const isMembership = purpose === 'membership';
  const isSession = purpose === 'session';

  const isValid =
    paymentReference &&
    amount > 0 &&
    (isMembership ? packageId > 0 : isSession ? sessionId > 0 : false);

  const handlePay = async (e: FormEvent) => {
    e.preventDefault();
    if (!isValid) return;

    setProcessing(true);
    setError('');

    try {
      const txnId = `MOCK-${Date.now()}`;

      if (isMembership) {
        await paymentService.confirmMembershipPayment(paymentReference, txnId, packageId);
        navigate('/login?payment=success', {
          state: { message: 'Payment successful. Your membership is active — you can sign in now.' },
        });
      } else if (isSession) {
        await paymentService.confirmSessionPayment(paymentReference, txnId, sessionId);
        navigate('/member/sessions', {
          state: { message: 'Payment successful. You are enrolled in the special session.', tab: 'mine' },
        });
      }
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : 'Payment could not be completed. Ensure the API is running and try again.'
      );
    } finally {
      setProcessing(false);
    }
  };

  if (!isValid) {
    return (
      <div className="auth-layout">
        <div className="auth-card">
          <div className="auth-card__header">
            <div className="auth-card__logo">R</div>
            <h1>Invalid Payment Link</h1>
            <p style={{ color: 'var(--color-text-muted)' }}>
              This checkout session is missing or expired.
            </p>
          </div>
          <Link to="/" className="btn btn--primary btn--block">
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-layout">
      <div className="auth-card mock-payment">
        <div className="auth-card__header">
          <div className="auth-card__logo">R</div>
          <h1>Roar Fitness Checkout</h1>
          <p style={{ color: 'var(--color-text-muted)' }}>
            Test payment portal — no real charges are made
          </p>
        </div>

        <div className="mock-payment__summary">
          <div>
            <span className="mock-payment__label">Item</span>
            <strong>{item}</strong>
          </div>
          <div>
            <span className="mock-payment__label">Reference</span>
            <strong>{paymentReference}</strong>
          </div>
          <div className="mock-payment__total">
            <span>Total due</span>
            <strong>{formatCurrency(amount)}</strong>
          </div>
        </div>

        {error && <div className="alert alert--error">{error}</div>}

        <form onSubmit={handlePay}>
          <div className="form-group">
            <label htmlFor="cardName">Name on card</label>
            <input
              id="cardName"
              required
              placeholder="John Doe"
              value={cardName}
              onChange={(e) => setCardName(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label htmlFor="cardNumber">Card number</label>
            <input
              id="cardNumber"
              required
              value={cardNumber}
              onChange={(e) => setCardNumber(e.target.value)}
            />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="expiry">Expiry</label>
              <input
                id="expiry"
                required
                value={expiry}
                onChange={(e) => setExpiry(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label htmlFor="cvv">CVV</label>
              <input
                id="cvv"
                required
                value={cvv}
                onChange={(e) => setCvv(e.target.value)}
              />
            </div>
          </div>

          <button type="submit" className="btn btn--primary btn--block" disabled={processing}>
            {processing ? 'Processing...' : `Pay ${formatCurrency(amount)}`}
          </button>
        </form>

        <p className="mock-payment__note">
          Development mode only. Click pay to simulate a successful transaction.
        </p>
      </div>
    </div>
  );
}
