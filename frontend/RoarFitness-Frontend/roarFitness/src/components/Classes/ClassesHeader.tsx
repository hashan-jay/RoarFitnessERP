import { motion, type Variants } from 'motion/react'

import { CLASSES_COPY } from './constants'
import { CLASSES_VIEWPORT } from './classesMotion'

interface ClassesHeaderProps {
  variants: Variants
}

export function ClassesHeader({ variants }: ClassesHeaderProps) {
  return (
    <motion.p
      id="classes-heading"
      className="text-[10px] font-medium uppercase tracking-[0.25em] text-white sm:text-[11px] md:text-xs"
      variants={variants}
      initial="hidden"
      whileInView="visible"
      viewport={CLASSES_VIEWPORT}
    >
      ( {CLASSES_COPY.eyebrow} )
    </motion.p>
  )
}
