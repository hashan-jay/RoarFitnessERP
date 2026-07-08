import { Link } from 'react-router-dom'

import { ROUTES } from '../../routes/paths'
import { FOOTER_COPY } from './constants'

export function FooterBrand() {
  return (
    <div>
      <Link
        to={ROUTES.home}
        aria-label="Roar Fitness home"
        className="group inline-flex items-center gap-[0.6rem] sm:gap-3"
      >
        <span className="font-display text-[1.45rem] leading-none tracking-[0.1em] text-white transition-[letter-spacing] duration-300 group-hover:tracking-[0.12em] sm:text-[1.65rem]">
          ROAR
        </span>
        <span
          className="select-none px-px font-light leading-none text-white/25 transition-colors duration-300 group-hover:text-white/40 sm:text-xl"
          aria-hidden="true"
        >
          |
        </span>
        <span className="pt-px text-[0.75rem] font-medium uppercase tracking-[0.18em] text-features-muted transition-colors duration-300 group-hover:text-white/70 sm:text-[0.82rem] sm:tracking-[0.2em]">
          Fitness
        </span>
      </Link>

      <p className="mt-3.5 max-w-xs text-[13px] leading-relaxed text-features-body sm:mt-4 sm:text-sm">
        {FOOTER_COPY.tagline}
      </p>
    </div>
  )
}
