import {
  createCtaRevealAt,
  createMediaRevealAt,
  createTextRevealAt,
  getRevealDelay,
} from '../../motion/reveal'

const HERO_STAGGER_STEP = 0.12
const HERO_STAGGER_START = 0.15

function getHeroRevealDelay(
  index: number,
  reduceMotion: boolean | null,
): number {
  return getRevealDelay(
    index,
    reduceMotion,
    HERO_STAGGER_STEP,
    HERO_STAGGER_START,
  )
}

export function createHeroTextReveal(
  reduceMotion: boolean | null,
  index: number,
) {
  return createTextRevealAt(
    reduceMotion,
    getHeroRevealDelay(index, reduceMotion),
  )
}

export function createHeroCtaReveal(
  reduceMotion: boolean | null,
  index: number,
) {
  return createCtaRevealAt(
    reduceMotion,
    getHeroRevealDelay(index, reduceMotion),
  )
}

export function createHeroRunnerReveal(reduceMotion: boolean | null) {
  return createMediaRevealAt(
    reduceMotion,
    getHeroRevealDelay(0, reduceMotion) + 0.1,
    { x: 28, y: 36, scale: 0.94 },
    { duration: 0.8 },
  )
}

export function createHeroWordmarkReveal(reduceMotion: boolean | null) {
  return createMediaRevealAt(
    reduceMotion,
    getHeroRevealDelay(1, reduceMotion) + 0.08,
    { y: 52, scale: 1.04 },
    { duration: 0.9 },
  )
}

export function createHeroLeftAthleteReveal(reduceMotion: boolean | null) {
  return createMediaRevealAt(
    reduceMotion,
    getHeroRevealDelay(0, reduceMotion) + 0.1,
    { x: -28, y: 36, scale: 0.94 },
    { duration: 0.8 },
  )
}

export function createHeroSideImageReveal(
  reduceMotion: boolean | null,
  index: number,
) {
  return createMediaRevealAt(
    reduceMotion,
    getHeroRevealDelay(3, reduceMotion) + index * 0.14,
    { x: -36, y: index === 0 ? 0 : 20, scale: 0.96 },
    { duration: 0.7 },
  )
}
