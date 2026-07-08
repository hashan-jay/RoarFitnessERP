import { AppLink } from '../common/AppLink'
import { PrimaryCta } from '../PrimaryCta'
import { ROUTES } from '../../routes/paths'
import { ABOUT_COPY } from './constants'

export function AboutCtaBanner() {
  return (
    <section
      aria-label="Join Roar Fitness"
      className="mx-auto max-w-[72rem] px-5 pb-16 sm:px-8 sm:pb-20 lg:px-10 lg:pb-24"
    >
      <div className="relative overflow-hidden rounded-[1px] border border-brand-ink/[0.08] bg-features-bg text-white shadow-[0_12px_28px_rgba(10,10,10,0.1)]">
        <div
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:48px_48px]"
          aria-hidden="true"
        />

        <div className="relative flex flex-col gap-6 px-6 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-8 sm:py-10">
          <div className="max-w-xl">
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-features-muted sm:text-[11px]">
              {ABOUT_COPY.ctaTitle}
            </p>
            <p className="mt-2 text-sm leading-relaxed text-features-body sm:text-[0.9375rem]">
              {ABOUT_COPY.ctaBody}
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <PrimaryCta to={ROUTES.join}>{ABOUT_COPY.ctaPrimary}</PrimaryCta>
            <AppLink
              to={ROUTES.classes}
              className="inline-flex min-h-[44px] items-center justify-center border border-white/20 bg-transparent px-7 py-3.5 text-xs font-semibold uppercase tracking-[0.15em] text-white transition-all duration-300 hover:-translate-y-0.5 hover:border-white/35 hover:bg-white/5 sm:px-9 sm:py-4 sm:text-sm"
            >
              {ABOUT_COPY.ctaSecondary}
            </AppLink>
          </div>
        </div>
      </div>
    </section>
  )
}
