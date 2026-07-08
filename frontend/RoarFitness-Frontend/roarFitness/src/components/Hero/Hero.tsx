import { motion, useReducedMotion } from 'motion/react'

import { ROUTES } from '../../routes/paths'
import { heroLeftAthlete, heroRunner } from '../../assets/images/index'
import { Navbar } from '../Navbar'
import { PrimaryCta } from '../PrimaryCta'
import { HERO_COPY } from './constants'
import {
  createHeroCtaReveal,
  createHeroLeftAthleteReveal,
  createHeroRunnerReveal,
  createHeroTextReveal,
  createHeroWordmarkReveal,
} from './heroMotion'

const loadAnimation = {
  initial: 'hidden' as const,
  animate: 'visible' as const,
}

/**
 * IronX gym hero section — full-viewport landing with layered imagery,
 * decorative background typography, and responsive reflow.
 *
 * Z-index stack (low → high):
 *   10 — left & right athlete images
 *   20 — decorative background wordmark
 *   30 — hero copy
 *   50 — navigation (Navbar)
 */
export function Hero() {
  const reduceMotion = useReducedMotion()

  const eyebrowVariants = createHeroTextReveal(reduceMotion, 0)
  const headlineVariants = createHeroTextReveal(reduceMotion, 1)
  const descriptionVariants = createHeroTextReveal(reduceMotion, 2)
  const ctaVariants = createHeroCtaReveal(reduceMotion, 3)
  const leftAthleteVariants = createHeroLeftAthleteReveal(reduceMotion)
  const runnerVariants = createHeroRunnerReveal(reduceMotion)
  const wordmarkVariants = createHeroWordmarkReveal(reduceMotion)

  return (
    <section
      id="home"
      className="relative min-h-screen overflow-hidden bg-surface font-sans text-black"
      aria-labelledby="hero-heading"
    >
      <Navbar />

      {/* Left athlete — desktop only, mirrored alignment with the right runner */}
      <figure className="pointer-events-none absolute bottom-0 left-0 z-10 hidden justify-start transition-transform duration-500 hover:scale-[1.01] lg:flex lg:left-7 lg:pointer-events-auto xl:left-11">
        <motion.div
          className="flex justify-start"
          variants={leftAthleteVariants}
          {...loadAnimation}
        >
          <img
            src={heroLeftAthlete}
            alt="Athlete performing bicep curls with dumbbells"
            className="block h-[clamp(28rem,88vh,56rem)] w-auto max-w-[min(58vw,52rem)] object-contain object-bottom xl:max-w-[min(52vw,56rem)]"
            loading="eager"
          />
        </motion.div>
      </figure>

      {/* Runner — dominant visual, anchored to the hero bottom edge */}
      <figure className="pointer-events-none absolute bottom-0 right-0 z-10 flex justify-end transition-transform duration-500 hover:scale-[1.01] max-md:left-1/2 max-md:right-auto max-md:-translate-x-1/2 max-md:justify-center lg:right-12 lg:pointer-events-auto xl:right-16">
        <motion.div
          className="flex justify-end max-md:justify-center lg:translate-y-2.5"
          variants={runnerVariants}
          {...loadAnimation}
        >
          <img
            src={heroRunner}
            alt="Athlete running in athletic wear"
            className="block h-[clamp(22rem,72vh,56rem)] w-auto max-w-[min(100vw,40rem)] object-contain object-bottom max-md:h-[clamp(13rem,34vh,18rem)] max-md:max-w-[min(85vw,17rem)] lg:h-[clamp(28rem,88vh,56rem)] lg:max-w-[min(58vw,52rem)] xl:max-w-[min(52vw,56rem)]"
            loading="eager"
            fetchPriority="high"
          />
        </motion.div>
      </figure>

      {/* Decorative background wordmark — sits above the runner */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 z-20 flex items-end justify-center overflow-hidden max-md:overflow-visible"
        aria-hidden="true"
      >
        <motion.p
          className="select-none whitespace-nowrap text-[clamp(4rem,18vw,16rem)] font-extrabold leading-none tracking-tight text-black/7 max-md:w-full max-md:max-w-[100vw] max-md:px-0 max-md:text-center max-md:text-[clamp(1.375rem,calc(100vw/7.5),3.75rem)]"
          variants={wordmarkVariants}
          {...loadAnimation}
        >
          {HERO_COPY.backgroundText}
        </motion.p>
      </div>

      {/* Hero content — headline and CTA */}
      <div className="relative z-30 mx-auto min-h-[calc(100vh-5.5rem)] max-w-[1440px] px-5 pt-4 sm:px-8 sm:pt-6 lg:px-12 lg:pt-8 max-md:flex max-md:min-h-[calc(100dvh-5.5rem)] max-md:flex-col max-md:justify-center max-md:px-4 max-md:pb-[clamp(13rem,34vh,18rem)] max-md:pt-8">
        {/* Center copy block — horizontally centered in the hero */}
        <div className="mx-auto flex w-full max-w-xl flex-col items-center px-1 pt-6 text-center sm:px-0 lg:pt-12 xl:pt-16 max-md:max-w-[19rem] max-md:px-0 max-md:pt-0">
          <div className="flex w-full flex-col items-center lg:-translate-y-8 max-md:gap-3">
            <motion.p
              className="mb-3 text-[10px] font-medium uppercase tracking-[0.25em] text-neutral-500 sm:mb-4 sm:text-[11px] md:mb-5 md:text-xs max-md:mb-0 max-md:text-[9px] max-md:leading-snug max-md:tracking-[0.16em]"
              variants={eyebrowVariants}
              {...loadAnimation}
            >
              ( {HERO_COPY.eyebrow} )
            </motion.p>

            <motion.h1
              id="hero-heading"
              className="max-w-[min(100%,34rem)] text-[clamp(2.35rem,3.8vw+1.1rem,4.25rem)] font-medium leading-[1.1] tracking-[-0.02em] max-md:max-w-[18rem] max-md:text-[1.75rem] max-md:leading-[1.2] max-md:tracking-[-0.015em]"
              variants={headlineVariants}
              {...loadAnimation}
            >
              {HERO_COPY.headline}
            </motion.h1>

            <motion.p
              className="mt-4 max-w-md text-[11px] font-normal uppercase leading-relaxed tracking-[0.08em] text-neutral-500 sm:mt-5 sm:max-w-lg sm:text-xs max-md:mt-0 max-md:max-w-[17rem] max-md:text-[10px] max-md:leading-[1.65] max-md:tracking-[0.05em]"
              variants={descriptionVariants}
              {...loadAnimation}
            >
              {HERO_COPY.description}
            </motion.p>
          </div>

          <motion.div
            variants={ctaVariants}
            {...loadAnimation}
          >
            <PrimaryCta
              to={ROUTES.join}
              className="mt-7 max-md:mt-5 sm:mt-8 lg:mt-9"
            >
              {HERO_COPY.cta}
            </PrimaryCta>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
