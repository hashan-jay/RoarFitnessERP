import {
  type FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { Loader2 } from 'lucide-react'
import { motion } from 'motion/react'
import { useNavigate, useSearchParams } from 'react-router-dom'

import { useAuthMotion } from '../auth/useAuthMotion'
import { AppLink } from '../common/AppLink'
import { FormField } from '../common/FormField'
import { PasswordInput } from '../common/PasswordInput'
import {
  FORM_SUBMIT_CLASS,
  formInputClassName,
  formSelectClassName,
} from '../common/formStyles'
import { formatInternationalPhone } from '../../utils/phone'
import { getPasswordStrength } from '../../utils/validation'
import { getPackageById, loadPackagesFromApi } from '../../utils/packageStorage'
import { parsePlanPackageId } from '../../adapters/packageAdapter'
import { ApiError, paymentService } from '../../services'
import { ROUTES } from '../../routes/paths'
import { savePendingRegistration } from '../../utils/registrationStorage'
import { GENDER_OPTIONS, REGISTER_COPY, type GenderValue } from './constants'
import { PasswordStrengthBar } from './PasswordStrengthBar'
import { RegisterFormSection } from './RegisterFormSection'
import { SelectedPlanBanner } from './SelectedPlanBanner'
import { registerUser } from './registerService'
import {
  type RegisterFormErrors,
  type RegisterFormField,
  type RegisterFormValues,
  getRegisterNicLabel,
  validateRegisterField,
  validateRegisterForm,
} from './registerValidation'
import { isAdultFromDateOfBirth } from '../../lib/datetime'

type SubmitStatus = 'idle' | 'loading' | 'error'

const INITIAL_VALUES: RegisterFormValues = {
  firstName: '',
  lastName: '',
  dateOfBirth: '',
  nicNumber: '',
  gender: '',
  email: '',
  phone: '',
  address: '',
  password: '',
  confirmPassword: '',
}

export function RegisterForm() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const planId = searchParams.get('plan') ?? ''
  const [selectedPlan, setSelectedPlan] = useState(() => getPackageById(planId))
  const { loadAnimation, variants } = useAuthMotion()
  const isSubmittingRef = useRef(false)

  const [values, setValues] = useState<RegisterFormValues>(INITIAL_VALUES)
  const [errors, setErrors] = useState<RegisterFormErrors>({})
  const [touched, setTouched] = useState<Partial<Record<RegisterFormField, boolean>>>({})
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [status, setStatus] = useState<SubmitStatus>('idle')
  const [formError, setFormError] = useState<string | null>(null)

  const isLoading = status === 'loading'

  useEffect(() => {
    loadPackagesFromApi().then(() => {
      const plan = getPackageById(planId)
      setSelectedPlan(plan)
      if (!plan) navigate(ROUTES.join, { replace: true })
    })
  }, [navigate, planId])

  useEffect(() => {
    if (!selectedPlan) {
      navigate(ROUTES.join, { replace: true })
    }
  }, [navigate, selectedPlan])

  const passwordStrength = useMemo(
    () => getPasswordStrength(values.password),
    [values.password],
  )

  const nicLabel = useMemo(
    () => getRegisterNicLabel(values.dateOfBirth),
    [values.dateOfBirth],
  )

  const isNicRequired = useMemo(
    () => isAdultFromDateOfBirth(values.dateOfBirth),
    [values.dateOfBirth],
  )

  const applyConfirmPasswordError = useCallback(
    (nextValues: RegisterFormValues) => {
      if (!touched.confirmPassword && !nextValues.confirmPassword) return

      const confirmError = validateRegisterField('confirmPassword', nextValues)
      setErrors((prev) => {
        if (!confirmError) {
          if (!prev.confirmPassword) return prev
          const next = { ...prev }
          delete next.confirmPassword
          return next
        }
        return { ...prev, confirmPassword: confirmError }
      })
    },
    [touched.confirmPassword],
  )

  const setField = useCallback(
    <K extends RegisterFormField>(field: K, value: RegisterFormValues[K]) => {
      setValues((prev) => {
        const nextValues = { ...prev, [field]: value }
        if (field === 'password' || field === 'confirmPassword') {
          applyConfirmPasswordError(nextValues)
        }
        if (
          field === 'dateOfBirth' &&
          (touched.nicNumber || prev.nicNumber || errors.nicNumber)
        ) {
          const nicError = validateRegisterField('nicNumber', nextValues)
          setErrors((prevErrors) => {
            const next = { ...prevErrors }
            if (nicError) next.nicNumber = nicError
            else delete next.nicNumber
            return next
          })
        }
        return nextValues
      })
      setErrors((prev) => {
        if (!prev[field]) return prev
        const next = { ...prev }
        delete next[field]
        return next
      })
      if (formError) setFormError(null)
    },
    [applyConfirmPasswordError, formError, touched.nicNumber, errors.nicNumber],
  )

  const handleBlur = useCallback(
    (field: RegisterFormField) => {
      setTouched((prev) => ({ ...prev, [field]: true }))
      const message = validateRegisterField(field, values)
      setErrors((prev) => {
        if (!message) {
          if (!prev[field]) return prev
          const next = { ...prev }
          delete next[field]
          return next
        }
        return { ...prev, [field]: message }
      })
    },
    [values],
  )

  const handlePhoneChange = (raw: string) => {
    setField('phone', formatInternationalPhone(raw))
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (isSubmittingRef.current || isLoading) return

    if (!selectedPlan) return

    const nextErrors = validateRegisterForm(values)
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      setTouched({
        firstName: true,
        lastName: true,
        dateOfBirth: true,
        nicNumber: true,
        gender: true,
        email: true,
        phone: true,
        address: true,
        password: true,
        confirmPassword: true,
      })
      return
    }

    isSubmittingRef.current = true
    setStatus('loading')
    setFormError(null)

    try {
      const packageId = parsePlanPackageId(selectedPlan.id)
      const result = await registerUser(values, packageId)

      if (!result.success || !result.memberId) {
        setStatus('error')
        setFormError(result.message ?? 'Unable to continue. Please try again.')
        return
      }

      const payment = await paymentService.initMembershipPayment(
        { amountLKR: selectedPlan.price, email: values.email.trim() },
        result.memberId,
        packageId,
      )

      if (!payment.paymentReference) {
        setStatus('error')
        setFormError('Could not start payment. Please try again.')
        return
      }

      savePendingRegistration({
        planId: selectedPlan.id,
        packageId,
        memberId: result.memberId,
        paymentReference: payment.paymentReference,
        checkoutUrl: payment.checkoutUrl,
        planName: selectedPlan.name,
        planDescription: selectedPlan.description,
        planPeriod: selectedPlan.period,
        amountLKR: selectedPlan.price,
        values,
      })
      navigate(ROUTES.payment)
    } catch (error) {
      setStatus('error')
      setFormError(
        error instanceof ApiError
          ? error.message
          : 'Something went wrong. Please try again.',
      )
    } finally {
      isSubmittingRef.current = false
    }
  }

  if (!selectedPlan) {
    return null
  }

  return (
    <div className="w-full">
      <motion.article
        variants={variants.card}
        {...loadAnimation}
        className="relative overflow-hidden rounded-[1px] border border-brand-ink/[0.08] bg-white shadow-[0_16px_48px_rgba(10,10,10,0.1)]"
      >
        <span
          className="absolute left-0 top-0 h-1 w-full bg-brand-ink"
          aria-hidden="true"
        />

        <div className="border-b border-brand-ink/[0.06] px-5 py-5 sm:px-7 sm:py-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-base font-medium tracking-[-0.01em] text-brand-ink sm:text-lg">
                {REGISTER_COPY.formTitle}
              </h1>
              <p className="mt-2 text-xs leading-relaxed text-brand-muted sm:text-sm">
                {REGISTER_COPY.formDescription}
              </p>
            </div>
            <AppLink
              to={ROUTES.home}
              className="shrink-0 pt-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-brand-muted transition-colors hover:text-brand-ink sm:text-[11px]"
            >
              {REGISTER_COPY.backHome}
            </AppLink>
          </div>

          <ol
            className="mt-6 flex flex-wrap gap-2"
            aria-label="Registration steps"
          >
            {[REGISTER_COPY.stepPersonal, REGISTER_COPY.stepContact, REGISTER_COPY.stepSecurity].map(
              (step, index) => (
                <li
                  key={step}
                  className="inline-flex items-center gap-2 rounded-full border border-brand-ink/[0.1] bg-surface/60 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-brand-muted sm:text-[11px]"
                >
                  <span className="font-display text-sm leading-none text-brand-ink/40">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  {step}
                </li>
              ),
            )}
          </ol>
        </div>

        <div className="px-5 py-6 sm:px-7 sm:py-8">
          {selectedPlan && <SelectedPlanBanner planId={selectedPlan.id} />}

          <form className="space-y-8" onSubmit={handleSubmit} noValidate>
              {formError && (
                <p
                  className="rounded-[1px] border border-red-500/20 bg-red-50 px-3.5 py-2.5 text-[11px] leading-relaxed text-red-700 sm:text-xs"
                  role="alert"
                >
                  {formError}
                </p>
              )}

              <RegisterFormSection
                step="01"
                title={REGISTER_COPY.sectionPersonalTitle}
                description={REGISTER_COPY.sectionPersonalDescription}
              >
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <FormField
                    id="register-first-name"
                    label={REGISTER_COPY.firstNameLabel}
                    error={errors.firstName}
                  >
                    <input
                      id="register-first-name"
                      name="firstName"
                      type="text"
                      autoComplete="given-name"
                      required
                      disabled={isLoading}
                      placeholder={REGISTER_COPY.firstNamePlaceholder}
                      value={values.firstName}
                      onChange={(event) => setField('firstName', event.target.value)}
                      onBlur={() => handleBlur('firstName')}
                      aria-invalid={errors.firstName ? 'true' : 'false'}
                      className={formInputClassName(Boolean(errors.firstName))}
                    />
                  </FormField>

                  <FormField
                    id="register-last-name"
                    label={REGISTER_COPY.lastNameLabel}
                    error={errors.lastName}
                  >
                    <input
                      id="register-last-name"
                      name="lastName"
                      type="text"
                      autoComplete="family-name"
                      required
                      disabled={isLoading}
                      placeholder={REGISTER_COPY.lastNamePlaceholder}
                      value={values.lastName}
                      onChange={(event) => setField('lastName', event.target.value)}
                      onBlur={() => handleBlur('lastName')}
                      aria-invalid={errors.lastName ? 'true' : 'false'}
                      className={formInputClassName(Boolean(errors.lastName))}
                    />
                  </FormField>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <FormField
                    id="register-date-of-birth"
                    label={REGISTER_COPY.dateOfBirthLabel}
                    error={errors.dateOfBirth}
                  >
                    <input
                      id="register-date-of-birth"
                      name="dateOfBirth"
                      type="date"
                      autoComplete="bday"
                      required
                      disabled={isLoading}
                      max={new Date().toISOString().slice(0, 10)}
                      value={values.dateOfBirth}
                      onChange={(event) => setField('dateOfBirth', event.target.value)}
                      onBlur={() => handleBlur('dateOfBirth')}
                      aria-invalid={errors.dateOfBirth ? 'true' : 'false'}
                      className={formInputClassName(Boolean(errors.dateOfBirth))}
                    />
                  </FormField>

                  <FormField
                    id="register-gender"
                    label={REGISTER_COPY.genderLabel}
                    error={errors.gender}
                  >
                    <select
                      id="register-gender"
                      name="gender"
                      required
                      disabled={isLoading}
                      value={values.gender}
                      onChange={(event) => {
                        setField('gender', event.target.value as GenderValue)
                        setTouched((prev) => ({ ...prev, gender: true }))
                      }}
                      onBlur={() => handleBlur('gender')}
                      aria-invalid={errors.gender ? 'true' : 'false'}
                      className={formSelectClassName(Boolean(errors.gender))}
                    >
                      <option value="" disabled>
                        {REGISTER_COPY.genderPlaceholder}
                      </option>
                      {GENDER_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </FormField>
                </div>

                <FormField
                  id="register-nic"
                  label={nicLabel}
                  error={errors.nicNumber}
                >
                  <input
                    id="register-nic"
                    name="nicNumber"
                    type="text"
                    autoComplete="off"
                    required={isNicRequired}
                    disabled={isLoading}
                    placeholder={REGISTER_COPY.nicNumberPlaceholder}
                    value={values.nicNumber}
                    onChange={(event) => setField('nicNumber', event.target.value)}
                    onBlur={() => handleBlur('nicNumber')}
                    aria-invalid={errors.nicNumber ? 'true' : 'false'}
                    className={formInputClassName(Boolean(errors.nicNumber))}
                  />
                </FormField>
              </RegisterFormSection>

              <RegisterFormSection
                step="02"
                title={REGISTER_COPY.sectionContactTitle}
                description={REGISTER_COPY.sectionContactDescription}
              >
                <FormField
                  id="register-email"
                  label={REGISTER_COPY.emailLabel}
                  error={errors.email}
                >
                  <input
                    id="register-email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    disabled={isLoading}
                    placeholder={REGISTER_COPY.emailPlaceholder}
                    value={values.email}
                    onChange={(event) => setField('email', event.target.value)}
                    onBlur={() => handleBlur('email')}
                    aria-invalid={errors.email ? 'true' : 'false'}
                    className={formInputClassName(Boolean(errors.email))}
                  />
                </FormField>

                <FormField
                  id="register-phone"
                  label={REGISTER_COPY.phoneLabel}
                  error={errors.phone}
                >
                  <input
                    id="register-phone"
                    name="phone"
                    type="tel"
                    autoComplete="tel"
                    inputMode="tel"
                    required
                    disabled={isLoading}
                    placeholder={REGISTER_COPY.phonePlaceholder}
                    value={values.phone}
                    onChange={(event) => handlePhoneChange(event.target.value)}
                    onBlur={() => handleBlur('phone')}
                    aria-invalid={errors.phone ? 'true' : 'false'}
                    className={formInputClassName(Boolean(errors.phone))}
                  />
                </FormField>

                <FormField
                  id="register-address"
                  label={REGISTER_COPY.addressLabel}
                  error={errors.address}
                >
                  <input
                    id="register-address"
                    name="address"
                    type="text"
                    autoComplete="street-address"
                    required
                    disabled={isLoading}
                    placeholder={REGISTER_COPY.addressPlaceholder}
                    value={values.address}
                    onChange={(event) => setField('address', event.target.value)}
                    onBlur={() => handleBlur('address')}
                    aria-invalid={errors.address ? 'true' : 'false'}
                    className={formInputClassName(Boolean(errors.address))}
                  />
                </FormField>
              </RegisterFormSection>

              <RegisterFormSection
                step="03"
                title={REGISTER_COPY.sectionSecurityTitle}
                description={REGISTER_COPY.sectionSecurityDescription}
              >
                <FormField
                  id="register-password"
                  label={REGISTER_COPY.passwordLabel}
                  error={errors.password}
                >
                  <PasswordInput
                    id="register-password"
                    name="password"
                    value={values.password}
                    onChange={(password) => setField('password', password)}
                    onBlur={() => handleBlur('password')}
                    placeholder={REGISTER_COPY.passwordPlaceholder}
                    autoComplete="new-password"
                    disabled={isLoading}
                    hasError={Boolean(errors.password)}
                    showPassword={showPassword}
                    onToggleVisibility={() => setShowPassword((v) => !v)}
                    showLabel={REGISTER_COPY.showPassword}
                    hideLabel={REGISTER_COPY.hidePassword}
                    describedBy="register-password-strength"
                  />
                  <div id="register-password-strength" className="mt-2">
                    <PasswordStrengthBar
                      level={passwordStrength.level}
                      percent={passwordStrength.percent}
                      label={passwordStrength.label}
                    />
                  </div>
                </FormField>

                <FormField
                  id="register-confirm-password"
                  label={REGISTER_COPY.confirmPasswordLabel}
                  error={errors.confirmPassword}
                >
                  <PasswordInput
                    id="register-confirm-password"
                    name="confirmPassword"
                    value={values.confirmPassword}
                    onChange={(confirmPassword) =>
                      setField('confirmPassword', confirmPassword)
                    }
                    onBlur={() => handleBlur('confirmPassword')}
                    placeholder={REGISTER_COPY.confirmPasswordPlaceholder}
                    autoComplete="new-password"
                    disabled={isLoading}
                    hasError={Boolean(errors.confirmPassword)}
                    showPassword={showConfirmPassword}
                    onToggleVisibility={() => setShowConfirmPassword((v) => !v)}
                    showLabel={REGISTER_COPY.showPassword}
                    hideLabel={REGISTER_COPY.hidePassword}
                  />
                </FormField>
              </RegisterFormSection>

              <button
                type="submit"
                disabled={isLoading}
                className={`${FORM_SUBMIT_CLASS} mt-2`}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" aria-hidden="true" />
                    {REGISTER_COPY.submittingLabel}
                  </>
                ) : (
                  <>
                    {REGISTER_COPY.submitLabel}
                    <span
                      className="ml-1 inline-block transition-transform duration-300 group-hover:translate-x-1"
                      aria-hidden="true"
                    >
                      {' >>'}
                    </span>
                  </>
                )}
              </button>
            </form>
        </div>

        <div className="border-t border-brand-ink/[0.06] bg-surface/40 px-5 py-4 text-center sm:px-7 sm:py-5">
          <p className="text-xs text-brand-muted sm:text-sm">
            {REGISTER_COPY.hasAccount}{' '}
            <AppLink
              to={ROUTES.login}
              className="font-semibold uppercase tracking-[0.1em] text-brand-ink transition-colors hover:text-brand-muted"
            >
              {REGISTER_COPY.signIn}
            </AppLink>
          </p>
        </div>
      </motion.article>
    </div>
  )
}
