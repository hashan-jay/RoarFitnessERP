import {
  type FormEvent,
  type ReactNode,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import {
  Check,
  CreditCard,
  Lock,
  Loader2,
  ShieldCheck,
} from 'lucide-react'
import { Navigate } from 'react-router-dom'

import { AppLink } from '../components/common/AppLink'
import {
  detectCardBrand,
  formatCardNumber,
  formatCvv,
  formatExpiry,
  isValidExpiry,
} from '../components/Payment/cardFormatters'
import { formatLKR } from '../components/MembershipPlans/constants'
import { getPackageById, getPackageByPackageId, loadPackagesFromApi } from '../utils/packageStorage'
import { ApiError, paymentService } from '../services'
import { ROUTES, registerPath } from '../routes/paths'
import {
  clearPendingRegistration,
  getPendingRegistration,
  type PendingRegistration,
} from '../utils/registrationStorage'
import {
  clearPendingPayment,
  getPendingPayment,
  type PendingPayment,
} from '../utils/pendingPaymentStorage'

type PaymentStatus = 'idle' | 'loading' | 'success'

const REGISTRATION_STEPS = [
  { id: 1, label: 'Select' },
  { id: 2, label: 'Details' },
  { id: 3, label: 'Payment' },
] as const

type RegistrationContext = {
  kind: 'registration'
  pending: PendingRegistration
  planName: string
  planDescription: string
  planPeriod: string
  amountLKR: number
  cardholderDefault: string
  backLink: { to: string; label: string }
  successTitle: string
  successMessage: string
  successAction: { to: string; label: string }
}

type MemberPaymentContext = {
  kind: PendingPayment['kind']
  pending: PendingPayment
  amountLKR: number
  cardholderDefault: string
  backLink: { to: string; label: string }
  successTitle: string
  successMessage: string
  successAction: { to: string; label: string }
}

type PaymentContext = RegistrationContext | MemberPaymentContext

function hasRegistrationSnapshot(registration: PendingRegistration): boolean {
  return Boolean(registration.planName && registration.amountLKR > 0)
}

function resolveRegistrationPlan(registration: PendingRegistration) {
  return getPackageById(registration.planId) ?? getPackageByPackageId(registration.packageId)
}

function resolvePaymentContext(planReady: boolean): PaymentContext | null {
  const registration = getPendingRegistration()
  if (registration) {
    const snapshotReady = hasRegistrationSnapshot(registration)
    if (!planReady && !snapshotReady) return null

    const plan = planReady ? resolveRegistrationPlan(registration) : undefined
    const planName = plan?.name ?? registration.planName
    const planDescription = plan?.description ?? registration.planDescription
    const planPeriod = (plan?.period ?? registration.planPeriod ?? '').replace('/', '').trim()
    const amountLKR = plan?.price ?? registration.amountLKR

    if (!planName || !amountLKR) return null

    return {
      kind: 'registration',
      pending: registration,
      planName,
      planDescription,
      planPeriod,
      amountLKR,
      cardholderDefault: `${registration.values.firstName} ${registration.values.lastName}`.trim(),
      backLink: {
        to: registerPath(registration.planId || String(registration.packageId)),
        label: '← Back to details',
      },
      successTitle: 'Payment successful',
      successMessage: `Registration complete — welcome to Roar Fitness. Your ${planName} membership is active.`,
      successAction: { to: ROUTES.login, label: 'Sign in to your account' },
    }
  }

  const memberPayment = getPendingPayment()
  if (!memberPayment) return null

  if (memberPayment.kind === 'membership-renewal') {
    return {
      kind: 'membership-renewal',
      pending: memberPayment,
      amountLKR: memberPayment.amountLKR,
      cardholderDefault: memberPayment.cardholderName,
      backLink: { to: memberPayment.returnPath, label: '← Back to membership' },
      successTitle: 'Payment successful',
      successMessage: `${memberPayment.title} has been paid. Your membership period will update according to your current plan schedule.`,
      successAction: { to: memberPayment.returnPath, label: memberPayment.returnLabel },
    }
  }

  return {
    kind: 'session',
    pending: memberPayment,
    amountLKR: memberPayment.amountLKR,
    cardholderDefault: memberPayment.cardholderName,
    backLink: { to: memberPayment.returnPath, label: '← Back to sessions' },
    successTitle: 'Payment successful',
    successMessage: `You are enrolled in ${memberPayment.title}. See you at the session.`,
    successAction: { to: memberPayment.returnPath, label: memberPayment.returnLabel },
  }
}

export function PaymentPage() {
  const pendingRegistration = getPendingRegistration()
  const [planReady, setPlanReady] = useState(
    () => !pendingRegistration || hasRegistrationSnapshot(pendingRegistration),
  )
  const [context, setContext] = useState<PaymentContext | null>(() =>
    resolvePaymentContext(
      !pendingRegistration || hasRegistrationSnapshot(pendingRegistration),
    ),
  )
  const isSubmittingRef = useRef(false)

  const [cardName, setCardName] = useState(() => context?.cardholderDefault ?? '')
  const [cardNumber, setCardNumber] = useState('')
  const [expiry, setExpiry] = useState('')
  const [cvv, setCvv] = useState('')
  const [formError, setFormError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [status, setStatus] = useState<PaymentStatus>('idle')

  useEffect(() => {
    if (!getPendingRegistration()) {
      setPlanReady(true)
      setContext(resolvePaymentContext(true))
      return
    }

    loadPackagesFromApi().finally(() => {
      setPlanReady(true)
      setContext(resolvePaymentContext(true))
    })
  }, [])

  useEffect(() => {
    if (context?.cardholderDefault) {
      setCardName(context.cardholderDefault)
    }
  }, [context])

  const isLoading = status === 'loading'
  const isSuccess = status === 'success'
  const brand = useMemo(() => detectCardBrand(cardNumber), [cardNumber])

  if (!planReady || !context) {
    if (getPendingRegistration()) {
      return (
        <div className="flex min-h-dvh items-center justify-center bg-[#f5f7fb] px-4">
          <div className="flex items-center gap-3 rounded-2xl bg-white px-6 py-5 text-sm text-slate-600 shadow-sm ring-1 ring-slate-200/80">
            <Loader2 className="size-5 animate-spin text-[#2563eb]" aria-hidden="true" />
            Preparing secure checkout…
          </div>
        </div>
      )
    }

    if (getPendingPayment()) {
      return <Navigate to={getPendingPayment()!.returnPath} replace />
    }
    return <Navigate to={ROUTES.join} replace />
  }

  const displayNumber = cardNumber || '•••• •••• •••• ••••'
  const displayName = cardName.trim() || 'YOUR NAME'
  const displayExpiry = expiry || 'MM/YY'
  const summaryTitle =
    context.kind === 'registration' ? context.planName : context.pending.title
  const summaryDescription =
    context.kind === 'registration'
      ? context.planDescription
      : context.pending.description
  const summaryPeriod =
    context.kind === 'registration' ? context.planPeriod : 'One-time payment'

  const validate = () => {
    const errors: Record<string, string> = {}
    const digits = cardNumber.replace(/\s/g, '')

    if (!cardName.trim()) errors.cardName = 'Enter the name on your card'
    if (digits.length < 16) errors.cardNumber = 'Enter a valid 16-digit card number'
    if (!isValidExpiry(expiry)) errors.expiry = 'Enter a valid expiry (MM/YY)'
    if (cvv.length < 3) errors.cvv = 'Enter a valid CVV'

    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (isSubmittingRef.current || isLoading || isSuccess) return

    if (!validate()) {
      setFormError('Please check your card details and try again.')
      return
    }

    isSubmittingRef.current = true
    setStatus('loading')
    setFormError(null)

    try {
      const gatewayTransactionId = `MOCK-${Date.now()}`

      if (context.kind === 'registration') {
        await paymentService.confirmMembershipPayment(
          context.pending.paymentReference,
          gatewayTransactionId,
          context.pending.packageId,
        )
        clearPendingRegistration()
      } else if (context.kind === 'membership-renewal') {
        await paymentService.confirmMembershipPayment(
          context.pending.paymentReference,
          gatewayTransactionId,
          context.pending.packageId!,
        )
        clearPendingPayment()
      } else {
        await paymentService.confirmSessionPayment(
          context.pending.paymentReference,
          gatewayTransactionId,
          context.pending.sessionId!,
        )
        clearPendingPayment()
      }

      setStatus('success')
    } catch (error) {
      setFormError(
        error instanceof ApiError
          ? error.message
          : 'Payment could not be processed. Please try again.',
      )
      setStatus('idle')
    } finally {
      isSubmittingRef.current = false
    }
  }

  return (
    <div className="min-h-dvh bg-[#f5f7fb] font-sans text-slate-900">
      <div className="mx-auto flex min-h-dvh max-w-5xl flex-col px-4 py-6 sm:px-6 sm:py-10 lg:px-8">
        <header className="mb-6 flex items-center justify-between gap-4 sm:mb-8">
          <div className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-xl bg-[#2563eb] text-white shadow-sm">
              <Lock className="size-4.5" aria-hidden="true" />
            </span>
            <div>
              <p className="text-base font-semibold text-slate-900">Roar Fitness</p>
              <p className="text-xs text-slate-500">Secure payment gateway</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-medium text-slate-600 shadow-sm ring-1 ring-slate-200">
            <ShieldCheck className="size-3.5 text-emerald-600" aria-hidden="true" />
            Secure checkout
          </div>
        </header>

        {context.kind === 'registration' && (
          <nav
            aria-label="Checkout progress"
            className="mb-6 rounded-2xl bg-white px-4 py-4 shadow-sm ring-1 ring-slate-200/80 sm:mb-8 sm:px-6"
          >
            <ol className="flex items-center">
              {REGISTRATION_STEPS.map((step, index) => {
                const isComplete = step.id < 3
                const isCurrent = step.id === 3

                return (
                  <li key={step.id} className="flex flex-1 items-center last:flex-none">
                    <div className="flex items-center gap-2.5">
                      <span
                        className={`flex size-8 items-center justify-center rounded-full text-xs font-bold sm:size-9 sm:text-sm ${
                          isComplete
                            ? 'bg-emerald-500 text-white'
                            : isCurrent
                              ? 'bg-[#2563eb] text-white'
                              : 'bg-slate-100 text-slate-400'
                        }`}
                      >
                        {isComplete ? (
                          <Check className="size-4" strokeWidth={2.5} aria-hidden="true" />
                        ) : (
                          step.id
                        )}
                      </span>
                      <span
                        className={`text-xs font-semibold sm:text-sm ${
                          isCurrent
                            ? 'text-slate-900'
                            : isComplete
                              ? 'text-emerald-600'
                              : 'text-slate-400'
                        }`}
                      >
                        {step.label}
                      </span>
                    </div>
                    {index < REGISTRATION_STEPS.length - 1 && (
                      <div
                        className={`mx-3 h-px flex-1 ${
                          isComplete ? 'bg-emerald-300' : 'bg-slate-200'
                        }`}
                        aria-hidden="true"
                      />
                    )}
                  </li>
                )
              })}
            </ol>
          </nav>
        )}

        <div className="grid flex-1 gap-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-start lg:gap-8">
          <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200/80 sm:p-8">
            {isSuccess ? (
              <div role="status" className="py-6 text-center sm:py-10">
                <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100">
                  <Check className="size-7" strokeWidth={2.5} aria-hidden="true" />
                </span>
                <h1 className="mt-5 text-xl font-semibold text-slate-900 sm:text-2xl">
                  {context.successTitle}
                </h1>
                <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-slate-500">
                  {context.successMessage}
                </p>
                <AppLink
                  to={context.successAction.to}
                  className="mt-8 inline-flex min-h-[48px] items-center justify-center rounded-xl bg-[#2563eb] px-8 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-600"
                >
                  {context.successAction.label}
                </AppLink>
              </div>
            ) : (
              <>
                <div className="mb-6 flex items-start justify-between gap-4">
                  <div>
                    <h1 className="text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">
                      Payment details
                    </h1>
                    <p className="mt-1 text-sm text-slate-500">
                      Enter your card information to complete your payment securely.
                    </p>
                  </div>
                  <CreditCard className="size-6 shrink-0 text-slate-300" aria-hidden="true" />
                </div>

                <div
                  className="relative mb-7 overflow-hidden rounded-2xl bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900 p-5 text-white shadow-md sm:p-6"
                  aria-hidden="true"
                >
                  <div className="absolute -right-6 -top-6 size-28 rounded-full bg-white/5" />
                  <div className="absolute -bottom-8 left-8 size-24 rounded-full bg-blue-400/10" />

                  <div className="relative flex items-start justify-between">
                    <div className="h-9 w-11 rounded-md bg-gradient-to-br from-amber-200 to-amber-400" />
                    <CardBrandBadge brand={brand} />
                  </div>

                  <p className="relative mt-7 font-mono text-lg tracking-[0.16em] sm:text-xl sm:tracking-[0.2em]">
                    {displayNumber}
                  </p>

                  <div className="relative mt-6 flex items-end justify-between gap-4">
                    <div className="min-w-0">
                      <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-slate-400">
                        Cardholder
                      </p>
                      <p className="mt-1 truncate text-sm font-medium uppercase tracking-wide">
                        {displayName}
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-slate-400">
                        Expires
                      </p>
                      <p className="mt-1 font-mono text-sm font-medium">{displayExpiry}</p>
                    </div>
                  </div>
                </div>

                <form className="space-y-4" onSubmit={handleSubmit} noValidate>
                  {formError && (
                    <p
                      className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                      role="alert"
                    >
                      {formError}
                    </p>
                  )}

                  <PaymentField
                    id="card-number"
                    label="Card number"
                    error={fieldErrors.cardNumber}
                  >
                    <input
                      id="card-number"
                      name="cardNumber"
                      type="text"
                      inputMode="numeric"
                      autoComplete="cc-number"
                      required
                      disabled={isLoading}
                      placeholder="4242 4242 4242 4242"
                      value={cardNumber}
                      onChange={(event) => {
                        setCardNumber(formatCardNumber(event.target.value))
                        setFieldErrors((prev) => ({ ...prev, cardNumber: '' }))
                        setFormError(null)
                      }}
                      maxLength={19}
                      aria-invalid={fieldErrors.cardNumber ? 'true' : 'false'}
                      className={paymentInputClass(Boolean(fieldErrors.cardNumber))}
                    />
                  </PaymentField>

                  <PaymentField
                    id="card-name"
                    label="Name on card"
                    error={fieldErrors.cardName}
                  >
                    <input
                      id="card-name"
                      name="cardName"
                      type="text"
                      autoComplete="cc-name"
                      required
                      disabled={isLoading}
                      placeholder="Name as shown on card"
                      value={cardName}
                      onChange={(event) => {
                        setCardName(event.target.value)
                        setFieldErrors((prev) => ({ ...prev, cardName: '' }))
                        setFormError(null)
                      }}
                      aria-invalid={fieldErrors.cardName ? 'true' : 'false'}
                      className={paymentInputClass(Boolean(fieldErrors.cardName))}
                    />
                  </PaymentField>

                  <div className="grid grid-cols-2 gap-4">
                    <PaymentField
                      id="card-expiry"
                      label="Expiry date"
                      error={fieldErrors.expiry}
                    >
                      <input
                        id="card-expiry"
                        name="expiry"
                        type="text"
                        inputMode="numeric"
                        autoComplete="cc-exp"
                        required
                        disabled={isLoading}
                        placeholder="MM/YY"
                        value={expiry}
                        onChange={(event) => {
                          setExpiry(formatExpiry(event.target.value))
                          setFieldErrors((prev) => ({ ...prev, expiry: '' }))
                          setFormError(null)
                        }}
                        maxLength={5}
                        aria-invalid={fieldErrors.expiry ? 'true' : 'false'}
                        className={paymentInputClass(Boolean(fieldErrors.expiry))}
                      />
                    </PaymentField>

                    <PaymentField id="card-cvv" label="CVV" error={fieldErrors.cvv}>
                      <input
                        id="card-cvv"
                        name="cvv"
                        type="password"
                        inputMode="numeric"
                        autoComplete="cc-csc"
                        required
                        disabled={isLoading}
                        placeholder="123"
                        value={cvv}
                        onChange={(event) => {
                          setCvv(formatCvv(event.target.value))
                          setFieldErrors((prev) => ({ ...prev, cvv: '' }))
                          setFormError(null)
                        }}
                        maxLength={4}
                        aria-invalid={fieldErrors.cvv ? 'true' : 'false'}
                        className={paymentInputClass(Boolean(fieldErrors.cvv))}
                      />
                    </PaymentField>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="mt-2 flex min-h-[52px] w-full items-center justify-center gap-2 rounded-xl bg-[#2563eb] px-5 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                        Processing payment…
                      </>
                    ) : (
                      <>
                        <Lock className="size-4" aria-hidden="true" />
                        Pay {formatLKR(context.amountLKR)}
                      </>
                    )}
                  </button>

                  <p className="flex items-center justify-center gap-1.5 text-center text-xs text-slate-400">
                    <Lock className="size-3" aria-hidden="true" />
                    Payments are encrypted and processed securely
                  </p>
                </form>
              </>
            )}
          </section>

          <aside className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200/80 sm:p-6">
            <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-slate-500">
              Order summary
            </h2>

            <div className="mt-5 rounded-xl bg-slate-50 p-4 ring-1 ring-slate-100">
              <p className="text-xs font-medium uppercase tracking-[0.12em] text-slate-400">
                {context.kind === 'session' ? 'Special session' : 'Membership'}
              </p>
              <p className="mt-1.5 text-lg font-semibold text-slate-900">{summaryTitle}</p>
              <p className="mt-1 text-sm leading-relaxed text-slate-500">{summaryDescription}</p>
            </div>

            <dl className="mt-5 space-y-3 text-sm">
              <div className="flex items-center justify-between gap-4">
                <dt className="text-slate-500">Item</dt>
                <dd className="font-medium text-slate-900">{summaryTitle}</dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt className="text-slate-500">Billing</dt>
                <dd className="font-medium text-slate-900">{summaryPeriod}</dd>
              </div>
              <div className="flex items-center justify-between gap-4 border-t border-slate-200 pt-4">
                <dt className="text-base font-semibold text-slate-900">Total due today</dt>
                <dd className="text-lg font-bold text-slate-900">
                  {formatLKR(context.amountLKR)}
                </dd>
              </div>
            </dl>

            <div className="mt-6 flex items-start gap-2.5 rounded-xl bg-emerald-50 px-3.5 py-3 text-xs leading-relaxed text-emerald-800 ring-1 ring-emerald-100">
              <ShieldCheck className="mt-0.5 size-4 shrink-0 text-emerald-600" aria-hidden="true" />
              Your payment information is protected with industry-standard encryption.
            </div>

            {!isSuccess && (
              <AppLink
                to={context.backLink.to}
                className="mt-5 inline-flex text-sm font-medium text-[#2563eb] transition hover:text-blue-700"
              >
                {context.backLink.label}
              </AppLink>
            )}
          </aside>
        </div>
      </div>
    </div>
  )
}

function paymentInputClass(hasError: boolean): string {
  return [
    'w-full rounded-xl border bg-white px-4 py-3 text-[15px] text-slate-900 placeholder:text-slate-400 transition focus:outline-none focus:ring-4',
    hasError
      ? 'border-red-400 focus:border-red-400 focus:ring-red-100'
      : 'border-slate-200 focus:border-[#2563eb] focus:ring-blue-100',
  ].join(' ')
}

function PaymentField({
  id,
  label,
  error,
  children,
}: {
  id: string
  label: string
  error?: string
  children: ReactNode
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.1em] text-slate-500"
      >
        {label}
      </label>
      {children}
      {error && (
        <p id={`${id}-error`} className="mt-1.5 text-xs text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}

function CardBrandBadge({ brand }: { brand: ReturnType<typeof detectCardBrand> }) {
  if (brand === 'visa') {
    return (
      <span className="rounded-md bg-white/10 px-2.5 py-1 text-xs font-bold tracking-wider text-white">
        VISA
      </span>
    )
  }
  if (brand === 'mastercard') {
    return (
      <span className="flex items-center -space-x-1.5" aria-label="Mastercard">
        <span className="size-5 rounded-full bg-red-500/90" />
        <span className="size-5 rounded-full bg-amber-400/90" />
      </span>
    )
  }
  if (brand === 'amex') {
    return (
      <span className="rounded-md bg-white/10 px-2.5 py-1 text-xs font-bold tracking-wider text-white">
        AMEX
      </span>
    )
  }
  return (
    <span className="rounded-md bg-white/10 px-2.5 py-1 text-xs font-medium text-slate-300">
      CARD
    </span>
  )
}
