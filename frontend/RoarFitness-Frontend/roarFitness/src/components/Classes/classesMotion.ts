import type { Variants } from 'motion/react'

import {
  createFadeUpReveal,
  createSectionEyebrowReveal,
  SECTION_VIEWPORT_TIGHT,
} from '../../motion/reveal'

export const CLASSES_VIEWPORT = SECTION_VIEWPORT_TIGHT

export const createClassesEyebrowReveal = createSectionEyebrowReveal

export function createClassRowReveal(
  reduceMotion: boolean | null,
  index: number,
): Variants {
  return createFadeUpReveal(reduceMotion, index, { y: 24 })
}
