import { motion } from 'motion/react'
import { Link } from 'react-router-dom'

import { showcaseSlide3 } from '../../assets/images/showcase'
import { ROUTES } from '../../routes/paths'
import { useAuthMotion } from '../auth/useAuthMotion'
import { REGISTER_COPY } from './constants'

const BENEFITS = [
  REGISTER_COPY.benefit1,
  REGISTER_COPY.benefit2,
  REGISTER_COPY.benefit3,
] as const

/** Full-width register hero — distinct from login's side brand panel */
export function RegisterHero() {
  const { loadAnimation, variants } = useAuthMotion()

  return (
    <header className="relative overflow-hidden bg-features-bg text-white">
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <img
          src={showcaseSlide3}
          alt=""
          className="h-full w-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-features-bg via-features-bg/90 to-features-bg/70" />
      </div>

      <div
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:56px_56px]"
        aria-hidden="true"
      />

      <div className="relative z-10 mx-auto max-w-3xl px-5 py-10 text-center sm:px-8 sm:py-14 lg:py-16">
        <motion.div variants={variants.eyebrow} {...loadAnimation}>
          <Link
            to={ROUTES.home}
            aria-label="Roar Fitness home"
            className="group inline-flex items-center gap-[0.55rem] sm:gap-3"
          >
            <span className="font-display text-[1.5rem] leading-none tracking-[0.1em] text-white transition-[letter-spacing] duration-300 group-hover:tracking-[0.12em] sm:text-[1.75rem]">
              ROAR
            </span>
            <span
              className="select-none px-px font-light leading-none text-white/25 sm:text-xl"
              aria-hidden="true"
            >
              |
            </span>
            <span className="pt-px text-[0.75rem] font-medium uppercase tracking-[0.18em] text-features-muted transition-colors duration-300 group-hover:text-white/70 sm:text-[0.82rem]">
              Fitness
            </span>
          </Link>
        </motion.div>

        <motion.p
          className="mt-6 text-[10px] font-semibold uppercase tracking-[0.28em] text-white/75 sm:mt-8 sm:text-[11px]"
          variants={variants.eyebrow}
          {...loadAnimation}
        >
          {REGISTER_COPY.eyebrow}
        </motion.p>

        <motion.h1
          className="mt-4 text-[clamp(2rem,5vw,2.75rem)] font-medium leading-[1.1] tracking-[-0.02em] text-white"
          variants={variants.headline}
          {...loadAnimation}
        >
          {REGISTER_COPY.heroHeadline}
          <span className="mt-1 block font-display text-[clamp(2.75rem,8vw,4.5rem)] font-normal uppercase leading-[0.9] tracking-[0.04em]">
            {REGISTER_COPY.heroAccent}
          </span>
        </motion.h1>

        <motion.p
          className="mx-auto mt-5 max-w-lg text-sm leading-[1.8] text-white/85 sm:text-[0.9375rem]"
          variants={variants.description}
          {...loadAnimation}
        >
          {REGISTER_COPY.heroDescription}
        </motion.p>

        <motion.ul
          className="mt-8 flex flex-wrap items-center justify-center gap-2 sm:mt-10 sm:gap-3"
          variants={variants.card}
          {...loadAnimation}
          aria-label="Membership benefits"
        >
          {BENEFITS.map((benefit) => (
            <li
              key={benefit}
              className="rounded-full border border-white/15 bg-white/10 px-4 py-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-white/90 backdrop-blur-sm sm:text-[11px]"
            >
              {benefit}
            </li>
          ))}
        </motion.ul>
      </div>
    </header>
  )
}
