import { useRef, useState, useEffect, useCallback } from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import HiveFeaturedCard from './HiveFeaturedCard.jsx';

/**
 * FeaturedEventsCarousel
 * Carrusel horizontal interactivo y fluido para Eventos Destacados (máximo 8).
 * Conserva exactamente el diseño visual y dimensiones de HiveFeaturedCard.
 */
export default function FeaturedEventsCarousel({ events = [] }) {
  const carouselRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Limitar estrictamente a máximo 8 eventos
  const displayEvents = events.slice(0, 8);

  const checkScrollState = useCallback(() => {
    const el = carouselRef.current;
    if (!el) return;

    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanScrollLeft(scrollLeft > 8);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 8);

    // Calcular índice aproximado para los dots
    if (clientWidth > 0 && displayEvents.length > 0) {
      const cardWidth = el.firstElementChild?.clientWidth || clientWidth / 2;
      const index = Math.round(scrollLeft / cardWidth);
      setCurrentIndex(Math.min(Math.max(0, index), displayEvents.length - 1));
    }
  }, [displayEvents.length]);

  useEffect(() => {
    checkScrollState();
    const el = carouselRef.current;
    if (!el) return;

    window.addEventListener('resize', checkScrollState);
    return () => window.removeEventListener('resize', checkScrollState);
  }, [checkScrollState]);

  const scrollPrev = () => {
    const el = carouselRef.current;
    if (!el) return;
    const cardWidth = el.firstElementChild?.clientWidth || el.clientWidth / 2;
    el.scrollBy({ left: -cardWidth - 24, behavior: 'smooth' });
  };

  const scrollNext = () => {
    const el = carouselRef.current;
    if (!el) return;
    const cardWidth = el.firstElementChild?.clientWidth || el.clientWidth / 2;
    el.scrollBy({ left: cardWidth + 24, behavior: 'smooth' });
  };

  const scrollToIndex = (index) => {
    const el = carouselRef.current;
    if (!el) return;
    const cardWidth = el.firstElementChild?.clientWidth || el.clientWidth / 2;
    el.scrollTo({ left: index * (cardWidth + 24), behavior: 'smooth' });
  };

  if (!displayEvents || displayEvents.length === 0) return null;

  return (
    <div className="relative w-full">
      {/* Botones de navegación laterales para escritorio (flotantes a los costados) */}
      {displayEvents.length > 2 && (
        <>
          <button
            type="button"
            onClick={scrollPrev}
            disabled={!canScrollLeft}
            aria-label="Evento anterior"
            className="hidden md:flex absolute -left-4 lg:-left-6 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-white border border-amber-300/80 text-[#0B172C] hover:border-amber-400 hover:bg-amber-50 hover:text-amber-800 shadow-lg active:scale-95 transition-all items-center justify-center disabled:opacity-0 disabled:pointer-events-none"
          >
            <FiChevronLeft size={22} />
          </button>

          <button
            type="button"
            onClick={scrollNext}
            disabled={!canScrollRight}
            aria-label="Siguiente evento"
            className="hidden md:flex absolute -right-4 lg:-right-6 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-white border border-amber-300/80 text-[#0B172C] hover:border-amber-400 hover:bg-amber-50 hover:text-amber-800 shadow-lg active:scale-95 transition-all items-center justify-center disabled:opacity-0 disabled:pointer-events-none"
          >
            <FiChevronRight size={22} />
          </button>
        </>
      )}

      {/* Contenedor del carrusel con scroll-snap fluido */}
      <div
        ref={carouselRef}
        onScroll={checkScrollState}
        className="flex gap-6 overflow-x-auto scroll-smooth snap-x snap-mandatory no-scrollbar pb-6 pt-2 px-1"
      >
        {displayEvents.map((event) => (
          <div
            key={event.id}
            className="w-full md:w-[calc(50%-12px)] flex-shrink-0 snap-start flex"
          >
            <HiveFeaturedCard event={event} />
          </div>
        ))}
      </div>

      {/* Indicadores de puntos (dots) e info de navegación */}
      {displayEvents.length > 1 && (
        <div className="flex items-center justify-between mt-2 pt-2">
          {/* Dots */}
          <div className="flex items-center gap-2">
            {displayEvents.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => scrollToIndex(i)}
                aria-label={`Ir al evento ${i + 1}`}
                className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                  currentIndex === i
                    ? 'w-7 bg-amber-500 shadow-xs'
                    : 'w-2 bg-amber-200/80 hover:bg-amber-300'
                }`}
              />
            ))}
          </div>

          {/* Flechas pequeñas para móvil/tablet */}
          <div className="flex items-center gap-2 md:hidden">
            <button
              type="button"
              onClick={scrollPrev}
              disabled={!canScrollLeft}
              aria-label="Evento anterior"
              className="w-8 h-8 rounded-full bg-white border border-amber-200 text-slate-800 flex items-center justify-center shadow-xs disabled:opacity-30 active:scale-95"
            >
              <FiChevronLeft size={16} />
            </button>
            <button
              type="button"
              onClick={scrollNext}
              disabled={!canScrollRight}
              aria-label="Siguiente evento"
              className="w-8 h-8 rounded-full bg-white border border-amber-200 text-slate-800 flex items-center justify-center shadow-xs disabled:opacity-30 active:scale-95"
            >
              <FiChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
