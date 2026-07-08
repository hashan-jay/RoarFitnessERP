import { motion, useReducedMotion } from 'motion/react'

import { TestimonialCard } from './TestimonialCard'
import { TestimonialsHeader } from './TestimonialsHeader'
import { TestimonialsStats } from './TestimonialsStats'
import { TESTIMONIALS } from './constants'
import {
  createTestimonialCardReveal,
  createTestimonialsDescriptionReveal,
  createTestimonialsEyebrowReveal,
  createTestimonialsHeadlineReveal,
  createTestimonialsStatsReveal,
  TESTIMONIALS_VIEWPORT,
} from './testimonialsMotion'

export function TestimonialsGrid() {
  const reduceMotion = useReducedMotion()

  return (
    <div className="flex flex-col">
      <TestimonialsHeader
        eyebrowVariants={createTestimonialsEyebrowReveal(reduceMotion)}
        headlineVariants={createTestimonialsHeadlineReveal(reduceMotion)}
        descriptionVariants={createTestimonialsDescriptionReveal(reduceMotion)}
      />

      <TestimonialsStats
        variants={(index) => createTestimonialsStatsReveal(reduceMotion, index)}
      />

      <div className="relative mt-14 sm:mt-16 lg:mt-20">
        <div
          className="pointer-events-none absolute inset-y-0 right-0 z-10 w-12 bg-gradient-to-l from-surface to-transparent lg:hidden"
          aria-hidden="true"
        />

        <motion.ul
          className="mx-auto flex max-w-[68rem] snap-x snap-mandatory gap-5 overflow-x-auto pb-2 pl-1 pr-4 [-ms-overflow-style:none] [scrollbar-width:none] sm:gap-6 lg:grid lg:snap-none lg:grid-cols-3 lg:items-stretch lg:gap-5 lg:overflow-visible lg:pb-0 lg:pl-0 lg:pr-0 xl:gap-6 [&::-webkit-scrollbar]:hidden"
          initial="hidden"
          whileInView="visible"
          viewport={TESTIMONIALS_VIEWPORT}
          aria-label="Member testimonials"
        >
          {TESTIMONIALS.map((testimonial, index) => (
            <motion.li
              key={testimonial.id}
              className="w-[min(82vw,20rem)] shrink-0 snap-center list-none sm:w-[min(48vw,22rem)] lg:w-full lg:shrink"
              variants={createTestimonialCardReveal(reduceMotion, index)}
            >
              <TestimonialCard
                testimonial={testimonial}
                index={index}
                className="h-full"
              />
            </motion.li>
          ))}
        </motion.ul>
      </div>
    </div>
  )
}
