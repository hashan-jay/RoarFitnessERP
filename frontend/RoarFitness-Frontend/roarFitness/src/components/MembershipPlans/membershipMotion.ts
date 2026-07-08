import type { Variants } from 'motion/react'

import {
  createFadeUpReveal,
  createSectionDescriptionReveal,
  createSectionEyebrowReveal,
  createSectionHeadlineReveal,
} from '../../motion/reveal'

export const MEMBERSHIP_VIEWPORT = {
  once: true,
  amount: 0.15,
  margin: '0px 0px -6% 0px',
} as const

export const createMembershipEyebrowReveal = createSectionEyebrowReveal
export const createMembershipHeadlineReveal = createSectionHeadlineReveal
export const createMembershipDescriptionReveal = createSectionDescriptionReveal

export function createPlanCardReveal(
  reduceMotion: boolean | null,
  index: number,
): Variants {
  return createFadeUpReveal(reduceMotion, index, { start: 0.12 })
}
