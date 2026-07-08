import { ChevronLeft, ChevronRight } from 'lucide-react'

import { WEEKDAY_LABELS } from './scheduleData'
import type { DayOption } from './scheduleUtils'
import { formatMonthLabel } from './scheduleUtils'

interface ClassesDateCarouselProps {
  variant?: 'light' | 'dark'
  days: DayOption[]
  selectedDateKey: string
  monthLabelDate: Date
  onSelectDate: (dateKey: string) => void
  onPrevious: () => void
  onNext: () => void
}

export function ClassesDateCarousel({
  variant = 'light',
  days,
  selectedDateKey,
  monthLabelDate,
  onSelectDate,
  onPrevious,
  onNext,
}: ClassesDateCarouselProps) {
  const isDark = variant === 'dark'

  return (
    <section
      aria-label="Select a date"
      className={`py-6 sm:py-7 ${
        isDark
          ? 'border-b border-white/10 px-5 sm:px-6'
          : 'border-b border-brand-ink/[0.08] px-5 sm:px-7'
      }`}
    >
      <div className="flex items-center justify-between gap-4">
        <p
          className={`text-sm font-medium tracking-[-0.01em] sm:text-base ${
            isDark ? 'text-white' : 'text-brand-ink'
          }`}
        >
          {formatMonthLabel(monthLabelDate)}
        </p>

        <div className="flex items-center gap-1 sm:gap-2">
          <button
            type="button"
            onClick={onPrevious}
            className={`inline-flex size-8 items-center justify-center rounded-full border transition-colors duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 sm:size-9 ${
              isDark
                ? 'border-white/15 text-white hover:border-white/30 hover:bg-white/10 focus-visible:outline-white/40'
                : 'border-brand-ink/[0.1] text-brand-ink hover:border-brand-ink/25 hover:bg-white focus-visible:outline-brand-ink/30'
            }`}
            aria-label="Show previous dates"
          >
            <ChevronLeft className="size-4" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={onNext}
            className={`inline-flex size-8 items-center justify-center rounded-full border transition-colors duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 sm:size-9 ${
              isDark
                ? 'border-white/15 text-white hover:border-white/30 hover:bg-white/10 focus-visible:outline-white/40'
                : 'border-brand-ink/[0.1] text-brand-ink hover:border-brand-ink/25 hover:bg-white focus-visible:outline-brand-ink/30'
            }`}
            aria-label="Show next dates"
          >
            <ChevronRight className="size-4" aria-hidden="true" />
          </button>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-7 gap-1 sm:gap-2">
        {days.map((day) => {
          const isSelected = day.key === selectedDateKey
          const weekdayLabel = WEEKDAY_LABELS[day.date.getDay()]
          const dateNumber = day.date.getDate()

          return (
            <button
              key={day.key}
              type="button"
              onClick={() => onSelectDate(day.key)}
              className={`group flex flex-col items-center gap-2 px-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 ${
                isDark ? 'focus-visible:outline-white/40' : 'focus-visible:outline-brand-ink/30'
              }`}
              aria-pressed={isSelected}
              aria-label={`${weekdayLabel} ${dateNumber}`}
            >
              <span
                className={`text-[10px] font-semibold uppercase tracking-[0.12em] sm:text-[11px] ${
                  isSelected
                    ? isDark
                      ? 'text-white'
                      : 'text-brand-ink'
                    : isDark
                      ? 'text-features-muted'
                      : 'text-brand-muted'
                }`}
              >
                {weekdayLabel}
              </span>
              <span
                className={`inline-flex size-9 items-center justify-center rounded-full text-sm font-medium tabular-nums transition-all duration-300 sm:size-10 sm:text-[0.9375rem] ${
                  isSelected
                    ? isDark
                      ? 'bg-white text-brand-ink shadow-[0_6px_16px_rgba(0,0,0,0.25)]'
                      : 'bg-brand-ink text-white shadow-[0_6px_16px_rgba(10,10,10,0.14)]'
                    : isDark
                      ? 'border border-white/15 bg-white/5 text-white group-hover:border-white/30'
                      : 'border border-brand-ink/[0.1] bg-white text-brand-ink group-hover:border-brand-ink/25'
                }`}
              >
                {dateNumber}
              </span>
            </button>
          )
        })}
      </div>
    </section>
  )
}
