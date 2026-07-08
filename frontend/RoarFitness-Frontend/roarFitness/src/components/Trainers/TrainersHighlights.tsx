import { motion, useReducedMotion } from 'motion/react'

import { TRAINER_HIGHLIGHTS } from './constants'
import {
  createTrainerHighlightReveal,
  TRAINERS_VIEWPORT,
} from './trainersMotion'

export function TrainersHighlights() {
  const reduceMotion = useReducedMotion()

  return (
    <motion.ul
      className="mx-auto grid max-w-5xl grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-x-8 sm:gap-y-7 lg:grid-cols-4 lg:gap-8"
      initial="hidden"
      whileInView="visible"
      viewport={TRAINERS_VIEWPORT}
      aria-label="Coach credentials"
    >
      {TRAINER_HIGHLIGHTS.map((highlight, index) => {
        const Icon = highlight.icon

        return (
          <motion.li
            key={highlight.id}
            className="list-none"
            variants={createTrainerHighlightReveal(reduceMotion, index)}
          >
            <div className="flex items-center gap-3.5 lg:flex-col lg:items-center lg:gap-3 lg:text-center">
              <Icon
                className="h-5 w-5 shrink-0 text-white/90 sm:h-[1.375rem] sm:w-[1.375rem]"
                strokeWidth={1.65}
                aria-hidden="true"
              />
              <span className="text-[11px] font-medium uppercase tracking-[0.14em] text-white/90 sm:text-xs sm:tracking-[0.16em]">
                {highlight.label}
              </span>
            </div>
          </motion.li>
        )
      })}
    </motion.ul>
  )
}
