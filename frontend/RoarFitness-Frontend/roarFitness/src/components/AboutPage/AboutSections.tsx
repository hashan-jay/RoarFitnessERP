import { motion, useReducedMotion } from 'motion/react'

import { createTextRevealAt } from '../../motion/reveal'
import {
  ABOUT_COPY,
  ABOUT_IMAGES,
  ABOUT_MILESTONES,
  ABOUT_STATS,
  ABOUT_VALUES,
} from './constants'

const viewport = { once: true, amount: 0.25 } as const

export function AboutStatsBand() {
  return (
    <section
      aria-label="Studio highlights"
      className="relative -mt-8 sm:-mt-10"
    >
      <div className="mx-auto max-w-[72rem] px-5 sm:px-8 lg:px-10">
        <motion.ul
          className="grid grid-cols-2 gap-px overflow-hidden rounded-[1px] border border-brand-ink/[0.08] bg-brand-ink/[0.08] shadow-[0_12px_32px_rgba(10,10,10,0.06)] sm:grid-cols-4"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={viewport}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          {ABOUT_STATS.map((stat) => (
            <li
              key={stat.id}
              className="flex flex-col items-center justify-center bg-white px-4 py-6 text-center sm:py-7"
            >
              <p className="font-display text-[clamp(1.75rem,3vw,2.35rem)] leading-none tracking-[0.04em] text-brand-ink">
                {stat.value}
              </p>
              <p className="mt-2 text-[10px] font-medium uppercase tracking-[0.16em] text-brand-muted sm:text-[11px]">
                {stat.label}
              </p>
            </li>
          ))}
        </motion.ul>
      </div>
    </section>
  )
}

export function AboutMission() {
  const reduceMotion = useReducedMotion()
  const variants = createTextRevealAt(reduceMotion, 0)

  return (
    <section
      aria-labelledby="about-mission-heading"
      className="mx-auto max-w-[72rem] px-5 py-16 sm:px-8 sm:py-20 lg:px-10 lg:py-24"
    >
      <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-brand-muted sm:text-[11px]">
        {ABOUT_COPY.missionEyebrow}
      </p>

      <motion.h2
        id="about-mission-heading"
        className="relative mt-5 max-w-[48rem] text-[clamp(1.35rem,2.5vw,2rem)] font-normal leading-[1.32] tracking-[-0.02em] text-brand-ink lg:text-[1.85rem] lg:leading-[1.28]"
        variants={variants}
        initial="hidden"
        whileInView="visible"
        viewport={viewport}
      >
        <span
          className="absolute -left-4 top-2 hidden h-[calc(100%-0.5rem)] w-px bg-gradient-to-b from-brand-ink/25 via-brand-ink/10 to-transparent sm:block"
          aria-hidden="true"
        />
        <span className="text-brand-muted">{ABOUT_COPY.missionLead} </span>
        <span className="font-display text-[1.05em] tracking-[0.01em] text-brand-ink">
          {ABOUT_COPY.missionHighlight}
        </span>
        <span className="text-brand-muted">{ABOUT_COPY.missionMiddle} </span>
        <span className="font-display text-[1.05em] tracking-[0.01em] text-brand-ink">
          {ABOUT_COPY.missionHighlight2}
        </span>
        <span className="text-brand-muted">{ABOUT_COPY.missionTrail}</span>
      </motion.h2>
    </section>
  )
}

