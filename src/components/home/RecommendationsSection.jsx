import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { FiChevronLeft, FiChevronRight, FiArrowRight } from 'react-icons/fi';
import { getRecomendacionesParaTi } from '../../services/eventService.js';
import session from '../../services/session.js';
import EventListCard from '../common/EventListCard.jsx';
import EventCardSkeleton from '../common/EventCardSkeleton.jsx';
import HiveEmptyState from './HiveEmptyState.jsx';
import Scroll3DReveal from './Scroll3DReveal.jsx';
import { useLanguage } from '../../context/LanguageContext.jsx';

/**
 * AnimatedCardItem
 * Réplica exacta del efecto de inclinación 3D interactivo y brillo radial ámbar
 * que utiliza UpcomingEventsScrollShowcase al pasar el cursor.
 */
function AnimatedCardItem({ children }) {
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

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transform: tilt.isHovered
          ? `perspective(1200px) translate3d(0px, 0px, 14px) rotateX(${tilt.rotateX.toFixed(2)}deg) rotateY(${tilt.rotateY.toFixed(2)}deg) scale(1.02)`
          : 'perspective(1200px) translate3d(0px, 0px, 0px) rotateX(0deg) rotateY(0deg) scale(1)',
        transitionProperty: tilt.isHovered ? 'box-shadow' : 'transform',
        transitionDuration: tilt.isHovered ? '120ms' : '450ms',
        transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
        willChange: 'transform',
      }}
      className="relative group/showcase transform-gpu h-full"
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

/**
 * Hook para determinar la cantidad de tarjetas visibles según el viewport
 */
function useVisibleCardsCount() {
  const [count, setCount] = useState(() => {
    if (typeof window === 'undefined') return 5;
    if (window.innerWidth < 640) return 1;
    if (window.innerWidth < 768) return 2;
    if (window.innerWidth < 1024) return 3;
    if (window.innerWidth < 1280) return 4;
    return 5;
  });

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) setCount(1);
      else if (window.innerWidth < 768) setCount(2);
      else if (window.innerWidth < 1024) setCount(3);
      else if (window.innerWidth < 1280) setCount(4);
      else setCount(5);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return count;
}

/**
 * RecommendationsSection
 * Sección "Recomendaciones para ti":
 * - Se ubica entre "Próximos Eventos" y "Mapa de Eventos".
 * - Consulta asíncrona a GET /api/eventos/recomendaciones-para-ti enviando el id del usuario logueado si hay sesión.
 * - Reactiva a cambios de sesión (login/logout/actualizaciones).
 * - Muestra 5 tarjetas en desktop.
 * - Desplazamiento de 1 tarjeta por clic (no 5).
 * - Flechas blancas sin círculo contenedor ubicadas muy a los costados.
 * - Efecto hover 3D interactivo igual al de Próximos Eventos.
 * - Sin tag "especialmente para ti".
 */
