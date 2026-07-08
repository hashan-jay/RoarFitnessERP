import { motion, type Variants } from 'motion/react'

import {
  CONTACT_ADDRESS,
  CONTACT_COPY,
  CONTACT_DETAILS,
  CONTACT_HOURS,
  CONTACT_MAP_DIRECTIONS_URL,
} from './constants'
import { CONTACT_VIEWPORT } from './contactMotion'

const labelClassName =
  'text-[10px] font-semibold uppercase tracking-[0.14em] text-brand-muted sm:text-[11px]'

interface ContactDetailsProps {
  variants: Variants
}

export function ContactDetails({ variants }: ContactDetailsProps) {
  return (
    <motion.aside
      variants={variants}
      initial="hidden"
      whileInView="visible"
      viewport={CONTACT_VIEWPORT}
      aria-label="Contact information"
      className="flex h-full flex-col overflow-hidden rounded-[1px] border border-brand-ink/[0.08] bg-white shadow-[0_8px_28px_rgba(10,10,10,0.06)]"
    >
      <div className="flex items-start justify-between gap-3 border-b border-brand-ink/[0.06] px-5 py-5 sm:px-6 sm:py-6">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-brand-muted sm:text-[11px]">
            Studio details
          </p>
          <span
            className="mt-3 block font-display text-3xl leading-none tracking-[0.06em] text-brand-ink/[0.08] sm:text-4xl"
            aria-hidden="true"
          >
            01
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col px-5 py-5 sm:px-6 sm:py-6">
        <address className="not-italic">
          <p className="text-sm font-medium leading-snug text-brand-ink sm:text-[0.9375rem]">
            {CONTACT_ADDRESS.line1}
          </p>
          <p className="mt-1 text-xs leading-snug text-brand-muted sm:text-sm">
            {CONTACT_ADDRESS.line2}
          </p>
        </address>

        <dl className="mt-5 space-y-4 sm:mt-6">
          {CONTACT_DETAILS.map((detail) => (
            <div
              key={detail.id}
              className="border-t border-brand-ink/[0.06] pt-4 first:border-t-0 first:pt-0"
            >
              <dt className={labelClassName}>{detail.label}</dt>
              <dd className="mt-1.5 text-sm text-brand-ink sm:text-[0.9375rem]">
                {detail.href ? (
                  <a
                    href={detail.href}
                    className="transition-colors hover:text-brand-muted"
                  >
                    {detail.value}
                  </a>
                ) : (
                  detail.value
                )}
              </dd>
            </div>
          ))}

          <div className="border-t border-brand-ink/[0.06] pt-4">
            <dt className={labelClassName}>Opening hours</dt>
            <dd className="mt-2 space-y-2">
              {CONTACT_HOURS.map((slot) => (
                <div
                  key={slot.id}
                  className="flex items-baseline justify-between gap-3 text-xs sm:text-sm"
                >
                  <span className="font-medium text-brand-ink">{slot.days}</span>
                  <span className="text-right text-brand-muted">{slot.hours}</span>
                </div>
              ))}
            </dd>
          </div>
        </dl>

        <a
          href={CONTACT_MAP_DIRECTIONS_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="group mt-auto inline-flex items-center pt-5 text-[10px] font-semibold uppercase tracking-[0.14em] text-brand-ink transition-colors hover:text-brand-muted sm:pt-6 sm:text-[11px]"
        >
          {CONTACT_COPY.directionsLabel}
          <span
            className="ml-1 inline-block transition-transform duration-300 group-hover:translate-x-1"
            aria-hidden="true"
          >
            {' >>'}
          </span>
        </a>
      </div>
    </motion.aside>
  )
}
