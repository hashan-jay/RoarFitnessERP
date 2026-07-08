import { type TouchEvent } from 'react'
import { useReducedMotion } from 'motion/react'

import { SHOWCASE_SLIDES } from './constants'
import { ShowcaseActiveInfo, ShowcaseHeroFrame } from './ShowcaseHeroFrame'
import {
  SHOWCASE_CONTENT_COL_CLASS,
  SHOWCASE_IMAGE_COL_CLASS,
} from './showcaseLayout'
import {
  ShowcaseIndexRail,
  ShowcaseSliderControls,
} from './ShowcaseSliderParts'
import { useShowcaseGallery } from './useShowcaseGallery'

export function ShowcaseSlider() {
  const reduceMotion = useReducedMotion()
  const {
    index,
    slideCount,
    progress,
    goTo,
    goNext,
    goPrev,
    onTouchStart,
    onTouchEnd,
  } = useShowcaseGallery()

  const activeSlide = SHOWCASE_SLIDES[index]

  const handleTouchStart = (event: TouchEvent<HTMLDivElement>) => {
    onTouchStart(event.touches[0]?.clientX ?? 0)
  }

  const handleTouchEnd = (event: TouchEvent<HTMLDivElement>) => {
    onTouchEnd(event.changedTouches[0]?.clientX ?? 0)
  }

  if (!activeSlide) return null

  const slideTotalLabel = String(slideCount).padStart(2, '0')

  return (
    <div className="mt-10 sm:mt-12 md:mt-14 lg:mt-16">
      <div className="relative overflow-hidden rounded-sm border border-brand-ink/[0.08] bg-white shadow-[0_16px_48px_rgba(10,10,10,0.06)]">
        <span
          className="pointer-events-none absolute -right-2 top-4 font-display text-[clamp(4rem,12vw,7rem)] leading-none tracking-[0.06em] text-brand-ink/[0.04] sm:top-6 lg:right-6"
          aria-hidden="true"
        >
          {slideTotalLabel}
        </span>

        <div className="flex flex-col lg:grid lg:grid-cols-12 lg:items-stretch">
          <div
            className={`flex flex-col justify-between gap-5 bg-brand-ink/[0.02] p-4 sm:p-5 lg:p-6 xl:p-7 ${SHOWCASE_IMAGE_COL_CLASS}`}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            aria-roledescription="carousel"
            aria-label="Gym showcase gallery"
          >
            <ShowcaseHeroFrame
              slide={activeSlide}
              index={index}
              reduceMotion={reduceMotion}
            />

            <ShowcaseSliderControls
              className="hidden lg:flex"
              onPrev={goPrev}
              onNext={goNext}
              progress={progress}
              activeIndex={index}
              slideCount={slideCount}
              reduceMotion={reduceMotion}
            />
          </div>

          <div
            className={`relative flex flex-col border-t border-brand-ink/[0.08] p-4 sm:p-5 lg:border-l lg:border-t-0 lg:p-6 xl:p-7 ${SHOWCASE_CONTENT_COL_CLASS}`}
          >
            <span
              className="pointer-events-none absolute left-0 top-8 hidden h-12 w-px bg-gradient-to-b from-brand-ink/20 via-brand-ink/10 to-transparent lg:block"
              aria-hidden="true"
            />

            <ShowcaseActiveInfo
              slide={activeSlide}
              index={index}
              reduceMotion={reduceMotion}
            />

            <div className="mt-5 flex-1 sm:mt-6">
              <p className="mb-3 hidden text-[10px] font-semibold uppercase tracking-[0.18em] text-brand-muted lg:block">
                All spaces
              </p>
              <ShowcaseIndexRail
                slides={SHOWCASE_SLIDES}
                activeIndex={index}
                onSelect={goTo}
                reduceMotion={reduceMotion}
              />
            </div>

            <ShowcaseSliderControls
              className="mt-5 border-t border-brand-ink/[0.08] pt-5 lg:mt-6 lg:hidden"
              onPrev={goPrev}
              onNext={goNext}
              progress={progress}
              activeIndex={index}
              slideCount={slideCount}
              reduceMotion={reduceMotion}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
