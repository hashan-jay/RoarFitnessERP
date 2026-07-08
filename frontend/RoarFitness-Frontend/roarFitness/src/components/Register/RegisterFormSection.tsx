import type { ReactNode } from 'react'

interface RegisterFormSectionProps {
  step: string
  title: string
  description: string
  children: ReactNode
}

/** Numbered form section — groups related registration fields */
export function RegisterFormSection({
  step,
  title,
  description,
  children,
}: RegisterFormSectionProps) {
  return (
    <section className="border-b border-brand-ink/[0.06] pb-7 last:border-b-0 last:pb-0 sm:pb-8">
      <div className="mb-5 flex items-start gap-4 sm:mb-6">
        <span
          className="font-display text-3xl leading-none tracking-[0.04em] text-brand-ink/15 sm:text-4xl"
          aria-hidden="true"
        >
          {step}
        </span>
        <div className="min-w-0 pt-0.5">
          <h2 className="text-sm font-medium tracking-[-0.01em] text-brand-ink sm:text-base">
            {title}
          </h2>
          <p className="mt-1 text-xs leading-relaxed text-brand-muted sm:text-sm">
            {description}
          </p>
        </div>
      </div>
      <div className="space-y-4">{children}</div>
    </section>
  )
}
