import { motion, useReducedMotion } from 'motion/react'

import { HERO_ACCENT_TAGS } from './constants'
import { createHeroTextReveal } from './heroMotion'

const loadAnimation = {
  initial: 'hidden' as const,
  animate: 'visible' as const,
}

export function HeroSublineEffects() {
  const reduceMotion = useReducedMotion()
  const variants = createHeroTextReveal(reduceMotion, 2)

  return (
    <motion.div
      className="hero-editorial__subline"
      variants={variants}
      {...loadAnimation}
      aria-hidden="true"
    >
      <span className="hero-editorial__subline-rule" />

      <div className="hero-editorial__subline-tags">
        {HERO_ACCENT_TAGS.map((tag) => (
          <span key={tag} className="hero-editorial__subline-tag">
            {tag}
          </span>
        ))}
      </div>

      <p className="hero-editorial__subline-shimmer">
        <span className="hero-editorial__shimmer-text">No limits.</span>
        <span className="hero-editorial__shimmer-text hero-editorial__shimmer-text--alt">
          Only results.
        </span>
      </p>
    </motion.div>
  )
}
