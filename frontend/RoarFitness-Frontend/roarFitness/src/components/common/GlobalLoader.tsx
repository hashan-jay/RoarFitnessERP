import { AnimatePresence, motion } from 'motion/react'

import { useGlobalLoading } from '../../context/LoadingContext'

const OVERLAY_FADE = { duration: 0.14, ease: [0.4, 0, 0.2, 1] as const }

const SPINNER_ROTATION = {
  rotate: 360,
  transition: {
    duration: 0.75,
    repeat: Infinity,
    ease: 'linear' as const,
  },
}

export function GlobalLoader() {
  const { isLoading } = useGlobalLoading()

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          className="pointer-events-auto fixed inset-0 z-[9999] flex items-center justify-center bg-white"
          role="status"
          aria-live="polite"
          aria-busy="true"
          aria-label="Loading"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={OVERLAY_FADE}
        >
          <motion.span
            className="block size-10 rounded-full border-[3px] border-black/15 border-t-black"
            aria-hidden="true"
            animate={SPINNER_ROTATION}
          />
        </motion.div>
      )}
    </AnimatePresence>
  )
}
