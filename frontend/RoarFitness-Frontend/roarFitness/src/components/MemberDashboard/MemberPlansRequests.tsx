import { type FormEvent, type ReactNode, useEffect, useMemo, useState } from 'react'
import { Apple, Dumbbell, Send, X } from 'lucide-react'

import { mapInstructorOption, mapMemberPlanRequest, type InstructorOption } from '../../adapters/memberPlanAdapter'
import { formatAppDate, formatAppDateTime } from '../../lib/formatters'
import { TRAINERS } from '../Trainers/constants'
import { memberPlanService } from '../../services'
import type { MemberFitnessPlan, MemberFitnessPlanSummary } from '../../types/api'
import type { PlanRequest } from '../../utils/planRequests'
import type { MemberDashboardData } from '../../types/member'
import { formatMemberDate, formatStatusLabel } from './memberDashboardData'
import {
  isMemberMembershipExpired,
  MEMBERSHIP_RENEW_MESSAGES,
  MemberExpiredMembershipSection,
} from './MemberExpiredMembershipSection'
import { usePortalToast } from '../PortalToast/PortalToast'

interface MemberPlansRequestsProps {
  data: MemberDashboardData
}

export function MemberPlansRequests({ data }: MemberPlansRequestsProps) {
  const toast = usePortalToast()
  const { profile, membership } = data
  const membershipExpired = isMemberMembershipExpired(data)
  const [requests, setRequests] = useState<PlanRequest[]>([])
  const [approvedPlans, setApprovedPlans] = useState<MemberFitnessPlanSummary[]>([])
  const [selectedPlan, setSelectedPlan] = useState<MemberFitnessPlan | null>(null)
  const [planLoading, setPlanLoading] = useState(false)
  const [instructors, setInstructors] = useState<InstructorOption[]>(() =>
    TRAINERS.filter((trainer) => trainer.id).map((trainer) => ({
      id: trainer.id,
      name: trainer.name,
      specialization: trainer.role,
    })),
  )
  const [planType, setPlanType] = useState<'workout' | 'meal'>('workout')
  const [instructorId, setInstructorId] = useState(TRAINERS[0]?.id ?? '')
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const refresh = async () => {
    const [pendingResult, approvedResult] = await Promise.allSettled([
      memberPlanService.getMemberPendingRequests(),
      memberPlanService.getMemberPlans(),
    ])

    if (pendingResult.status === 'fulfilled') {
      setRequests(pendingResult.value.map((request) => mapMemberPlanRequest(request, profile.email)))
    } else {
      setRequests([])
    }

    if (approvedResult.status === 'fulfilled') {
      setApprovedPlans(approvedResult.value)
    } else {
      setApprovedPlans([])
      toast.error('Could not load approved plans.')
    }

    if (pendingResult.status === 'rejected' && approvedResult.status === 'rejected') {
      toast.error('Could not load plan requests.')
    }
  }

  const openPlan = async (planId: number) => {
    setPlanLoading(true)
    try {
      const plan = await memberPlanService.getMemberPlan(planId)
      setSelectedPlan(plan)
    } catch {
      toast.error('Could not load plan details.')
    } finally {
      setPlanLoading(false)
    }
  }

  useEffect(() => {
    void refresh()
    memberPlanService
      .getInstructors()
      .then((options) => {
        if (options.length === 0) return
        const mapped = options.map((option) => mapInstructorOption(option))
        setInstructors(mapped)
        setInstructorId(mapped[0]?.id ?? '')
      })
      .catch(() => {
        /* keep trainer fallback list */
      })
  }, [profile.email])

  const selectedInstructor = useMemo(
    () => instructors.find((trainer) => trainer.id === instructorId),
    [instructors, instructorId],
  )

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()

    if (membershipExpired) {
      return
    }

    if (!selectedInstructor) {
      toast.error('Please select an instructor.')
      return
    }

    setSubmitting(true)
    try {
      await memberPlanService.createPlanRequest({
        instructorId: Number(selectedInstructor.id),
        planCategory: planType === 'meal' ? 'Meal' : 'Workout',
        memberNote: notes.trim() || undefined,
      })
      await refresh()
      setNotes('')
      toast.success(
        `${planType === 'meal' ? 'Meal' : 'Workout'} plan request sent to ${selectedInstructor.name}. It will appear below until approved.`,
      )
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not submit request.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-8">
      <header className="border-b border-portal-line pb-6">
        <p className="text-xs font-medium text-portal-muted">Workout / Meal Plans</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-portal-ink sm:text-3xl">
          Workout / Meal Plans
        </h1>
        <p className="mt-2 max-w-xl text-sm text-portal-muted">
          Request a meal or workout plan from an instructor, track pending requests, and view
          approved plans sent to you.
        </p>
      </header>

      <MemberExpiredMembershipSection
        expired={membershipExpired}
        message={MEMBERSHIP_RENEW_MESSAGES.plans}
      >
      <div className="grid gap-3 sm:grid-cols-3">
        <InfoTile label="Membership" value={membership.planName} />
        <InfoTile
          label="Status"
          value={
            <span
              className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                membership.status === 'active'
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'bg-amber-50 text-amber-800'
              }`}
            >
              {formatStatusLabel(membership.status)}
            </span>
          }
        />
        <InfoTile label="Expires" value={formatMemberDate(membership.expiresAt)} />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <form
          onSubmit={handleSubmit}
          className="rounded-xl border border-portal-line bg-portal-card p-5 sm:p-6"
        >
          <h2 className="text-base font-semibold text-portal-ink">New request</h2>
          <p className="mt-1 text-sm text-portal-muted">
            Choose a plan type and instructor.
          </p>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <PlanTypeCard
              active={planType === 'workout'}
              icon={Dumbbell}
              title="Workout plan"
              description="Training split and progression."
              onClick={() => setPlanType('workout')}
            />
            <PlanTypeCard
              active={planType === 'meal'}
              icon={Apple}
              title="Meal plan"
              description="Nutrition targets and meals."
              onClick={() => setPlanType('meal')}
            />
          </div>

          <label className="mt-5 block">
            <span className="mb-1.5 block text-xs text-portal-muted">Instructor</span>
            <select
              value={instructorId}
              onChange={(event) => setInstructorId(event.target.value)}
              className="w-full rounded-lg border border-portal-line bg-portal-canvas px-3 py-2.5 text-sm text-portal-ink outline-none focus:border-portal-ink"
            >
              {instructors.map((trainer) => (
                <option key={trainer.id} value={trainer.id}>
                  {trainer.name} — {trainer.specialization}
                </option>
              ))}
            </select>
          </label>

          {selectedInstructor && (
            <div className="mt-3 rounded-lg bg-portal-canvas px-3 py-3">
              <p className="text-sm font-medium text-portal-ink">{selectedInstructor.name}</p>
              <p className="mt-0.5 text-xs text-portal-muted">{selectedInstructor.specialization}</p>
            </div>
          )}

          <label className="mt-5 block">
            <span className="mb-1.5 block text-xs text-portal-muted">Additional notes</span>
            <textarea
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              rows={4}
              placeholder="e.g. Fat loss, 4 days/week, no dairy…"
              className="w-full resize-none rounded-lg border border-portal-line bg-portal-canvas px-3 py-2.5 text-sm text-portal-ink outline-none placeholder:text-portal-muted/70 focus:border-portal-ink"
            />
          </label>

          <button
            type="submit"
            disabled={submitting}
            className="mt-5 inline-flex min-h-[42px] w-full items-center justify-center gap-2 rounded-lg bg-portal-ink px-4 text-sm font-medium text-white transition hover:bg-black"
          >
            <Send className="size-4" aria-hidden="true" />
            Send request
          </button>
        </form>

        <aside className="rounded-xl border border-portal-line bg-portal-card p-5">
          <h2 className="text-xs font-medium uppercase tracking-[0.12em] text-portal-muted">
            Pending requests
          </h2>
          {requests.length === 0 ? (
            <p className="mt-4 text-sm text-portal-muted">No pending requests.</p>
          ) : (
            <ul className="mt-4 divide-y divide-portal-line">
              {requests.slice(0, 4).map((request) => (
                <li key={request.id} className="py-3 first:pt-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium capitalize text-portal-ink">
                      {request.type} plan
                    </p>
                    <StatusPill status={request.status} />
                  </div>
                  <p className="mt-1 text-xs text-portal-muted">
                    {request.instructorName} · {formatAppDateTime(request.createdAt)}
                  </p>
                  {request.notes && (
                    <p className="mt-1 text-xs text-portal-ink/80">“{request.notes}”</p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </aside>
      </div>

      <section className="portal-widget-3d rounded-xl border border-portal-line bg-portal-card p-5 sm:p-6">
        <h2 className="text-base font-semibold text-portal-ink">Approved plans</h2>
        <p className="mt-1 text-sm text-portal-muted">
          Workout and meal plans your instructor has approved and sent to you.
        </p>

        {approvedPlans.length === 0 ? (
          <p className="mt-6 text-sm text-portal-muted">
            No approved plans yet. Once your instructor approves a request, it will appear here.
          </p>
        ) : (
          <ul className="mt-6 divide-y divide-portal-line">
            {approvedPlans.map((plan, index) => (
              <li
                key={plan.planId}
                className="flex flex-wrap items-center justify-between gap-3 py-4 first:pt-0"
              >
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-semibold text-portal-ink">
                      {plan.planCategory} plan
                    </p>
                    {index === 0 && (
                      <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-700">
                        Latest
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-portal-muted">
                    {plan.instructorName} · Updated {formatAppDate(plan.updatedAt)}
                  </p>
                </div>
                <button
                  type="button"
                  disabled={planLoading}
                  onClick={() => void openPlan(plan.planId)}
                  className="rounded-lg border border-portal-line px-3.5 py-2 text-sm font-medium text-portal-ink transition hover:bg-portal-canvas disabled:opacity-50"
                >
                  View plan
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      {selectedPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button
            type="button"
            className="absolute inset-0 bg-portal-ink/20"
            aria-label="Close plan details"
            onClick={() => setSelectedPlan(null)}
          />
          <div className="portal-widget-3d relative z-10 max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-xl border border-portal-line bg-portal-card p-6 shadow-xl">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-portal-ink">
                  {selectedPlan.planCategory} plan
                </h2>
                <p className="mt-1 text-sm text-portal-muted">
                  {selectedPlan.instructorName}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedPlan(null)}
                className="flex size-8 shrink-0 items-center justify-center rounded-lg text-portal-muted transition hover:bg-portal-canvas hover:text-portal-ink"
                aria-label="Close"
              >
                <X className="size-4" />
              </button>
            </div>
            <section className="mt-5 border-t border-portal-line pt-5">
              <h3 className="text-xs font-medium uppercase tracking-wide text-portal-muted">
                The plan
              </h3>
              <pre className="mt-3 whitespace-pre-wrap font-sans text-sm leading-relaxed text-portal-ink">
                {selectedPlan.description}
              </pre>
            </section>
            {selectedPlan.notes && (
              <section className="mt-5 border-t border-portal-line pt-5">
                <h3 className="text-xs font-medium uppercase tracking-wide text-portal-muted">
                  Notes
                </h3>
                <pre className="mt-3 whitespace-pre-wrap font-sans text-sm leading-relaxed text-portal-ink">
                  {selectedPlan.notes}
                </pre>
              </section>
            )}
          </div>
        </div>
      )}
      </MemberExpiredMembershipSection>
    </div>
  )
}

function InfoTile({
  label,
  value,
}: {
  label: string
  value: ReactNode
}) {
  return (
    <div className="rounded-xl border border-portal-line bg-portal-card px-4 py-4">
      <p className="text-xs text-portal-muted">{label}</p>
      <div className="mt-2 text-base font-semibold text-portal-ink">{value}</div>
    </div>
  )
}

function PlanTypeCard({
  active,
  icon: Icon,
  title,
  description,
  onClick,
}: {
  active: boolean
  icon: typeof Dumbbell
  title: string
  description: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-lg border p-4 text-left transition ${
        active
          ? 'border-portal-ink bg-portal-accent-soft'
          : 'border-portal-line bg-portal-canvas hover:border-portal-ink/30'
      }`}
    >
      <Icon
        className={`size-4 ${active ? 'text-portal-ink' : 'text-portal-muted'}`}
        aria-hidden="true"
      />
      <p className="mt-3 text-sm font-semibold text-portal-ink">{title}</p>
      <p className="mt-1 text-xs text-portal-muted">{description}</p>
    </button>
  )
}

export function StatusPill({ status }: { status: string }) {
  const styles: Record<string, string> = {
    pending: 'bg-amber-50 text-amber-700',
    in_progress: 'bg-sky-50 text-sky-700',
    completed: 'bg-emerald-50 text-emerald-700',
    declined: 'bg-rose-50 text-rose-700',
  }

  return (
    <span
      className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
        styles[status] ?? 'bg-portal-canvas text-portal-muted'
      }`}
    >
      {status.replace('_', ' ')}
    </span>
  )
}
