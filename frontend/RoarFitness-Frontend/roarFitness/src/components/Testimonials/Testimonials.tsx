import { TestimonialsGrid } from './TestimonialsGrid'

/**
 * Member stories — light editorial band after coaches.
 */
export function Testimonials() {
  return (
    <section
      id="testimonials"
      className="relative overflow-hidden bg-surface font-sans text-brand-ink"
      aria-labelledby="testimonials-heading"
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(10,10,10,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(10,10,10,0.03)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_75%)]"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -left-24 top-1/4 h-80 w-80 rounded-full bg-brand-ink/[0.03] blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand-ink/10 to-transparent"
        aria-hidden="true"
      />

      <div className="relative z-10 mx-auto max-w-[90rem] px-5 py-16 sm:px-8 sm:py-20 md:py-24 lg:px-12 lg:py-28 xl:py-32">
        <TestimonialsGrid />
      </div>
    </section>
  )
}
