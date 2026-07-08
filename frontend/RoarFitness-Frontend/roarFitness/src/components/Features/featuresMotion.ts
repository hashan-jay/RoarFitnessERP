import { getRevealDelay } from '../../motion/reveal'

const FEATURES_STAGGER_STEP = 0.14
const FEATURES_STAGGER_START = 0.06

/** Viewport trigger — animate once when the section enters view */
export const FEATURES_VIEWPORT = {
  once: true,
  amount: 0.2,
  margin: '0px 0px -8% 0px',
} as const

export function getFeaturesRevealDelay(
  index: number,
  reduceMotion: boolean | null,
): number {
  return getRevealDelay(
    index,
    reduceMotion,
    FEATURES_STAGGER_STEP,
    FEATURES_STAGGER_START,
  )
}
