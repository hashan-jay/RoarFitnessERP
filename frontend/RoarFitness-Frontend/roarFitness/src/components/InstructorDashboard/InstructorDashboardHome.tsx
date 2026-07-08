import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { CalendarDays, ClipboardList, Users } from 'lucide-react'

import { useAuth } from '../../context/AuthContext'
import { memberPlanService, sessionService } from '../../services'
import { ROUTES } from '../../routes/paths'
import { PortalBmiSection } from '../portal/PortalBmiSection'

export function InstructorDashboardHome() {
  const { user } = useAuth()
  const [stats, setStats] = useState({
    pendingSessions: 0,
    approvedSessions: 0,
    pendingPlans: 0,
  })

  useEffect(() => {
    if (!user) return
    let cancelled = false

    const load = async () => {
      try {
        const [sessions, plans] = await Promise.all([
          sessionService.getInstructorSessions(),
          memberPlanService.getPendingRequests(),
        ])
        if (cancelled) return
        setStats({
          pendingSessions: sessions.filter((s) => s.status === 'Pending').length,
          approvedSessions: sessions.filter((s) => s.status === 'Accepted').length,
          pendingPlans: plans.length,
        })
      } catch {
        if (!cancelled) {
          setStats({ pendingSessions: 0, approvedSessions: 0, pendingPlans: 0 })
        }
      }
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [user])

  if (!user) return null

  return (
    <div className="space-y-8">
      <header className="border-b border-portal-line pb-6">
        <p className="text-xs font-medium text-portal-muted">Dashboard</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-portal-ink sm:text-3xl">
          Welcome, {user.firstName}
        </h1>
        <p className="mt-2 text-sm text-portal-muted">
          Create sessions for admin approval, and review member plan requests.
        </p>
      </header>

      <div className="grid gap-3 sm:grid-cols-3">
        <StatCard
          label="Pending sessions"
          value={String(stats.pendingSessions)}
          icon={CalendarDays}
          gradient="bg-gradient-to-br from-white via-amber-50/70 to-orange-50/50"
          border="border-amber-100"
        />
        <StatCard
          label="Approved sessions"
          value={String(stats.approvedSessions)}
          icon={Users}
          gradient="bg-gradient-to-br from-white via-emerald-50/70 to-teal-50/50"
          border="border-emerald-100"
        />
        <StatCard
          label="Pending plan requests"
          value={String(stats.pendingPlans)}
          icon={ClipboardList}
          gradient="bg-gradient-to-br from-white via-violet-50/70 to-fuchsia-50/50"
          border="border-violet-100"
        />
      </div>

      <PortalBmiSection audience="instructor" />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <QuickLink
          title="My Sessions"
          description="Create a session and submit it for admin approval."
          to={`${ROUTES.dashboardInstructor}/sessions`}
          cta="Manage sessions"
          gradient="bg-gradient-to-br from-white via-orange-50/60 to-amber-50/40"
          border="border-orange-100"
        />
        <QuickLink
          title="My General Classes"
          description="View your weekly general class schedule by type and day."
          to={`${ROUTES.dashboardInstructor}/general-classes`}
          cta="View schedule"
          gradient="bg-gradient-to-br from-white via-sky-50/60 to-blue-50/40"
          border="border-sky-100"
        />
        <QuickLink
          title="Workout / Meal Plans"
          description="Review meal and workout plan requests from members."
          to={`${ROUTES.dashboardInstructor}/plans`}
          cta="View requests"
          gradient="bg-gradient-to-br from-white via-fuchsia-50/60 to-pink-50/40"
          border="border-fuchsia-100"
        />
      </div>
    </div>
  )
}

function StatCard({
  label,
  value,
  icon: Icon,
  gradient,
  border,
}: {
  label: string
  value: string
  icon: typeof CalendarDays
  gradient: string
  border: string
}) {
  return (
    <div className={`portal-widget-3d rounded-xl border px-4 py-4 ${gradient} ${border}`}>
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-medium text-portal-muted">{label}</p>
        <Icon className="size-4 text-portal-muted" aria-hidden="true" />
      </div>
      <p className="mt-3 text-3xl font-semibold tracking-tight text-portal-ink">{value}</p>
    </div>
  )
}

function QuickLink({
  title,
  description,
  to,
  cta,
  gradient,
  border,
}: {
  title: string
  description: string
  to: string
  cta: string
  gradient: string
  border: string
}) {
  return (
    <article className={`portal-widget-3d flex h-full flex-col rounded-xl border p-5 ${gradient} ${border}`}>
      <h2 className="text-base font-semibold text-portal-ink">{title}</h2>
      <p className="mt-2 flex-1 text-sm leading-relaxed text-portal-muted">{description}</p>
      <Link
        to={to}
        className="mt-5 inline-flex min-h-[40px] items-center justify-center rounded-lg bg-portal-ink px-4 py-2 text-sm font-medium text-white transition hover:bg-black"
      >
        {cta}
      </Link>
    </article>
  )
}
