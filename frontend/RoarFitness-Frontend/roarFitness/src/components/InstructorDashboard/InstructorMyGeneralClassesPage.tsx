import { useCallback, useEffect, useMemo, useState } from 'react'

import { ClassScheduleList } from '../ClassesPage/ClassScheduleList'
import { ClassesCalendarPanel } from '../ClassesPage/ClassesCalendarPanel'
import { SCHEDULE_FILTER_CLASS_TYPES } from '../ClassesPage/scheduleCatalog'
import {
  filterSessions,
  getDayKey,
  parseStartMinutes,
  getWeekWindow,
  shiftDate,
  startOfDay,
} from '../ClassesPage/scheduleUtils'
import { generalClassService } from '../../services/generalClassService'
import type { GeneralClassRecord } from '../../types/generalClass'
import {
  buildClassTypeFilters,
  groupGeneralClassesByWeekday,
} from '../../utils/generalClassSchedule'

const REFRESH_MS = 30_000

export function InstructorMyGeneralClassesPage() {
  const today = useMemo(() => startOfDay(new Date()), [])
  const [windowStart, setWindowStart] = useState(today)
  const [selectedDateKey, setSelectedDateKey] = useState(getDayKey(today))
  const [selectedClassType, setSelectedClassType] = useState('all')
  const [generalClasses, setGeneralClasses] = useState<GeneralClassRecord[] | null>(null)

  const loadGeneralClasses = useCallback(async () => {
    try {
      const data = await generalClassService.getInstructorMine()
      setGeneralClasses(data)
    } catch {
      setGeneralClasses(null)
    }
  }, [])

  useEffect(() => {
    void loadGeneralClasses()
    const timer = window.setInterval(() => {
      void loadGeneralClasses()
    }, REFRESH_MS)
    const handleFocus = () => {
      void loadGeneralClasses()
    }
    window.addEventListener('focus', handleFocus)
    return () => {
      window.clearInterval(timer)
      window.removeEventListener('focus', handleFocus)
    }
  }, [loadGeneralClasses])

  const weeklyFromApi = useMemo(
    () => (generalClasses ? groupGeneralClassesByWeekday(generalClasses) : null),
    [generalClasses],
  )

  const classTypeFilters = useMemo(() => {
    if (generalClasses && generalClasses.length > 0) {
      return buildClassTypeFilters(generalClasses)
    }
    return SCHEDULE_FILTER_CLASS_TYPES
  }, [generalClasses])

  const week = useMemo(() => getWeekWindow(windowStart), [windowStart])

  const selectedDate =
    week.find((day) => day.key === selectedDateKey)?.date ?? week[0]?.date ?? today

  const selectedWeekday = selectedDate.getDay()

  const daySessions = useMemo(() => {
    const catalogSessions = weeklyFromApi?.[selectedWeekday] ?? []

    return [...catalogSessions].sort(
      (left, right) => parseStartMinutes(left.time) - parseStartMinutes(right.time),
    )
  }, [weeklyFromApi, selectedWeekday])

  const filteredSessions = useMemo(
    () => filterSessions(daySessions, selectedClassType, 'all'),
    [daySessions, selectedClassType],
  )

  const isRestDay = selectedWeekday === 0 && daySessions.length === 0

  const handleSelectDate = (dateKey: string) => {
    setSelectedDateKey(dateKey)
    setSelectedClassType('all')
  }

  const handlePreviousWeek = () => {
    const nextStart = shiftDate(windowStart, -7)
    const nextWeek = getWeekWindow(nextStart)
    setWindowStart(nextStart)
    setSelectedDateKey(nextWeek[0]?.key ?? selectedDateKey)
    setSelectedClassType('all')
  }

  const handleNextWeek = () => {
    const nextStart = shiftDate(windowStart, 7)
    const nextWeek = getWeekWindow(nextStart)
    setSelectedDateKey(nextWeek[0]?.key ?? selectedDateKey)
    setWindowStart(nextStart)
    setSelectedClassType('all')
  }

  return (
    <div className="space-y-6">
      <header className="border-b border-portal-line pb-6">
        <p className="text-xs font-medium text-portal-muted">Schedule</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-portal-ink sm:text-3xl">
          My General Classes
        </h1>
        <p className="mt-2 max-w-xl text-sm text-portal-muted">
          View your weekly general class timetable. Filter by class type and pick a day to see your
          assigned time slots.
        </p>
      </header>

      <ClassesCalendarPanel
        days={week}
        selectedDateKey={selectedDateKey}
        selectedDate={selectedDate}
        monthLabelDate={selectedDate}
        classTypes={classTypeFilters}
        trainers={[]}
        selectedClassType={selectedClassType}
        selectedTrainer="all"
        onSelectDate={handleSelectDate}
        onPrevious={handlePreviousWeek}
        onNext={handleNextWeek}
        onClassTypeChange={setSelectedClassType}
        onTrainerChange={() => undefined}
        showLoginCta={false}
        showTrainerFilter={false}
      />

      <div className="overflow-hidden rounded-xl border border-portal-line bg-white px-5 py-6 shadow-sm sm:px-7 sm:py-8">
        <ClassScheduleList
          sessions={filteredSessions}
          isRestDay={isRestDay}
          showSignUp={false}
        />
      </div>
    </div>
  )
}
