import { useEffect, useRef } from 'react';
import Lenis from 'lenis';
import 'lenis/dist/lenis.css';

let activeLenisInstance = null;
const scrollListeners = new Set();

/**
 * Registra un callback que se invocará en cada evento de scroll de Lenis
 * @param {Function} callback
 * @returns {Function} Función para cancelar la suscripción
 */
export function registerLenisScrollListener(callback) {
  if (typeof callback !== 'function') return () => {};
  scrollListeners.add(callback);
  return () => {
    scrollListeners.delete(callback);
  };
}

/**
 * Obtiene la instancia activa de Lenis si está disponible
 * @returns {Lenis|null}
 */
export function getActiveLenis() {
  return activeLenisInstance || (typeof window !== 'undefined' ? window.__lenis : null);
}

/**
 * useLenisScrollEffect
 * Hook reactivo para sincronizar elementos del DOM directamente con el motor Lenis.
 * Invoca el callback en cada frame de scroll de Lenis y provee fallback pasivo para scroll nativo.
 *
 * @param {Function} callback - Callback que recibe ({ scroll, velocity, progress, direction, lenis })
 * @param {Array} [deps] - Dependencias del efecto
 */
export function useLenisScrollEffect(callback, deps = []) {
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  useEffect(() => {
    const handler = (e) => {
      const currentScroll =
        e?.scroll ?? (typeof window !== 'undefined' ? window.scrollY || window.pageYOffset : 0);
      callbackRef.current?.({
        scroll: currentScroll,
        velocity: e?.velocity ?? 0,
        progress: e?.progress ?? 0,
        direction: e?.direction ?? 1,
        lenis: e?.lenis || activeLenisInstance,
        event: e,
      });
    };

    const unsubscribe = registerLenisScrollListener(handler);
    window.addEventListener('scroll', handler, { passive: true });

    // Ejecución inicial para calcular posición inicial
    handler({ scroll: typeof window !== 'undefined' ? window.scrollY : 0 });

    return () => {
      unsubscribe();
      window.removeEventListener('scroll', handler);
    };
  }, deps);
}

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
      prevent: (node) => {
        if (!node) return false;
        if (typeof node.hasAttribute === 'function' && node.hasAttribute('data-lenis-prevent')) {
          return true;
        }
        if (typeof node.closest === 'function') {
          if (node.closest('[data-lenis-prevent]')) return true;
          if (node.closest('[role="listbox"], [role="dialog"], aside, .overflow-y-auto, .overscroll-contain')) {
            return true;
          }
        }
        return false;
      },
      ...options,
    });

    lenisRef.current = lenis;
    activeLenisInstance = lenis;
    if (typeof window !== 'undefined') {
      window.__lenis = lenis;
    }

    const unsubscribeInternal = lenis.on('scroll', (e) => {
      if (typeof onScroll === 'function') {
        onScroll(e);
      }
      scrollListeners.forEach((fn) => {
        try {
          fn(e);
        } catch (err) {
          console.error('Error en listener de Lenis scroll:', err);
        }
      });
    });

    let rafId;
    function raf(time) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }
    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      unsubscribeInternal();
      lenis.destroy();
      lenisRef.current = null;
      if (activeLenisInstance === lenis) {
        activeLenisInstance = null;
      }
      if (typeof window !== 'undefined' && window.__lenis === lenis) {
        window.__lenis = null;
      }
    };
  }, []);

  return lenisRef;
}

export default useLenisScroll;
