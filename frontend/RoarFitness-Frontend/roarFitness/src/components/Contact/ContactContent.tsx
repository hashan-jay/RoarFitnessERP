import { useReducedMotion } from 'motion/react'

import { ContactDetails } from './ContactDetails'
import { ContactForm } from './ContactForm'
import { ContactHeader } from './ContactHeader'
import { ContactMap } from './ContactMap'
import {
  createContactDescriptionReveal,
  createContactEyebrowReveal,
  createContactHeadlineReveal,
  createContactPanelReveal,
} from './contactMotion'

export function ContactContent() {
  const reduceMotion = useReducedMotion()

  return (
    <div className="flex flex-col">
      <ContactHeader
        eyebrowVariants={createContactEyebrowReveal(reduceMotion)}
        headlineVariants={createContactHeadlineReveal(reduceMotion)}
        descriptionVariants={createContactDescriptionReveal(reduceMotion)}
      />

      <div
        className="mt-10 grid grid-cols-1 items-stretch gap-5 sm:mt-12 sm:gap-6 lg:mt-14 lg:grid-cols-12 lg:gap-6 xl:gap-7"
        aria-label="Contact panels"
      >
        <div className="lg:col-span-3">
          <ContactDetails
            variants={createContactPanelReveal(reduceMotion, 0)}
          />
        </div>

        <div className="lg:col-span-5">
          <ContactMap variants={createContactPanelReveal(reduceMotion, 1)} />
        </div>

        <div className="lg:col-span-4">
          <ContactForm variants={createContactPanelReveal(reduceMotion, 2)} />
        </div>
      </div>
    </div>
  )
}
