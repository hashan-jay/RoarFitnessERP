/**
 * Single-element scroll-reveal animation for public page sections.
 * Respects reduced-motion preference.
 */
import { motion, type HTMLMotionProps } from 'framer-motion';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { fadeUpVariants, motionTransition } from '../../lib/motion';

interface RevealProps extends HTMLMotionProps<'div'> {
  delay?: number;
  duration?: number;
}

export function Reveal({
  children,
  delay = 0,
  duration = 0.65,
  className,
  ...props
}: RevealProps) {
  const reducedMotion = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2, margin: '-60px 0px' }}
      variants={fadeUpVariants}
      transition={motionTransition(reducedMotion, duration, delay)}
      {...props}
    >
      {children}
    </motion.div>
  );
}
