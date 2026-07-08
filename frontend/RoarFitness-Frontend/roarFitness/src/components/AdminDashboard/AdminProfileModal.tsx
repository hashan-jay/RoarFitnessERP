import type { AuthUser } from '../../types/auth'

interface AdminProfileModalProps {
  user: AuthUser
  onClose: () => void
}

export function AdminProfileModal({ user, onClose }: AdminProfileModalProps) {
  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-portal-ink/40 p-4"
      onClick={onClose}
    >
      <div
        className="portal-widget-3d w-full max-w-lg rounded-xl border border-portal-line bg-portal-card p-6 shadow-xl"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="admin-profile-title"
      >
        <header className="border-b border-portal-line pb-4">
          <p className="text-xs font-medium text-portal-muted">Profile</p>
          <h2
            id="admin-profile-title"
            className="mt-1 text-xl font-semibold tracking-tight text-portal-ink"
          >
            Your account
          </h2>
          <p className="mt-1 text-sm text-portal-muted">
            Administrator account details for the shared login portal.
          </p>
        </header>

        <section className="mt-5 rounded-xl border border-sky-100 bg-gradient-to-br from-white via-sky-50/50 to-blue-50/30 p-5">
          <div className="flex flex-wrap items-center gap-4">
            <span className="flex size-14 items-center justify-center rounded-full bg-white text-lg font-semibold text-portal-ink shadow-sm">
              {user.firstName.charAt(0)}
              {user.lastName.charAt(0)}
            </span>
            <div>
              <h3 className="text-lg font-semibold text-portal-ink">
                {user.firstName} {user.lastName}
              </h3>
              <p className="mt-0.5 text-sm text-portal-muted">System Administrator</p>
            </div>
          </div>

          <dl className="mt-6 grid gap-4 border-t border-sky-100 pt-5 sm:grid-cols-2">
            <div>
              <dt className="text-xs text-portal-muted">Email</dt>
              <dd className="mt-1 text-sm font-medium text-portal-ink">{user.email}</dd>
            </div>
            <div>
              <dt className="text-xs text-portal-muted">Access</dt>
              <dd className="mt-1 text-sm font-medium text-portal-ink">
                Admin portal (role-based)
              </dd>
            </div>
          </dl>
        </section>

        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex min-h-[42px] items-center justify-center rounded-lg border border-portal-line px-5 text-sm font-medium text-portal-ink hover:bg-portal-canvas"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
