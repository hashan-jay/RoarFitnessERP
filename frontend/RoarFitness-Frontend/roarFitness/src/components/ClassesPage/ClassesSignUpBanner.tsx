import { AppLink } from '../common/AppLink'
import { ROUTES } from '../../routes/paths'
import { CLASSES_PAGE_COPY } from './scheduleData'

export function ClassesSignUpBanner() {
  return (
    <section
      aria-label="Sign up call to action"
      className="mt-6 overflow-hidden rounded-[1px] border border-brand-ink/[0.08] bg-features-bg text-white shadow-[0_12px_28px_rgba(10,10,10,0.1)] sm:mt-8"
    >
      <div className="flex flex-col gap-4 px-5 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-7 sm:py-7">
        <div className="max-w-2xl">
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-features-muted sm:text-[11px]">
            {CLASSES_PAGE_COPY.signUpBannerTitle}
          </p>
          <p className="mt-2 text-sm leading-relaxed text-features-body sm:text-[0.9375rem]">
            {CLASSES_PAGE_COPY.signUpBannerText}
          </p>
        </div>

        <div className="flex flex-wrap gap-2.5">
          <AppLink
            to={ROUTES.register}
            className="inline-flex min-h-[42px] items-center justify-center border border-white bg-white px-5 py-2.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-brand-ink transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/90 sm:text-[11px]"
          >
            {CLASSES_PAGE_COPY.signUpCta}
          </AppLink>
          <AppLink
            to={ROUTES.login}
            className="inline-flex min-h-[42px] items-center justify-center border border-white/20 bg-transparent px-5 py-2.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-white transition-all duration-300 hover:-translate-y-0.5 hover:border-white/35 hover:bg-white/5 sm:text-[11px]"
          >
            {CLASSES_PAGE_COPY.loginCta}
          </AppLink>
        </div>
      </div>
    </section>
  )
}
