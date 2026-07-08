import { motion, useReducedMotion, type Variants } from 'motion/react'

import { createTextRevealAt } from '../../motion/reveal'
import { FEATURE_ITEMS, FEATURES_COPY } from './constants'
import { FeatureCard } from './FeatureCard'
import { FeaturesStatement } from './FeaturesStatement'
import { FEATURES_VIEWPORT, getFeaturesRevealDelay } from './featuresMotion'

/**
 * Editorial features band — manifesto statement with numbered capability rows.
 */
export function Features() {
  const reduceMotion = useReducedMotion()

  const eyebrowVariants: Variants = createTextRevealAt(
    reduceMotion,
    getFeaturesRevealDelay(0, reduceMotion),
  )
  const statementVariants: Variants = createTextRevealAt(
    reduceMotion,
    getFeaturesRevealDelay(1, reduceMotion),
  )

  return (
    <section
      id="about"
      className="relative overflow-hidden bg-features-bg font-sans text-white"
      aria-labelledby="features-heading"
    >
      <div
        className="pointer-events-none absolute -left-20 top-1/3 h-72 w-72 rounded-full bg-white/[0.02] blur-3xl"
        aria-hidden="true"
      />

      <div className="relative z-10 mx-auto max-w-[75rem] px-5 py-20 sm:px-8 sm:py-24 md:px-10 md:py-28 lg:px-12 lg:py-32 xl:py-36">
        <div className="lg:grid lg:grid-cols-12 lg:gap-x-12 xl:gap-x-16">
          <div className="lg:col-span-5 lg:pt-2">
            <motion.p
              className="mb-6 text-[10px] font-medium uppercase tracking-[0.25em] text-white/75 sm:mb-8 sm:text-[11px] md:mb-10 md:text-xs lg:text-left"
              variants={eyebrowVariants}
              initial="hidden"
              whileInView="visible"
              viewport={FEATURES_VIEWPORT}
            >
              ( {FEATURES_COPY.eyebrow} )
            </motion.p>

            <FeaturesStatement variants={statementVariants} />

            <span
              className="mx-auto mt-10 hidden h-px w-full max-w-md bg-gradient-to-r from-white/25 via-white/10 to-transparent lg:mx-0 lg:block xl:mt-12"
              aria-hidden="true"
            />
          </div>

          <ul className="mt-16 space-y-0 sm:mt-20 md:mt-24 lg:col-span-7 lg:mt-0 lg:pt-4">
            {FEATURE_ITEMS.map((feature, index) => (
              <li
                key={feature.id}
                className={
                  index < FEATURE_ITEMS.length - 1
                    ? 'border-b border-white/[0.08]'
                    : undefined
                }
              >
                <FeatureCard
                  feature={feature}
                  index={index}
                  titleVariants={createTextRevealAt(
                    reduceMotion,
                    getFeaturesRevealDelay(2 + index, reduceMotion),
                  )}
                />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
