import { useCallback, useRef, useState } from 'react'

import { SHOWCASE_SLIDES, SHOWCASE_SWIPE_THRESHOLD } from './constants'

export function useShowcaseGallery() {
  const touchStartX = useRef<number | null>(null)
  const slideCount = SHOWCASE_SLIDES.length
  const maxIndex = Math.max(0, slideCount - 1)

  const [index, setIndex] = useState(0)
  const activeIndex = Math.min(index, maxIndex)
  const progress = maxIndex === 0 ? 1 : activeIndex / maxIndex

  const goTo = useCallback(
    (nextIndex: number) => {
      setIndex(Math.max(0, Math.min(nextIndex, maxIndex)))
    },
    [maxIndex],
  )

  const goNext = useCallback(() => {
    setIndex((current) => (current >= maxIndex ? 0 : current + 1))
  }, [maxIndex])

  const goPrev = useCallback(() => {
    setIndex((current) => (current <= 0 ? maxIndex : current - 1))
  }, [maxIndex])

  const onTouchStart = useCallback((clientX: number) => {
    touchStartX.current = clientX
  }, [])

  const onTouchEnd = useCallback(
    (clientX: number) => {
      if (touchStartX.current === null) return

      const delta = touchStartX.current - clientX
      if (delta > SHOWCASE_SWIPE_THRESHOLD) goNext()
      else if (delta < -SHOWCASE_SWIPE_THRESHOLD) goPrev()

      touchStartX.current = null
    },
    [goNext, goPrev],
  )

  return {
    index: activeIndex,
    maxIndex,
    slideCount,
    progress,
    goTo,
    goNext,
    goPrev,
    onTouchStart,
    onTouchEnd,
  }
}