export default function RecommendationsSection() {
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const visibleCards = useVisibleCardsCount();
  const [startIndex, setStartIndex] = useState(0);
  const [currentUser, setCurrentUser] = useState(() => session.getUser());

  // Suscripción asíncrona a cambios de sesión para refrescar recomendaciones de inmediato
  useEffect(() => {
    const handleSessionChange = (e) => {
      const updated = e?.detail ?? session.getUser();
      setCurrentUser(updated ? { ...updated } : null);
      queryClient.invalidateQueries({ queryKey: ['home-recommendations'] });
    };

    window.addEventListener('eventhive_session_updated', handleSessionChange);
    window.addEventListener('storage', handleSessionChange);
    return () => {
      window.removeEventListener('eventhive_session_updated', handleSessionChange);
      window.removeEventListener('storage', handleSessionChange);
    };
  }, [queryClient]);

  const userId = currentUser?.id ?? currentUser?.usuarioId ?? null;

  // Consulta asíncrona al backend
  const { data: rawEvents = [], isLoading } = useQuery({
    queryKey: ['home-recommendations', userId || 'guest'],
    queryFn: async () => {
      return await getRecomendacionesParaTi({ usuarioId: userId, size: 12 });
    },
    staleTime: 1000 * 60 * 3,
    refetchOnWindowFocus: true,
  });

  const events = Array.isArray(rawEvents) ? rawEvents : (rawEvents?.events || []);
  const maxIndex = Math.max(0, events.length - visibleCards);

  // Mantener startIndex dentro del rango si cambia la cantidad visible o la lista
  useEffect(() => {
    if (startIndex > maxIndex) {
      setStartIndex(maxIndex);
    }
  }, [maxIndex, startIndex]);

  // Al dar clic se avanza 1 card más (no 5)
  const handlePrev = () => {
    if (events.length <= visibleCards) return;
    setStartIndex((prev) => (prev <= 0 ? maxIndex : prev - 1));
  };

  const handleNext = () => {
    if (events.length <= visibleCards) return;
    setStartIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
  };

  return (
    <section
      id="recomendaciones"
      className="w-full px-4 sm:px-6 lg:px-10 py-12 sm:py-16 md:py-20 bg-slate-100/70 dark:bg-slate-950/40 transition-colors duration-200 overflow-hidden relative"
    >
      <div className="max-w-[1720px] mx-auto">
        <Scroll3DReveal variant="fade-elevate" duration={800}>
          <div className="flex flex-col items-center justify-center mb-10 text-center relative">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-950 dark:text-white tracking-tight uppercase">
              {t('home.recommendationsTitle') || 'Recomendaciones para ti'}
            </h2>

            <div className="mt-3">
              <Link
                to="/buscar"
                className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 transition-colors duration-200 group"
              >
                <span>{t('home.exploreMore') || 'Explorar más experiencias'}</span>
                <FiArrowRight size={14} className="transition-transform duration-200 group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        </Scroll3DReveal>

        {isLoading ? (
          <div className="relative max-w-[1720px] mx-auto px-8 sm:px-12 lg:px-16">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-5 items-start pt-2">
              {[0, 1, 2, 3, 4].map((idx) => (
                <EventCardSkeleton key={idx} aspectVariant="standard" />
              ))}
            </div>
          </div>
        ) : !events || events.length === 0 ? (
          <HiveEmptyState
            title={t('home.emptyRecommendationsTitle') || 'Recomendaciones para ti'}
            subtitle={
              t('home.emptyRecommendationsSubtitle') ||
              'Estamos preparando las mejores experiencias recomendadas según tus preferencias culturales. Vuelve pronto para descubrirlas.'
            }
            showAction={true}
            actionType="explore"
          />
        ) : (
          <div className="relative max-w-[1720px] mx-auto px-8 sm:px-12 lg:px-16 pt-2 pb-4">
            {/* Halo ambiental estático detrás del carrusel */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2/3 h-44 rounded-full bg-amber-500/10 dark:bg-amber-400/10 blur-3xl"
            />

            {/* Flecha Izquierda: Blanca, sin círculo contenedor, ubicada muy al costado */}
            {events.length > visibleCards && (
              <button
                type="button"
                onClick={handlePrev}
                aria-label="Recomendación anterior"
                className="absolute left-0 sm:left-1 lg:left-2 top-1/2 -translate-y-1/2 z-20 text-white hover:text-amber-400 p-1 sm:p-2 transition-transform duration-200 hover:scale-125 active:scale-95 cursor-pointer select-none drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]"
              >
                <FiChevronLeft className="w-8 h-8 sm:w-11 sm:h-11" strokeWidth={2.75} />
              </button>
            )}

            {/* Pista deslizable con ventana de visualización */}
            <div className="overflow-hidden w-full py-4">
              <div
                className="flex transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] -mx-2 sm:-mx-2.5"
                style={{
                  transform: `translateX(-${startIndex * (100 / visibleCards)}%)`,
                }}
              >
                {events.map((event, idx) => (
                  <div
                    key={event.id || idx}
                    className="shrink-0 px-2 sm:px-2.5"
                    style={{ width: `${100 / visibleCards}%` }}
                  >
                    <AnimatedCardItem>
                      <EventListCard event={event} aspectVariant="standard" equalHeight />
                    </AnimatedCardItem>
                  </div>
                ))}
              </div>
            </div>

            {/* Flecha Derecha: Blanca, sin círculo contenedor, ubicada muy al costado */}
            {events.length > visibleCards && (
              <button
                type="button"
                onClick={handleNext}
                aria-label="Siguiente recomendación"
                className="absolute right-0 sm:right-1 lg:right-2 top-1/2 -translate-y-1/2 z-20 text-white hover:text-amber-400 p-1 sm:p-2 transition-transform duration-200 hover:scale-125 active:scale-95 cursor-pointer select-none drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]"
              >
                <FiChevronRight className="w-8 h-8 sm:w-11 sm:h-11" strokeWidth={2.75} />
              </button>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
