import type { Variants } from 'motion/react'

import {
  createFadeUpReveal,
  createSectionDescriptionReveal,
  createSectionEyebrowReveal,
  createSectionHeadlineReveal,
  SECTION_VIEWPORT_TIGHT,
} from '../../motion/reveal'

export const TESTIMONIALS_VIEWPORT = SECTION_VIEWPORT_TIGHT

export const createTestimonialsEyebrowReveal = createSectionEyebrowReveal
export const createTestimonialsHeadlineReveal = createSectionHeadlineReveal
export const createTestimonialsDescriptionReveal = createSectionDescriptionReveal

export function createTestimonialCardReveal(
  reduceMotion: boolean | null,
  index: number,
): Variants {
  return createFadeUpReveal(reduceMotion, index, { start: 0.1 })
}

export function createTestimonialsStatsReveal(
  reduceMotion: boolean | null,
  index: number,
): Variants {
  return createFadeUpReveal(reduceMotion, index, {
    y: 16,
    duration: 0.45,
    step: 0.08,
    start: 0.32,
  })
}
