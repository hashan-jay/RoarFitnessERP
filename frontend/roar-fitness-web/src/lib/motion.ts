/**
 * Shared Framer Motion easing, variants, and transition helpers.
 * Consumed by public marketing pages and portal UI animations.
 */

/** Custom cubic-bezier easing for smooth enter/exit animations. */
export const easeSmooth = [0.22, 1, 0.36, 1] as const;

/** Fade-in with upward slide for staggered list items. */
export const fadeUpVariants = {
  hidden: {
    opacity: 0,
    y: 20,
  },
  visible: {
    opacity: 1,
    y: 0,
  },
};

/** Simple opacity fade. */
export const fadeInVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

/** Subtle scale and slide for cards and modals. */
export const scaleInVariants = {
  hidden: { opacity: 0, scale: 0.98, y: 12 },
  visible: { opacity: 1, scale: 1, y: 0 },
};

/** Staggered reveal for child elements in generic sections. */
export const staggerContainerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.07,
      delayChildren: 0.05,
    },
  },
};

/** Staggered reveal tuned for hero sections. */
export const heroContainerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

/**
 * Returns Framer Motion transition props, zeroing duration when reduced motion is preferred.
 */
export function motionTransition(
  reducedMotion: boolean,
  duration = 0.5,
  delay = 0
) {
  if (reducedMotion) {
    return { duration: 0, delay: 0 };
  }

  return {
    duration,
    delay,
    ease: easeSmooth,
  };
}
