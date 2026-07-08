import { TrainersGrid } from './TrainersGrid'

/**
 * Expert coaches — premium glass cards without photography.
 */
export function Trainers() {
  return (
    <section
      id="trainers"
      className="relative overflow-hidden bg-features-bg font-sans text-white"
      aria-labelledby="trainers-heading"
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_75%)]"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -left-32 top-20 h-96 w-96 rounded-full bg-white/[0.04] blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -right-24 bottom-32 h-80 w-80 rounded-full bg-white/[0.03] blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 h-[32rem] w-[32rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/[0.015] blur-3xl"
        aria-hidden="true"
      />

      <div className="relative z-10 mx-auto max-w-[90rem] px-5 py-20 sm:px-8 sm:py-24 md:py-28 lg:px-12 lg:py-32 xl:py-36">
        <TrainersGrid />
      </div>
    </section>
  )
}
