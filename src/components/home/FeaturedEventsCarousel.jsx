import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  FiCalendar,
  FiMapPin,
  FiArrowRight,
  FiChevronLeft,
  FiChevronRight,
} from 'react-icons/fi';
import ImageWithFallback from '../common/ImageWithFallback.jsx';

/**
 * FeaturedEventsCarousel
 * Carrusel panorámico refinado para Eventos Destacados:
 * - Proporción visual limpia (aspect ratio panorámico y escalado proporcional sin deformar ni recortar).
 * - Colores sobrios y bordes sutiles sin gradientes estridentes.
 * - Deslizamiento suave y controles accesibles con transiciones de 200ms.
 */
export default function FeaturedEventsCarousel({ events = [] }) {
  const displayEvents = events.slice(0, 8);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [manualInteraction, setManualInteraction] = useState(false);
  const timerRef = useRef(null);
  const manualTimeoutRef = useRef(null);

  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  const total = displayEvents.length;

  const nextSlide = useCallback(() => {
    if (total <= 1) return;
    setCurrentIndex((prev) => (prev + 1) % total);
  }, [total]);

  const prevSlide = useCallback(() => {
    if (total <= 1) return;
    setCurrentIndex((prev) => (prev - 1 + total) % total);
  }, [total]);

  const handleUserArrowClick = (direction) => {
    if (direction === 'next') {
      nextSlide();
    } else {
      prevSlide();
    }
    setManualInteraction(true);

    if (manualTimeoutRef.current) clearTimeout(manualTimeoutRef.current);
    manualTimeoutRef.current = setTimeout(() => {
      setManualInteraction(false);
    }, 15000);
  };

  const handleUserIndicatorClick = (idx) => {
    setCurrentIndex(idx);
    setManualInteraction(true);
    if (manualTimeoutRef.current) clearTimeout(manualTimeoutRef.current);
    manualTimeoutRef.current = setTimeout(() => {
      setManualInteraction(false);
    }, 15000);
  };

  useEffect(() => {
    if (total <= 1 || isPaused || manualInteraction) return;

    timerRef.current = setInterval(() => {
      nextSlide();
    }, 5000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [total, isPaused, manualInteraction, nextSlide]);

  useEffect(() => {
    return () => {
      if (manualTimeoutRef.current) clearTimeout(manualTimeoutRef.current);
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const diff = touchStartX.current - touchEndX.current;
    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        handleUserArrowClick('next');
      } else {
        handleUserArrowClick('prev');
      }
    }
    touchStartX.current = 0;
    touchEndX.current = 0;
  };

  if (!displayEvents || displayEvents.length === 0) return null;

  return (
    <div
      className="relative w-full rounded-3xl overflow-hidden shadow-xl border border-slate-800 bg-[#0B132B] select-none"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Tira deslizante de slides */}
      <div
        className="flex w-full transition-transform duration-500 ease-out"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {displayEvents.map((event, idx) => {
          const { id, category, title, description, date, location, photo } = event;
          const fallbackDesc =
            'Vive esta experiencia cultural en Cartagena de Indias. Conoce los detalles de programación, localidades y asegura tu entrada.';

          return (
            <div
              key={id || idx}
              className="w-full min-w-full flex-shrink-0 relative aspect-[16/9] sm:aspect-[21/9] min-h-[340px] max-h-[480px] overflow-hidden bg-[#0A1122]"
            >
              <Link
                to={`/eventos/${id}`}
                className="group block w-full h-full relative overflow-hidden"
              >
                {/* Portada / Imagen con object-cover centrado sin deformaciones */}
                <ImageWithFallback
                  src={photo}
                  alt={title}
                  className="absolute inset-0 w-full h-full"
                  imgClassName="w-full h-full object-cover object-center group-hover:scale-103 transition-transform duration-700 ease-out"
                  fallbackClassName="absolute inset-0 w-full h-full bg-[#0B132B]"
                  fallbackText={title}
                  showText={false}
                  iconSize={0}
                />

                {/* Overlays oscuros sobrios para legibilidad impecable */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#060B18]/95 via-[#060B18]/50 to-transparent pointer-events-none" />
                <div className="absolute inset-0 bg-gradient-to-r from-[#060B18]/85 via-transparent to-transparent pointer-events-none hidden sm:block" />

                {/* Badge de Categoría: solo en desktop */}
                <div className="hidden lg:block absolute top-6 left-8 z-20">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-black uppercase tracking-wider bg-slate-900/90 text-amber-400 border border-slate-700 backdrop-blur-sm shadow-sm">
                    <span>⬡</span>
                    <span>{category}</span>
                  </span>
                </div>

                {/* Contenido principal del slide */}
                <div className="absolute inset-0 flex flex-col justify-end p-5 sm:p-8 md:p-10 lg:p-12 z-10 pb-8 sm:pb-10 lg:pb-14">
                  <div className="max-w-xl md:max-w-2xl space-y-2">
                    {/* Título: Siempre visible */}
                    <h3 className="text-lg sm:text-2xl md:text-3xl font-extrabold text-white leading-snug tracking-tight drop-shadow-sm group-hover:text-amber-300 transition-colors duration-200 line-clamp-2 uppercase">
                      {title}
                    </h3>

                    {/* Descripción: Solo en desktop (oculta en tablets y móviles) */}
                    <p className="hidden lg:block text-slate-300 text-xs sm:text-sm leading-relaxed line-clamp-2 max-w-xl font-normal">
                      {description || fallbackDesc}
                    </p>

                    {/* Metadatos (Fecha y Ubicación): Solo en desktop (ocultos en tablets y móviles) */}
                    <div className="hidden lg:flex flex-wrap items-center gap-2 sm:gap-3 text-xs text-slate-300 pt-1">
                      <div className="flex items-center gap-1.5 bg-slate-900/80 backdrop-blur-sm px-3 py-1 rounded-lg border border-slate-700">
                        <FiCalendar className="text-amber-400 shrink-0" size={13.5} />
                        <span className="font-semibold text-white">{date}</span>
                      </div>
                      <div className="flex items-center gap-1.5 bg-slate-900/80 backdrop-blur-sm px-3 py-1 rounded-lg border border-slate-700">
                        <FiMapPin className="text-slate-400 shrink-0" size={13.5} />
                        <span className="font-medium text-slate-200">{location}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          );
        })}
      </div>

      {/* Flechas de navegación */}
      {total > 1 && (
        <>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleUserArrowClick('prev');
            }}
            aria-label="Evento anterior"
            className="absolute left-3 sm:left-5 top-1/2 -translate-y-1/2 z-20 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-slate-900/80 hover:bg-slate-900 text-white hover:text-amber-400 border border-slate-700/80 backdrop-blur-sm flex items-center justify-center shadow-lg active:scale-95 transition-all duration-200 cursor-pointer"
          >
            <FiChevronLeft className="w-5 h-5" />
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleUserArrowClick('next');
            }}
            aria-label="Siguiente evento"
            className="absolute right-3 sm:right-5 top-1/2 -translate-y-1/2 z-20 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-slate-900/80 hover:bg-slate-900 text-white hover:text-amber-400 border border-slate-700/80 backdrop-blur-sm flex items-center justify-center shadow-lg active:scale-95 transition-all duration-200 cursor-pointer"
          >
            <FiChevronRight className="w-5 h-5" />
          </button>
        </>
      )}

      {/* Indicadores horizontales */}
      {total > 1 && (
        <div className="absolute bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 sm:gap-2">
          {displayEvents.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleUserIndicatorClick(idx);
              }}
              aria-label={`Ir al evento ${idx + 1}`}
              className={`h-1.5 sm:h-2 rounded-full transition-all duration-200 cursor-pointer ${
                currentIndex === idx
                  ? 'w-6 sm:w-9 bg-amber-400'
                  : 'w-2.5 sm:w-4 bg-white/40 hover:bg-white/70'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
