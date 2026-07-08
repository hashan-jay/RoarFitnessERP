import { motion, useReducedMotion } from 'motion/react'

import { ClassRow } from './ClassRow'
import { FITNESS_CLASSES } from './constants'
import {
  CLASSES_VIEWPORT,
  createClassRowReveal,
} from './classesMotion'

export function ClassesList() {
  const reduceMotion = useReducedMotion()

  return (
    <motion.ul
      className="mt-10 border-t border-white/[0.08] sm:mt-12 md:mt-14 lg:mt-16"
      initial="hidden"
      whileInView="visible"
      viewport={CLASSES_VIEWPORT}
      aria-label="Fitness class offerings"
    >
      {FITNESS_CLASSES.map((fitnessClass, index) => (
        <ClassRow
          key={fitnessClass.id}
          fitnessClass={fitnessClass}
          variants={createClassRowReveal(reduceMotion, index)}
          isLast={index === FITNESS_CLASSES.length - 1}
        />
      ))}
    </motion.ul>
  )
}
