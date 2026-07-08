import { motion } from 'motion/react'

import { CLASSES_PAGE_COPY } from './scheduleData'
import { formatFullDate } from './scheduleUtils'

interface ClassesHeroProps {
  heroImage: string
  selectedDate: Date
  sessionCount: number
}

function formatDisplayWeekday(date: Date): string {
  return new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(date).toUpperCase()
}

export function ClassesHero({ heroImage, selectedDate, sessionCount }: ClassesHeroProps) {
  const weekdayLabel = formatDisplayWeekday(selectedDate)
  const sessionsLabel =
    sessionCount === 1
      ? CLASSES_PAGE_COPY.sessionSingular
      : CLASSES_PAGE_COPY.sessionPlural

  return (
    <header className="relative overflow-hidden bg-features-bg text-white">
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <motion.img
          key={heroImage}
          src={heroImage}
          alt=""
          className="h-full w-full object-cover object-center"
          initial={{ opacity: 0, scale: 1.04 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-features-bg via-features-bg/92 to-features-bg/55" />
        <div className="absolute inset-0 bg-gradient-to-t from-features-bg/80 via-transparent to-features-bg/30" />
      </div>

      <div
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:56px_56px]"
        aria-hidden="true"
      />

      <div className="relative z-10 mx-auto max-w-[90rem] px-5 pb-10 pt-8 sm:px-8 sm:pb-12 sm:pt-10 lg:px-12 lg:pb-14">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-white/70 sm:text-[11px]">
              {CLASSES_PAGE_COPY.eyebrow}
            </p>

            <h1 className="mt-4 text-[clamp(1.75rem,3.5vw,2.35rem)] font-medium leading-[1.1] tracking-[-0.02em] text-white/90">
              {CLASSES_PAGE_COPY.heading}
            </h1>

            <p
              className="mt-2 font-display text-[clamp(3.5rem,11vw,7.5rem)] font-normal leading-[0.88] tracking-[0.03em] text-white"
              aria-hidden="true"
            >
              {weekdayLabel}
            </p>

            <p className="sr-only">
              {CLASSES_PAGE_COPY.heading} — {formatFullDate(selectedDate)}
            </p>

            <p className="mt-4 max-w-xl text-sm leading-[1.8] text-white/80 sm:text-[0.9375rem]">
              {CLASSES_PAGE_COPY.description}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 lg:pb-1">
            <span className="rounded-full border border-white/15 bg-white/10 px-4 py-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-white/90 backdrop-blur-sm sm:text-[11px]">
              {sessionCount} {sessionsLabel}
            </span>
            <span className="rounded-full border border-white/10 bg-black/20 px-4 py-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-white/65 backdrop-blur-sm sm:text-[11px]">
              {formatFullDate(selectedDate)}
            </span>
          </div>
        </div>
      </div>
    </header>
  )
}
