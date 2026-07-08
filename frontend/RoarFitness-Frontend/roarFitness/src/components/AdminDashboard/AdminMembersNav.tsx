import { NavLink } from 'react-router-dom'

import { ROUTES } from '../../routes/paths'

const tabs = [
  { label: 'Member accounts', to: `${ROUTES.dashboardAdmin}/members` },
  { label: 'Membership renewals', to: `${ROUTES.dashboardAdmin}/members/renewals` },
] as const

export function AdminMembersNav() {
  return (
    <nav className="flex flex-wrap gap-2" aria-label="Member sections">
      {tabs.map((tab) => (
        <NavLink
          key={tab.to}
          to={tab.to}
          end={tab.to.endsWith('/members')}
          className={({ isActive }) =>
            `rounded-lg px-4 py-2 text-sm font-medium transition ${
              isActive
                ? 'bg-portal-ink text-white'
                : 'border border-portal-line bg-portal-card text-portal-ink hover:bg-portal-canvas'
            }`
          }
        >
          {tab.label}
        </NavLink>
      ))}
    </nav>
  )
}
