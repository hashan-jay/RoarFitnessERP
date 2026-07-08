import {
  type FormEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { motion } from 'motion/react'
import { useNavigate, useLocation } from 'react-router-dom'

import { AppLink } from '../common/AppLink'
import { FormField } from '../common/FormField'
import {
  FORM_SUBMIT_CLASS,
  formInputClassName,
} from '../common/formStyles'
import { useAuth } from '../../context/AuthContext'
import { dashboardPath, ROUTES } from '../../routes/paths'
import { LOGIN_COPY, REMEMBER_EMAIL_KEY } from './constants'
import { authenticateUser } from './loginService'
import { useLoginMotion } from './loginMotion'
import {
  type LoginFormErrors,
  type LoginFormValues,
  validateLoginForm,
} from './loginValidation'

type SubmitStatus = 'idle' | 'loading' | 'success' | 'error'

function readRememberedEmail(): string {
  try {
    return localStorage.getItem(REMEMBER_EMAIL_KEY) ?? ''
  } catch {
    return ''
  }
}

function persistRememberedEmail(email: string, remember: boolean): void {
  try {
    if (remember) {
      localStorage.setItem(REMEMBER_EMAIL_KEY, email.trim())
      return
    }
    localStorage.removeItem(REMEMBER_EMAIL_KEY)
  } catch {
    // Storage may be unavailable in private browsing
  }
}

export function LoginForm() {
  const navigate = useNavigate()
  const location = useLocation()
  const { signIn } = useAuth()
  const { loadAnimation, variants } = useLoginMotion()
  const isSubmittingRef = useRef(false)

  const [values, setValues] = useState<LoginFormValues>(() => ({
    email: readRememberedEmail(),
    password: '',
    rememberMe: Boolean(readRememberedEmail()),
  }))
  const [errors, setErrors] = useState<LoginFormErrors>({})
  const [showPassword, setShowPassword] = useState(false)
  const [status, setStatus] = useState<SubmitStatus>('idle')
  const [formError, setFormError] = useState<string | null>(null)

  const isLoading = status === 'loading'
  const isSuccess = status === 'success'

  const setField = useCallback(
    <K extends keyof LoginFormValues>(field: K, value: LoginFormValues[K]) => {
      setValues((prev) => ({ ...prev, [field]: value }))
      setErrors((prev) => {
        if (!prev[field as keyof LoginFormErrors]) return prev
        const next = { ...prev }
        delete next[field as keyof LoginFormErrors]
        return next
      })
      if (formError) setFormError(null)
    },
    [formError],
  )

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (isSubmittingRef.current || isLoading || isSuccess) return

    const nextErrors = validateLoginForm(values)
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      return
    }

    isSubmittingRef.current = true
    setStatus('loading')
    setFormError(null)

    try {
      const result = await authenticateUser(values)

      if (!result.success || !result.user) {
        setStatus('error')
        setFormError(result.message ?? 'Unable to sign in. Please try again.')
        return
      }

      persistRememberedEmail(values.email, values.rememberMe)
      signIn(result.user)
      setStatus('success')

      const redirectTo =
        (location.state as { from?: string } | null)?.from ??
        dashboardPath(result.user.role)

      window.setTimeout(() => {
        navigate(redirectTo)
      }, 1400)
    } catch {
      setStatus('error')
      setFormError('Something went wrong. Please try again.')
    } finally {
      isSubmittingRef.current = false
    }
  }

  useEffect(() => {
    if (status !== 'error') return
    const firstInvalid = document.querySelector<HTMLElement>(
      '[aria-invalid="true"], [role="alert"]',
    )
    firstInvalid?.focus()
  }, [status, errors])

  return (
    <div className="w-full">
      <motion.div
        className="mb-8 flex items-center justify-between gap-4 sm:mb-10"
        variants={variants.eyebrow}
        {...loadAnimation}
      >
        <AppLink
          to={ROUTES.home}
          className="text-[10px] font-semibold uppercase tracking-[0.14em] text-brand-muted transition-colors hover:text-brand-ink sm:text-[11px]"
        >
          ← {LOGIN_COPY.backHome}
        </AppLink>
      </motion.div>

      <motion.header
        className="mb-8 sm:mb-9"
        variants={variants.headline}
        {...loadAnimation}
      >
        <h1 className="text-[clamp(1.625rem,4vw,2rem)] font-medium tracking-[-0.02em] text-brand-ink">
          {LOGIN_COPY.formTitle}
        </h1>
        <p className="mt-2.5 text-sm leading-relaxed text-brand-muted sm:text-[0.9375rem]">
          {LOGIN_COPY.formDescription}
        </p>
      </motion.header>

      <motion.div variants={variants.card} {...loadAnimation}>
        {isSuccess ? (
          <p
            className="rounded-[1px] border border-brand-ink/[0.08] bg-white px-5 py-6 text-sm leading-relaxed text-brand-ink shadow-[0_8px_28px_rgba(10,10,10,0.06)] sm:px-6 sm:text-[0.9375rem]"
            role="status"
          >
            {LOGIN_COPY.successMessage}
          </p>
        ) : (
          <form className="space-y-5" onSubmit={handleSubmit} noValidate>
            {formError && (
              <p
                className="rounded-[1px] border border-red-500/20 bg-red-50 px-3.5 py-2.5 text-[11px] leading-relaxed text-red-700 sm:text-xs"
                role="alert"
              >
                {formError}
              </p>
            )}

            <FormField id="login-email" label={LOGIN_COPY.emailLabel} error={errors.email}>
              <input
                id="login-email"
                name="email"
                type="email"
                autoComplete="email"
                required
                disabled={isLoading}
                placeholder={LOGIN_COPY.emailPlaceholder}
                value={values.email}
                onChange={(event) => setField('email', event.target.value)}
                aria-invalid={errors.email ? 'true' : 'false'}
                aria-describedby={errors.email ? 'login-email-error' : undefined}
                className={formInputClassName(Boolean(errors.email))}
              />
            </FormField>

            <FormField
              id="login-password"
              label={LOGIN_COPY.passwordLabel}
              error={errors.password}
            >
              <div className="relative">
                <input
                  id="login-password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  disabled={isLoading}
                  placeholder={LOGIN_COPY.passwordPlaceholder}
                  value={values.password}
                  onChange={(event) => setField('password', event.target.value)}
                  aria-invalid={errors.password ? 'true' : 'false'}
                  aria-describedby={errors.password ? 'login-password-error' : undefined}
                  className={`${formInputClassName(Boolean(errors.password))} pr-11`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((visible) => !visible)}
                  disabled={isLoading}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-muted transition-colors hover:text-brand-ink disabled:opacity-50"
                  aria-label={showPassword ? LOGIN_COPY.hidePassword : LOGIN_COPY.showPassword}
                  aria-pressed={showPassword}
                >
                  {showPassword ? (
                    <EyeOff className="size-4" aria-hidden="true" />
                  ) : (
                    <Eye className="size-4" aria-hidden="true" />
                  )}
                </button>
              </div>
            </FormField>

            <div className="flex flex-wrap items-center justify-between gap-3">
              <label className="inline-flex cursor-pointer items-center gap-2.5">
                <input
                  type="checkbox"
                  name="rememberMe"
                  checked={values.rememberMe}
                  disabled={isLoading}
                  onChange={(event) => setField('rememberMe', event.target.checked)}
                  className="size-3.5 rounded-[1px] border border-brand-ink/20 accent-brand-ink"
                />
                <span className="text-[11px] font-medium text-brand-muted sm:text-xs">
                  {LOGIN_COPY.rememberMe}
                </span>
              </label>

              <AppLink
                href="#forgot-password"
                className="text-[11px] font-semibold uppercase tracking-[0.12em] text-brand-ink transition-colors hover:text-brand-muted sm:text-xs"
              >
                {LOGIN_COPY.forgotPassword}
              </AppLink>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`${FORM_SUBMIT_CLASS} mt-1`}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" aria-hidden="true" />
                  {LOGIN_COPY.submittingLabel}
                </>
              ) : (
                <>
                  {LOGIN_COPY.submitLabel}
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
        )}
      </motion.div>

      <motion.aside
        className="relative mt-10 border-t border-brand-ink/[0.08] pt-8 sm:mt-12 sm:pt-10"
        variants={variants.description}
        {...loadAnimation}
        aria-label="Create an account"
      >
        <span
          className="absolute left-0 top-0 h-px w-12 bg-brand-ink/40 sm:w-16"
          aria-hidden="true"
        />

        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between sm:gap-8">
          <div className="max-w-[16rem] sm:max-w-xs">
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-brand-muted sm:text-[11px]">
              {LOGIN_COPY.noAccount}
            </p>
            <p className="mt-2.5 text-sm leading-[1.75] text-brand-muted/90 sm:text-[0.9375rem]">
              {LOGIN_COPY.joinDescription}
            </p>
          </div>

          <AppLink
            to={ROUTES.join}
            className="group inline-flex min-h-[46px] w-full shrink-0 items-center justify-center gap-2 border border-brand-ink/20 bg-white/60 px-7 py-3.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-brand-ink backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-brand-ink hover:bg-white hover:shadow-[0_10px_24px_rgba(10,10,10,0.08)] sm:w-auto sm:min-w-[10.5rem] sm:px-8 sm:text-[11px]"
          >
            {LOGIN_COPY.joinNow}
            <span
              className="inline-block transition-transform duration-300 group-hover:translate-x-1"
              aria-hidden="true"
            >
              →
            </span>
          </AppLink>
        </div>
      </motion.aside>
    </div>
  )
}
