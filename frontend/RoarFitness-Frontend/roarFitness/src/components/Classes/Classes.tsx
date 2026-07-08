import { motion, useReducedMotion } from 'motion/react'

import { createCtaRevealAt } from '../../motion/reveal'
import { ROUTES } from '../../routes/paths'
import { PrimaryCta } from '../PrimaryCta'
import { ClassesHeader } from './ClassesHeader'
import { ClassesList } from './ClassesList'
import { CLASSES_COPY } from './constants'
import { createClassesEyebrowReveal } from './classesMotion'

/**
 * Dark fitness classes list — editorial rows with hover highlight.
 * Standalone section; import into App when ready to display.
 */
export function Classes() {
  const reduceMotion = useReducedMotion()
  const eyebrowVariants = createClassesEyebrowReveal(reduceMotion)
  const ctaVariants = createCtaRevealAt(reduceMotion, 0.2)

  return (
    <section
      id="classes"
      className="overflow-hidden bg-features-bg font-sans text-white"
      aria-labelledby="classes-heading"
    >
      <div className="mx-auto max-w-[90rem] px-5 py-16 sm:px-8 sm:py-20 md:py-24 lg:px-12 lg:py-28 xl:py-32">
        <ClassesHeader variants={eyebrowVariants} />
        <ClassesList />

        <motion.div
          className="mt-12 flex justify-center sm:mt-14 lg:mt-16"
          variants={ctaVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.4 }}
        >
          <PrimaryCta to={ROUTES.classes}>{CLASSES_COPY.cta}</PrimaryCta>
        </motion.div>
      </div>
    </section>
  )
}
