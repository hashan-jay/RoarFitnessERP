import { AnimatePresence, motion } from 'motion/react'

import type { ShowcaseSlide } from './constants'
import { SHOWCASE_HERO_ASPECT_CLASS } from './showcaseLayout'
import { getShowcaseFrameTransition } from './showcaseMotion'

interface ShowcaseHeroFrameProps {
  slide: ShowcaseSlide
  index: number
  reduceMotion: boolean | null
}

export function ShowcaseHeroFrame({
  slide,
  index,
  reduceMotion,
}: ShowcaseHeroFrameProps) {
  const transition = getShowcaseFrameTransition(reduceMotion)
  const indexLabel = String(index + 1).padStart(2, '0')

  return (
    <div className="relative">
      {/* Offset editorial frame */}
      <span
        className="pointer-events-none absolute -bottom-2 -right-2 hidden h-full w-full border border-brand-ink/10 sm:block"
        aria-hidden="true"
      />

      <div className="relative overflow-hidden rounded-sm bg-neutral-100 shadow-[0_8px_32px_rgba(10,10,10,0.08)] ring-1 ring-brand-ink/[0.06]">
        <div className={`relative w-full ${SHOWCASE_HERO_ASPECT_CLASS}`}>
          <AnimatePresence mode="wait" initial={false}>
            <motion.img
              key={slide.id}
              src={slide.image}
              alt={slide.alt}
              className="absolute inset-0 h-full w-full object-cover"
              draggable={false}
              initial={{ opacity: 0, scale: 1.04 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={transition}
            />
          </AnimatePresence>

          <span className="absolute left-3 top-3 rounded-[1px] bg-white/95 px-2.5 py-1 font-display text-[11px] tracking-[0.12em] text-brand-ink shadow-sm backdrop-blur-sm sm:left-4 sm:top-4">
            {indexLabel}
          </span>
        </div>
      </div>
    </div>
  )
}

interface ShowcaseActiveInfoProps {
  slide: ShowcaseSlide
  index: number
  reduceMotion: boolean | null
}

export function ShowcaseActiveInfo({
  slide,
  index,
  reduceMotion,
}: ShowcaseActiveInfoProps) {
  const transition = getShowcaseFrameTransition(reduceMotion)
  const indexLabel = String(index + 1).padStart(2, '0')

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={slide.id}
        className="border-l-2 border-brand-ink pl-4 sm:pl-5"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={transition}
      >
        <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-brand-muted sm:text-[11px]">
          Now viewing · {indexLabel}
        </p>
        <h3 className="mt-2 font-display text-[clamp(1.5rem,3vw,2.25rem)] uppercase leading-[0.95] tracking-[0.04em] text-brand-ink">
          {slide.title}
        </h3>
        <p className="mt-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-brand-muted sm:text-[11px]">
          {slide.category}
        </p>
      </motion.div>
    </AnimatePresence>
  )
}
