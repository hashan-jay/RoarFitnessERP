import { motion } from 'motion/react'

import { PrimaryCta } from '../PrimaryCta'
import { ROUTES } from '../../routes/paths'
import { TRAINERS_COPY } from './constants'
import { createTrainersCtaReveal, TRAINERS_VIEWPORT } from './trainersMotion'

interface TrainersCtaProps {
  reduceMotion: boolean | null
}

export function TrainersCta({ reduceMotion }: TrainersCtaProps) {
  return (
    <motion.div
      className="flex justify-center"
      variants={createTrainersCtaReveal(reduceMotion)}
      initial="hidden"
      whileInView="visible"
      viewport={TRAINERS_VIEWPORT}
    >
      <PrimaryCta to={ROUTES.trainers}>{TRAINERS_COPY.cta}</PrimaryCta>
    </motion.div>
  )
}
