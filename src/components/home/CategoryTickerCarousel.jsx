import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiArrowUpRight } from 'react-icons/fi';
import { getAllCategories } from '../../services/categoryService.js';
import ImageWithFallback from '../common/ImageWithFallback.jsx';
import { useLanguage } from '../../context/LanguageContext.jsx';

/**
 * CategoryTickerCarousel
 * Carrusel continuo de ancho completo con tarjetas interactivas vibrantes estilo Blendo:
 * - Fotografía nítida con elevación 3D e inclinación juguetona al pasar el cursor.
 * - Píldora flotante de conteo de eventos y botón circular emergente.
 * - Auto-scroll fluido con pausa suave al interactuar.
 */
export default function CategoryTickerCarousel() {
  const { t } = useLanguage();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    getAllCategories()
      .then((data) => {
        if (!isMounted) return;
        setCategories(data || []);
      })
      .catch(() => {})
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="w-full overflow-hidden py-5">
        <div className="flex justify-center gap-5 px-4 animate-pulse">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div
              key={n}
              className="w-[260px] sm:w-[300px] h-[165px] sm:h-[180px] rounded-3xl bg-slate-200 dark:bg-slate-800/80 border border-slate-300/70 dark:border-slate-700/60 shrink-0 p-5 flex flex-col justify-end"
            >
              <div className="w-3/4 h-6 bg-slate-300 dark:bg-slate-700 rounded-md mb-2" />
              <div className="w-1/3 h-4 bg-slate-300/80 dark:bg-slate-700/80 rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!categories || categories.length === 0) return null;

  const loopList = [...categories, ...categories, ...categories];

  // Acentos vibrantes rotativos para el borde e insignia en hover (inspiración Blendo)
  const accentStyles = [
    'hover:border-amber-400 hover:shadow-[0_10px_28px_-6px_rgba(245,158,11,0.45)]',
    'hover:border-emerald-400 hover:shadow-[0_10px_28px_-6px_rgba(16,185,129,0.4)]',
    'hover:border-sky-400 hover:shadow-[0_10px_28px_-6px_rgba(56,189,248,0.4)]',
    'hover:border-rose-400 hover:shadow-[0_10px_28px_-6px_rgba(251,113,133,0.4)]',
  ];

  return (
    <div className="w-full relative overflow-hidden py-6 select-none group [mask-image:linear-gradient(to_right,transparent,black_4%,black_96%,transparent)]">
      <div className="animate-marquee flex items-center gap-5 w-max py-2">
        {loopList.map((cat, index) => {
          const imageUrl = cat.imagenUrl || cat.urlFoto || cat.foto || cat.imagen;
          const accentClass = accentStyles[index % accentStyles.length];
          const tiltDirection = index % 2 === 0 ? 'hover:-rotate-1' : 'hover:rotate-1';

          return (
            <Link
              key={`${cat.id}-${index}`}
              to={`/buscar?categoriaId=${cat.id}`}
              className={`relative flex-shrink-0 w-[260px] sm:w-[300px] h-[150px] sm:h-[170px] rounded-3xl bg-slate-900 border-2 border-white/15 ${accentClass} ${tiltDirection} shadow-lg transition-all duration-300 ease-out overflow-hidden flex flex-col justify-between p-4 text-left group/item hover:-translate-y-2 hover:scale-[1.03]`}
            >
              {/* Fotografía de la categoría con zoom orgánico */}
              {imageUrl ? (
                <div className="absolute inset-0">
                  <ImageWithFallback
                    src={imageUrl}
                    alt={cat.nombre}
                    className="w-full h-full object-cover group-hover/item:scale-110 transition-transform duration-500 ease-out opacity-100 saturate-110"
                    showText={false}
                  />
                </div>
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-amber-600/40 via-[#0F1D38] to-slate-950" />
              )}

              {/* Máscara de contraste dinámico */}
              <div
                className="absolute inset-0 pointer-events-none opacity-85 group-hover/item:opacity-90 transition-opacity duration-300"
                style={{
                  background:
                    'linear-gradient(180deg, rgba(0,0,0,0.22) 0%, transparent 42%, rgba(7, 13, 27, 0.88) 100%)',
                }}
              />

              {/* Fila superior: Píldora flotante de conteo + Botón flecha animado */}
              <div className="relative z-10 flex items-center justify-between w-full">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/55 backdrop-blur-md border border-white/20 text-[10px] font-extrabold uppercase tracking-wider text-amber-300 shadow-xs">
                  <span>⬡</span>
                  <span>
                    {cat.totalEventos ?? 0}{' '}
                    {(cat.totalEventos ?? 0) === 1 ? t('home.eventSingular') : t('home.eventPlural')}
                  </span>
                </span>

                <span className="w-8 h-8 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center shadow-md opacity-0 scale-75 translate-y-2 group-hover/item:opacity-100 group-hover/item:scale-100 group-hover/item:translate-y-0 transition-all duration-300">
                  <FiArrowUpRight size={16} strokeWidth={2.5} />
                </span>
              </div>

              {/* Fila inferior: Título audaz con subrayado animado */}
              <div className="relative z-10 w-full min-w-0">
                <h4 className="text-base sm:text-lg font-black uppercase text-white truncate tracking-tight group-hover/item:text-amber-300 transition-colors duration-200 drop-shadow-md">
                  {cat.nombre}
                </h4>
                <div className="h-1 w-0 group-hover/item:w-12 bg-amber-400 rounded-full transition-all duration-300 mt-1" />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