export function AboutValues() {
  const reduceMotion = useReducedMotion()

  return (
    <section
      aria-labelledby="about-values-heading"
      className="border-y border-brand-ink/[0.06] bg-white"
    >
      <div className="mx-auto max-w-[72rem] px-5 py-16 sm:px-8 sm:py-20 lg:px-10 lg:py-24">
        <div className="max-w-xl">
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-brand-muted sm:text-[11px]">
            What we stand for
          </p>
          <h2
            id="about-values-heading"
            className="mt-3 text-[clamp(1.5rem,2.8vw,2.1rem)] font-medium leading-[1.12] tracking-[-0.02em] text-brand-ink"
          >
            The pillars behind every session
          </h2>
        </div>

        <ul className="mt-10 grid gap-4 sm:mt-12 sm:grid-cols-2 lg:gap-5">
          {ABOUT_VALUES.map((value, index) => {
            const Icon = value.icon
            return (
              <motion.li
                key={value.id}
                className="group list-none rounded-[1px] border border-brand-ink/[0.08] bg-surface p-6 transition-colors duration-300 hover:border-brand-ink/15 hover:bg-white sm:p-7"
                variants={createTextRevealAt(reduceMotion, index * 0.08)}
                initial="hidden"
                whileInView="visible"
                viewport={viewport}
              >
                <div className="flex items-start gap-4">
                  <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-[1px] border border-brand-ink/10 bg-white text-brand-ink transition-colors duration-300 group-hover:border-brand-ink/20">
                    <Icon className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" />
                  </span>
                  <div>
                    <h3 className="text-sm font-semibold tracking-[-0.01em] text-brand-ink sm:text-base">
                      {value.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-brand-muted">
                      {value.description}
                    </p>
                  </div>
                </div>
              </motion.li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}

export function AboutJourney() {
  const reduceMotion = useReducedMotion()

  return (
    <section
      aria-labelledby="about-journey-heading"
      className="mx-auto max-w-[72rem] px-5 py-16 sm:px-8 sm:py-20 lg:px-10 lg:py-24"
    >
      <div className="grid gap-10 lg:grid-cols-12 lg:items-start lg:gap-12">
        <motion.div
          className="relative overflow-hidden rounded-[1px] border border-brand-ink/[0.08] lg:col-span-5"
          initial={{ opacity: 0, x: -12 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={viewport}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        >
          <img
            src={ABOUT_IMAGES.journey}
            alt="Members training together at Roar Fitness"
            className="aspect-[4/5] w-full object-cover object-center sm:aspect-[5/6]"
            loading="lazy"
          />
          <figure className="absolute bottom-4 right-4 hidden w-[42%] overflow-hidden rounded-[1px] border border-white/20 shadow-[0_8px_24px_rgba(0,0,0,0.25)] sm:block">
            <img
              src={ABOUT_IMAGES.accent}
              alt=""
              className="aspect-square w-full object-cover"
              loading="lazy"
            />
          </figure>
        </motion.div>

        <div className="lg:col-span-7">
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-brand-muted sm:text-[11px]">
            {ABOUT_COPY.journeyEyebrow}
          </p>
          <h2
            id="about-journey-heading"
            className="mt-3 text-[clamp(1.5rem,2.8vw,2.05rem)] font-medium leading-[1.14] tracking-[-0.02em] text-brand-ink"
          >
            {ABOUT_COPY.journeyTitle}
          </h2>
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-brand-muted sm:text-[0.9375rem]">
            {ABOUT_COPY.journeyBody}
          </p>

          <ol className="relative mt-10 space-y-0 border-l border-brand-ink/10 pl-6 sm:mt-12">
            {ABOUT_MILESTONES.map((milestone, index) => (
              <motion.li
                key={milestone.id}
                className="relative pb-8 last:pb-0"
                variants={createTextRevealAt(reduceMotion, index * 0.1)}
                initial="hidden"
                whileInView="visible"
                viewport={viewport}
              >
                <span
                  className="absolute -left-[calc(1.5rem+1px)] top-1.5 h-2.5 w-2.5 rounded-full border border-brand-ink/20 bg-white ring-4 ring-surface"
                  aria-hidden="true"
                />
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-brand-muted">
                  {milestone.year}
                </p>
                <h3 className="mt-1 text-sm font-semibold text-brand-ink sm:text-base">
                  {milestone.title}
                </h3>
                <p className="mt-2 max-w-md text-sm leading-relaxed text-brand-muted">
                  {milestone.body}
                </p>
              </motion.li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}
