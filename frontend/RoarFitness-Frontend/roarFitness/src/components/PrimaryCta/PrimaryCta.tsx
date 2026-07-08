import type { ComponentPropsWithoutRef, ReactNode } from 'react'

import { AppLink } from '../common/AppLink'

const primaryCtaClassName =
  'group inline-flex items-center bg-white px-7 py-3.5 text-xs font-semibold uppercase tracking-[0.15em] text-black shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md sm:px-9 sm:py-4 sm:text-sm lg:px-10 max-md:min-h-[44px] max-md:w-full max-md:max-w-[19rem] max-md:justify-center max-md:px-6 max-md:py-4'

type PrimaryCtaProps = {
  children: ReactNode
  className?: string
  to?: string
} & ComponentPropsWithoutRef<'a'>

/** Primary call-to-action — shared by Hero, Classes, and other sections */
export function PrimaryCta({
  children,
  className = '',
  to,
  href,
  ...props
}: PrimaryCtaProps) {
  const classes = `${primaryCtaClassName} ${className}`.trim()
  const chevron = (
    <span
      className="inline-block transition-transform duration-300 group-hover:translate-x-1"
      aria-hidden="true"
    >
      {' >>'}
    </span>
  )

  if (to) {
    return (
      <AppLink to={to} className={classes}>
        {children}
        {chevron}
      </AppLink>
    )
  }

  return (
    <AppLink href={href} className={classes} {...props}>
      {children}
      {chevron}
    </AppLink>
  )
}
