import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  FiCalendar,
  FiMapPin,
  FiArrowRight,
  FiChevronLeft,
  FiChevronRight,
} from 'react-icons/fi';
import { getCategoryGradient } from '../../utils/formatters.js';
import ImageWithFallback from '../common/ImageWithFallback.jsx';

/**
 * FeaturedEventsCarousel
 * Carrusel estilo banner/hero para la sección de Eventos Destacados.
 * - Deslizamiento automático que se detiene cuando el usuario hace clic en las flechas.
 * - Sin imagen de categoría en el banner: solo el nombre en una sección pequeña en amarillo arriba a la izquierda.
 * - Tipografía ajustada y equilibrada para no ocupar todo el espacio del slide.
 * - En móviles: solo muestra el título pequeño y el botón de dirección a detalle de evento.
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

  // Si el usuario hace clic en las flechas o indicadores, se pausa el auto-deslizamiento
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

  // Se desliza solo en caso de que el usuario no de click en las flechas
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

  // Manejo de gestos táctiles (swipe)
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
      className="relative w-full rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl border border-amber-200/80 bg-[#0D1527] select-none"
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
            'Vive esta experiencia cultural única en Cartagena de Indias. Conoce los detalles del programa, localidades y asegura tu entrada.';

          return (
            <div
              key={id || idx}
              className="w-full min-w-full flex-shrink-0 relative h-[320px] sm:h-[420px] md:h-[480px] lg:h-[520px] overflow-hidden bg-[#0D1527]"
            >
              <Link
                to={`/eventos/${id}`}
                className="group block w-full h-full relative overflow-hidden"
              >
                {/* Portada / Imagen con fallback limpio sin iconos superpuestos */}
                <ImageWithFallback
                  src={photo}
                  alt={title}
                  className="absolute inset-0 w-full h-full"
                  imgClassName="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                  fallbackClassName="absolute inset-0 w-full h-full"
                  fallbackGradient={getCategoryGradient(category)}
                  fallbackText=""
                  showText={false}
                  iconSize={0}
                />

                {/* Overlays de gradiente para contraste impecable */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0B172C] via-[#0B172C]/65 to-transparent pointer-events-none" />
                <div className="absolute inset-0 bg-gradient-to-r from-[#0B172C]/90 via-[#0B172C]/40 to-transparent pointer-events-none hidden sm:block" />

                {/* Sección pequeña en amarillo arriba a la izquierda con solo el nombre de la categoría */}
                <div className="absolute top-3.5 sm:top-6 left-3.5 sm:left-8 z-20">
                  <span className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-md text-[10px] sm:text-xs font-black uppercase tracking-wider bg-amber-400 text-slate-950 shadow-md">
                    <span>⬡</span>
                    <span>{category}</span>
                  </span>
                </div>

                {/* Contenido principal del slide */}
                <div className="absolute inset-0 flex flex-col justify-end p-4 sm:p-8 md:p-10 lg:p-12 z-10 pb-10 sm:pb-12">
                  <div className="max-w-xl md:max-w-2xl">
                    {/* Título: tamaño equilibrado para no ocupar todo el slide */}
                    <h3 className="font-display text-base sm:text-xl md:text-2xl lg:text-3xl font-black text-white leading-snug tracking-tight mb-1.5 sm:mb-2.5 drop-shadow-md group-hover:text-amber-300 transition-colors line-clamp-2">
                      {title}
                    </h3>

                    {/* Descripción: Oculta en teléfonos */}
                    <p className="hidden sm:block text-slate-200 text-xs sm:text-sm leading-relaxed line-clamp-2 mb-3 max-w-xl font-normal drop-shadow-sm">
                      {description || fallbackDesc}
                    </p>

                    {/* Metadatos (Fecha y Ubicación): Ocultos en teléfonos */}
                    <div className="hidden sm:flex flex-wrap items-center gap-2 sm:gap-3 text-xs text-slate-200 mb-4">
                      <div className="flex items-center gap-1.5 bg-[#0D1527]/85 backdrop-blur-md px-3 py-1 rounded-lg border border-amber-400/20 shadow-sm">
                        <FiCalendar className="text-amber-400 shrink-0" size={13.5} />
                        <span className="font-bold text-white">{date}</span>
                      </div>
                      <div className="flex items-center gap-1.5 bg-[#0D1527]/85 backdrop-blur-md px-3 py-1 rounded-lg border border-amber-400/20 shadow-sm">
                        <FiMapPin className="text-rose-400 shrink-0" size={13.5} />
                        <span className="font-medium text-slate-100">{location}</span>
                      </div>
                    </div>

                    {/* Botón / Dirección a detalle de evento */}
                    <div>
                      <span className="inline-flex items-center gap-2 px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-lg sm:rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 group-hover:from-amber-400 group-hover:to-yellow-300 text-slate-950 font-black text-xs sm:text-sm uppercase tracking-wider shadow-md hover:shadow-amber-500/25 transition-all">
                        <span>Ver evento</span>
                        <FiArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          );
        })}
      </div>

      {/* Flechas de navegación izquierda y derecha */}
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
            className="absolute left-2.5 sm:left-5 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-11 sm:h-11 rounded-full bg-black/45 hover:bg-[#0D1527] text-white hover:text-amber-300 border border-white/20 hover:border-amber-400/60 backdrop-blur-md flex items-center justify-center shadow-xl active:scale-95 transition-all cursor-pointer"
          >
            <FiChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleUserArrowClick('next');
            }}
            aria-label="Siguiente evento"
            className="absolute right-2.5 sm:right-5 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-11 sm:h-11 rounded-full bg-black/45 hover:bg-[#0D1527] text-white hover:text-amber-300 border border-white/20 hover:border-amber-400/60 backdrop-blur-md flex items-center justify-center shadow-xl active:scale-95 transition-all cursor-pointer"
          >
            <FiChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </>
      )}

      {/* Indicadores en barra/dash horizontales centrados en la parte inferior */}
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
              className={`h-1.5 sm:h-2 rounded-full transition-all duration-300 cursor-pointer ${
                currentIndex === idx
                  ? 'w-6 sm:w-10 bg-amber-400 shadow-md shadow-amber-400/50'
                  : 'w-3 sm:w-5 bg-white/40 hover:bg-white/70'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
