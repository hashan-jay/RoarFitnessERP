import type { Variants } from 'motion/react'

import {
  createFadeUpReveal,
  createSectionDescriptionReveal,
  createSectionEyebrowReveal,
  createSectionHeadlineReveal,
  createTextRevealAt,
  SECTION_VIEWPORT_TIGHT,
} from '../../motion/reveal'

export const TRAINERS_VIEWPORT = SECTION_VIEWPORT_TIGHT

export const createTrainersIntroReveal = createSectionEyebrowReveal
export const createTrainersHeadingReveal = createSectionHeadlineReveal

export function createTrainersSubtitleReveal(
  reduceMotion: boolean | null,
): Variants {
  return createSectionDescriptionReveal(reduceMotion, 0.24)
}

export function createTrainersCtaReveal(
  reduceMotion: boolean | null,
): Variants {
  return createTextRevealAt(reduceMotion, 0.08)
}

export function createTrainerCardReveal(
  reduceMotion: boolean | null,
  index: number,
): Variants {
  return createFadeUpReveal(reduceMotion, index)
}

export function createTrainerHighlightReveal(
  reduceMotion: boolean | null,
  index: number,
): Variants {
  return createFadeUpReveal(reduceMotion, index, {
    y: 16,
    duration: 0.45,
    step: 0.06,
    start: 0.07,
  })
}
