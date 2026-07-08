import { useCallback, useEffect, useMemo, useState } from 'react'

import { Footer } from '../components/Footer'
import { Navbar } from '../components/Navbar'
import { ClassScheduleList } from '../components/ClassesPage/ClassScheduleList'
import { ClassesCalendarPanel } from '../components/ClassesPage/ClassesCalendarPanel'
import { ClassesHero } from '../components/ClassesPage/ClassesHero'
import { ClassesSignUpBanner } from '../components/ClassesPage/ClassesSignUpBanner'
import {
  SCHEDULE_FILTER_CLASS_TYPES,
  SCHEDULE_FILTER_TRAINERS,
  WEEKDAY_CLASS_IMAGES,
} from '../components/ClassesPage/scheduleCatalog'
import {
  filterSessions,
  getDayKey,
  getDaySchedule,
  parseStartMinutes,
  getWeekWindow,
  shiftDate,
  startOfDay,
} from '../components/ClassesPage/scheduleUtils'
import { generalClassService } from '../services/generalClassService'
import { sessionService } from '../services/sessionService'
import type { PublicVipSession } from '../types/api'
import type { GeneralClassRecord } from '../types/generalClass'
import {
  buildScheduleFilters,
  groupGeneralClassesByWeekday,
} from '../utils/generalClassSchedule'
import { mapVipSessionToScheduleSlot } from '../utils/vipSessionSchedule'

const REFRESH_MS = 30_000

/**
 * Public classes schedule — general classes and accepted VIP sessions from the API.
 */
export function ClassesPage() {
  const today = useMemo(() => startOfDay(new Date()), [])
  const [windowStart, setWindowStart] = useState(today)
  const [selectedDateKey, setSelectedDateKey] = useState(getDayKey(today))
  const [selectedClassType, setSelectedClassType] = useState('all')
  const [selectedTrainer, setSelectedTrainer] = useState('all')
  const [generalClasses, setGeneralClasses] = useState<GeneralClassRecord[] | null>(null)
  const [vipSessions, setVipSessions] = useState<PublicVipSession[]>([])

  const loadGeneralClasses = useCallback(async () => {
    try {
      const data = await generalClassService.getPublic()
      setGeneralClasses(data)
    } catch {
      setGeneralClasses(null)
    }
  }, [])

  const loadVipSessions = useCallback(async (dateKey: string) => {
    try {
      const data = await sessionService.getPublicVipSessions(dateKey)
      setVipSessions(data)
    } catch {
      setVipSessions([])
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

  useEffect(() => {
    void loadVipSessions(selectedDateKey)
    const timer = window.setInterval(() => {
      void loadVipSessions(selectedDateKey)
    }, REFRESH_MS)
    const handleFocus = () => {
      void loadVipSessions(selectedDateKey)
    }
    window.addEventListener('focus', handleFocus)
    return () => {
      window.clearInterval(timer)
      window.removeEventListener('focus', handleFocus)
    }
  }, [loadVipSessions, selectedDateKey])

  const weeklyFromApi = useMemo(
    () => (generalClasses ? groupGeneralClassesByWeekday(generalClasses) : null),
    [generalClasses],
  )

  const scheduleFilters = useMemo(() => {
    if (generalClasses) {
      return buildScheduleFilters(generalClasses)
    }
    return {
      classTypes: SCHEDULE_FILTER_CLASS_TYPES,
      trainers: SCHEDULE_FILTER_TRAINERS,
    }
  }, [generalClasses])

  const week = useMemo(() => getWeekWindow(windowStart), [windowStart])

  const selectedDate =
    week.find((day) => day.key === selectedDateKey)?.date ??
    week[0]?.date ??
    today

  const selectedWeekday = selectedDate.getDay()
  const heroImage = WEEKDAY_CLASS_IMAGES[selectedWeekday] ?? WEEKDAY_CLASS_IMAGES[1]

  const daySessions = useMemo(() => {
    // Merge general classes (API or WEEKLY_SCHEDULE_INPUT fallback) with date-scoped VIP sessions.
    const catalogSessions =
      weeklyFromApi?.[selectedWeekday] ?? getDaySchedule(selectedWeekday)
    const vipScheduleSlots = vipSessions.map(mapVipSessionToScheduleSlot)

    return [...catalogSessions, ...vipScheduleSlots].sort(
      (left, right) => parseStartMinutes(left.time) - parseStartMinutes(right.time),
    )
  }, [weeklyFromApi, selectedWeekday, vipSessions])

  const filteredSessions = useMemo(
    () => filterSessions(daySessions, selectedClassType, selectedTrainer),
    [daySessions, selectedClassType, selectedTrainer],
  )

  const isRestDay = selectedWeekday === 0 && daySessions.length === 0

  const handleSelectDate = (dateKey: string) => {
    setSelectedDateKey(dateKey)
    setSelectedClassType('all')
    setSelectedTrainer('all')
  }

  const handlePreviousWeek = () => {
    const nextStart = shiftDate(windowStart, -7)
    const nextWeek = getWeekWindow(nextStart)
    setWindowStart(nextStart)
    setSelectedDateKey(nextWeek[0]?.key ?? selectedDateKey)
    setSelectedClassType('all')
    setSelectedTrainer('all')
  }

  const handleNextWeek = () => {
    const nextStart = shiftDate(windowStart, 7)
    const nextWeek = getWeekWindow(nextStart)
    setSelectedDateKey(nextWeek[0]?.key ?? selectedDateKey)
    setWindowStart(nextStart)
    setSelectedClassType('all')
    setSelectedTrainer('all')
  }

  return (
    <div className="min-h-screen bg-surface font-sans text-brand-ink">
      <Navbar />

      <main>
        <ClassesHero
          heroImage={heroImage}
          selectedDate={selectedDate}
          sessionCount={daySessions.length}
        />

        <section className="relative mx-auto max-w-[72rem] px-5 pb-14 sm:px-8 sm:pb-16 lg:px-10 lg:pb-20">
          <div
            className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(10,10,10,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(10,10,10,0.02)_1px,transparent_1px)] bg-[size:48px_48px] [mask-image:radial-gradient(ellipse_at_50%_12%,black_10%,transparent_72%)]"
            aria-hidden="true"
          />

          <div className="relative z-10 space-y-6 sm:space-y-8">
            <div className="-mt-10 sm:-mt-12">
              <ClassesCalendarPanel
                days={week}
                selectedDateKey={selectedDateKey}
                selectedDate={selectedDate}
                monthLabelDate={selectedDate}
                classTypes={scheduleFilters.classTypes}
                trainers={scheduleFilters.trainers}
                selectedClassType={selectedClassType}
                selectedTrainer={selectedTrainer}
                onSelectDate={handleSelectDate}
                onPrevious={handlePreviousWeek}
                onNext={handleNextWeek}
                onClassTypeChange={setSelectedClassType}
                onTrainerChange={setSelectedTrainer}
              />
            </div>

            <div className="overflow-hidden rounded-[1px] border border-brand-ink/[0.08] bg-white px-5 py-6 shadow-[0_10px_28px_rgba(10,10,10,0.05)] sm:px-7 sm:py-8">
              <ClassScheduleList sessions={filteredSessions} isRestDay={isRestDay} />
            </div>

            <ClassesSignUpBanner />
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
