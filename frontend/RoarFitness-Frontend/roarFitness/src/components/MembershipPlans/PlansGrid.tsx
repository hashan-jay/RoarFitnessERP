import { useEffect, useState } from 'react'
import { motion, useReducedMotion } from 'motion/react'

import { getPackages, loadPackagesFromApi } from '../../utils/packageStorage'
import {
  createPlanCardReveal,
  MEMBERSHIP_VIEWPORT,
} from './membershipMotion'
import { PlanCard } from './PlanCard'

export function PlansGrid() {
  const reduceMotion = useReducedMotion()
  const [plans, setPlans] = useState(getPackages())

  useEffect(() => {
    loadPackagesFromApi().then(setPlans)
  }, [])

  return (
    <motion.ul
      className="mx-auto grid w-full max-w-[64rem] grid-cols-1 gap-6 max-sm:justify-items-center sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 lg:items-stretch lg:gap-6 xl:gap-8"
      initial="hidden"
      whileInView="visible"
      viewport={MEMBERSHIP_VIEWPORT}
      aria-label="Membership plan options"
    >
      {plans.map((plan, index) => (
        <motion.li
          key={plan.id}
          className={`list-none h-full w-full max-sm:max-w-[17rem] ${
            index === plans.length - 1
              ? 'sm:col-span-2 sm:mx-auto sm:max-w-[17rem] lg:col-span-1 lg:max-w-none'
              : ''
          }`}
          variants={createPlanCardReveal(reduceMotion, index)}
        >
          <PlanCard plan={plan} index={index} className="h-full" />
        </motion.li>
      ))}
    </motion.ul>
  )
}
