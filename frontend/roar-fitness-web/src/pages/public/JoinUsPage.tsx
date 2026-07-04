/**
 * Multi-step membership registration: choose package, create account, then pay
 * via the payment gateway. Role: Public (prospective members).
 */
import { useEffect, useState, type FormEvent } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { publicService, membershipService, paymentService, ApiError } from '../../services';
import { PackageCard } from '../../components/PackageCard';
import { LoadingSpinner } from '../../components/common';
import { formatCurrency } from '../../lib/formatters';
import { Reveal, Stagger, StaggerItem } from '../../components/motion';
import { easeSmooth } from '../../lib/motion';
import type { MembershipPackage } from '../../types';

const fallbackPackages: MembershipPackage[] = [
  { packageId: 1, packageName: 'Starter Monthly', description: 'Full gym access, locker, basic orientation', durationDays: 30, priceLKR: 8500, typeName: 'Monthly' },
  { packageId: 2, packageName: 'Power Quarterly', description: 'Full access + 2 PT sessions/month', durationDays: 90, priceLKR: 22000, typeName: 'Quarterly' },
  { packageId: 3, packageName: 'Roar Annual Elite', description: 'Unlimited access + nutrition consult + merch discount', durationDays: 365, priceLKR: 75000, typeName: 'Annual' },
];

type Step = 1 | 2 | 3;

