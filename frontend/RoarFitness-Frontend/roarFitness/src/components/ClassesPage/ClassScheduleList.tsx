import { CLASSES_PAGE_COPY } from './scheduleData'
import type { ClassSession } from './scheduleUtils'
import { ClassScheduleRow } from './ClassScheduleRow'

interface ClassScheduleListProps {
  sessions: ClassSession[]
  isRestDay?: boolean
  showSignUp?: boolean
}

export function ClassScheduleList({
  sessions,
  isRestDay = false,
  showSignUp = true,
}: ClassScheduleListProps) {
  if (sessions.length === 0) {
    return (
      <section
        className="flex min-h-[18rem] flex-col items-center justify-center px-4 py-14 text-center sm:min-h-[22rem] sm:py-20"
        aria-label="No classes"
      >
        {isRestDay ? (
          <>
            <p className="font-display text-[clamp(3rem,10vw,5.5rem)] font-normal uppercase leading-[0.9] tracking-[0.04em] text-brand-ink/15">
              {CLASSES_PAGE_COPY.restDayLabel}
            </p>
            <h2 className="mt-4 text-lg font-medium tracking-[-0.01em] text-brand-ink sm:text-xl">
              {CLASSES_PAGE_COPY.restDayTitle}
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-brand-muted">
              {CLASSES_PAGE_COPY.restDayText}
            </p>
          </>
        ) : (
          <>
            <h2 className="text-lg font-medium tracking-[-0.01em] text-brand-ink sm:text-xl">
              {CLASSES_PAGE_COPY.noClassesTitle}
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-brand-muted">
              {CLASSES_PAGE_COPY.noClassesText}
            </p>
          </>
        )}
      </section>
    )
  }

  return (
    <section aria-label="Class schedule" className="relative py-2 sm:py-3">
      <div className="mb-5 flex items-center justify-between gap-4 border-b border-brand-ink/[0.08] pb-4 sm:mb-6 sm:pb-5">
        <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-brand-muted sm:text-[11px]">
          {CLASSES_PAGE_COPY.scheduleTitle}
        </p>
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-brand-ink/70 sm:text-[11px]">
          {sessions.length}{' '}
          {sessions.length === 1
            ? CLASSES_PAGE_COPY.sessionSingular
            : CLASSES_PAGE_COPY.sessionPlural}
        </p>
      </div>

      {sessions.map((session, index) => (
        <ClassScheduleRow
          key={session.id}
          session={session}
          index={index}
          isLast={index === sessions.length - 1}
          showSignUp={showSignUp}
        />
      ))}
    </section>
  )
}
