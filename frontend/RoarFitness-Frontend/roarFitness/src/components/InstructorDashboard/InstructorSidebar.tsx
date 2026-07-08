import { LogOut } from 'lucide-react'
import { NavLink } from 'react-router-dom'

import type { AuthUser } from '../../types/auth'
import { PortalClock } from '../portal/PortalClock'
import { INSTRUCTOR_NAV } from './instructorNav'

interface InstructorSidebarProps {
  user: AuthUser
  onLogout: () => void
}

export function InstructorSidebar({ user, onLogout }: InstructorSidebarProps) {
  const fullName = `${user.firstName} ${user.lastName}`.trim()

  return (
    <aside className="flex h-full w-full flex-col bg-portal-side text-portal-ink lg:w-60">
      <div className="px-5 py-6">
        <div className="flex items-center gap-3">
          <span className="flex size-9 items-center justify-center rounded-lg bg-portal-ink text-sm font-bold text-white">
            R
          </span>
          <div>
            <p className="text-sm font-semibold tracking-tight">Instructor Portal</p>
            <p className="text-[11px] text-portal-muted">Roar Fitness</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 pb-4" aria-label="Instructor navigation">
        <ul className="space-y-0.5">
          {INSTRUCTOR_NAV.map((item) => {
            const Icon = item.icon
            const end = item.id === 'dashboard'

            return (
              <li key={item.id}>
                <NavLink
                  to={item.to}
                  end={end}
                  className={({ isActive }) =>
                    [
                      'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-portal-accent-soft text-portal-ink'
                        : 'text-portal-muted hover:bg-portal-canvas hover:text-portal-ink',
                    ].join(' ')
                  }
                >
                  <Icon className="size-4 shrink-0" aria-hidden="true" />
                  {item.label}
                </NavLink>
              </li>
            )
          })}
        </ul>
      </nav>

      <div className="px-5 pb-3">
        <PortalClock />
      </div>

      <div className="border-t border-portal-line px-5 py-5">
        <p className="truncate text-sm font-medium text-portal-ink">{fullName}</p>
        <p className="mt-0.5 truncate text-xs text-portal-muted">{user.email}</p>
        <button
          type="button"
          onClick={onLogout}
          className="mt-4 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-portal-muted transition-colors hover:text-portal-ink"
        >
          <LogOut className="size-3.5" aria-hidden="true" />
          Logout
        </button>
      </div>
    </aside>
  )
}
