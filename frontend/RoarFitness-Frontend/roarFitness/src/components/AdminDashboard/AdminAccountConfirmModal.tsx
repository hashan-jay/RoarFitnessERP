import { PortalConfirmModal } from '../portal/PortalConfirmModal'

interface AdminAccountConfirmModalProps {
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  confirmTone?: 'danger' | 'success'
  loading?: boolean
  onCancel: () => void
  onConfirm: () => void
}

export function AdminAccountConfirmModal(props: AdminAccountConfirmModalProps) {
  return (
    <PortalConfirmModal
      {...props}
      confirmLabel={props.confirmLabel ?? 'YES'}
      cancelLabel={props.cancelLabel ?? 'NO'}
    />
  )
}
