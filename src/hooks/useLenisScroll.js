import { useEffect, useRef } from 'react';
import Lenis from 'lenis';
import 'lenis/dist/lenis.css';

/**
 * useLenisScroll
 * Hook reutilizable para activar desplazamiento ultra fluido (Smooth Scroll)
 * basado en el motor oficial Lenis en cualquier vista de EventHive.
 *
 * @param {Object} options - Opciones de configuración de Lenis.
 * @param {Function} [onScroll] - Callback opcional ejecutado en cada scroll con los datos de Lenis.
 * @returns {React.MutableRefObject<Lenis|null>} Referencia a la instancia activa de Lenis.
 */
export function useLenisScroll(options = {}, onScroll = null) {
  const lenisRef = useRef(null);

  useEffect(() => {
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) return;

    const lenis = new Lenis({
      duration: 1.1,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 0.95,
      touchMultiplier: 1.2,
      ...options,
    });

    lenisRef.current = lenis;

    let unsubscribe = null;
    if (typeof onScroll === 'function') {
      unsubscribe = lenis.on('scroll', onScroll);
    }

    let rafId;
    function raf(time) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }
    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  return lenisRef;
}

export default useLenisScroll;


