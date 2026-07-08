import { ContactContent } from './ContactContent'

/**
 * Visit & contact — map-hero split with sidebar form rail.
 */
export function Contact() {
  return (
    <section
      id="contact"
      className="relative overflow-hidden bg-surface font-sans text-brand-ink"
      aria-labelledby="contact-heading"
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(10,10,10,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(10,10,10,0.025)_1px,transparent_1px)] bg-[size:56px_56px] [mask-image:radial-gradient(ellipse_at_70%_30%,black_12%,transparent_72%)]"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand-ink/10 to-transparent"
        aria-hidden="true"
      />

      <div className="relative z-10 mx-auto max-w-[90rem] px-5 py-16 sm:px-8 sm:py-20 md:py-24 lg:px-12 lg:py-28 xl:py-32">
        <ContactContent />
      </div>
    </section>
  )
}
