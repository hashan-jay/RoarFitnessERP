import { useCallback, useEffect, useRef, useState } from 'react'

const SWIPE_THRESHOLD = 48
export const TRAINERS_VISIBLE_COUNT = 3
export const TRAINERS_MOBILE_VISIBLE_COUNT = 1
export const TRAINERS_DESKTOP_MEDIA_QUERY = '(min-width: 768px)'

export function useTrainersCarousel(
  slideCount: number,
  visibleCount = TRAINERS_VISIBLE_COUNT,
) {
  const touchStartX = useRef<number | null>(null)
  const maxIndex = Math.max(0, slideCount - visibleCount)
  const positionCount = maxIndex + 1

  const [index, setIndex] = useState(0)

  useEffect(() => {
    setIndex((current) => Math.min(current, maxIndex))
  }, [maxIndex])

  const activeIndex = Math.min(index, maxIndex)

  const goTo = useCallback(
    (nextIndex: number) => {
      setIndex(Math.max(0, Math.min(nextIndex, maxIndex)))
    },
    [maxIndex],
  )

  const goNext = useCallback(() => {
    setIndex((current) => Math.min(current + 1, maxIndex))
  }, [maxIndex])

  const goPrev = useCallback(() => {
    setIndex((current) => Math.max(current - 1, 0))
  }, [])

  const onTouchStart = useCallback((clientX: number) => {
    touchStartX.current = clientX
  }, [])

  const onTouchEnd = useCallback(
    (clientX: number) => {
      if (touchStartX.current === null) return

      const delta = touchStartX.current - clientX
      if (delta > SWIPE_THRESHOLD) goNext()
      else if (delta < -SWIPE_THRESHOLD) goPrev()

      touchStartX.current = null
    },
    [goNext, goPrev],
  )

  return {
    index: activeIndex,
    slideCount,
    positionCount,
    maxIndex,
    canGoPrev: activeIndex > 0,
    canGoNext: activeIndex < maxIndex,
    goTo,
    goNext,
    goPrev,
    onTouchStart,
    onTouchEnd,
  }
}
