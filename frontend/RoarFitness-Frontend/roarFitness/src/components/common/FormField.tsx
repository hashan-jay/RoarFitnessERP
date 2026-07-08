import type { ReactNode } from 'react'

import { FORM_ERROR_CLASS, FORM_LABEL_CLASS } from './formStyles'

interface FormFieldProps {
  id: string
  label: string
  error?: string
  children: ReactNode
}

/** Accessible label + field + inline error wrapper */
export function FormField({ id, label, error, children }: FormFieldProps) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className={FORM_LABEL_CLASS}>
        {label}
      </label>
      {children}
      {error && (
        <p id={`${id}-error`} className={FORM_ERROR_CLASS} role="alert">
          {error}
        </p>
      )}
    </div>
  )
}
