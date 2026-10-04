import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAllCategories } from '../../services/categoryService.js';
import ImageWithFallback from '../common/ImageWithFallback.jsx';

/**
 * CategoryTickerCarousel
 * Carrusel continuo de ancho completo ("full-width") con cards más grandes:
 * - Fotografía amplia y claramente visible.
 * - Sin logo de colmena.
 * - Solo muestra el título y el número de eventos.
 * - Se mueve de manera continua automática (auto-scroll) con pausa suave al hover.
 */
export default function CategoryTickerCarousel() {
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
      <div className="w-full overflow-hidden py-4">
        <div className="flex gap-4 px-4 animate-pulse">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div
              key={n}
              className="w-[260px] sm:w-[300px] h-[140px] sm:h-[160px] rounded-2xl bg-slate-800/80 border border-slate-700/60 shrink-0"
            />
          ))}
        </div>
      </div>
    );
  }

  if (!categories || categories.length === 0) return null;

  // Duplicar categorías suficientes veces para bucle infinito sin saltos
  const loopList = [...categories, ...categories, ...categories];

  return (
    <div className="w-full relative overflow-hidden py-4 select-none group">
      {/* Tira animada continua */}
      <div className="animate-marquee flex items-center gap-4 w-max">
        {loopList.map((cat, index) => {
          const imageUrl = cat.imagenUrl || cat.urlFoto || cat.foto || cat.imagen;

          return (
            <Link
              key={`${cat.id}-${index}`}
              to={`/buscar?categoriaId=${cat.id}`}
              className="relative flex-shrink-0 w-[250px] sm:w-[290px] h-[135px] sm:h-[155px] rounded-2xl bg-[#0B1428] border border-slate-800 hover:border-slate-600 transition-all duration-300 ease-out overflow-hidden flex flex-col justify-end p-4 text-left shadow-lg group/item hover:scale-[1.02]"
            >
              {/* Fotografía de la categoría nítida y visible */}
              {imageUrl ? (
                <div className="absolute inset-0">
                  <ImageWithFallback
                    src={imageUrl}
                    alt={cat.nombre}
                    className="w-full h-full object-cover group-hover/item:scale-105 transition-transform duration-500 ease-out opacity-75 group-hover/item:opacity-90"
                    showText={false}
                  />
                </div>
              ) : (
                <div className="absolute inset-0 bg-[#0F1D38]" />
              )}

              {/* Degradado inferior para legibilidad del texto */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-none" />

              {/* Contenido: Solo título y número de eventos (sin logo de colmena) */}
              <div className="relative z-10 w-full min-w-0">
                <h4 className="text-base sm:text-lg font-extrabold uppercase text-white truncate tracking-tight group-hover/item:text-amber-300 transition-colors duration-200">
                  {cat.nombre}
                </h4>
                <p className="text-xs text-slate-300 font-semibold mt-0.5">
                  {cat.totalEventos ?? 0} {(cat.totalEventos ?? 0) === 1 ? 'evento' : 'eventos'}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
