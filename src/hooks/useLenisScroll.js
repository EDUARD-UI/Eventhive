import { useEffect, useRef } from 'react';
import Lenis from 'lenis';
import 'lenis/dist/lenis.css';

/**
 * useLenisScroll
 * Hook reutilizable para activar desplazamiento ultra-fluido (Smooth Scroll)
 * cinemático con Lenis en cualquier vista o página de EventHive.
 *
 * @param {Object} options - Opciones de configuración adicionales de Lenis.
 * @returns {React.MutableRefObject<Lenis|null>} Referencia a la instancia activa de Lenis.
 */
export function useLenisScroll(options = {}) {
  const lenisRef = useRef(null);

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      syncTouch: true,
      syncTouchLerp: 0.08,
      wheelMultiplier: 1,
      touchMultiplier: 1.8,
      touchInertiaMultiplier: 35,
      infinite: false,
      ...options,
    });

    lenisRef.current = lenis;

    let animationFrameId;
    function raf(time) {
      lenis.raf(time);
      animationFrameId = requestAnimationFrame(raf);
    }
    animationFrameId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(animationFrameId);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  return lenisRef;
}

export default useLenisScroll;
