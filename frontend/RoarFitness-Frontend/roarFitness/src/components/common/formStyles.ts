/** Shared form field styles — aligned with Contact form aesthetic */

export const FORM_INPUT_CLASS =
  'w-full rounded-[1px] border border-brand-ink/[0.08] bg-surface/40 px-3.5 py-2.5 text-sm text-brand-ink placeholder:text-brand-muted/45 transition-colors duration-300 focus:border-brand-ink/20 focus:bg-white focus:outline-none sm:px-4 sm:py-3'

export const FORM_LABEL_CLASS =
  'text-[10px] font-semibold uppercase tracking-[0.14em] text-brand-muted sm:text-[11px]'

export const FORM_ERROR_CLASS = 'text-[11px] text-red-600'

export const FORM_SUBMIT_CLASS =
  'group inline-flex min-h-[44px] w-full items-center justify-center border border-brand-ink bg-brand-ink px-5 py-2.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-brand-ink/90 disabled:pointer-events-none disabled:opacity-60 sm:text-[11px]'

export function formInputClassName(hasError: boolean): string {
  return hasError
    ? `${FORM_INPUT_CLASS} border-red-500/70 focus:border-red-500`
    : FORM_INPUT_CLASS
}

export const FORM_SELECT_CLASS = `${FORM_INPUT_CLASS} appearance-none bg-[length:12px] bg-[right_0.75rem_center] bg-no-repeat pr-9`

export function formSelectClassName(hasError: boolean): string {
  return hasError
    ? `${FORM_SELECT_CLASS} border-red-500/70 focus:border-red-500`
    : FORM_SELECT_CLASS
}
