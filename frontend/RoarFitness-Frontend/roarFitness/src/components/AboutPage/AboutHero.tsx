import { motion } from 'motion/react'

import { ABOUT_COPY, ABOUT_IMAGES } from './constants'

export function AboutHero() {
  return (
    <header className="relative overflow-hidden bg-features-bg text-white">
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <motion.img
          src={ABOUT_IMAGES.hero}
          alt=""
          className="h-full w-full object-cover object-center"
          initial={{ opacity: 0, scale: 1.04 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-features-bg via-features-bg/92 to-features-bg/50" />
        <div className="absolute inset-0 bg-gradient-to-t from-features-bg/85 via-transparent to-features-bg/35" />
      </div>

      <div
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:56px_56px]"
        aria-hidden="true"
      />

      <div className="relative z-10 mx-auto max-w-[90rem] px-5 pb-14 pt-8 sm:px-8 sm:pb-16 sm:pt-10 lg:px-12 lg:pb-20">
        <div className="max-w-3xl">
          <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-white/70 sm:text-[11px]">
            {ABOUT_COPY.eyebrow}
          </p>

          <h1 className="mt-4 text-[clamp(2rem,4.5vw,3.25rem)] font-medium leading-[1.08] tracking-[-0.02em] text-white">
            {ABOUT_COPY.headline}
          </h1>

          <p
            className="pointer-events-none mt-3 select-none font-display text-[clamp(3rem,10vw,6.5rem)] font-normal leading-[0.88] tracking-[0.04em] text-white/20"
            aria-hidden="true"
          >
            ROAR
          </p>

          <p className="mt-5 max-w-xl text-sm leading-[1.85] text-white/80 sm:text-[0.9375rem]">
            {ABOUT_COPY.description}
          </p>
        </div>
      </div>
    </header>
  )
}
