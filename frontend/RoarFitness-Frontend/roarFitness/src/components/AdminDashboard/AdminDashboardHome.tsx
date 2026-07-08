import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { CalendarDays, Clock3, Users, Wallet } from 'lucide-react'

import { formatLKR } from '../MembershipPlans/constants'
import { ROUTES } from '../../routes/paths'
import { membershipService, reportService, sessionService } from '../../services'

export function AdminDashboardHome() {
  const [stats, setStats] = useState({
    pendingSessions: 0,
    approvedSessions: 0,
    members: 0,
    instructors: 0,
    totalRevenue: 0,
  })

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      try {
        const [pending, approved, members, instructors, finance] = await Promise.all([
          sessionService.getAdminSessions('Pending'),
          sessionService.getAdminSessions('Accepted'),
          membershipService.listMembers('all'),
          membershipService.listInstructors('all'),
          reportService.getSummary(),
        ])

        if (cancelled) return

        setStats({
          pendingSessions: pending.length,
          approvedSessions: approved.length,
          members: members.filter((member) => !member.isTerminated).length,
          instructors: instructors.filter((instructor) => !instructor.isTerminated).length,
          totalRevenue: finance.totalRevenue,
        })
      } catch {
        if (!cancelled) {
          setStats({
            pendingSessions: 0,
            approvedSessions: 0,
            members: 0,
            instructors: 0,
            totalRevenue: 0,
          })
        }
      }
    }

    void load()

    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div className="space-y-8">
      <header className="border-b border-portal-line pb-6">
        <p className="text-xs font-medium text-portal-muted">Dashboard</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-portal-ink sm:text-3xl">
          Admin overview
        </h1>
        <p className="mt-2 text-sm text-portal-muted">
          Review instructor requests, manage schedules, and view enrollments.
        </p>
      </header>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Pending sessions"
          value={String(stats.pendingSessions)}
          icon={Clock3}
          gradient="bg-gradient-to-br from-white via-amber-50/70 to-orange-50/50"
          border="border-amber-100"
        />
        <StatCard
          label="Approved sessions"
          value={String(stats.approvedSessions)}
          icon={CalendarDays}
          gradient="bg-gradient-to-br from-white via-emerald-50/70 to-teal-50/50"
          border="border-emerald-100"
        />
        <StatCard
          label="Members / Instructors"
          value={`${stats.members} / ${stats.instructors}`}
          icon={Users}
          gradient="bg-gradient-to-br from-white via-sky-50/70 to-blue-50/50"
          border="border-sky-100"
        />
        <StatCard
          label="Total revenue"
          value={formatLKR(stats.totalRevenue)}
          icon={Wallet}
          gradient="bg-gradient-to-br from-white via-violet-50/70 to-fuchsia-50/50"
          border="border-violet-100"
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <QuickLink
          title="VIP Sessions"
          description="Approve or reject instructor VIP session requests and view the calendar."
          to={`${ROUTES.dashboardAdmin}/sessions`}
          cta="Manage VIP sessions"
          gradient="bg-gradient-to-br from-white via-orange-50/60 to-amber-50/40"
          border="border-orange-100"
        />
        <QuickLink
          title="Accounts"
          description="Create and manage member and instructor accounts."
          to={`${ROUTES.dashboardAdmin}/members`}
          cta="Manage members"
          gradient="bg-gradient-to-br from-white via-sky-50/60 to-blue-50/40"
          border="border-sky-100"
        />
        <QuickLink
          title="Revenue Analytics"
          description="Monthly revenue breakdown, line charts, and printable analytics."
          to={`${ROUTES.dashboardAdmin}/reports`}
          cta="View analytics"
          gradient="bg-gradient-to-br from-white via-violet-50/60 to-fuchsia-50/40"
          border="border-violet-100"
        />
        <QuickLink
          title="Inventory & POS"
          description="Manage products and record in-gym merchandise sales."
          to={`${ROUTES.dashboardAdmin}/inventory`}
          cta="Open inventory"
          gradient="bg-gradient-to-br from-white via-sky-50/60 to-blue-50/40"
          border="border-sky-100"
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
    <div
      className={`portal-widget-3d rounded-xl border px-4 py-4 ${gradient} ${border}`}
    >
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-medium text-portal-muted">{label}</p>
        <Icon className="size-4 text-portal-muted" aria-hidden="true" />
      </div>
      <p className="mt-3 text-3xl font-semibold tracking-tight text-portal-ink">
        {value}
      </p>
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
    <article
      className={`portal-widget-3d flex h-full flex-col rounded-xl border p-5 ${gradient} ${border}`}
    >
      <h2 className="text-base font-semibold text-portal-ink">{title}</h2>
      <p className="mt-2 flex-1 text-sm leading-relaxed text-portal-muted">
        {description}
      </p>
      <Link
        to={to}
        className="mt-5 inline-flex min-h-[40px] items-center justify-center rounded-lg bg-portal-ink px-4 py-2 text-sm font-medium text-white transition hover:bg-black"
      >
        {cta}
      </Link>
    </article>
  )
}
