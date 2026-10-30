import React, { useEffect, useRef, useState } from 'react';
import EventListCard from '../common/EventListCard.jsx';
import EventCardSkeleton from '../common/EventCardSkeleton.jsx';
import HiveEmptyState from './HiveEmptyState.jsx';

/**
 * UpcomingEventsScrollShowcase
 * Showcase interactivo con animación sincronizada al scroll en 3D para la sección
 * de "Próximos Eventos" en el Home.
 *
 * - Abanico 3D progresivo (Fan-Out & Depth Parallax) conducido por el scroll real.
 * - Desfase de onda vertical entre columnas pares e impares al desplazarse.
 * - Inclinación 3D interactiva por tarjeta al pasar el cursor con brillo radial ámbar.
 * - Preserva íntegramente los datos, endpoints y redirecciones de EventListCard.
 */
function AnimatedCardItem({ children, index, scrollProgress, isVisible }) {
  const cardRef = useRef(null);
  const [tilt, setTilt] = useState({ rotateX: 0, rotateY: 0, glowX: 50, glowY: 50, isHovered: false });

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -6;
    const rotateY = ((x - centerX) / centerX) * 6;
    const glowX = (x / rect.width) * 100;
    const glowY = (y / rect.height) * 100;

    setTilt({ rotateX, rotateY, glowX, glowY, isHovered: true });
  };

  const handleMouseLeave = () => {
    setTilt({ rotateX: 0, rotateY: 0, glowX: 50, glowY: 50, isHovered: false });
  };

  // Geometría de entrada por columna (efecto abanico 3D desde el centro)
  const spreadOffsets = [
    { x: -38, y: 64, z: -55, ry: 12, rz: -2.5 },
    { x: -14, y: 44, z: -25, ry: 5, rz: -0.8 },
    { x: 14, y: 54, z: -25, ry: -5, rz: 0.8 },
    { x: 38, y: 74, z: -55, ry: -12, rz: 2.5 },
  ];

  const cfg = spreadOffsets[index % 4];
  const active = isVisible || scrollProgress > 0.12;

  // Parallax vertical sutil continuo mientras el usuario sigue bajando
  const isOdd = index % 2 !== 0;
  const parallaxWave = active
    ? (scrollProgress - 0.5) * (isOdd ? -14 : 14)
    : 0;

  const transformString = active
    ? `perspective(1200px) translate3d(0px, ${parallaxWave.toFixed(1)}px, ${tilt.isHovered ? '18px' : '0px'}) rotateX(${tilt.rotateX.toFixed(2)}deg) rotateY(${tilt.rotateY.toFixed(2)}deg) rotateZ(0deg) scale(${tilt.isHovered ? 1.025 : 1})`
    : `perspective(1200px) translate3d(${cfg.x}px, ${cfg.y}px, ${cfg.z}px) rotateX(14deg) rotateY(${cfg.ry}deg) rotateZ(${cfg.rz}deg) scale(0.91)`;

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        opacity: active ? 1 : 0,
        transform: transformString,
        filter: active ? 'blur(0px)' : 'blur(4px)',
        transitionProperty: tilt.isHovered ? 'box-shadow' : 'transform, opacity, filter',
        transitionDuration: tilt.isHovered ? '150ms' : '950ms',
        transitionDelay: tilt.isHovered ? '0ms' : `${index * 115}ms`,
        transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
        willChange: 'transform, opacity',
      }}
      className="relative group/showcase transform-gpu"
    >
      {/* Resplandor dinámico que sigue al cursor sobre la tarjeta */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -inset-[1.5px] rounded-[26px] opacity-0 group-hover/showcase:opacity-100 transition-opacity duration-300 z-0"
        style={{
          background: `radial-gradient(320px circle at ${tilt.glowX}% ${tilt.glowY}%, rgba(245, 158, 11, 0.45), transparent 70%)`,
        }}
      />

      <div className="relative z-10 h-full">{children}</div>
    </div>
  );
}

export default function UpcomingEventsScrollShowcase({
  events = [],
  isLoading = false,
  emptyTitle,
  emptySubtitle,
}) {
  const sectionRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const node = sectionRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );

    observer.observe(node);

    let rafId = null;
    const updateScroll = () => {
      if (rafId) return;
      rafId = requestAnimationFrame(() => {
        rafId = null;
        if (!sectionRef.current) return;
        const rect = sectionRef.current.getBoundingClientRect();
        const vh = window.innerHeight || 800;

        if (rect.top <= vh * 0.88) {
          setIsVisible(true);
        }

        const totalTravel = vh + rect.height;
        const currentTravel = vh - rect.top;
        const progress = Math.max(0, Math.min(1, currentTravel / totalTravel));
        setScrollProgress(progress);
      });
    };

    window.addEventListener('scroll', updateScroll, { passive: true });
    updateScroll();

    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', updateScroll);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  if (isLoading) {
    return (
      <div ref={sectionRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-start pt-2">
        {[0, 1, 2, 3].map((idx) => (
          <AnimatedCardItem
            key={idx}
            index={idx}
            scrollProgress={scrollProgress}
            isVisible={isVisible}
          >
            <EventCardSkeleton aspectVariant="standard" />
          </AnimatedCardItem>
        ))}
      </div>
    );
  }

  if (!events || events.length === 0) {
    return (
      <div ref={sectionRef}>
        <HiveEmptyState
          title={emptyTitle}
          subtitle={emptySubtitle}
          showAction={false}
        />
      </div>
    );
  }

  const displayedEvents = events.slice(0, 4);

  return (
    <div ref={sectionRef} className="relative pt-2 pb-4">
      {/* Halo ambiental de fondo que se desplaza horizontalmente con el scroll */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 left-1/2 -translate-y-1/2 w-2/3 h-44 rounded-full bg-amber-500/10 dark:bg-amber-400/10 blur-3xl transition-transform duration-300"
        style={{
          transform: `translate3d(${(scrollProgress - 0.5) * 120 - 50}%, -50%, 0)`,
        }}
      />

      {/* Grilla de tarjetas con efecto abanico 3D y desfase parallax */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-7 items-start relative z-10">
        {displayedEvents.map((event, idx) => (
          <AnimatedCardItem
            key={event.id || idx}
            index={idx}
            scrollProgress={scrollProgress}
            isVisible={isVisible}
          >
            <EventListCard event={event} aspectVariant="standard" />
          </AnimatedCardItem>
        ))}
      </div>


    </div>
  );
}
