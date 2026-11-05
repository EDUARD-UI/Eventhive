import React, { useEffect, useRef, useState } from 'react';
import EventListCard from '../common/EventListCard.jsx';
import EventCardSkeleton from '../common/EventCardSkeleton.jsx';
import HiveEmptyState from './HiveEmptyState.jsx';

/**
 * UpcomingEventsScrollShowcase
 * Showcase de "Próximos Eventos" con revelación 3D al entrar en el viewport.
 *
 * - Animación de entrada escalonada, activada una sola vez por IntersectionObserver.
 * - Inclinación 3D interactiva por tarjeta al pasar el cursor con brillo radial ámbar.
 * - Preserva íntegramente los datos, endpoints y redirecciones de EventListCard.
 */
function AnimatedCardItem({ children, index, isVisible }) {
  const cardRef = useRef(null);
  const [tilt, setTilt] = useState({ rotateX: 0, rotateY: 0, glowX: 50, glowY: 50, isHovered: false });

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -5;
    const rotateY = ((x - centerX) / centerX) * 5;
    const glowX = (x / rect.width) * 100;
    const glowY = (y / rect.height) * 100;

    setTilt({ rotateX, rotateY, glowX, glowY, isHovered: true });
  };

  const handleMouseLeave = () => {
    setTilt({ rotateX: 0, rotateY: 0, glowX: 50, glowY: 50, isHovered: false });
  };

  // Geometría de entrada por columna (efecto abanico 3D sutil y dinámico)
  const spreadOffsets = [
    { x: -28, y: 44, z: -40, ry: 9, rz: -2 },
    { x: -10, y: 30, z: -20, ry: 4, rz: -0.6 },
    { x: 10, y: 36, z: -20, ry: -4, rz: 0.6 },
    { x: 28, y: 50, z: -40, ry: -9, rz: 2 },
  ];

  const cfg = spreadOffsets[index % 4];
  const active = isVisible;

  const transformString = active
    ? `perspective(1200px) translate3d(0px, 0px, ${tilt.isHovered ? '14px' : '0px'}) rotateX(${tilt.rotateX.toFixed(2)}deg) rotateY(${tilt.rotateY.toFixed(2)}deg) rotateZ(0deg) scale(${tilt.isHovered ? 1.02 : 1})`
    : `perspective(1200px) translate3d(${cfg.x}px, ${cfg.y}px, ${cfg.z}px) rotateX(10deg) rotateY(${cfg.ry}deg) rotateZ(${cfg.rz}deg) scale(0.94)`;

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        opacity: active ? 1 : 0,
        transform: transformString,
        filter: active ? 'blur(0px)' : 'blur(3px)',
        transitionProperty: tilt.isHovered ? 'box-shadow' : 'transform, opacity, filter',
        transitionDuration: tilt.isHovered ? '120ms' : '450ms',
        transitionDelay: tilt.isHovered ? '0ms' : `${index * 50}ms`,
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

  useEffect(() => {
    const node = sectionRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.08, rootMargin: '0px 0px -30px 0px' }
    );

    observer.observe(node);

    return () => {
      observer.disconnect();
    };
  }, []);

  if (isLoading) {
    return (
      <div ref={sectionRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-start pt-2">
        {[0, 1, 2, 3].map((idx) => (
          <AnimatedCardItem
            key={idx}
            index={idx}
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
      {/* Halo ambiental estático detrás de las tarjetas */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2/3 h-44 rounded-full bg-amber-500/10 dark:bg-amber-400/10 blur-3xl"
      />

      {/* Grilla de tarjetas con efecto abanico 3D de entrada */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-7 items-stretch relative z-10">
        {displayedEvents.map((event, idx) => (
          <AnimatedCardItem
            key={event.id || idx}
            index={idx}
            isVisible={isVisible}
          >
            <EventListCard event={event} aspectVariant="standard" equalHeight />
          </AnimatedCardItem>
        ))}
      </div>
    </div>
  );
}
