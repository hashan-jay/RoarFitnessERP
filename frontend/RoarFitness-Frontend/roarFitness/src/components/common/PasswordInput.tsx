import { Eye, EyeOff } from 'lucide-react'

import { formInputClassName } from './formStyles'

interface PasswordInputProps {
  id: string
  name: string
  value: string
  onChange: (value: string) => void
  onBlur?: () => void
  placeholder?: string
  autoComplete?: string
  disabled?: boolean
  hasError?: boolean
  showPassword: boolean
  onToggleVisibility: () => void
  showLabel: string
  hideLabel: string
  describedBy?: string
}

/** Password field with accessible show/hide toggle */
export function PasswordInput({
  id,
  name,
  value,
  onChange,
  onBlur,
  placeholder,
  autoComplete = 'current-password',
  disabled = false,
  hasError = false,
  showPassword,
  onToggleVisibility,
  showLabel,
  hideLabel,
  describedBy,
}: PasswordInputProps) {
  return (
    <div className="relative">
      <input
        id={id}
        name={name}
        type={showPassword ? 'text' : 'password'}
        autoComplete={autoComplete}
        required
        disabled={disabled}
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onBlur={onBlur}
        aria-invalid={hasError ? 'true' : 'false'}
        aria-describedby={describedBy}
        className={`${formInputClassName(hasError)} pr-11`}
      />
      <button
        type="button"
        onClick={onToggleVisibility}
        disabled={disabled}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-muted transition-colors hover:text-brand-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-ink/30 disabled:opacity-50"
        aria-label={showPassword ? hideLabel : showLabel}
        aria-pressed={showPassword}
      >
        {showPassword ? (
          <EyeOff className="size-4" aria-hidden="true" />
        ) : (
          <Eye className="size-4" aria-hidden="true" />
        )}
      </button>
    </div>
  )
}
