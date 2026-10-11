import { Link } from 'react-router-dom';
import { FiArrowRight, FiTag } from 'react-icons/fi';
import ImageWithFallback from './common/ImageWithFallback.jsx';

/**
 * CategoryCard
 * Componente accesible de tarjeta de categoría para Event Hive:
 * - Modo Claro: sombra suave multidireccional (shadow-sm hover:shadow-md) y bordes border-slate-200
 * - Modo Oscuro: borde perimetral sutil (rgba(255, 255, 255, 0.07)) y elevación lumínica al hover (hover:bg-slate-800)
 * - Máscara linear-gradient(180deg, transparent 40%, rgba(0,0,0,0.85) 100%) para contraste de tipografía
 */
export default function CategoryCard({ category }) {
  if (!category) return null;

  const { id, nombre, totalEventos, urlFoto, foto, imagen, imagenUrl } = category;
  const photo = urlFoto || foto || imagen || imagenUrl;
  const count = totalEventos ?? 0;

  return (
    <article className="group relative rounded-2xl overflow-hidden bg-white dark:bg-[#151D2F] border border-slate-200 dark:border-white/[0.07] hover:border-slate-300 hover:dark:bg-slate-800 hover:dark:border-white/15 shadow-sm hover:shadow-md transition-all duration-300 card-interactive flex flex-col justify-between">
      {/* Portada multimedia con máscara de degradado inferior para garantizar legibilidad */}
      <div className="relative aspect-[16/10] overflow-hidden bg-slate-100 dark:bg-slate-900">
        {photo ? (
          <ImageWithFallback
            src={photo}
            alt={nombre}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
            fallbackText={nombre || 'Categoría'}
            iconSize={26}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 flex items-center justify-center">
            <FiTag className="text-slate-400 dark:text-slate-600" size={32} />
          </div>
        )}

        {/* Máscara linear-gradient(180deg, transparent 40%, rgba(0,0,0,0.85) 100%) */}
        <div
          className="absolute inset-0 pointer-events-none opacity-85 group-hover:opacity-95 transition-opacity duration-300"
          style={{
            background: 'linear-gradient(180deg, transparent 40%, rgba(0, 0, 0, 0.85) 100%)',
          }}
        />

        {/* Badge contador sobre la imagen con alto contraste */}
        <div className="absolute top-3 right-3 z-10">
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10.5px] font-bold uppercase tracking-wider bg-slate-950/80 text-amber-400 border border-slate-700/80 backdrop-blur-md shadow-xs">
            {count} {count === 1 ? 'evento' : 'eventos'}
          </span>
        </div>

        {/* Título superpuesto en la parte inferior de la imagen */}
        <div className="absolute bottom-3 left-3 right-3 z-10">
          <h3 className="font-display text-lg font-black text-white uppercase tracking-tight line-clamp-1 drop-shadow-md group-hover:text-amber-300 transition-colors duration-200">
            {nombre}
          </h3>
        </div>
      </div>

      {/* Pie de tarjeta con botón de acceso directo */}
      <div className="p-4 flex items-center justify-between border-t border-slate-100 dark:border-white/[0.07] bg-slate-50/70 dark:bg-[#0E1526]/80">
        <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
          Explorar cartelera
        </span>

        <Link
          to={`/buscar?categoriaId=${encodeURIComponent(id || '')}&categoria=${encodeURIComponent(nombre || '')}`}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-all duration-200 active:scale-95 shadow-xs focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
          aria-label={`Ver eventos de la categoría ${nombre}`}
        >
          <span>Ver</span>
          <FiArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>
    </article>
  );
}

