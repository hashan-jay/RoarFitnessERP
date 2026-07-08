import { useEffect, useState } from 'react'
import { Search } from 'lucide-react'

import { formatDate } from '../../lib/formatters'
import { membershipRenewService } from '../../services'
import type { AdminMemberListItem, MemberRenewSearchItem, MembershipRenewBill } from '../../types/api'
import { usePortalToast } from '../PortalToast/PortalToast'
import { AdminMembershipRenewModal } from './AdminMembershipRenewModal'
import { AdminMembersNav } from './AdminMembersNav'
import { MembershipRenewBillReceipt } from './MembershipRenewBillReceipt'

function toRenewMember(item: MemberRenewSearchItem): AdminMemberListItem {
  const [firstName = '', ...rest] = item.fullName.split(' ')
  return {
    memberId: item.memberId,
    identificationNumber: item.identificationNumber,
    firstName,
    lastName: rest.join(' '),
    fullName: item.fullName,
    email: '',
    phone: item.phone,
    nicNumber: item.nicNumber,
    hasActiveMembership: item.hasActiveMembership,
    membershipEndDate: item.currentMembershipEndDate ?? item.membershipExpiredDate,
    isTerminated: false,
    isFingerprintActivated: item.isFingerprintActivated,
  }
}

export function AdminMembershipRenewalsPage() {
  const toast = usePortalToast()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<MemberRenewSearchItem[]>([])
  const [searching, setSearching] = useState(false)
  const [renewMember, setRenewMember] = useState<AdminMemberListItem | null>(null)
  const [renewBill, setRenewBill] = useState<MembershipRenewBill | null>(null)

  useEffect(() => {
    const trimmed = query.trim()
    if (trimmed.length < 2) {
      setResults([])
      return
    }

    let cancelled = false
    const timer = window.setTimeout(() => {
      setSearching(true)
      membershipRenewService
        .searchMembersForRenewal(trimmed)
        .then((items) => {
          if (!cancelled) setResults(items)
        })
        .catch(() => {
          if (!cancelled) setResults([])
        })
        .finally(() => {
          if (!cancelled) setSearching(false)
        })
    }, 300)

    return () => {
      cancelled = true
      window.clearTimeout(timer)
    }
  }, [query])

  return (
    <div className="space-y-6">
      <header className="border-b border-portal-line pb-6">
        <p className="text-xs font-medium text-portal-muted">Members</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-portal-ink sm:text-3xl">
          Membership renewals
        </h1>
        <p className="mt-2 text-sm text-portal-muted">
          Search a member, collect cash or card payment at reception, and print a bill like POS
          sales.
        </p>
      </header>

      <AdminMembersNav />

      <label className="relative block max-w-xl">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-portal-muted"
          aria-hidden="true"
        />
        <input
          className="w-full rounded-lg border border-portal-line bg-portal-canvas py-2.5 pl-10 pr-3 text-sm text-portal-ink outline-none focus:border-portal-ink"
          placeholder="Search by member ID, name, NIC, or phone…"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </label>

      {query.trim().length < 2 ? (
        <p className="text-sm text-portal-muted">Enter at least 2 characters to search.</p>
      ) : searching ? (
        <p className="text-sm text-portal-muted">Searching…</p>
      ) : results.length === 0 ? (
        <p className="text-sm text-portal-muted">No matching members found.</p>
      ) : (
        <ul className="space-y-3">
          {results.map((member) => (
            <li
              key={member.memberId}
              className="portal-widget-3d flex flex-wrap items-center justify-between gap-4 rounded-xl border border-portal-line bg-portal-card p-4"
            >
              <div>
                <p className="text-sm font-semibold text-portal-ink">{member.fullName}</p>
                <p className="mt-1 text-xs text-portal-muted">
                  {member.identificationNumber}
                  {member.phone ? ` · ${member.phone}` : ''}
                </p>
                <p className="mt-1 text-xs text-portal-muted">
                  {member.hasActiveMembership ? (
                    <>
                      Active
                      {member.currentMembershipEndDate
                        ? ` · expires ${formatDate(member.currentMembershipEndDate)}`
                        : ''}
                    </>
                  ) : member.membershipExpiredDate ? (
                    <>Inactive · expired {formatDate(member.membershipExpiredDate)}</>
                  ) : (
                    'No active membership'
                  )}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setRenewMember(toRenewMember(member))}
                className="rounded-lg bg-portal-ink px-4 py-2 text-sm font-medium text-white transition hover:bg-black"
              >
                Renew membership
              </button>
            </li>
          ))}
        </ul>
      )}

      {renewMember && (
        <AdminMembershipRenewModal
          member={renewMember}
          onClose={() => setRenewMember(null)}
          onBillGenerated={(bill) => {
            setRenewBill(bill)
            setRenewMember(null)
            toast.success(
              `Membership renewed for ${bill.memberName}. Bill ${bill.billReference} generated.`,
            )
          }}
        />
      )}

      {renewBill && (
        <MembershipRenewBillReceipt bill={renewBill} onClose={() => setRenewBill(null)} />
      )}
    </div>
  )
}
