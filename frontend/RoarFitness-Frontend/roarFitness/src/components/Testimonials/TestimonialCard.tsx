import type { Testimonial } from './constants'

interface TestimonialCardProps {
  testimonial: Testimonial
  index: number
  className?: string
}

/** Editorial quote card — sharp frame, ghost index, result line */
export function TestimonialCard({
  testimonial,
  index,
  className = '',
}: TestimonialCardProps) {
  const indexLabel = String(index + 1).padStart(2, '0')

  return (
    <article
      className={`group relative flex h-full w-full flex-col overflow-hidden rounded-[1px] border border-brand-ink/[0.08] bg-white shadow-[0_8px_28px_rgba(10,10,10,0.06)] transition-all duration-500 ease-out hover:-translate-y-0.5 hover:border-brand-ink/15 hover:shadow-[0_16px_40px_rgba(10,10,10,0.1)] ${className}`.trim()}
    >
      <span
        className="absolute left-0 top-0 h-1 w-full bg-brand-ink/80"
        aria-hidden="true"
      />

      <div className="relative flex flex-1 flex-col p-5 sm:p-6 lg:p-7">
        <span
          className="font-display text-4xl leading-none tracking-[0.04em] text-brand-ink/[0.07] sm:text-5xl"
          aria-hidden="true"
        >
          {indexLabel}
        </span>

        <blockquote className="mt-4 flex-1">
          <p className="text-sm leading-[1.8] tracking-[-0.01em] text-brand-ink/90 sm:text-[0.9375rem] md:text-base">
            &ldquo;{testimonial.quote}&rdquo;
          </p>
        </blockquote>

        <div className="mt-6 border-t border-brand-ink/[0.06] pt-5 sm:mt-7 sm:pt-6">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-brand-ink sm:text-[11px]">
            {testimonial.result}
          </p>

          <footer className="mt-4">
            <cite className="not-italic">
              <p className="text-sm font-medium tracking-[-0.01em] text-brand-ink sm:text-base">
                {testimonial.name}
              </p>
              <p className="mt-1 text-[10px] font-medium uppercase tracking-[0.12em] text-brand-muted sm:text-[11px]">
                {testimonial.role}
              </p>
            </cite>
          </footer>
        </div>
      </div>
    </article>
  )
}
