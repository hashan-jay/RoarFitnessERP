import { ArrowUpRight } from 'lucide-react'
import { motion, type Variants } from 'motion/react'

import {
  CONTACT_ADDRESS,
  CONTACT_COPY,
  CONTACT_MAP_DIRECTIONS_URL,
  CONTACT_MAP_EMBED_URL,
} from './constants'
import { CONTACT_VIEWPORT } from './contactMotion'

interface ContactMapProps {
  variants: Variants
}

export function ContactMap({ variants }: ContactMapProps) {
  return (
    <motion.article
      variants={variants}
      initial="hidden"
      whileInView="visible"
      viewport={CONTACT_VIEWPORT}
      className="flex h-full flex-col overflow-hidden rounded-[1px] border border-brand-ink/[0.08] bg-white shadow-[0_10px_36px_rgba(10,10,10,0.07)]"
    >
      <div className="flex items-start justify-between gap-4 px-5 py-5 sm:px-6 sm:py-6">
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-brand-muted sm:text-[11px]">
            {CONTACT_COPY.mapTitle}
          </p>
          <p className="mt-2 text-sm font-medium leading-snug text-brand-ink sm:text-[0.9375rem]">
            {CONTACT_ADDRESS.line1}
          </p>
          <p className="text-xs leading-snug text-brand-muted sm:text-sm">
            {CONTACT_ADDRESS.line2}
          </p>
        </div>

        <a
          href={CONTACT_MAP_DIRECTIONS_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="group inline-flex shrink-0 items-center gap-1.5 border border-brand-ink/12 px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-brand-ink transition-all duration-300 hover:border-brand-ink hover:bg-brand-ink hover:text-white sm:px-3.5 sm:py-2.5 sm:text-[11px]"
        >
          {CONTACT_COPY.directionsLabel}
          <ArrowUpRight
            className="h-3.5 w-3.5 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
            strokeWidth={2}
            aria-hidden="true"
          />
        </a>
      </div>

      <div className="relative mx-5 mb-5 min-h-[11.5rem] flex-1 overflow-hidden rounded-[1px] border border-brand-ink/[0.06] sm:mx-6 sm:mb-6 sm:min-h-[13rem]">
        <iframe
          title="Roar Fitness studio location"
          src={CONTACT_MAP_EMBED_URL}
          className="absolute inset-0 h-full w-full border-0"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          allowFullScreen
        />
      </div>

      <div className="mt-auto border-t border-brand-ink/[0.06] px-5 py-3 sm:px-6">
        <p className="font-display text-base tracking-[0.08em] text-brand-ink/25 sm:text-lg">
          {CONTACT_COPY.studioCode}
        </p>
      </div>
    </motion.article>
  )
}
