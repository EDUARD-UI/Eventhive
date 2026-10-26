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
import ImageWithFallback from '../common/ImageWithFallback.jsx';

/**
 * FeaturedEventsCarousel
 * Carrusel panorámico refinado para Eventos Destacados:
 * - Proporción visual limpia (aspect ratio panorámico y escalado proporcional sin deformar ni recortar).
 * - Colores sobrios y bordes sutiles sin gradientes estridentes.
 * - Deslizamiento suave y controles accesibles con transiciones de 200ms.
 */
export default function FeaturedEventsCarousel({ events = [] }) {
  // Solo eventos elegibles devueltos por GET /api/eventos/carrusel con imagen destacada válida
  const displayEvents = (Array.isArray(events) ? events : [])
    .filter((e) => {
      const src =
        typeof e === 'string'
          ? e
          : e?.url_imagen_promocionado ||
            e?.urlImagenPromocionado ||
            e?.url_imagen_destacado ||
            e?.urlImagenDestacado ||
            e?.photo ||
            e?.imagen;
      return Boolean(src);
    })
    .slice(0, 10);

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

  if (!displayEvents || displayEvents.length === 0) {
    return (
      <div className="relative w-full rounded-2xl sm:rounded-3xl overflow-hidden shadow-lg border border-slate-800 bg-[#0B132B] aspect-[16/9] sm:aspect-[21/9] min-h-[240px] sm:min-h-[290px] md:min-h-[330px] max-h-[370px] sm:max-h-[390px] flex flex-col items-center justify-center p-6 sm:p-10 text-center select-none">
        {/* Fondo azul profundo institucional con gradiente */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0B132B] via-[#0D1D45] to-[#060B18]" />

        {/* Resplandores azul y ámbar sutiles */}
        <div className="absolute -top-24 -left-24 w-80 h-80 rounded-full bg-blue-600/15 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-80 h-80 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center justify-center max-w-lg space-y-3">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-amber-400 shadow-inner">
            <FiImage size={28} className="text-amber-400/90" />
          </div>
          <div className="space-y-1.5">
            <span className="inline-flex items-center px-3 py-1 rounded-md text-[11px] font-black uppercase tracking-wider bg-slate-900/90 text-amber-400 border border-slate-700/80">
              Carrusel Principal
            </span>
            <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
              Espacio para banners destacados
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 max-w-sm mx-auto">
              Aún no hay imágenes asignadas por marketing para este carrusel.
            </p>
          </div>
        </div>
      </div>
    );
  }

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
          const { id, eventoId, category, title, description, date, location, photo, hora } = event;
          const imageUrl =
            event.url_imagen_promocionado ||
            event.urlImagenPromocionado ||
            event.url_imagen_destacado ||
            event.urlImagenDestacado ||
            photo;

          const hasRealId = eventoId || (id && !String(id).startsWith('carrusel-'));
          const targetUrl = hasRealId ? `/eventos/${eventoId || id}` : '/eventos';

          const hasTitle = Boolean(title && title.trim() && title !== 'Evento Destacado');
          const hasCategory = Boolean(category && category.trim() && category !== 'Evento Destacado');
          const hasMeta = Boolean(date || location || hora);
          const hasOverlayContent = hasTitle || hasCategory || hasMeta;

          return (
            <div
              key={id || idx}
              className="w-full min-w-full flex-shrink-0 relative aspect-[16/9] sm:aspect-[21/9] min-h-[240px] sm:min-h-[290px] md:min-h-[330px] max-h-[370px] sm:max-h-[390px] overflow-hidden bg-[#0A1122]"
            >
              <Link
                to={targetUrl}
                className="group block w-full h-full relative overflow-hidden"
              >
                {/* Portada / Banner asignado por Marketing: sin deformaciones */}
                <ImageWithFallback
                  src={imageUrl}
                  alt={title || 'Banner promocional de evento'}
                  className="absolute inset-0 w-full h-full"
                  imgClassName="w-full h-full object-cover object-center group-hover:scale-103 transition-transform duration-700 ease-out"
                  fallbackClassName="absolute inset-0 w-full h-full bg-[#0B132B]"
                  fallbackText={title || 'Banner Destacado'}
                  showText={false}
                  iconSize={0}
                />

                {/* Si hay contenido textual oficial, mostramos overlay degradado legible; si es solo la foto de marketing, no oscurecemos la pieza publicitaria */}
                {hasOverlayContent ? (
                  <>
                    <div className="absolute inset-0 bg-gradient-to-t from-[#060B18]/85 via-[#060B18]/25 to-transparent pointer-events-none" />

                    {hasCategory && (
                      <div className="hidden lg:block absolute top-5 left-6 z-20">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-black uppercase tracking-wider bg-slate-900/90 text-amber-400 border border-slate-700 backdrop-blur-sm shadow-sm">
                          <span>{category}</span>
                        </span>
                      </div>
                    )}

                    <div className="absolute inset-0 flex flex-col justify-end p-4 sm:p-6 md:p-8 lg:p-10 z-10 pb-6 sm:pb-8 lg:pb-10">
                      <div className="max-w-xl md:max-w-2xl space-y-1.5 sm:space-y-2">
                        {hasTitle && (
                          <h3 className="text-base sm:text-xl md:text-2xl font-extrabold text-white leading-snug tracking-tight drop-shadow-sm group-hover:text-amber-300 transition-colors duration-200 line-clamp-2 uppercase">
                            {title}
                          </h3>
                        )}

                        {description && (
                          <p className="hidden lg:block text-slate-300 text-xs sm:text-sm leading-relaxed line-clamp-2 max-w-xl font-normal">
                            {description}
                          </p>
                        )}

                        {hasMeta && (
                          <div className="hidden lg:flex flex-wrap items-center gap-2 sm:gap-3 text-xs text-slate-300 pt-1">
                            {date && (
                              <div className="flex items-center gap-1.5 bg-slate-900/80 backdrop-blur-sm px-3 py-1 rounded-lg border border-slate-700">
                                <FiCalendar className="text-amber-400 shrink-0" size={13.5} />
                                <span className="font-semibold text-white">{date}</span>
                              </div>
                            )}
                            {location && (
                              <div className="flex items-center gap-1.5 bg-slate-900/80 backdrop-blur-sm px-3 py-1 rounded-lg border border-slate-700">
                                <FiMapPin className="text-slate-400 shrink-0" size={13.5} />
                                <span className="font-medium text-slate-200">{location}</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                ) : (
                  /* Banner puro colocado por marketing: degradado inferior sutil para la barra de navegación */
                  <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-[#060B18]/60 to-transparent pointer-events-none" />
                )}
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
