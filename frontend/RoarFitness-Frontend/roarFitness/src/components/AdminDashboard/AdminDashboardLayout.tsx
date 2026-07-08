import { useEffect, useState } from 'react'
import { Menu } from 'lucide-react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'

import { useAuth } from '../../context/AuthContext'
import { ROUTES } from '../../routes/paths'
import { AdminProfileModal } from './AdminProfileModal'
import { AdminSidebar } from './AdminSidebar'
import { PortalConfirmModal } from '../portal/PortalConfirmModal'
import { PortalToastProvider } from '../PortalToast/PortalToast'

export function AdminDashboardLayout() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false)

  useEffect(() => {
    setMobileOpen(false)
  }, [location.pathname])

  if (!user) return null

  const handleLogoutClick = () => {
    setLogoutConfirmOpen(true)
  }

  const handleLogoutConfirm = () => {
    setLogoutConfirmOpen(false)
    signOut()
    navigate(ROUTES.home)
  }

  return (
    <PortalToastProvider>
    <div className="app-portal min-h-dvh bg-portal-canvas lg:flex">
      <div className="relative z-10 hidden lg:sticky lg:top-0 lg:flex lg:h-dvh lg:shrink-0 lg:border-r lg:border-portal-line">
        <AdminSidebar
          user={user}
          onLogout={handleLogoutClick}
          onOpenProfile={() => setProfileOpen(true)}
        />
      </div>

      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-portal-ink/20"
            aria-label="Close menu"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative z-10 h-full w-[min(100%,17rem)] border-r border-portal-line bg-portal-side shadow-xl">
            <AdminSidebar
              user={user}
              onLogout={handleLogoutClick}
              onOpenProfile={() => {
                setMobileOpen(false)
                setProfileOpen(true)
              }}
            />
          </div>
        </div>
      )}

      <div className="relative z-10 flex min-w-0 flex-1 flex-col">
        <div className="flex items-center gap-3 border-b border-portal-line bg-portal-card px-4 py-3 lg:hidden">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="inline-flex items-center gap-2 rounded-lg border border-portal-line bg-white px-3 py-2 text-sm font-medium text-portal-ink"
          >
            <Menu className="size-4" aria-hidden="true" />
            Menu
          </button>
          <button
            type="button"
            onClick={() => setProfileOpen(true)}
            className="flex-1 text-center text-sm font-semibold text-portal-ink hover:text-portal-muted"
            aria-label="View admin profile"
          >
            Admin Portal
          </button>
          <span className="w-[4.75rem] shrink-0" aria-hidden="true" />
        </div>

        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6 sm:py-8 lg:px-10 lg:py-10">
          <Outlet />
        </main>
      </div>

      {profileOpen ? (
        <AdminProfileModal user={user} onClose={() => setProfileOpen(false)} />
      ) : null}

      {logoutConfirmOpen ? (
        <PortalConfirmModal
          title="Log out"
          message="Do you wish to log out?"
          confirmLabel="Yes"
          cancelLabel="No"
          onCancel={() => setLogoutConfirmOpen(false)}
          onConfirm={handleLogoutConfirm}
        />
      ) : null}
    </div>
    </PortalToastProvider>
  )
}
