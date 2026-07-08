import { Link } from 'react-router-dom'

import { ROUTES } from '../../routes/paths'

/**
 * Brand wordmark — ROAR | Fitness
 * Display + sans pairing with a restrained monochrome palette.
 */
export function Logo() {
  return (
    <Link
      to={ROUTES.home}
      aria-label="Roar Fitness home"
      className="group inline-flex items-center gap-[0.6rem] sm:gap-3"
    >
      <span className="font-display text-[1.625rem] leading-none tracking-[0.1em] text-brand-ink transition-[letter-spacing,color] duration-300 group-hover:tracking-[0.12em] sm:text-[1.875rem]">
        ROAR
      </span>

      <span
        className="select-none px-px font-light leading-none text-brand-divider transition-colors duration-300 group-hover:text-neutral-400 sm:text-xl"
        aria-hidden="true"
      >
        |
      </span>

      <span className="pt-px text-[0.8125rem] font-medium uppercase tracking-[0.18em] text-brand-muted transition-colors duration-300 group-hover:text-neutral-700 sm:text-[0.9375rem] sm:tracking-[0.22em]">
        Fitness
      </span>
    </Link>
  )
}
