import { motion, type Variants } from 'motion/react'

import type { FitnessClass } from './constants'

interface ClassRowProps {
  fitnessClass: FitnessClass
  variants: Variants
  isLast: boolean
}

export function ClassRow({ fitnessClass, variants, isLast }: ClassRowProps) {
  return (
    <motion.li variants={variants} className="list-none">
      <article
        className={`group relative overflow-hidden transition-colors duration-300 hover:bg-[#2a2a2a] lg:hover:bg-transparent ${
          isLast ? '' : 'border-b border-white/[0.08] lg:group-hover:border-white/[0.14]'
        }`}
        aria-label={fitnessClass.title}
      >
        {/* Desktop — full-row background image on hover */}
        <div
          className="pointer-events-none absolute inset-0 hidden lg:block"
          aria-hidden="true"
        >
          <img
            src={fitnessClass.image}
            alt=""
            className="absolute inset-0 h-full w-full scale-105 object-cover opacity-0 transition-all duration-700 ease-out group-hover:scale-100 group-hover:opacity-100"
            loading="lazy"
            decoding="async"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#121212]/95 via-[#121212]/80 to-[#121212]/55 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
        </div>

        <div className="relative z-10 mx-auto grid max-w-[75rem] grid-cols-1 gap-3 px-5 py-8 sm:px-8 sm:py-10 md:grid-cols-[3.5rem_minmax(0,1.1fr)_minmax(0,0.95fr)] md:items-start md:gap-x-6 md:gap-y-4 md:py-12 lg:grid-cols-[4.5rem_minmax(0,1.15fr)_minmax(0,1fr)] lg:gap-x-10 lg:px-12 lg:py-14 xl:gap-x-14">
          <p className="text-sm tabular-nums text-white/90 md:row-start-1 sm:text-base lg:transition-colors lg:duration-300 lg:group-hover:text-white">
            {fitnessClass.number}
          </p>

          <h3 className="text-[clamp(1.75rem,3.6vw,3.25rem)] font-medium leading-[1.08] tracking-[-0.02em] text-white md:col-start-2 md:row-start-1 lg:transition-transform lg:duration-300 lg:group-hover:translate-x-1">
            {fitnessClass.title}
          </h3>

          <p className="max-w-md text-sm leading-relaxed text-features-body sm:text-[0.9375rem] md:col-start-3 md:row-start-1 md:max-w-none md:pt-1 lg:max-w-[22rem] lg:text-base lg:leading-[1.6] lg:transition-colors lg:duration-300 lg:group-hover:text-white/85">
            {fitnessClass.description}
          </p>

          {/* Mobile/tablet — inline image below copy */}
          <figure className="pointer-events-none relative col-span-full mt-2 h-40 w-full overflow-hidden rounded-sm shadow-[0_8px_24px_rgba(0,0,0,0.35)] sm:mt-3 sm:h-44 md:col-span-3 md:mt-2 md:h-48 lg:hidden">
            <img
              src={fitnessClass.image}
              alt={fitnessClass.alt}
              className="h-full w-full object-cover"
              loading="lazy"
              decoding="async"
            />
          </figure>
        </div>
      </article>
    </motion.li>
  )
}
