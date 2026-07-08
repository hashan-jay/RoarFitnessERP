import { ChevronLeft, ChevronRight } from 'lucide-react'
import { motion } from 'motion/react'

import type { ShowcaseSlide } from './constants'
import { SHOWCASE_THUMB_SIZE_CLASS } from './showcaseLayout'
import { SHOWCASE_UI_TRANSITION } from './showcaseMotion'

interface ShowcaseIndexRailProps {
  slides: ShowcaseSlide[]
  activeIndex: number
  onSelect: (index: number) => void
  reduceMotion: boolean | null
}

export function ShowcaseIndexRail({
  slides,
  activeIndex,
  onSelect,
  reduceMotion,
}: ShowcaseIndexRailProps) {
  const uiTransition = reduceMotion ? { duration: 0 } : SHOWCASE_UI_TRANSITION

  return (
    <>
      {/* Mobile — compact numbered pills */}
      <div
        className="flex justify-center gap-2 lg:hidden"
        role="tablist"
        aria-label="Studio spaces"
      >
        {slides.map((slide, slideIndex) => {
          const isActive = slideIndex === activeIndex
          const label = String(slideIndex + 1).padStart(2, '0')

          return (
            <button
              key={slide.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-label={`View ${slide.title}`}
              onClick={() => onSelect(slideIndex)}
              className={`flex h-10 min-w-[2.5rem] items-center justify-center rounded-full px-3 text-xs font-display tracking-[0.08em] transition-all duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-ink ${
                isActive
                  ? 'bg-brand-ink text-white shadow-[0_4px_14px_rgba(10,10,10,0.18)]'
                  : 'bg-brand-ink/[0.05] text-brand-muted hover:bg-brand-ink/10 hover:text-brand-ink'
              }`}
            >
              {label}
            </button>
          )
        })}
      </div>

      {/* Desktop — thumbnail index list */}
      <div
        className="hidden flex-col gap-2 lg:flex"
        role="tablist"
        aria-label="Studio spaces"
      >
        {slides.map((slide, slideIndex) => {
          const isActive = slideIndex === activeIndex
          const label = String(slideIndex + 1).padStart(2, '0')

          return (
            <button
              key={slide.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-label={`View ${slide.title}`}
              onClick={() => onSelect(slideIndex)}
              className={`group/rail relative flex w-full items-center gap-3 rounded-sm border p-2 text-left transition-all duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-ink ${
                isActive
                  ? 'border-brand-ink/15 border-l-2 border-l-brand-ink bg-brand-ink/[0.04] pl-[calc(0.5rem-1px)] shadow-[0_4px_16px_rgba(10,10,10,0.06)]'
                  : 'border-transparent hover:border-brand-ink/10 hover:bg-brand-ink/[0.02]'
              }`}
            >
              <span className={`relative ${SHOWCASE_THUMB_SIZE_CLASS} shrink-0 overflow-hidden rounded-sm bg-neutral-100`}>
                <img
                  src={slide.image}
                  alt=""
                  className="h-full w-full object-cover"
                  draggable={false}
                  aria-hidden="true"
                />
                {isActive && (
                  <span className="absolute inset-0 ring-2 ring-inset ring-brand-ink/30" />
                )}
              </span>

              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-2">
                  <motion.span
                    className="font-display text-sm tracking-[0.08em]"
                    animate={{
                      color: isActive ? '#0a0a0a' : 'rgba(10,10,10,0.35)',
                    }}
                    transition={uiTransition}
                    aria-hidden="true"
                  >
                    {label}
                  </motion.span>
                  <span
                    className={`truncate text-sm font-medium capitalize tracking-[-0.01em] ${
                      isActive ? 'text-brand-ink' : 'text-brand-muted'
                    }`}
                  >
                    {slide.title}
                  </span>
                </span>
                <span className="mt-0.5 block truncate text-[10px] font-semibold uppercase tracking-[0.14em] text-brand-muted/80">
                  {slide.category}
                </span>
              </span>
            </button>
          )
        })}
      </div>
    </>
  )
}

interface ShowcaseSliderControlsProps {
  onPrev: () => void
  onNext: () => void
  progress: number
  activeIndex: number
  slideCount: number
  reduceMotion: boolean | null
  className?: string
}

export function ShowcaseSliderControls({
  onPrev,
  onNext,
  progress,
  activeIndex,
  slideCount,
  reduceMotion,
  className = '',
}: ShowcaseSliderControlsProps) {
  const uiTransition = reduceMotion ? { duration: 0 } : SHOWCASE_UI_TRANSITION

  return (
    <div
      className={`flex items-center gap-3 sm:gap-4 ${className}`}
      role="group"
      aria-label="Slide navigation"
    >
      <button
        type="button"
        onClick={onPrev}
        aria-label="Previous slide"
        className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-brand-ink/10 bg-white text-brand-ink shadow-sm transition-all duration-300 hover:border-brand-ink hover:bg-brand-ink hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-ink active:scale-95"
      >
        <ChevronLeft className="h-5 w-5" strokeWidth={1.75} aria-hidden="true" />
      </button>

      <div className="flex min-w-0 flex-1 items-center gap-3">
        <span className="shrink-0 font-display text-sm tracking-[0.06em] text-brand-ink/70 sm:text-base">
          {String(activeIndex + 1).padStart(2, '0')}
        </span>
        <div className="relative h-1 flex-1 overflow-hidden rounded-full bg-brand-ink/10">
          <motion.div
            className="absolute inset-y-0 left-0 rounded-full bg-brand-ink"
            animate={{ width: `${Math.max(progress * 100, 8)}%` }}
            transition={uiTransition}
          />
        </div>
        <span className="shrink-0 text-[10px] font-semibold uppercase tracking-[0.14em] text-brand-muted">
          {String(slideCount).padStart(2, '0')}
        </span>
      </div>

      <button
        type="button"
        onClick={onNext}
        aria-label="Next slide"
        className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-brand-ink/10 bg-white text-brand-ink shadow-sm transition-all duration-300 hover:border-brand-ink hover:bg-brand-ink hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-ink active:scale-95"
      >
        <ChevronRight className="h-5 w-5" strokeWidth={1.75} aria-hidden="true" />
      </button>
    </div>
  )
}
