import { useEffect, useRef } from 'react';


/**
 * useLenisScroll
 * Hook reutilizable para activar desplazamiento fluido (Smooth Scroll)
 * nativo y ligero sin requerir dependencias externas en cualquier vista de EventHive.
 *
 * @param {Object} options - Opciones de configuración adicionales.
 * @returns {React.MutableRefObject<Object|null>} Referencia al controlador de scroll.
 */
export function useLenisScroll(options = {}) {
  const lenisRef = useRef(null);

  useEffect(() => {
    const html = document.documentElement;
    const prevScrollBehavior = html.style.scrollBehavior;
    html.style.scrollBehavior = 'smooth';

    lenisRef.current = {
      scrollTo: (target, opts = {}) => {
        if (typeof target === 'number') {
          window.scrollTo({ top: target, behavior: opts.immediate ? 'auto' : 'smooth' });
        } else if (typeof target === 'string') {
          const el = document.querySelector(target);
          if (el) el.scrollIntoView({ behavior: opts.immediate ? 'auto' : 'smooth' });
        } else if (target instanceof HTMLElement) {
          target.scrollIntoView({ behavior: opts.immediate ? 'auto' : 'smooth' });
        }
      },
      destroy: () => {
        html.style.scrollBehavior = prevScrollBehavior;
      },
    };

    return () => {
      html.style.scrollBehavior = prevScrollBehavior;
      lenisRef.current = null;
    };
  }, []);

  return lenisRef;
}

export default useLenisScroll;

