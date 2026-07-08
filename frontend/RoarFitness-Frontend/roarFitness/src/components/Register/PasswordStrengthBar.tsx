import type { PasswordStrengthLevel } from '../../utils/validation'

interface PasswordStrengthBarProps {
  level: PasswordStrengthLevel
  percent: number
  label: string
}

const BAR_COLORS: Record<PasswordStrengthLevel, string> = {
  weak: 'bg-red-500',
  fair: 'bg-amber-500',
  good: 'bg-lime-500',
  strong: 'bg-emerald-600',
}

/** Visual password strength meter */
export function PasswordStrengthBar({
  level,
  percent,
  label,
}: PasswordStrengthBarProps) {
  if (percent === 0) return null

  return (
    <div className="space-y-1.5" aria-live="polite">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-brand-muted">
          Password strength
        </span>
        <span className="text-[10px] font-medium text-brand-muted">{label}</span>
      </div>
      <div
        className="h-1 w-full overflow-hidden rounded-full bg-brand-ink/[0.08]"
        role="meter"
        aria-valuenow={percent}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Password strength: ${label}`}
      >
        <div
          className={`h-full rounded-full transition-all duration-300 ${BAR_COLORS[level]}`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  )
}
