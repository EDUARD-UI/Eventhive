import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAllCategories } from '../../services/categoryService.js';
import ImageWithFallback from '../common/ImageWithFallback.jsx';

/**
 * CategoryTickerCarousel
 * Carrusel continuo de ancho completo ("full-width") con cards más grandes:
 * - Fotografía amplia y claramente visible.
 * 
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
        <div className="flex justify-center gap-4 px-4 animate-pulse">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div
              key={n}
              className="w-[260px] sm:w-[310px] h-[185px] sm:h-[210px] rounded-2xl bg-slate-200 dark:bg-slate-800/80 border border-slate-300/70 dark:border-slate-700/60 shrink-0 p-5 flex flex-col justify-end"
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

  // Duplicar categorías suficientes veces para bucle infinito sin saltos
  const loopList = [...categories, ...categories, ...categories];

  return (
    <div className="w-full relative overflow-hidden py-4 select-none group [mask-image:linear-gradient(to_right,transparent,black_4%,black_96%,transparent)]">
      {/* Tira animada continua sin sensación de recuadro */}
      <div className="animate-marquee flex items-center gap-4 w-max">
        {loopList.map((cat, index) => {
          const imageUrl = cat.imagenUrl || cat.urlFoto || cat.foto || cat.imagen;

          return (
            <Link
              key={`${cat.id}-${index}`}
              to={`/buscar?categoriaId=${cat.id}`}
              className="relative flex-shrink-0 w-[250px] sm:w-[290px] h-[135px] sm:h-[155px] rounded-2xl bg-slate-900 border-0 shadow-md hover:shadow-xl transition-all duration-300 ease-out overflow-hidden flex flex-col justify-end p-4 text-left group/item hover:scale-[1.03]"
            >
              {/* Fotografía de la categoría nítida, colorida y claramente visible */}
              {imageUrl ? (
                <div className="absolute inset-0">
                  <ImageWithFallback
                    src={imageUrl}
                    alt={cat.nombre}
                    className="w-full h-full object-cover group-hover/item:scale-105 transition-transform duration-500 ease-out opacity-100 saturate-105"
                    showText={false}
                  />
                </div>
              ) : (
                <div className="absolute inset-0 bg-slate-200 dark:bg-[#0F1D38]" />
              )}

              {/* Máscara suave en el borde inferior para legibilidad del texto sin apagar los colores */}
              <div
                className="absolute inset-0 pointer-events-none opacity-80 group-hover/item:opacity-90 transition-opacity duration-300"
                style={{
                  background: 'linear-gradient(180deg, transparent 55%, rgba(0, 0, 0, 0.75) 100%)',
                }}
              />

              {/* Contenido: Solo título y número de eventos con alto contraste */}
              <div className="relative z-10 w-full min-w-0">
                <h4 className="text-base sm:text-lg font-extrabold uppercase text-white truncate tracking-tight group-hover/item:text-amber-300 transition-colors duration-200 drop-shadow-sm">
                  {cat.nombre}
                </h4>
                <p className="text-xs text-slate-200 font-semibold mt-0.5 drop-shadow-xs">
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
