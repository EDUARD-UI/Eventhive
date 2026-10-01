import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  FiCalendar,
  FiMapPin,
  FiArrowRight,
  FiChevronLeft,
  FiChevronRight,
  FiImage,
} from 'react-icons/fi';
import { getCategoryGradient } from '../../utils/formatters.js';
import ImageWithFallback from '../common/ImageWithFallback.jsx';

/**
 * FeaturedEventsCarousel
 * Carrusel estilo banner/hero ultra-panorámico para la sección de Eventos Destacados en el Home.
 * Diseñado para aprovechar pantallas grandes (16 pulgadas y monitores amplios)
 * con auto-deslizamiento que se detiene cuando el usuario interactúa con las flechas,
 * y separación visual para que el título nunca tape el logo/placeholder de imagen.
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

  // Si el usuario hace clic en las flechas, se pausa el auto-deslizamiento
  const handleUserArrowClick = (direction) => {
    if (direction === 'next') {
      nextSlide();
    } else {
      prevSlide();
    }
    // Marcamos que el usuario tomó control manual con las flechas
    setManualInteraction(true);

    // Si pasan 15 segundos sin interacción manual, se reactiva el auto-slide
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

  // Se desliza solo en caso de que el usuario no de clic en las flechas
  useEffect(() => {
    if (total <= 1 || isPaused || manualInteraction) return;

    timerRef.current = setInterval(() => {
      nextSlide();
    }, 5000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [total, isPaused, manualInteraction, nextSlide]);

  // Limpieza de timeouts al desmontar
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
      className="relative w-full rounded-3xl overflow-hidden shadow-2xl border border-amber-200/80 bg-[#0D1527] select-none"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Tira deslizante de slides */}
      <div
        className="flex w-full transition-transform duration-600 ease-out"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {displayEvents.map((event, idx) => {
          const { id, category, title, description, date, location, photo } = event;
          const fallbackDesc =
            'Vive esta experiencia cultural única en Cartagena de Indias. Conoce los detalles del programa, localidades y asegura tu entrada.';

          return (
            <div
              key={id || idx}
              className="w-full min-w-full flex-shrink-0 relative aspect-[16/11] sm:aspect-[16/7] md:aspect-[21/9] lg:aspect-[23/9] min-h-[460px] sm:min-h-[500px] lg:min-h-[540px] xl:min-h-[570px]"
            >
              <Link
                to={`/eventos/${id}`}
                className="group block w-full h-full relative overflow-hidden"
              >
                {/* Portada / Imagen con fallback (desactivamos showText e iconSize=0 para evitar iconos en el centro) */}
                <ImageWithFallback
                  src={photo}
                  alt={title}
                  className="w-full h-full"
                  imgClassName="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                  fallbackClassName="w-full h-full"
                  fallbackGradient={getCategoryGradient(category)}
                  fallbackText=""
                  showText={false}
                  iconSize={0}
                />

                {/* Overlays de gradiente para contraste impecable */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0B172C] via-[#0B172C]/70 to-transparent pointer-events-none" />
                <div className="absolute inset-0 bg-gradient-to-r from-[#0B172C]/95 via-[#0B172C]/50 to-transparent pointer-events-none hidden sm:block" />

                {/* Logo / Badge de imagen en el lado derecho cuando no hay imagen cargada (NUNCA tapa el título) */}
                {!photo && (
                  <div className="absolute right-8 sm:right-16 lg:right-28 xl:right-36 top-1/2 -translate-y-1/2 z-10 hidden md:flex flex-col items-center justify-center p-8 lg:p-10 rounded-3xl bg-white/10 border border-white/20 backdrop-blur-md text-white shadow-2xl pointer-events-none group-hover:scale-105 transition-transform duration-500">
                    <div className="w-20 h-20 lg:w-24 lg:h-24 rounded-2xl bg-amber-400/20 border border-amber-400/40 flex items-center justify-center mb-3 text-amber-300 shadow-inner">
                      <FiImage size={42} className="drop-shadow" />
                    </div>
                    <span className="text-xs lg:text-sm font-black uppercase tracking-widest text-amber-300 drop-shadow-sm text-center">
                      {category}
                    </span>
                    <span className="text-[11px] text-slate-200 mt-1 font-semibold opacity-85">
                      Cartagena Cultural
                    </span>
                  </div>
                )}

                {/* Contenido principal del slide (alineado a la izquierda con amplio espacio) */}
                <div className="absolute inset-0 flex flex-col justify-end p-6 sm:p-10 md:p-12 lg:p-16 z-10 pb-14 sm:pb-16">
                  <div className="max-w-xl md:max-w-2xl lg:max-w-3xl">
                    {/* Badge de Categoría con el azul del navbar */}
                    <div className="mb-3">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-[11px] font-black uppercase tracking-widest text-white bg-[#0D1527] border border-amber-400/40 shadow-md">
                        <span className="text-amber-400">⬡</span>
                        <span>{category}</span>
                      </span>
                    </div>

                    {/* Título (completamente libre de colisiones) */}
                    <h3 className="font-display text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-white leading-tight tracking-tight mb-3 drop-shadow-md group-hover:text-amber-300 transition-colors line-clamp-2">
                      {title}
                    </h3>

                    {/* Descripción */}
                    <p className="text-slate-200 text-xs sm:text-sm md:text-base leading-relaxed line-clamp-2 sm:line-clamp-3 mb-4 max-w-2xl font-normal drop-shadow-sm">
                      {description || fallbackDesc}
                    </p>

                    {/* Metadatos: Fecha y Ubicación */}
                    <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-slate-200 mb-6">
                      <div className="flex items-center gap-2 bg-[#0D1527]/85 backdrop-blur-md px-3 py-1.5 rounded-lg border border-amber-400/20 shadow-sm">
                        <FiCalendar className="text-amber-400 shrink-0" size={15} />
                        <span className="font-bold text-white">{date}</span>
                      </div>
                      <div className="flex items-center gap-2 bg-[#0D1527]/85 backdrop-blur-md px-3 py-1.5 rounded-lg border border-amber-400/20 shadow-sm">
                        <FiMapPin className="text-rose-400 shrink-0" size={15} />
                        <span className="font-medium text-slate-100">{location}</span>
                      </div>
                    </div>

                    {/* Botón de acción */}
                    <div>
                      <span className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 group-hover:from-amber-400 group-hover:to-yellow-300 text-slate-950 font-black text-xs sm:text-sm uppercase tracking-wider shadow-lg shadow-amber-500/25 transition-all">
                        <span>Ver detalles del evento</span>
                        <FiArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
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
            className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-black/45 hover:bg-[#0D1527] text-white hover:text-amber-300 border border-white/20 hover:border-amber-400/60 backdrop-blur-md flex items-center justify-center shadow-xl active:scale-95 transition-all cursor-pointer"
          >
            <FiChevronLeft size={24} />
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleUserArrowClick('next');
            }}
            aria-label="Siguiente evento"
            className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-black/45 hover:bg-[#0D1527] text-white hover:text-amber-300 border border-white/20 hover:border-amber-400/60 backdrop-blur-md flex items-center justify-center shadow-xl active:scale-95 transition-all cursor-pointer"
          >
            <FiChevronRight size={24} />
          </button>
        </>
      )}

      {/* Indicadores en barra/dash horizontales centrados en la parte inferior */}
      {total > 1 && (
        <div className="absolute bottom-4 sm:bottom-5 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
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
                  ? 'w-8 sm:w-12 bg-amber-400 shadow-md shadow-amber-400/50'
                  : 'w-4 sm:w-6 bg-white/40 hover:bg-white/70'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
