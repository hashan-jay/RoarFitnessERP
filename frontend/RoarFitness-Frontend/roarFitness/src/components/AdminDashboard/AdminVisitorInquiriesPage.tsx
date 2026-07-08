import { useEffect, useMemo, useState } from 'react'
import { Mail, X } from 'lucide-react'

import { formatAppDateTime } from '../../lib/formatters'
import { visitorInquiryService } from '../../services'
import { usePortalToast } from '../PortalToast/PortalToast'
import type { VisitorInquiry } from '../../types/api'

export function AdminVisitorInquiriesPage() {
  const toast = usePortalToast()
  const [inquiries, setInquiries] = useState<VisitorInquiry[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<VisitorInquiry | null>(null)

  useEffect(() => {
    visitorInquiryService
      .list()
      .then(setInquiries)
      .catch(() => {
        setInquiries([])
        toast.error('Could not load visitor inquiries.')
      })
      .finally(() => setLoading(false))
  }, [])

  const latestCount = useMemo(() => inquiries.length, [inquiries])

  return (
    <div className="space-y-6">
      <header className="border-b border-portal-line pb-6">
        <p className="text-xs font-medium text-portal-muted">Public website</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-portal-ink sm:text-3xl">
          Visitor Inquiries
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-portal-muted">
          Messages submitted through the public Contact Us form. Reply to important inquiries
          through your email app — responses are not handled inside this portal.
        </p>
      </header>

      <div className="grid gap-3 sm:grid-cols-2">
        <StatTile label="Total inquiries" value={String(latestCount)} />
        <StatTile
          label="Latest submission"
          value={
            inquiries[0]
              ? formatAppDateTime(inquiries[0].submittedAt)
              : '—'
          }
        />
      </div>

      <div className="portal-widget-3d overflow-hidden rounded-xl border border-portal-line bg-portal-card">
        {loading ? (
          <p className="px-5 py-10 text-center text-sm text-portal-muted">Loading inquiries…</p>
        ) : inquiries.length === 0 ? (
          <div className="px-5 py-12 text-center">
            <Mail className="mx-auto size-8 text-portal-muted/60" aria-hidden="true" />
            <p className="mt-4 text-sm font-medium text-portal-ink">No inquiries yet</p>
            <p className="mt-1 text-sm text-portal-muted">
              Visitor messages from the public website will appear here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-portal-line bg-portal-canvas text-xs uppercase tracking-wide text-portal-muted">
                <tr>
                  <th className="px-4 py-3">Submitted</th>
                  <th className="px-4 py-3">Full name</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Phone</th>
                  <th className="px-4 py-3">Message</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-portal-line">
                {inquiries.map((inquiry) => (
                  <tr key={inquiry.inquiryId} className="hover:bg-portal-canvas/60">
                    <td className="whitespace-nowrap px-4 py-3 text-portal-muted">
                      {formatAppDateTime(inquiry.submittedAt)}
                    </td>
                    <td className="px-4 py-3 font-medium text-portal-ink">{inquiry.fullName}</td>
                    <td className="px-4 py-3">
                      <a
                        href={`mailto:${encodeURIComponent(inquiry.email)}`}
                        className="text-portal-ink underline-offset-2 hover:underline"
                      >
                        {inquiry.email}
                      </a>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-portal-muted">
                      {inquiry.phone || '—'}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => setSelected(inquiry)}
                        className="max-w-xs truncate text-left text-portal-ink underline-offset-2 hover:underline"
                      >
                        {inquiry.message}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button
            type="button"
            className="absolute inset-0 bg-portal-ink/20"
            aria-label="Close inquiry details"
            onClick={() => setSelected(null)}
          />
          <div className="portal-widget-3d relative z-10 max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-xl border border-portal-line bg-portal-card p-6 shadow-xl">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-portal-ink">Visitor inquiry</h2>
                <p className="mt-1 text-sm text-portal-muted">
                  {formatAppDateTime(selected.submittedAt)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="flex size-8 shrink-0 items-center justify-center rounded-lg text-portal-muted transition hover:bg-portal-canvas hover:text-portal-ink"
                aria-label="Close"
              >
                <X className="size-4" />
              </button>
            </div>

            <dl className="mt-5 space-y-3 border-t border-portal-line pt-5 text-sm">
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-portal-muted">
                  Full name
                </dt>
                <dd className="mt-1 font-medium text-portal-ink">{selected.fullName}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-portal-muted">
                  Email
                </dt>
                <dd className="mt-1">
                  <a
                    href={`mailto:${encodeURIComponent(selected.email)}`}
                    className="font-medium text-portal-ink underline-offset-2 hover:underline"
                  >
                    {selected.email}
                  </a>
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-portal-muted">
                  Phone
                </dt>
                <dd className="mt-1 text-portal-ink">{selected.phone || '—'}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-portal-muted">
                  Message
                </dt>
                <dd className="mt-2 whitespace-pre-wrap leading-relaxed text-portal-ink">
                  {selected.message}
                </dd>
              </div>
            </dl>

            <p className="mt-5 border-t border-portal-line pt-4 text-xs text-portal-muted">
              To respond, open your email app and reply to {selected.email}.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

function StatTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="portal-widget-3d rounded-xl border border-portal-line bg-portal-card px-4 py-4">
      <p className="text-xs text-portal-muted">{label}</p>
      <p className="mt-2 text-base font-semibold text-portal-ink">{value}</p>
    </div>
  )
}
