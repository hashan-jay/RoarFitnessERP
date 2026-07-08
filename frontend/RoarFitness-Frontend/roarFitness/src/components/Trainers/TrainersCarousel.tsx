import { type KeyboardEvent, type TouchEvent, useEffect, useRef, useState, useSyncExternalStore } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

import type { Trainer } from './constants'
import { TrainerCard } from './TrainerCard'
import {
  TRAINERS_DESKTOP_MEDIA_QUERY,
  TRAINERS_MOBILE_VISIBLE_COUNT,
  TRAINERS_VISIBLE_COUNT,
  useTrainersCarousel,
} from './useTrainersCarousel'

const CARD_GAP_PX = 20

function subscribeDesktopCarousel(onStoreChange: () => void) {
  const mediaQuery = window.matchMedia(TRAINERS_DESKTOP_MEDIA_QUERY)
  mediaQuery.addEventListener('change', onStoreChange)
  return () => mediaQuery.removeEventListener('change', onStoreChange)
}

function getDesktopCarouselSnapshot() {
  return window.matchMedia(TRAINERS_DESKTOP_MEDIA_QUERY).matches
}

interface TrainersCarouselProps {
  trainers: Trainer[]
  reduceMotion: boolean | null
}

export function TrainersCarousel({ trainers, reduceMotion }: TrainersCarouselProps) {
  const viewportRef = useRef<HTMLDivElement>(null)
  const [cardWidthPx, setCardWidthPx] = useState(0)
  const [stepPx, setStepPx] = useState(0)
  const isDesktop = useSyncExternalStore(
    subscribeDesktopCarousel,
    getDesktopCarouselSnapshot,
    () => true,
  )
  const visibleCount = isDesktop ? TRAINERS_VISIBLE_COUNT : TRAINERS_MOBILE_VISIBLE_COUNT

  const {
    index,
    slideCount,
    positionCount,
    canGoPrev,
    canGoNext,
    goTo,
    goNext,
    goPrev,
    onTouchStart,
    onTouchEnd,
  } = useTrainersCarousel(trainers.length, visibleCount)

  useEffect(() => {
    const node = viewportRef.current
    if (!node) return

    const updateMeasurements = () => {
      const viewportWidth = node.offsetWidth
      const nextCardWidth =
        (viewportWidth - CARD_GAP_PX * (visibleCount - 1)) / visibleCount

      setCardWidthPx(nextCardWidth)
      setStepPx(nextCardWidth + CARD_GAP_PX)
    }

    updateMeasurements()

    const observer = new ResizeObserver(updateMeasurements)
    observer.observe(node)
    return () => observer.disconnect()
  }, [visibleCount])

  if (slideCount === 0) return null

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'ArrowRight') {
      event.preventDefault()
      goNext()
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault()
      goPrev()
    }
  }

  const handleTouchStart = (event: TouchEvent<HTMLDivElement>) => {
    onTouchStart(event.touches[0]?.clientX ?? 0)
  }

  const handleTouchEnd = (event: TouchEvent<HTMLDivElement>) => {
    onTouchEnd(event.changedTouches[0]?.clientX ?? 0)
  }

  return (
    <div className="mx-auto w-full max-w-[68rem]">
      <div className="flex items-center gap-3 sm:gap-4 lg:gap-6">
        <button
          type="button"
          onClick={goPrev}
          disabled={!canGoPrev}
          className="inline-flex size-10 shrink-0 items-center justify-center rounded-full border border-white/15 text-white transition-colors duration-300 hover:border-white/30 hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/40 disabled:cursor-not-allowed disabled:opacity-35 sm:size-11"
          aria-label="Previous coach"
        >
          <ChevronLeft className="size-5" aria-hidden="true" />
        </button>

        <div
          ref={viewportRef}
          className="relative min-w-0 flex-1 overflow-hidden"
          role="region"
          aria-roledescription="carousel"
          aria-label="Expert coaches"
          tabIndex={0}
          onKeyDown={handleKeyDown}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <div
            className={`flex gap-5 ${reduceMotion ? '' : 'transition-transform duration-300 ease-out'}`}
            style={{
              transform: stepPx > 0 ? `translateX(-${index * stepPx}px)` : undefined,
            }}
          >
            {trainers.map((trainer, trainerIndex) => (
              <div
                key={trainer.id}
                className="shrink-0"
                style={cardWidthPx > 0 ? { width: `${cardWidthPx}px` } : undefined}
                aria-hidden={
                  trainerIndex < index || trainerIndex >= index + visibleCount
                    ? true
                    : undefined
                }
              >
                <TrainerCard trainer={trainer} index={trainerIndex} className="h-full" />
              </div>
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={goNext}
          disabled={!canGoNext}
          className="inline-flex size-10 shrink-0 items-center justify-center rounded-full border border-white/15 text-white transition-colors duration-300 hover:border-white/30 hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/40 disabled:cursor-not-allowed disabled:opacity-35 sm:size-11"
          aria-label="Next coach"
        >
          <ChevronRight className="size-5" aria-hidden="true" />
        </button>
      </div>

      {positionCount > 1 ? (
        <div
          className="mt-6 flex items-center justify-center gap-2 sm:mt-8"
          role="tablist"
          aria-label="Carousel positions"
        >
          {Array.from({ length: positionCount }, (_, positionIndex) => {
            const isActive = positionIndex === index

            return (
              <button
                key={positionIndex}
                type="button"
                role="tab"
                aria-selected={isActive}
                aria-label={`Show coaches ${positionIndex + 1} to ${Math.min(positionIndex + visibleCount, slideCount)}`}
                onClick={() => goTo(positionIndex)}
                className={`h-2 rounded-full transition-all duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/40 ${
                  isActive ? 'w-7 bg-white' : 'w-2 bg-white/30 hover:bg-white/50'
                }`}
              />
            )
          })}
        </div>
      ) : null}

      <p className="mt-4 text-center text-[10px] font-medium uppercase tracking-[0.16em] text-features-muted">
        {String(index + 1).padStart(2, '0')} / {String(positionCount).padStart(2, '0')}
      </p>
    </div>
  )
}
