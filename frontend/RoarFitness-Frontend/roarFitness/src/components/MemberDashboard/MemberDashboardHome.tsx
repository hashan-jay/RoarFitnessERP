import type { ReactNode } from 'react'
import { Hand } from 'lucide-react'
import { Link } from 'react-router-dom'

import type { MemberDashboardData } from '../../types/member'
import { ROUTES } from '../../routes/paths'
import { MemberAttendanceCalendar } from './MemberAttendanceCalendar'
import { PortalBmiSection } from '../portal/PortalBmiSection'
import {
  formatMemberDate,
  formatStatusLabel,
} from './memberDashboardData'

interface MemberDashboardHomeProps {
  data: MemberDashboardData
}

export function MemberDashboardHome({ data }: MemberDashboardHomeProps) {
  const { profile, membership, alerts } = data

  return (
    <div className="space-y-8">
      <header className="border-b border-portal-line pb-6">
        <p className="text-xs font-medium text-portal-muted">Dashboard</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-portal-ink sm:text-3xl">
          Welcome, {profile.firstName}
        </h1>
        <p className="mt-2 text-sm text-portal-muted">
          Member ID{' '}
          <span className="font-medium text-portal-ink">{profile.memberId}</span>
        </p>
      </header>

      {alerts.map((alert) => (
        <div
          key={alert.id}
          className="portal-widget-3d flex gap-3 rounded-xl border border-amber-100 bg-gradient-to-r from-white via-amber-50/80 to-orange-50/60 px-4 py-4"
          role="status"
        >
          <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg bg-white text-amber-600 shadow-sm">
            <Hand className="size-4" aria-hidden="true" />
          </span>
          <div>
            <p className="text-sm font-semibold text-portal-ink">{alert.title}</p>
            <p className="mt-1 text-sm leading-relaxed text-portal-muted">
              {alert.message}
            </p>
          </div>
        </div>
      ))}

      <div className="grid gap-3 sm:grid-cols-3">
        <SummaryCard
          label="Membership"
          value={membership.planName}
          gradient="bg-gradient-to-br from-white via-violet-50/70 to-fuchsia-50/50"
          border="border-violet-100"
        />
        <SummaryCard
          label="Status"
          value={
            <span
              className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                membership.status === 'active'
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'bg-amber-50 text-amber-700'
              }`}
            >
              {formatStatusLabel(membership.status)}
            </span>
          }
          gradient="bg-gradient-to-br from-white via-emerald-50/70 to-teal-50/50"
          border="border-emerald-100"
        />
        <SummaryCard
          label="Expires"
          value={formatMemberDate(membership.expiresAt)}
          gradient="bg-gradient-to-br from-white via-sky-50/70 to-blue-50/50"
          border="border-sky-100"
        />
      </div>

      <PortalBmiSection audience="member" />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <ActionCard
            title="Workout / Meal Plans"
            description="Request a meal or workout plan from an instructor."
            to={`${ROUTES.dashboard}/plans`}
            cta="Request a plan"
            gradient="bg-gradient-to-br from-white via-fuchsia-50/60 to-pink-50/40"
            border="border-fuchsia-100"
          />
          <ActionCard
            title="General Classes"
            description="View the weekly general class timetable by type, instructor, and day."
            to={`${ROUTES.dashboard}/general-classes`}
            cta="View timetable"
            gradient="bg-gradient-to-br from-white via-emerald-50/60 to-teal-50/40"
            border="border-emerald-100"
          />
          <ActionCard
            title="VIP Sessions"
            description="Browse VIP sessions and enroll with online payment."
            to={`${ROUTES.dashboard}/sessions`}
            cta="View VIP sessions"
            gradient="bg-gradient-to-br from-white via-orange-50/60 to-amber-50/40"
            border="border-orange-100"
          />
          <ActionCard
            title="Membership"
            description="Renew or queue your next membership period online."
            to={`${ROUTES.dashboard}/renew`}
            cta="Manage membership"
            gradient="bg-gradient-to-br from-white via-sky-50/60 to-blue-50/40"
          border="border-sky-100"
        />
      </div>

      <MemberAttendanceCalendar />
    </div>
  )
}

function SummaryCard({
  label,
  value,
  gradient,
  border,
}: {
  label: string
  value: ReactNode
  gradient: string
  border: string
}) {
  return (
    <div className={`portal-widget-3d rounded-xl border px-4 py-4 ${gradient} ${border}`}>
      <p className="text-xs font-medium text-portal-muted">{label}</p>
      <div className="mt-2 text-base font-semibold text-portal-ink">{value}</div>
    </div>
  )
}

function ActionCard({
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
