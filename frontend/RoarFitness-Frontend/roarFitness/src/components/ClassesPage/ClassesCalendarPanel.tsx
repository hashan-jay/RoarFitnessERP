import { ChevronDown } from 'lucide-react'

import { AppLink } from '../common/AppLink'
import { FORM_SELECT_CLASS } from '../common/formStyles'
import { ROUTES } from '../../routes/paths'
import { ClassesDateCarousel } from './ClassesDateCarousel'
import { CLASSES_PAGE_COPY } from './scheduleData'
import type { DayOption } from './scheduleUtils'
import { formatFullDate } from './scheduleUtils'

interface FilterOption {
  id: string
  label: string
}

interface TrainerFilterOption {
  id: string
  name: string
}

interface ClassesCalendarPanelProps {
  days: DayOption[]
  selectedDateKey: string
  selectedDate: Date
  monthLabelDate: Date
  classTypes: FilterOption[]
  trainers: TrainerFilterOption[]
  selectedClassType: string
  selectedTrainer: string
  onSelectDate: (dateKey: string) => void
  onPrevious: () => void
  onNext: () => void
  showLoginCta?: boolean
  showTrainerFilter?: boolean
  onClassTypeChange: (value: string) => void
  onTrainerChange: (value: string) => void
}

const filterSelectClassName = `${FORM_SELECT_CLASS} min-h-[42px] w-full cursor-pointer text-[11px] font-medium uppercase tracking-[0.08em] text-brand-ink sm:text-xs`

export function ClassesCalendarPanel({
  days,
  selectedDateKey,
  selectedDate,
  monthLabelDate,
  classTypes,
  trainers,
  selectedClassType,
  selectedTrainer,
  onSelectDate,
  onPrevious,
  onNext,
  onClassTypeChange,
  onTrainerChange,
  showLoginCta = true,
  showTrainerFilter = true,
}: ClassesCalendarPanelProps) {
  return (
    <section
      aria-label="Class calendar"
      className="overflow-hidden rounded-[1px] border border-brand-ink/[0.08] bg-white shadow-[0_16px_36px_rgba(10,10,10,0.08)]"
    >
      <div className="border-b border-brand-ink/[0.08] px-5 py-5 sm:px-7 sm:py-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-brand-muted sm:text-[11px]">
              {CLASSES_PAGE_COPY.calendarTitle}
            </p>
            <h2 className="mt-2 text-lg font-medium tracking-[-0.01em] text-brand-ink sm:text-xl">
              {formatFullDate(selectedDate)}
            </h2>
          </div>

          {showLoginCta ? (
            <AppLink
              to={ROUTES.login}
              className="self-start text-[10px] font-semibold uppercase tracking-[0.14em] text-brand-ink underline decoration-brand-ink/25 underline-offset-4 transition-colors duration-300 hover:decoration-brand-ink sm:text-[11px]"
            >
              {CLASSES_PAGE_COPY.loginCta}
            </AppLink>
          ) : null}
        </div>

        <div
          className={`mt-5 grid gap-3 ${showTrainerFilter ? 'sm:grid-cols-2' : 'sm:grid-cols-1'}`}
        >
          <div className="relative">
            <label htmlFor="class-type-filter" className="sr-only">
              Filter by class type
            </label>
            <select
              id="class-type-filter"
              value={selectedClassType}
              onChange={(event) => onClassTypeChange(event.target.value)}
              className={filterSelectClassName}
            >
              <option value="all">{CLASSES_PAGE_COPY.filterAllTypes}</option>
              {classTypes.map((classType) => (
                <option key={classType.id} value={classType.id}>
                  {classType.label}
                </option>
              ))}
            </select>
            <ChevronDown
              className="pointer-events-none absolute right-3 top-1/2 size-3.5 -translate-y-1/2 text-brand-muted"
              aria-hidden="true"
            />
          </div>

          {showTrainerFilter ? (
            <div className="relative">
              <label htmlFor="instructor-filter" className="sr-only">
                Filter by instructor
              </label>
              <select
                id="instructor-filter"
                value={selectedTrainer}
                onChange={(event) => onTrainerChange(event.target.value)}
                className={filterSelectClassName}
              >
                <option value="all">{CLASSES_PAGE_COPY.filterAllInstructors}</option>
                {trainers.map((trainer) => (
                  <option key={trainer.id} value={trainer.id}>
                    {trainer.name}
                  </option>
                ))}
              </select>
              <ChevronDown
                className="pointer-events-none absolute right-3 top-1/2 size-3.5 -translate-y-1/2 text-brand-muted"
                aria-hidden="true"
              />
            </div>
          ) : null}
        </div>
      </div>

      <ClassesDateCarousel
        variant="light"
        days={days}
        selectedDateKey={selectedDateKey}
        monthLabelDate={monthLabelDate}
        onSelectDate={onSelectDate}
        onPrevious={onPrevious}
        onNext={onNext}
      />

      <div className="border-t border-brand-ink/[0.08] bg-surface/35 px-5 py-4 sm:px-7 sm:py-5">
        <p className="text-xs leading-relaxed text-brand-muted sm:text-sm">
          {CLASSES_PAGE_COPY.timezoneNote}
        </p>
      </div>
    </section>
  )
}
