import { type FormEvent, useEffect, useMemo, useState } from 'react'
import { Plus } from 'lucide-react'

import { mapSpecialSessionToRequest } from '../../adapters/sessionAdapter'
import { FITNESS_CLASSES } from '../Classes/constants'
import { usePortalToast } from '../PortalToast/PortalToast'
import { sessionService } from '../../services'
import {
  formatLkr,
  formatSessionDate,
  type SessionRequest,
  type SessionRequestStatus,
} from '../../utils/sessionRequests'

const STUDIOS = [
  'Strength Floor',
  'Cardio Hall',
  'Zen Room',
  'Studio A',
  'Studio B',
  'Box Arena',
] as const

export function InstructorSessionsPage() {
  const toast = usePortalToast()
  const [sessions, setSessions] = useState<SessionRequest[]>([])
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const refresh = async () => {
    try {
      const data = await sessionService.getInstructorSessions()
      setSessions(data.map(mapSpecialSessionToRequest))
    } catch {
      setSessions([])
    }
  }

  useEffect(() => {
    void refresh()
  }, [])

  const [title, setTitle] = useState('')
  const [classTypeId, setClassTypeId] = useState(FITNESS_CLASSES[0]?.id ?? 'cardio')
  const [description, setDescription] = useState('')
  const [date, setDate] = useState('')
  const [startTime, setStartTime] = useState('06:00')
  const [endTime, setEndTime] = useState('07:00')
  const [studio, setStudio] = useState<string>(STUDIOS[0])
  const [capacity, setCapacity] = useState('20')
  const [priceLkr, setPriceLkr] = useState('2000')

  const pendingCount = useMemo(
    () => sessions.filter((session) => session.status === 'pending').length,
    [sessions],
  )

  const resetForm = () => {
    setTitle('')
    setClassTypeId(FITNESS_CLASSES[0]?.id ?? 'cardio')
    setDescription('')
    setDate('')
    setStartTime('06:00')
    setEndTime('07:00')
    setStudio(STUDIOS[0])
    setCapacity('20')
    setPriceLkr('2000')
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()

    if (!title.trim()) {
      toast.error('Enter a session title.')
      return
    }
    if (!description.trim()) {
      toast.error('Enter a session description.')
      return
    }
    if (!date) {
      toast.error('Select a session date.')
      return
    }
    if (!startTime || !endTime) {
      toast.error('Select start and end times.')
      return
    }
    if (endTime <= startTime) {
      toast.error('End time must be after start time.')
      return
    }

    const capacityNumber = Number(capacity)
    const priceNumber = Number(priceLkr)
    if (!capacityNumber || capacityNumber < 1) {
      toast.error('Enter a valid capacity.')
      return
    }
    if (Number.isNaN(priceNumber) || priceNumber < 0) {
      toast.error('Enter a valid price.')
      return
    }

    setSubmitting(true)
    try {
      await sessionService.createRequest({
        title: title.trim(),
        description: description.trim(),
        startDateTime: `${date}T${startTime}:00`,
        endDateTime: `${date}T${endTime}:00`,
        feePerPersonLKR: priceNumber,
        maxParticipants: capacityNumber,
      })
      await refresh()
      toast.success('Session request submitted. Waiting for admin approval.')
      resetForm()
      setShowForm(false)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not submit session request.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4 border-b border-portal-line pb-6">
        <div>
          <p className="text-xs font-medium text-portal-muted">My Sessions</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-portal-ink sm:text-3xl">
            My Session Requests
          </h1>
          <p className="mt-2 text-sm text-portal-muted">
            Create a session and submit it for admin approval. Approved sessions
            appear on the member portal and public classes page.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowForm((prev) => !prev)}
          className="inline-flex min-h-[40px] items-center gap-2 rounded-lg bg-portal-ink px-4 py-2 text-sm font-medium text-white transition hover:bg-black"
        >
          <Plus className="size-4" aria-hidden="true" />
          {showForm ? 'Close form' : 'Create session'}
        </button>
      </header>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="portal-widget-3d space-y-4 rounded-xl border border-portal-line bg-portal-card p-5 sm:p-6"
        >
          <h2 className="text-base font-semibold text-portal-ink">
            New session request
          </h2>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block sm:col-span-2">
              <span className="mb-1.5 block text-xs text-portal-muted">Title</span>
              <input
                type="text"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="e.g. VIP Zumba Session"
                className="w-full rounded-lg border border-portal-line bg-portal-canvas px-3 py-2.5 text-sm outline-none focus:border-portal-ink"
              />
            </label>

            <label className="block">
              <span className="mb-1.5 block text-xs text-portal-muted">Class type</span>
              <select
                value={classTypeId}
                onChange={(event) => setClassTypeId(event.target.value)}
                className="w-full rounded-lg border border-portal-line bg-portal-canvas px-3 py-2.5 text-sm outline-none focus:border-portal-ink"
              >
                {FITNESS_CLASSES.map((fitnessClass) => (
                  <option key={fitnessClass.id} value={fitnessClass.id}>
                    {fitnessClass.title}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="mb-1.5 block text-xs text-portal-muted">Studio</span>
              <select
                value={studio}
                onChange={(event) => setStudio(event.target.value)}
                className="w-full rounded-lg border border-portal-line bg-portal-canvas px-3 py-2.5 text-sm outline-none focus:border-portal-ink"
              >
                {STUDIOS.map((entry) => (
                  <option key={entry} value={entry}>
                    {entry}
                  </option>
                ))}
              </select>
            </label>

            <label className="block sm:col-span-2">
              <span className="mb-1.5 block text-xs text-portal-muted">Description</span>
              <textarea
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                rows={3}
                placeholder="What members can expect from this session…"
                className="w-full resize-none rounded-lg border border-portal-line bg-portal-canvas px-3 py-2.5 text-sm outline-none focus:border-portal-ink"
              />
            </label>

            <label className="block">
              <span className="mb-1.5 block text-xs text-portal-muted">Date</span>
              <input
                type="date"
                value={date}
                onChange={(event) => setDate(event.target.value)}
                className="w-full rounded-lg border border-portal-line bg-portal-canvas px-3 py-2.5 text-sm outline-none focus:border-portal-ink"
              />
            </label>

            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className="mb-1.5 block text-xs text-portal-muted">Start time</span>
                <input
                  type="time"
                  value={startTime}
                  onChange={(event) => setStartTime(event.target.value)}
                  className="w-full rounded-lg border border-portal-line bg-portal-canvas px-3 py-2.5 text-sm outline-none focus:border-portal-ink"
                />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-xs text-portal-muted">End time</span>
                <input
                  type="time"
                  value={endTime}
                  onChange={(event) => setEndTime(event.target.value)}
                  className="w-full rounded-lg border border-portal-line bg-portal-canvas px-3 py-2.5 text-sm outline-none focus:border-portal-ink"
                />
              </label>
            </div>

            <label className="block">
              <span className="mb-1.5 block text-xs text-portal-muted">Capacity</span>
              <input
                type="number"
                min={1}
                value={capacity}
                onChange={(event) => setCapacity(event.target.value)}
                className="w-full rounded-lg border border-portal-line bg-portal-canvas px-3 py-2.5 text-sm outline-none focus:border-portal-ink"
              />
            </label>

            <label className="block">
              <span className="mb-1.5 block text-xs text-portal-muted">Price (LKR)</span>
              <input
                type="number"
                min={0}
                value={priceLkr}
                onChange={(event) => setPriceLkr(event.target.value)}
                className="w-full rounded-lg border border-portal-line bg-portal-canvas px-3 py-2.5 text-sm outline-none focus:border-portal-ink"
              />
            </label>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="inline-flex min-h-[42px] items-center justify-center rounded-lg bg-portal-ink px-5 text-sm font-medium text-white transition hover:bg-black"
          >
            {submitting ? 'Submitting…' : 'Submit session request'}
          </button>
        </form>
      )}

      <div className="flex items-center justify-between gap-3">
        <h2 className="text-sm font-semibold text-portal-ink">Your requests</h2>
        <p className="text-xs text-portal-muted">{pendingCount} pending approval</p>
      </div>

      {sessions.length === 0 ? (
        <div className="portal-widget-3d rounded-xl border border-dashed border-portal-line bg-portal-card px-5 py-12 text-center">
          <p className="text-sm font-medium text-portal-ink">No sessions yet</p>
          <p className="mt-1 text-sm text-portal-muted">
            Create a session and submit it for admin approval.
          </p>
        </div>
      ) : (
        <ul className="space-y-3">
          {sessions.map((session) => (
            <SessionRequestCard key={session.id} session={session} />
          ))}
        </ul>
      )}
    </div>
  )
}

function SessionRequestCard({ session }: { session: SessionRequest }) {
  const classType =
    FITNESS_CLASSES.find((entry) => entry.id === session.classTypeId)?.title ??
    session.classTypeId

  return (
    <li className="portal-widget-3d rounded-xl border border-orange-100 bg-gradient-to-br from-white via-orange-50/40 to-amber-50/30 p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <StatusPill status={session.status} />
        <p className="text-sm font-semibold text-sky-600">
          {formatLkr(session.priceLkr)}
        </p>
      </div>
      <h3 className="mt-3 text-lg font-semibold text-portal-ink">{session.title}</h3>
      <p className="mt-1 text-sm text-portal-muted">
        {classType} · {session.studio}
      </p>
      <p className="mt-2 text-sm leading-relaxed text-portal-muted">
        {session.description}
      </p>
      <p className="mt-3 text-sm text-portal-ink">
        {formatSessionDate(session.date)} · {session.startTime} - {session.endTime}
      </p>
      <p className="mt-1 text-sm text-portal-muted">
        Capacity {session.capacity}
        {session.status === 'pending' && ' · Awaiting admin approval'}
        {session.status === 'approved' && ' · Live on member portal & classes page'}
        {session.status === 'rejected' && ' · Rejected by admin'}
      </p>
    </li>
  )
}

function StatusPill({ status }: { status: SessionRequestStatus }) {
  const styles: Record<SessionRequestStatus, string> = {
    pending: 'bg-amber-100 text-amber-800',
    approved: 'bg-emerald-100 text-emerald-800',
    rejected: 'bg-rose-100 text-rose-800',
  }

  return (
    <span
      className={`rounded-md px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] ${styles[status]}`}
    >
      {status}
    </span>
  )
}
