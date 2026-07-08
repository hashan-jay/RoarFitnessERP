import { type FormEvent, useEffect, useState } from 'react'
import { X } from 'lucide-react'

import { mapMemberPlanRequest } from '../../adapters/memberPlanAdapter'
import { formatAppDate, formatAppDateTime } from '../../lib/formatters'
import { memberPlanService } from '../../services'
import { usePortalToast } from '../PortalToast/PortalToast'
import type { MemberFitnessPlan, MemberFitnessPlanSummary } from '../../types/api'
import type { PlanRequest } from '../../utils/planRequests'

type PendingRequest = PlanRequest & {
  requestId: number
  memberId: number
  memberName: string
  memberIdentificationNumber: string
}

export function InstructorMemberPlansPage() {
  const toast = usePortalToast()
  const [pendingRequests, setPendingRequests] = useState<PendingRequest[]>([])
  const [approvedPlans, setApprovedPlans] = useState<MemberFitnessPlanSummary[]>([])
  const [approveTarget, setApproveTarget] = useState<PendingRequest | null>(null)
  const [planDescription, setPlanDescription] = useState('')
  const [instructorNotes, setInstructorNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<MemberFitnessPlan | null>(null)
  const [planLoading, setPlanLoading] = useState(false)

  const refresh = async () => {
    const [pendingResult, approvedResult] = await Promise.allSettled([
      memberPlanService.getPendingRequests(),
      memberPlanService.getInstructorPlans(),
    ])

    if (pendingResult.status === 'fulfilled') {
      setPendingRequests(pendingResult.value.map((request) => mapMemberPlanRequest(request)))
    } else {
      setPendingRequests([])
    }

    if (approvedResult.status === 'fulfilled') {
      setApprovedPlans(approvedResult.value)
    } else {
      setApprovedPlans([])
    }

    if (pendingResult.status === 'rejected' && approvedResult.status === 'rejected') {
      toast.error('Could not load plan requests.')
    }
  }

  useEffect(() => {
    void refresh()
  }, [])

  const openApproveModal = (request: PendingRequest) => {
    setApproveTarget(request)
    setPlanDescription('')
    setInstructorNotes('')
  }

  const closeApproveModal = () => {
    if (submitting) return
    setApproveTarget(null)
    setPlanDescription('')
    setInstructorNotes('')
  }

  const handleApproveSubmit = async (event: FormEvent) => {
    event.preventDefault()
    if (!approveTarget) return

    if (!planDescription.trim()) {
      toast.error('Please write the plan before submitting.')
      return
    }

    setSubmitting(true)
    try {
      await memberPlanService.approvePlanRequest(approveTarget.requestId, {
        description: planDescription.trim(),
        notes: instructorNotes.trim() || undefined,
      })
      closeApproveModal()
      await refresh()
      toast.success('Plan sent to the member.')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not approve request.')
    } finally {
      setSubmitting(false)
    }
  }

  const openPlan = async (planId: number) => {
    setPlanLoading(true)
    try {
      const plan = await memberPlanService.getInstructorPlan(planId)
      setSelectedPlan(plan)
    } catch {
      toast.error('Could not load plan details.')
    } finally {
      setPlanLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      <header className="border-b border-portal-line pb-6">
        <p className="text-xs font-medium text-portal-muted">Workout / Meal Plans</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-portal-ink sm:text-3xl">
          Workout / Meal Plans
        </h1>
        <p className="mt-2 text-sm text-portal-muted">
          Review meal and workout plan requests from members, approve them, and view plans you have
          already sent.
        </p>
      </header>

      <section className="space-y-4">
        <div>
          <h2 className="text-base font-semibold text-portal-ink">Pending requests</h2>
          <p className="mt-1 text-sm text-portal-muted">
            Accept a request to write and send the plan to the member.
          </p>
        </div>

        {pendingRequests.length === 0 ? (
          <div className="portal-widget-3d rounded-xl border border-dashed border-portal-line bg-portal-card px-5 py-10 text-center">
            <p className="text-sm font-medium text-portal-ink">No pending requests</p>
            <p className="mt-1 text-sm text-portal-muted">
              Requests appear here when members submit them from My Plans.
            </p>
          </div>
        ) : (
          <ul className="space-y-3">
            {pendingRequests.map((request) => (
              <li
                key={request.id}
                className="portal-widget-3d rounded-xl border border-violet-100 bg-gradient-to-br from-white via-violet-50/50 to-fuchsia-50/30 p-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold capitalize text-portal-ink">
                      {request.type} plan
                    </p>
                    <p className="mt-1 text-sm text-portal-muted">
                      Member ID: {request.memberIdentificationNumber}
                    </p>
                    <p className="mt-0.5 text-sm text-portal-muted">Name: {request.memberName}</p>
                    {request.notes && (
                      <p className="mt-2 text-sm leading-relaxed text-portal-ink/80">
                        “{request.notes}”
                      </p>
                    )}
                    <p className="mt-2 text-xs text-portal-muted">
                      Requested {formatAppDateTime(request.createdAt)}
                    </p>
                  </div>
                  <StatusPill status={request.status} />
                </div>

                <button
                  type="button"
                  onClick={() => openApproveModal(request)}
                  className="mt-4 rounded-lg bg-portal-ink px-3.5 py-2 text-sm font-medium text-white transition hover:bg-black"
                >
                  Accept
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="portal-widget-3d rounded-xl border border-portal-line bg-portal-card p-5 sm:p-6">
        <h2 className="text-base font-semibold text-portal-ink">Recent approved plans</h2>
        <p className="mt-1 text-sm text-portal-muted">
          Plans you have approved and sent to members. These cannot be edited.
        </p>

        {approvedPlans.length === 0 ? (
          <p className="mt-6 text-sm text-portal-muted">
            No approved plans yet. Accepted requests will appear here.
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
                      {plan.planCategory} plan · {plan.memberName}
                    </p>
                    {index === 0 && (
                      <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-700">
                        Latest
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-portal-muted">
                    Member ID: {plan.memberIdentificationNumber} · Updated{' '}
                    {formatAppDate(plan.updatedAt)}
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

      {approveTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button
            type="button"
            className="absolute inset-0 bg-portal-ink/20"
            aria-label="Close approve plan dialog"
            onClick={closeApproveModal}
          />
          <form
            onSubmit={handleApproveSubmit}
            className="portal-widget-3d relative z-10 max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl border border-portal-line bg-portal-card p-6 shadow-xl"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-portal-ink">Approve plan request</h2>
                <p className="mt-1 text-sm text-portal-muted">
                  Write the {approveTarget.type} plan for {approveTarget.memberName}.
                </p>
              </div>
              <button
                type="button"
                onClick={closeApproveModal}
                className="flex size-8 shrink-0 items-center justify-center rounded-lg text-portal-muted transition hover:bg-portal-canvas hover:text-portal-ink"
                aria-label="Close"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="mt-5 space-y-3 rounded-lg bg-portal-canvas px-4 py-3 text-sm">
              <p>
                <span className="text-portal-muted">Member ID:</span>{' '}
                <span className="font-medium text-portal-ink">
                  {approveTarget.memberIdentificationNumber}
                </span>
              </p>
              <p>
                <span className="text-portal-muted">Name:</span>{' '}
                <span className="font-medium text-portal-ink">{approveTarget.memberName}</span>
              </p>
              <p>
                <span className="text-portal-muted">Plan type:</span>{' '}
                <span className="font-medium capitalize text-portal-ink">
                  {approveTarget.type} plan
                </span>
              </p>
              {approveTarget.notes && (
                <p>
                  <span className="text-portal-muted">Member note:</span>{' '}
                  <span className="text-portal-ink">“{approveTarget.notes}”</span>
                </p>
              )}
            </div>

            <label className="mt-5 block">
              <span className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-portal-muted">
                The plan
              </span>
              <textarea
                value={planDescription}
                onChange={(event) => setPlanDescription(event.target.value)}
                rows={8}
                required
                placeholder="Write the workout or meal plan details for the member…"
                className="w-full resize-none rounded-lg border border-portal-line bg-portal-canvas px-3 py-2.5 text-sm text-portal-ink outline-none placeholder:text-portal-muted/70 focus:border-portal-ink"
              />
            </label>

            <label className="mt-4 block">
              <span className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-portal-muted">
                Instructor notes (optional)
              </span>
              <textarea
                value={instructorNotes}
                onChange={(event) => setInstructorNotes(event.target.value)}
                rows={3}
                placeholder="Any extra guidance or reminders for the member…"
                className="w-full resize-none rounded-lg border border-portal-line bg-portal-canvas px-3 py-2.5 text-sm text-portal-ink outline-none placeholder:text-portal-muted/70 focus:border-portal-ink"
              />
            </label>

            <div className="mt-6 flex flex-wrap justify-end gap-2">
              <button
                type="button"
                onClick={closeApproveModal}
                disabled={submitting}
                className="rounded-lg border border-portal-line px-4 py-2 text-sm font-medium text-portal-ink transition hover:bg-portal-canvas disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="rounded-lg bg-portal-ink px-4 py-2 text-sm font-medium text-white transition hover:bg-black disabled:opacity-50"
              >
                {submitting ? 'Submitting…' : 'Submit plan'}
              </button>
            </div>
          </form>
        </div>
      )}

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
                  {selectedPlan.memberName} · {selectedPlan.memberIdentificationNumber}
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
                  Instructor notes
                </h3>
                <pre className="mt-3 whitespace-pre-wrap font-sans text-sm leading-relaxed text-portal-ink">
                  {selectedPlan.notes}
                </pre>
              </section>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function StatusPill({ status }: { status: string }) {
  const styles: Record<string, string> = {
    pending: 'bg-amber-50 text-amber-800',
    in_progress: 'bg-sky-50 text-sky-800',
    completed: 'bg-emerald-50 text-emerald-800',
    declined: 'bg-rose-50 text-rose-800',
  }

  return (
    <span
      className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${
        styles[status] ?? 'bg-portal-canvas text-portal-muted'
      }`}
    >
      {status.replace('_', ' ')}
    </span>
  )
}
