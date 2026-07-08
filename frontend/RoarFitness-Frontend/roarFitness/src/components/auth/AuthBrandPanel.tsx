import { motion } from 'motion/react'
import { Link } from 'react-router-dom'

import { showcaseSlide2 } from '../../assets/images/showcase'
import { ROUTES } from '../../routes/paths'
import { useAuthMotion } from './useAuthMotion'

export interface AuthBrandPanelCopy {
  eyebrow: string
  panelHeadline: string
  panelAccent: string
  panelTagline: string
  panelStat1: { value: string; label: string }
  panelStat2: { value: string; label: string }
}

interface AuthBrandPanelProps {
  copy: AuthBrandPanelCopy
  imageSrc?: string
}

function BrandWordmark({ className = '' }: { className?: string }) {
  return (
    <Link
      to={ROUTES.home}
      aria-label="Roar Fitness home"
      className={`group inline-flex items-center gap-[0.55rem] sm:gap-3 ${className}`.trim()}
    >
      <span className="font-display text-[1.5rem] leading-none tracking-[0.1em] text-white transition-[letter-spacing] duration-300 group-hover:tracking-[0.12em] sm:text-[1.75rem]">
        ROAR
      </span>
      <span
        className="select-none px-px font-light leading-none text-white/25 transition-colors duration-300 group-hover:text-white/40 sm:text-xl"
        aria-hidden="true"
      >
        |
      </span>
      <span className="pt-px text-[0.75rem] font-medium uppercase tracking-[0.18em] text-features-muted transition-colors duration-300 group-hover:text-white/70 sm:text-[0.82rem] sm:tracking-[0.2em]">
        Fitness
      </span>
    </Link>
  )
}

/** Image-led brand panel shared by login and register */
export function AuthBrandPanel({
  copy,
  imageSrc = showcaseSlide2,
}: AuthBrandPanelProps) {
  const { loadAnimation, variants } = useAuthMotion()

  return (
    <aside
      className="relative flex flex-col overflow-hidden text-white lg:min-h-screen"
      aria-label="Roar Fitness brand"
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_at_30%_20%,black_25%,transparent_75%)]"
        aria-hidden="true"
      />

      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <img
          src={imageSrc}
          alt=""
          className="h-full w-full object-cover object-center"
        />
      </div>
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/35 via-black/20 to-black/45"
        aria-hidden="true"
      />

      <p
        className="pointer-events-none absolute -right-6 bottom-8 select-none font-display text-[clamp(5rem,18vw,11rem)] uppercase leading-none tracking-[0.04em] text-white/[0.1] lg:-right-4 lg:bottom-16 lg:text-[clamp(7rem,14vw,13rem)]"
        aria-hidden="true"
      >
        ROAR
      </p>

      <div className="relative z-10 flex flex-1 flex-col justify-between px-5 py-8 sm:px-8 sm:py-10 lg:px-12 lg:py-14 xl:px-16">
        <motion.div variants={variants.eyebrow} {...loadAnimation}>
          <BrandWordmark />
        </motion.div>

        <div className="mt-8 lg:mt-0 lg:flex lg:flex-1 lg:flex-col lg:justify-center lg:py-16">
          <motion.p
            className="text-[10px] font-semibold uppercase tracking-[0.28em] text-white/80 sm:text-[11px]"
            variants={variants.eyebrow}
            {...loadAnimation}
          >
            {copy.eyebrow}
          </motion.p>

          <motion.h1
            className="mt-4 max-w-md text-[clamp(1.75rem,3.5vw,2.5rem)] font-medium leading-[1.15] tracking-[-0.02em] text-white lg:mt-5"
            variants={variants.headline}
            {...loadAnimation}
          >
            {copy.panelHeadline}
            <span className="mt-1 block font-display text-[clamp(2.5rem,6vw,4rem)] font-normal uppercase leading-[0.9] tracking-[0.04em] text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.35)]">
              {copy.panelAccent}
            </span>
          </motion.h1>

          <motion.p
            className="mt-5 max-w-sm text-sm leading-[1.8] text-white/88 sm:text-[0.9375rem] lg:mt-6"
            variants={variants.description}
            {...loadAnimation}
          >
            {copy.panelTagline}
          </motion.p>

          <motion.dl
            className="mt-8 hidden gap-8 border-t border-white/[0.08] pt-8 sm:flex lg:mt-10"
            variants={variants.card}
            {...loadAnimation}
          >
            <div>
              <dt className="font-display text-2xl tracking-[0.04em] text-white sm:text-3xl">
                {copy.panelStat1.value}
              </dt>
              <dd className="mt-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/75 sm:text-[11px]">
                {copy.panelStat1.label}
              </dd>
            </div>
            <div className="h-10 w-px bg-white/10" aria-hidden="true" />
            <div>
              <dt className="font-display text-2xl tracking-[0.04em] text-white sm:text-3xl">
                {copy.panelStat2.value}
              </dt>
              <dd className="mt-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/75 sm:text-[11px]">
                {copy.panelStat2.label}
              </dd>
            </div>
          </motion.dl>
        </div>

        <motion.div
          className="mt-8 hidden lg:block"
          variants={variants.description}
          {...loadAnimation}
          aria-hidden="true"
        >
          <span className="h-px w-16 bg-gradient-to-r from-white/25 to-transparent" />
        </motion.div>
      </div>
    </aside>
  )
}
