import { useEffect, useSyncExternalStore } from 'react'
import { motion, useReducedMotion } from 'motion/react'

import { getTrainers, loadTrainersFromApi, subscribeTrainers } from '../../utils/trainerStorage'
import { TrainersCarousel } from './TrainersCarousel'
import { TrainersHighlights } from './TrainersHighlights'
import { TrainersIntro } from './TrainersIntro'
import {
  createTrainersHeadingReveal,
  createTrainersIntroReveal,
  createTrainersSubtitleReveal,
} from './trainersMotion'

export function TrainersGrid() {
  const reduceMotion = useReducedMotion()
  const trainers = useSyncExternalStore(subscribeTrainers, getTrainers, getTrainers)

  useEffect(() => {
    void loadTrainersFromApi()
  }, [])

  return (
    <div className="flex flex-col">
      <TrainersIntro
        eyebrowVariants={createTrainersIntroReveal(reduceMotion)}
        headingVariants={createTrainersHeadingReveal(reduceMotion)}
        subtitleVariants={createTrainersSubtitleReveal(reduceMotion)}
      />

      <motion.div
        className="mt-14 sm:mt-16 lg:mt-20"
        initial={reduceMotion ? false : { opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={reduceMotion ? { duration: 0 } : { duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      >
        <TrainersCarousel trainers={trainers} reduceMotion={reduceMotion} />
      </motion.div>

      <div className="mt-16 sm:mt-20 lg:mt-24">
        <TrainersHighlights />
      </div>
    </div>
  )
}
