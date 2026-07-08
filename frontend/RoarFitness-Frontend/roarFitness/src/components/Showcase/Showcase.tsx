import { ShowcaseHeader } from './ShowcaseHeader'
import { ShowcaseSlider } from './ShowcaseSlider'
import { useShowcaseHeaderVariants } from './useShowcaseHeaderVariants'

/**
 * Editorial facility showcase — centered intro with a spotlight image slider.
 */
export function Showcase() {
  const { eyebrowVariants, headlineVariants, subtitleVariants } =
    useShowcaseHeaderVariants()

  return (
    <section
      className="relative overflow-hidden bg-surface font-sans text-brand-ink"
      aria-labelledby="showcase-heading"
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(10,10,10,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(10,10,10,0.02)_1px,transparent_1px)] bg-[size:48px_48px] [mask-image:radial-gradient(ellipse_at_50%_0%,black_8%,transparent_70%)]"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-y-16 left-8 hidden w-px bg-gradient-to-b from-transparent via-brand-ink/10 to-transparent lg:block xl:left-12"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-y-16 right-8 hidden w-px bg-gradient-to-b from-transparent via-brand-ink/10 to-transparent lg:block xl:right-12"
        aria-hidden="true"
      />

      <div className="relative z-10 mx-auto max-w-[90rem] px-5 py-16 sm:px-8 sm:py-20 md:py-24 lg:px-12 lg:py-28 xl:py-32">
        <ShowcaseHeader
          eyebrowVariants={eyebrowVariants}
          headlineVariants={headlineVariants}
          subtitleVariants={subtitleVariants}
        />
        <ShowcaseSlider />
      </div>
    </section>
  )
}
