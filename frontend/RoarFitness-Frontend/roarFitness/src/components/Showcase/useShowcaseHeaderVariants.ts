import { useReducedMotion } from 'motion/react'
import type { Variants } from 'motion/react'

import { createTextRevealAt } from '../../motion/reveal'

export function useShowcaseHeaderVariants(): {
  eyebrowVariants: Variants
  headlineVariants: Variants
  subtitleVariants: Variants
} {
  const reduceMotion = useReducedMotion()

  return {
    eyebrowVariants: createTextRevealAt(reduceMotion, 0.06),
    headlineVariants: createTextRevealAt(reduceMotion, 0.18),
    subtitleVariants: createTextRevealAt(reduceMotion, 0.3),
  }
}
