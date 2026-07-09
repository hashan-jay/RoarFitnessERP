import { motion, useReducedMotion } from 'motion/react'

import { ROUTES } from '../../routes/paths'
import { heroLeftAthlete, heroRunner } from '../../assets/images/index'
import { Navbar } from '../Navbar'
import { PrimaryCta } from '../PrimaryCta'
import { HERO_COPY } from './constants'
import { HeroFeatureBar } from './HeroFeatureBar'
import { HeroSublineEffects } from './HeroSublineEffects'
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
 * Editorial luxury-fitness hero — grid backdrop, live status pill,
 * condensed headline stack, subline effects, and bottom live strap.
 * Left athlete image styling is intentionally unchanged.
 */
export function Hero() {
  const reduceMotion = useReducedMotion()

  const livePillVariants = createHeroTextReveal(reduceMotion, 0)
  const headlineVariants = createHeroTextReveal(reduceMotion, 1)
  const descriptionVariants = createHeroTextReveal(reduceMotion, 3)
  const ctaVariants = createHeroCtaReveal(reduceMotion, 4)
  const leftAthleteVariants = createHeroLeftAthleteReveal(reduceMotion)
  const runnerVariants = createHeroRunnerReveal(reduceMotion)
  const wordmarkVariants = createHeroWordmarkReveal(reduceMotion)

  return (
    <section
      id="home"
      className="hero-editorial relative min-h-screen overflow-hidden bg-surface font-sans text-black"
      aria-labelledby="hero-heading"
    >
      <Navbar />
      <div className="hero-editorial__grid" aria-hidden="true" />
      <div className="hero-editorial__vignette" aria-hidden="true" />

      {/* Left athlete — unchanged styling */}
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

      {/* Runner — dominant visual */}
      <figure className="pointer-events-none absolute bottom-0 right-0 z-10 flex justify-end transition-transform duration-500 hover:scale-[1.01] max-md:bottom-[2.2rem] max-md:left-1/2 max-md:right-auto max-md:-translate-x-1/2 max-md:justify-center lg:right-12 lg:pointer-events-auto xl:right-16">
        <motion.div
          className="flex justify-end max-md:justify-center lg:translate-y-2.5"
          variants={runnerVariants}
          {...loadAnimation}
        >
          <img
            src={heroRunner}
            alt="Athlete running in athletic wear"
            className="block h-[clamp(22rem,72vh,56rem)] w-auto max-w-[min(100vw,40rem)] object-contain object-bottom max-md:h-[clamp(13.5rem,32vh,17rem)] max-md:max-w-[min(84vw,16.5rem)] lg:h-[clamp(28rem,88vh,56rem)] lg:max-w-[min(58vw,52rem)] xl:max-w-[min(52vw,56rem)]"
            loading="eager"
            fetchPriority="high"
          />
        </motion.div>
      </figure>

      {/* Decorative background wordmark */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 z-20 flex items-end justify-center overflow-hidden max-md:overflow-visible"
        aria-hidden="true"
      >
        <motion.p
          className="hero-editorial__wordmark select-none whitespace-nowrap text-[clamp(4rem,18vw,16rem)] font-extrabold leading-none tracking-tight text-black/7 max-md:w-full max-md:max-w-[100vw] max-md:px-0 max-md:text-center max-md:text-[clamp(1.375rem,calc(100vw/7.5),3.75rem)]"
          variants={wordmarkVariants}
          {...loadAnimation}
        >
          {HERO_COPY.backgroundText}
        </motion.p>
      </div>

      {/* Hero content */}
      <div className="relative z-30 mx-auto min-h-[calc(100vh-5.5rem)] max-w-[1440px] px-5 pt-4 pb-[clamp(3.5rem,7vh,4.5rem)] sm:px-8 sm:pt-6 lg:px-12 lg:pt-8 max-md:flex max-md:min-h-[calc(100dvh-5.5rem)] max-md:flex-col max-md:justify-start max-md:px-4 max-md:pb-[clamp(7.25rem,16vh,8.75rem)] max-md:pt-7">
        <div className="hero-editorial__copy mx-auto flex w-full max-w-xl flex-col items-center px-1 pt-6 text-center sm:px-0 lg:pt-12 xl:pt-16 max-md:max-w-[19rem] max-md:px-0 max-md:pt-0">
          <div className="flex w-full flex-col items-center lg:-translate-y-8 max-md:gap-3">
            <motion.div
              className="hero-editorial__live-pill mb-4 sm:mb-5 max-md:mb-3"
              variants={livePillVariants}
              {...loadAnimation}
              aria-live="polite"
            >
              <span className="hero-editorial__live-dot" aria-hidden="true" />
              <span className="hero-editorial__live-text">{HERO_COPY.liveStatus}</span>
              <span className="hero-editorial__live-divider" aria-hidden="true">
                |
              </span>
              <span className="hero-editorial__live-detail">
                {HERO_COPY.liveStatusDetail}
              </span>
            </motion.div>

            <motion.h1
              id="hero-heading"
              className="hero-editorial__headline max-w-[min(100%,34rem)] max-md:max-w-[18rem]"
              variants={headlineVariants}
              {...loadAnimation}
            >
              <span className="hero-editorial__headline-line">
                {HERO_COPY.headlineLineOne}
              </span>
              <span className="hero-editorial__headline-accent">
                {HERO_COPY.headlineLineTwo}
              </span>
            </motion.h1>

            <HeroSublineEffects />

            <motion.p
              className="hero-editorial__description mt-4 max-w-md sm:mt-5 sm:max-w-lg max-md:mt-3 max-md:max-w-[17rem]"
              variants={descriptionVariants}
              {...loadAnimation}
            >
              {HERO_COPY.description}
            </motion.p>
          </div>

          <motion.div variants={ctaVariants} {...loadAnimation}>
            <PrimaryCta
              to={ROUTES.join}
              className="hero-editorial__cta mt-7 max-md:mt-5 sm:mt-8 lg:mt-9"
            >
              {HERO_COPY.cta}
            </PrimaryCta>
          </motion.div>
        </div>
      </div>

      <HeroFeatureBar />
    </section>
  )
}
