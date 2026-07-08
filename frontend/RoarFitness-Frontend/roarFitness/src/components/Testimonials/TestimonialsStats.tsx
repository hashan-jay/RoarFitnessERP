import { motion, type Variants } from 'motion/react'

import { TESTIMONIAL_STATS } from './constants'
import { TESTIMONIALS_VIEWPORT } from './testimonialsMotion'

interface TestimonialsStatsProps {
  variants: (index: number) => Variants
}

export function TestimonialsStats({ variants }: TestimonialsStatsProps) {
  return (
    <motion.ul
      className="mx-auto mt-12 flex max-w-2xl flex-wrap items-center justify-center gap-x-8 gap-y-6 sm:mt-14 md:mt-16 lg:max-w-3xl lg:gap-x-12"
      initial="hidden"
      whileInView="visible"
      viewport={TESTIMONIALS_VIEWPORT}
      aria-label="Member satisfaction highlights"
    >
      {TESTIMONIAL_STATS.map((stat, index) => (
        <motion.li
          key={stat.id}
          className="list-none text-center"
          variants={variants(index)}
        >
          <p className="font-display text-[clamp(2rem,4vw,2.75rem)] leading-none tracking-[0.04em] text-brand-ink">
            {stat.value}
          </p>
          <p className="mt-2 text-[10px] font-medium uppercase tracking-[0.16em] text-brand-muted sm:text-[11px]">
            {stat.label}
          </p>
        </motion.li>
      ))}
    </motion.ul>
  )
}
