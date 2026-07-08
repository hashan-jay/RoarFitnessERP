import { useReducedMotion } from 'motion/react'
import type { Variants } from 'motion/react'

import {
  createSectionDescriptionReveal,
  createSectionEyebrowReveal,
  createSectionHeadlineReveal,
  createTextRevealAt,
} from '../../motion/reveal'

/** Shared mount animations for auth pages (login, register) */
export function useAuthMotion() {
  const reduceMotion = useReducedMotion()

  const loadAnimation = reduceMotion
    ? { initial: 'visible' as const, animate: 'visible' as const }
    : { initial: 'hidden' as const, animate: 'visible' as const }

  const variants = {
    eyebrow: createSectionEyebrowReveal(reduceMotion),
    headline: createSectionHeadlineReveal(reduceMotion),
    description: createSectionDescriptionReveal(reduceMotion, 0.22),
    card: createTextRevealAt(reduceMotion, 0.32),
  } satisfies Record<string, Variants>

  return { loadAnimation, variants }
}
