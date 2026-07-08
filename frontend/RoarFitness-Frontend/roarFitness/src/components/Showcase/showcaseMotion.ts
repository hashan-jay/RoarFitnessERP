import type { Transition } from 'motion/react'

import { EASE_OUT } from '../../motion/reveal'

export const SHOWCASE_FRAME_TRANSITION: Transition = {
  duration: 0.55,
  ease: EASE_OUT,
}

export const SHOWCASE_FRAME_REDUCED: Transition = {
  duration: 0,
}

export function getShowcaseFrameTransition(
  reduceMotion: boolean | null,
): Transition {
  return reduceMotion ? SHOWCASE_FRAME_REDUCED : SHOWCASE_FRAME_TRANSITION
}

export const SHOWCASE_UI_TRANSITION: Transition = {
  duration: 0.35,
  ease: EASE_OUT,
}
