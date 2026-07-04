/**
 * React hook for respecting the user's prefers-reduced-motion OS setting.
 * Used by animated UI across public and portal pages.
 */
import { useEffect, useState } from 'react';

/** Subscribes to `(prefers-reduced-motion: reduce)` and returns whether motion should be minimized. */
export function useReducedMotion(): boolean {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReducedMotion(mediaQuery.matches);

    update();
    mediaQuery.addEventListener('change', update);
    return () => mediaQuery.removeEventListener('change', update);
  }, []);

  return reducedMotion;
}
