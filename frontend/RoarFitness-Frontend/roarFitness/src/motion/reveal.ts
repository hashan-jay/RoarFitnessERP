import type { Transition, Variants } from 'motion/react'

export const EASE_OUT: Transition['ease'] = [0.22, 1, 0.36, 1]

export const REDUCED_MOTION_VARIANTS: Variants = {
  hidden: { opacity: 1, y: 0, x: 0, scale: 1, filter: 'blur(0px)' },
  visible: { opacity: 1, y: 0, x: 0, scale: 1, filter: 'blur(0px)' },
}

/** Reduced-motion fallback for simple fade-up card reveals */
export const STATIC_FADE_VARIANTS: Variants = {
  hidden: { opacity: 1, y: 0 },
  visible: { opacity: 1, y: 0 },
}

/** Shared viewport for sections that animate on partial entry */
export const SECTION_VIEWPORT_TIGHT = {
  once: true,
  amount: 0.12,
  margin: '0px 0px -4% 0px',
} as const

interface FadeUpRevealOptions {
  y?: number
  duration?: number
  step?: number
  start?: number
}

const TEXT_REVEAL_HIDDEN = {
  opacity: 0,
  y: 20,
  filter: 'blur(6px)',
}

const TEXT_REVEAL_VISIBLE = {
  opacity: 1,
  y: 0,
  filter: 'blur(0px)',
}

interface RevealTiming {
  duration?: number
  delay?: number
}

interface MediaRevealFrom {
  x?: number
  y?: number
  scale?: number
}

export function getRevealDelay(
  index: number,
  reduceMotion: boolean | null,
  step = 0.14,
  start = 0.06,
): number {
  if (reduceMotion) return 0
  return start + index * step
}

export function createFadeUpReveal(
  reduceMotion: boolean | null,
  index: number,
  options: FadeUpRevealOptions = {},
): Variants {
  if (reduceMotion) return STATIC_FADE_VARIANTS

  const { y = 28, duration = 0.55, step = 0.1, start = 0.08 } = options

  return {
    hidden: { opacity: 0, y },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration,
        ease: EASE_OUT,
        delay: getRevealDelay(index, reduceMotion, step, start),
      },
    },
  }
}

export function createSectionEyebrowReveal(
  reduceMotion: boolean | null,
): Variants {
  return createTextRevealAt(reduceMotion, 0.04)
}

export function createSectionHeadlineReveal(
  reduceMotion: boolean | null,
): Variants {
  return createTextRevealAt(reduceMotion, 0.16)
}

export function createSectionDescriptionReveal(
  reduceMotion: boolean | null,
  delay = 0.26,
): Variants {
  return createTextRevealAt(reduceMotion, delay)
}

export function createTextRevealAt(
  reduceMotion: boolean | null,
  delay: number,
  timing: RevealTiming = {},
): Variants {
  if (reduceMotion) return REDUCED_MOTION_VARIANTS

  const { duration = 0.6 } = timing

  return {
    hidden: TEXT_REVEAL_HIDDEN,
    visible: {
      ...TEXT_REVEAL_VISIBLE,
      transition: {
        duration,
        ease: EASE_OUT,
        delay,
      },
    },
  }
}

export function createCtaRevealAt(
  reduceMotion: boolean | null,
  delay: number,
  timing: RevealTiming = {},
): Variants {
  if (reduceMotion) return REDUCED_MOTION_VARIANTS

  const { duration = 0.55 } = timing

  return {
    hidden: {
      opacity: 0,
      y: 16,
      scale: 0.98,
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration,
        ease: EASE_OUT,
        delay,
      },
    },
  }
}

export function createMediaRevealAt(
  reduceMotion: boolean | null,
  delay: number,
  from: MediaRevealFrom = {},
  timing: RevealTiming = {},
): Variants {
  if (reduceMotion) return REDUCED_MOTION_VARIANTS

  const { x = 0, y = 24, scale = 0.97 } = from
  const { duration = 0.75 } = timing

  return {
    hidden: {
      opacity: 0,
      x,
      y,
      scale,
    },
    visible: {
      opacity: 1,
      x: 0,
      y: 0,
      scale: 1,
      transition: {
        duration,
        ease: EASE_OUT,
        delay,
      },
    },
  }
}
