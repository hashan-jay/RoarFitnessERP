/**
 * Staggered scroll-reveal container and child item for public page animations.
 * Respects reduced-motion preference.
 */
import { motion, type HTMLMotionProps } from 'framer-motion';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { fadeUpVariants, motionTransition, staggerContainerVariants } from '../../lib/motion';

interface StaggerProps extends HTMLMotionProps<'div'> {
  delay?: number;
}

export function Stagger({ children, className, delay = 0, ...props }: StaggerProps) {
  const reducedMotion = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.15, margin: '-40px 0px' }}
      variants={staggerContainerVariants}
      transition={motionTransition(reducedMotion, 0.5, delay)}
      {...props}
    >
      {children}
    </motion.div>
  );
}

interface StaggerItemProps extends HTMLMotionProps<'div'> {}

export function StaggerItem({ children, className, ...props }: StaggerItemProps) {
  const reducedMotion = useReducedMotion();

  return (
    <motion.div
      className={className}
      variants={fadeUpVariants}
      transition={motionTransition(reducedMotion, 0.55)}
      {...props}
    >
      {children}
    </motion.div>
  );
}
