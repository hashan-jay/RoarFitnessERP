import { KeyRound } from 'lucide-react'

interface KeyAccountButtonProps {
  label: string
  onClick: () => void
}

export function KeyAccountButton({ label, onClick }: KeyAccountButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      aria-label={label}
      className="inline-flex size-8 items-center justify-center rounded-lg border border-portal-line bg-portal-canvas text-portal-ink transition hover:border-portal-ink hover:bg-white"
    >
      <KeyRound className="size-4" aria-hidden="true" />
    </button>
  )
}
