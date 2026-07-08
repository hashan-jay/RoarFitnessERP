import type { Variants } from 'motion/react'

import {
  createFadeUpReveal,
  createSectionDescriptionReveal,
  createSectionEyebrowReveal,
  createSectionHeadlineReveal,
  SECTION_VIEWPORT_TIGHT,
} from '../../motion/reveal'

export const CONTACT_VIEWPORT = SECTION_VIEWPORT_TIGHT

export const createContactEyebrowReveal = createSectionEyebrowReveal
export const createContactHeadlineReveal = createSectionHeadlineReveal
export const createContactDescriptionReveal = createSectionDescriptionReveal

export function createContactPanelReveal(
  reduceMotion: boolean | null,
  index: number,
): Variants {
  return createFadeUpReveal(reduceMotion, index, { y: 24, start: 0.32 })
}
