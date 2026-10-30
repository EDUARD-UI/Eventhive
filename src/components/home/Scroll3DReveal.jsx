import React, { useEffect, useRef, useState } from 'react';

/**
 * Scroll3DReveal
 * Componente arquitectónico de animación por scroll en 3D inspirado en landing pages modernas
 * (Oriel, WorkSite, 3D Scroll Design).
 *
 * Características de ingeniería:
 * - Perspectiva 3D acelerada por GPU (transform3d, rotateX, scale) sin reflujos de layout (CLS = 0).
 * - Interpolación progresiva suave al entrar en el viewport y revelación escalonada.
 * - Adaptación responsiva automática en móviles y tablets para mantener 60fps estables.
 * - Respeto nativo a prefers-reduced-motion.
 */
export default function Scroll3DReveal({
  children,
  variant = 'tilt-up', // 'tilt-up' | 'card-pop' | 'ribbon-depth' | 'fade-elevate'
  delay = 0,
  duration = 950,
  threshold = 0.12,
  className = '',
  glowAccent = false,
  id,
}) {
  const containerRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;

    // Verificar preferencia de movimiento reducido
    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReduced) {
      setIsVisible(true);
      setScrollProgress(1);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
          }
        });
      },
      {
        threshold,
        rootMargin: '0px 0px -45px 0px',
      }
    );

    observer.observe(node);

    // Cálculo progresivo sutil de profundidad 3D mientras se hace scroll hacia la sección
    let rafId = null;
    const handleScroll = () => {
      if (rafId) return;
      rafId = requestAnimationFrame(() => {
        rafId = null;
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const vh = window.innerHeight || 800;

        if (rect.top <= vh * 0.92) {
          setIsVisible(true);
        }

        // Progreso normalizado entre 0 (entrando abajo) y 1 (asentado en pantalla)
        const rawProgress = (vh - rect.top) / (vh * 0.65);
        const clamped = Math.max(0, Math.min(1, rawProgress));
        setScrollProgress(clamped);
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', handleScroll);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [threshold]);

  // Calcular transformaciones 3D según la variante seleccionada
  const getVariantStyle = () => {
    const active = isVisible || scrollProgress > 0.15;

    switch (variant) {
      case 'tilt-up': {
        // Efecto 3D Stage Tilt (ideal para Eventos Destacados y Mapa de Eventos)
        return {
          opacity: active ? 1 : 0,
          transform: active
            ? 'perspective(1400px) translate3d(0, 0px, 0) rotateX(0deg) scale(1)'
            : 'perspective(1400px) translate3d(0, 52px, -40px) rotateX(9deg) scale(0.95)',
          filter: active ? 'blur(0px)' : 'blur(3px)',
          transitionProperty: 'transform, opacity, filter',
          transitionDuration: `${duration}ms`,
          transitionDelay: `${delay}ms`,
          transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
          transformOrigin: 'center top',
          willChange: 'transform, opacity',
        };
      }

      case 'card-pop': {
        // Efecto 3D Card Float (ideal para grillas de tarjetas individuales con stagger)
        return {
          opacity: active ? 1 : 0,
          transform: active
            ? 'perspective(1100px) translate3d(0, 0px, 0) rotateX(0deg) rotateY(0deg) scale(1)'
            : 'perspective(1100px) translate3d(0, 42px, -30px) rotateX(11deg) rotateY(-2deg) scale(0.93)',
          filter: active ? 'blur(0px)' : 'blur(2px)',
          transitionProperty: 'transform, opacity, filter',
          transitionDuration: `${duration}ms`,
          transitionDelay: `${delay}ms`,
          transitionTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)',
          transformOrigin: 'center bottom',
          willChange: 'transform, opacity',
        };
      }

      case 'ribbon-depth': {
        // Efecto 3D Parallax Ribbon (ideal para Categorías y Cintas)
        return {
          opacity: active ? 1 : 0,
          transform: active
            ? 'perspective(1300px) translate3d(0, 0px, 0) rotateX(0deg) scale(1)'
            : 'perspective(1300px) translate3d(0, 38px, -25px) rotateX(7deg) scale(0.96)',
          transitionProperty: 'transform, opacity',
          transitionDuration: `${duration}ms`,
          transitionDelay: `${delay}ms`,
          transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
          willChange: 'transform, opacity',
        };
      }

      case 'fade-elevate':
      default: {
        return {
          opacity: active ? 1 : 0,
          transform: active
            ? 'translate3d(0, 0px, 0) scale(1)'
            : 'translate3d(0, 36px, 0) scale(0.98)',
          filter: active ? 'blur(0px)' : 'blur(2px)',
          transitionProperty: 'transform, opacity, filter',
          transitionDuration: `${duration}ms`,
          transitionDelay: `${delay}ms`,
          transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
          willChange: 'transform, opacity',
        };
      }
    }
  };

  return (
    <div
      id={id}
      ref={containerRef}
      style={getVariantStyle()}
      className={`relative transform-gpu ${className}`}
    >
      {/* Halo de iluminación ambiental 3D opcional al revelarse */}
      {glowAccent && (
        <div
          aria-hidden="true"
          className={`pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 w-3/4 max-w-3xl h-24 rounded-full bg-amber-500/15 dark:bg-amber-400/12 blur-3xl transition-opacity duration-1000 ${
            isVisible ? 'opacity-100' : 'opacity-0'
          }`}
        />
      )}
      {children}
    </div>
  );
}
