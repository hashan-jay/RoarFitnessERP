interface PortalConfirmModalProps {
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  confirmTone?: 'danger' | 'success'
  loading?: boolean
  onCancel: () => void
  onConfirm: () => void
}

export function PortalConfirmModal({
  title,
  message,
  confirmLabel = 'Yes',
  cancelLabel = 'No',
  confirmTone = 'danger',
  loading = false,
  onCancel,
  onConfirm,
}: PortalConfirmModalProps) {
  const confirmClass =
    confirmTone === 'success'
      ? 'rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-60'
      : 'rounded-lg bg-rose-600 px-4 py-2 text-sm font-medium text-white hover:bg-rose-700 disabled:opacity-60'

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-portal-ink/40 p-4"
      onClick={() => !loading && onCancel()}
    >
      <div
        className="portal-widget-3d w-full max-w-md rounded-xl border border-portal-line bg-portal-card p-6 shadow-xl"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 className="text-lg font-semibold text-portal-ink">{title}</h2>
        <p className="mt-3 text-sm text-portal-muted">{message}</p>
        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            disabled={loading}
            onClick={onCancel}
            className="rounded-lg border border-portal-line px-4 py-2 text-sm font-medium text-portal-ink hover:bg-portal-canvas disabled:opacity-60"
          >
            {cancelLabel}
          </button>
          <button type="button" disabled={loading} onClick={onConfirm} className={confirmClass}>
            {loading ? 'Please wait…' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
