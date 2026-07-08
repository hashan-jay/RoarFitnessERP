import { type FormEvent, useState } from 'react'
import { motion, type Variants } from 'motion/react'

import { publicService } from '../../services'
import { CONTACT_COPY, CONTACT_FORM_FIELDS } from './constants'
import {
  FORM_ERROR_CLASS,
  FORM_LABEL_CLASS,
  formInputClassName,
} from '../common/formStyles'
import {
  type ContactFormErrors,
  type ContactFormValues,
  validateContactForm,
} from './contactFormValidation'
import { CONTACT_VIEWPORT } from './contactMotion'

interface ContactFormProps {
  variants: Variants
}

export function ContactForm({ variants }: ContactFormProps) {
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [values, setValues] = useState<ContactFormValues>({
    name: '',
    email: '',
    phone: '',
    message: '',
  })
  const [errors, setErrors] = useState<ContactFormErrors>({})
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const setField = (field: keyof ContactFormValues, value: string) => {
    setValues((prev) => ({ ...prev, [field]: value }))
    setErrors((prev) => {
      if (!prev[field]) return prev
      const nextErrors = { ...prev }
      delete nextErrors[field]
      return nextErrors
    })
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const nextErrors = validateContactForm(values)

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      return
    }

    setSubmitting(true)
    setSubmitError(null)
    try {
      await publicService.sendContactMessage({
        name: values.name.trim(),
        email: values.email.trim(),
        phone: values.phone.trim() || undefined,
        message: values.message.trim(),
      })
      setIsSubmitted(true)
    } catch {
      setSubmitError('Could not send your message. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <motion.article
      variants={variants}
      initial="hidden"
      whileInView="visible"
      viewport={CONTACT_VIEWPORT}
      className="flex h-full flex-col overflow-hidden rounded-[1px] border border-brand-ink/[0.08] bg-white shadow-[0_8px_28px_rgba(10,10,10,0.06)]"
    >
      <div className="px-5 py-5 sm:px-6 sm:py-6">
        <h3 className="text-base font-medium tracking-[-0.01em] text-brand-ink sm:text-lg">
          {CONTACT_COPY.formTitle}
        </h3>
        <p className="mt-2 text-xs leading-relaxed text-brand-muted sm:text-sm">
          {CONTACT_COPY.formDescription}
        </p>
      </div>

      <div className="flex flex-1 flex-col border-t border-brand-ink/[0.06] px-5 pb-5 pt-5 sm:px-6 sm:pb-6 sm:pt-6">
        {isSubmitted ? (
          <p
            className="text-sm leading-relaxed text-brand-ink sm:text-[0.9375rem]"
            role="status"
          >
            Thank you — your message has been received. We will be in touch shortly.
          </p>
        ) : (
          <form className="flex flex-1 flex-col" onSubmit={handleSubmit} noValidate>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label htmlFor="contact-name" className={FORM_LABEL_CLASS}>
                  {CONTACT_FORM_FIELDS.name.label}
                </label>
                <input
                  id="contact-name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  required
                  placeholder={CONTACT_FORM_FIELDS.name.placeholder}
                  value={values.name}
                  onChange={(event) => setField('name', event.target.value)}
                  aria-invalid={errors.name ? 'true' : 'false'}
                  className={formInputClassName(Boolean(errors.name))}
                />
                {errors.name && (
                  <p className={FORM_ERROR_CLASS} role="alert">
                    {errors.name}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <label htmlFor="contact-email" className={FORM_LABEL_CLASS}>
                  {CONTACT_FORM_FIELDS.email.label}
                </label>
                <input
                  id="contact-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  placeholder={CONTACT_FORM_FIELDS.email.placeholder}
                  value={values.email}
                  onChange={(event) => setField('email', event.target.value)}
                  aria-invalid={errors.email ? 'true' : 'false'}
                  className={formInputClassName(Boolean(errors.email))}
                />
                {errors.email && (
                  <p className={FORM_ERROR_CLASS} role="alert">
                    {errors.email}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <label htmlFor="contact-phone" className={FORM_LABEL_CLASS}>
                  {CONTACT_FORM_FIELDS.phone.label}
                </label>
                <input
                  id="contact-phone"
                  name="phone"
                  type="tel"
                  autoComplete="tel"
                  placeholder={CONTACT_FORM_FIELDS.phone.placeholder}
                  value={values.phone}
                  onChange={(event) => setField('phone', event.target.value)}
                  aria-invalid={errors.phone ? 'true' : 'false'}
                  className={formInputClassName(Boolean(errors.phone))}
                />
                {errors.phone && (
                  <p className={FORM_ERROR_CLASS} role="alert">
                    {errors.phone}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <label htmlFor="contact-message" className={FORM_LABEL_CLASS}>
                  {CONTACT_FORM_FIELDS.message.label}
                </label>
                <textarea
                  id="contact-message"
                  name="message"
                  required
                  rows={3}
                  placeholder={CONTACT_FORM_FIELDS.message.placeholder}
                  value={values.message}
                  onChange={(event) => setField('message', event.target.value)}
                  aria-invalid={errors.message ? 'true' : 'false'}
                  className={`${formInputClassName(Boolean(errors.message))} min-h-[4.5rem] resize-none`}
                />
                {errors.message && (
                  <p className={FORM_ERROR_CLASS} role="alert">
                    {errors.message}
                  </p>
                )}
              </div>
            </div>

            {submitError && (
              <p className={FORM_ERROR_CLASS} role="alert">
                {submitError}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="group mt-5 inline-flex min-h-[40px] w-full items-center justify-center border border-brand-ink bg-brand-ink px-5 py-2.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-brand-ink/90 sm:mt-6 sm:text-[11px]"
            >
              {submitting ? 'Sending…' : CONTACT_COPY.submitLabel}
              <span
                className="ml-1 inline-block transition-transform duration-300 group-hover:translate-x-1"
                aria-hidden="true"
              >
                {' >>'}
              </span>
            </button>
          </form>
        )}
      </div>
    </motion.article>
  )
}