export function JoinUsPage() {
  const [step, setStep] = useState<Step>(1);
  const [packages, setPackages] = useState<MembershipPackage[]>([]);
  const [selectedPackage, setSelectedPackage] = useState<MembershipPackage | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [memberId, setMemberId] = useState<number | null>(null);
  const [paymentUrl, setPaymentUrl] = useState<string | null>(null);

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    nicNumber: '',
    password: '',
    confirmPassword: '',
    dateOfBirth: '',
    gender: '',
    addressLine1: '',
    city: 'Colombo',
    emergencyContactName: '',
    emergencyContactPhone: '',
  });

  useEffect(() => {
    publicService
      .getPackages()
      .then(setPackages)
      .catch(() => setPackages(fallbackPackages))
      .finally(() => setLoading(false));
  }, []);

  /** Register member, then init membership payment and redirect to checkout. */
  const handleRegister = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedPackage) return;

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      let registration;
      try {
        registration = await membershipService.register({
          email: form.email,
          password: form.password,
          firstName: form.firstName,
          lastName: form.lastName,
          phone: form.phone,
          nicNumber: form.nicNumber || undefined,
          dateOfBirth: form.dateOfBirth || undefined,
          gender: form.gender || undefined,
          addressLine1: form.addressLine1 || undefined,
          city: form.city || undefined,
          emergencyContactName: form.emergencyContactName || undefined,
          emergencyContactPhone: form.emergencyContactPhone || undefined,
          packageId: selectedPackage.packageId,
        });
      } catch (err) {
        if (err instanceof ApiError) {
          if (err.status === 400 && err.message.toLowerCase().includes('email')) {
            setError('This email is already registered. Try logging in instead.');
          } else {
            setError(err.message);
          }
        } else {
          setError('Registration failed. Ensure the API is running on http://localhost:5188 and try again.');
        }
        return;
      }

      setMemberId(registration.memberId);

      try {
        const payment = await paymentService.initMembershipPayment(
          { amountLKR: selectedPackage.priceLKR, email: form.email },
          registration.memberId,
          selectedPackage.packageId
        );
        setPaymentUrl(payment.checkoutUrl);

        // Dev mock checkout skips step 3 and goes straight to the payment page.
        if (payment.checkoutUrl.includes('/payment/mock')) {
          window.location.href = payment.checkoutUrl;
          return;
        }
      } catch (err) {
        setError(
          err instanceof ApiError
            ? `Account created, but payment setup failed: ${err.message}`
            : 'Account created, but payment setup failed. Ensure the API is running and try again from step 3.'
        );
      }

      setStep(3);
    } finally {
      setSubmitting(false);
    }
  };

  const steps = [
    { num: 1, label: 'Choose Package' },
    { num: 2, label: 'Your Details' },
    { num: 3, label: 'Payment' },
  ];

  return (
      <section className="section">
        <div className="container">
          <Reveal className="section__header section__header--center">
            <span className="section__eyebrow">Join</span>
            <h1>Become a member</h1>
            <p>Select a plan, register, and complete payment.</p>
          </Reveal>

        <Reveal delay={0.08}>
          <div className="step-indicator">
          {steps.map((s) => (
            <div
              key={s.num}
              className={`step-indicator__step ${
                step === s.num ? 'step-indicator__step--active' : step > s.num ? 'step-indicator__step--completed' : ''
              }`}
            >
              <span className="step-indicator__number">{step > s.num ? '✓' : s.num}</span>
              {s.label}
            </div>
          ))}
          </div>
        </Reveal>

        {error && <div className="alert alert--error">{error}</div>}

        <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div
            key="step-1"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3, ease: easeSmooth }}
          >
            {loading ? (
              <LoadingSpinner />
            ) : (
              <>
                <Stagger className="grid grid--3">
                  {packages.map((pkg) => (
                    <StaggerItem key={pkg.packageId}>
                      <PackageCard
                        pkg={pkg}
                        featured={pkg.isFeatured}
                        showSelect
                        selected={selectedPackage?.packageId === pkg.packageId}
                        onSelect={setSelectedPackage}
                      />
                    </StaggerItem>
                  ))}
                </Stagger>
                <div style={{ textAlign: 'center', marginTop: 'var(--spacing-xl)' }}>
                  <button
                    className="btn btn--primary btn--lg"
                    disabled={!selectedPackage}
                    onClick={() => setStep(2)}
                  >
                    Continue
                  </button>
                </div>
              </>
            )}
          </motion.div>
        )}

        {step === 2 && selectedPackage && (
          <motion.div
            key="step-2"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3, ease: easeSmooth }}
          >
          <div className="card card--interactive" style={{ maxWidth: 600, margin: '0 auto' }}>
            <div className="alert alert--info">
              Selected: <strong>{selectedPackage.packageName}</strong> — {formatCurrency(selectedPackage.priceLKR)}
            </div>
            <form onSubmit={handleRegister}>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="firstName">First Name</label>
                  <input id="firstName" required value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} />
                </div>
                <div className="form-group">
                  <label htmlFor="lastName">Last Name</label>
                  <input id="lastName" required value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} />
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input id="email" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="phone">Phone</label>
                  <input id="phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                </div>
                <div className="form-group">
                  <label htmlFor="gender">Gender</label>
                  <select id="gender" value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })}>
                    <option value="">Select</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="password">Password</label>
                  <input id="password" type="password" required minLength={8} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
                </div>
                <div className="form-group">
                  <label htmlFor="confirmPassword">Confirm Password</label>
                  <input id="confirmPassword" type="password" required value={form.confirmPassword} onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })} />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="nicNumber">NIC</label>
                  <input id="nicNumber" value={form.nicNumber} onChange={(e) => setForm({ ...form, nicNumber: e.target.value })} />
                </div>
                <div className="form-group">
                  <label htmlFor="dateOfBirth">Date of Birth</label>
                  <input id="dateOfBirth" type="date" value={form.dateOfBirth} onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })} />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="city">City</label>
                  <input id="city" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
                </div>
                <div className="form-group">
                  <label htmlFor="addressLine1">Address</label>
                  <input id="addressLine1" value={form.addressLine1} onChange={(e) => setForm({ ...form, addressLine1: e.target.value })} />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="emergencyContactName">Contact Person (Emergency)</label>
                  <input id="emergencyContactName" value={form.emergencyContactName} onChange={(e) => setForm({ ...form, emergencyContactName: e.target.value })} />
                </div>
                <div className="form-group">
                  <label htmlFor="emergencyContactPhone">Contact Number (Emergency)</label>
                  <input id="emergencyContactPhone" value={form.emergencyContactPhone} onChange={(e) => setForm({ ...form, emergencyContactPhone: e.target.value })} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: 'var(--spacing-md)' }}>
                <button type="button" className="btn btn--outline" onClick={() => setStep(1)}>Back</button>
                <button type="submit" className="btn btn--primary" disabled={submitting}>
                  {submitting ? 'Creating Account...' : 'Create Account & Pay'}
                </button>
              </div>
            </form>
          </div>
          </motion.div>
        )}

        {step === 3 && selectedPackage && (
          <motion.div
            key="step-3"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3, ease: easeSmooth }}
          >
          <div className="card card--interactive" style={{ maxWidth: 500, margin: '0 auto', textAlign: 'center' }}>
            <h2>Complete Payment</h2>
            <p style={{ margin: 'var(--spacing-lg) 0' }}>
              Amount due: <strong>{formatCurrency(selectedPackage.priceLKR)}</strong>
            </p>
            <div className="alert alert--info">
              You will be redirected to our secure checkout to complete payment.
            </div>
            <button
              className="btn btn--primary btn--lg btn--block"
              onClick={() => {
                if (paymentUrl) window.location.href = paymentUrl;
              }}
            >
              Proceed to Checkout
            </button>
            <p style={{ marginTop: 'var(--spacing-md)', fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
              Member ID: {memberId}. After payment, visit the gym to activate your fingerprint for gym access.
            </p>
          </div>
          </motion.div>
        )}
        </AnimatePresence>
      </div>
    </section>
  );
}
