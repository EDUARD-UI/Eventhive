import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowRight, FiAward } from 'react-icons/fi';

// Imágenes predeterminadas de alta calidad para ambientar las categorías en Cartagena
const DEFAULT_CATEGORY_IMAGES = {
  musica: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=800&q=80',
  concierto: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=800&q=80',
  festival: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?auto=format&fit=crop&w=800&q=80',
  gastronomia: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80',
  cultura: 'https://images.unsplash.com/photo-1518998053901-5348d3961a04?auto=format&fit=crop&w=800&q=80',
  arte: 'https://images.unsplash.com/photo-1460661419200-1860a1df649f?auto=format&fit=crop&w=800&q=80',
  deportes: 'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?auto=format&fit=crop&w=800&q=80',
  tecnologia: 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&w=800&q=80',
  nocturna: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=800&q=80',
  teatro: 'https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?auto=format&fit=crop&w=800&q=80',
};

const getFallbackImage = (name = '') => {
  const lower = name.toLowerCase();
  for (const [key, url] of Object.entries(DEFAULT_CATEGORY_IMAGES)) {
    if (lower.includes(key)) return url;
  }
  return 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=800&q=80';
};

/**
 * HexCategoryCard
 * Tarjeta hexagonal regular para una categoría con microanimación de llenado de miel al activarse.
 */
export function HexCategoryCard({ category, onSelect }) {
  const [isPouringHoney, setIsPouringHoney] = useState(false);

  const imageUrl =
    category.urlFoto ||
    category.foto ||
    category.imagen ||
    getFallbackImage(category.nombre);

  const handleClick = () => {
    if (isPouringHoney) return;
    setIsPouringHoney(true);

    // Esperar a que la miel llene el panal antes de la redirección
    setTimeout(() => {
      onSelect(category);
    }, 420);
  };

  return (
    <div className="flex flex-col items-center group cursor-pointer" onClick={handleClick}>
      {/* Contenedor del Hexágono Regular Grande */}
      <div className="relative w-44 h-48 sm:w-52 sm:h-56 transition-transform duration-300 group-hover:scale-105 active:scale-95 filter drop-shadow-[0_12px_24px_rgba(0,0,0,0.45)]">
        {/* Borde exterior dorado hexagonal con Glow */}
        <div
          className={`absolute inset-0 clip-hexagon bg-gradient-to-b from-amber-400 via-amber-500 to-amber-600 transition-all duration-300 ${
            isPouringHoney
              ? 'ring-4 ring-amber-300 shadow-[0_0_35px_rgba(245,158,11,0.85)] scale-105'
              : 'group-hover:shadow-[0_0_25px_rgba(245,158,11,0.5)]'
          }`}
        />

        {/* Marco interior hexagonal (recorte de la imagen) */}
        <div className="absolute inset-[3px] clip-hexagon bg-[#0B1325] overflow-hidden">
          {/* Imagen de fondo de la categoría */}
          <div
            className="absolute inset-0 bg-cover bg-center transition-transform duration-700 ease-out group-hover:scale-110"
            style={{ backgroundImage: `url(${imageUrl})` }}
          />

          {/* Gradiente oscuro superpuesto para legibilidad óptima */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#060D1E] via-[#0B1325]/70 to-[#0B1325]/40 group-hover:via-[#0B1325]/50 transition-colors" />

          {/* ========================================================
              MICROANIMACIÓN DE MIEL: SE LLENA DE ABAJO HACIA ARRIBA
              ======================================================== */}
          {isPouringHoney && (
            <div className="absolute inset-x-0 bottom-0 z-30 animate-honey-fill bg-gradient-to-t from-amber-600 via-amber-500 to-yellow-400 overflow-hidden flex flex-col justify-start">
              {/* Ondas líquidas en la superficie de la miel */}
              <div className="w-[200%] h-6 -mt-3 flex animate-honey-wave opacity-90">
                <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="w-full h-full fill-amber-300">
                  <path d="M0,0 C150,90 350,-40 500,45 C650,130 900,10 1000,50 L1000,120 L0,120 Z" />
                </svg>
              </div>

              {/* Burbujitas de miel subiendo */}
              <div className="flex items-center justify-center flex-1">
                <span className="text-slate-950 font-black text-xs uppercase tracking-widest bg-white/40 px-2 py-0.5 rounded-full shadow-xs">
                  Cargando...
                </span>
              </div>
            </div>
          )}

          {/* Contenido centrado dentro del hexágono */}
          <div className="relative z-20 h-full w-full flex flex-col items-center justify-between p-5 text-center pointer-events-none">
            {/* Badge de cantidad de eventos en la parte superior */}
            <div className="mt-2">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-black/60 backdrop-blur-md text-amber-300 border border-amber-400/30 shadow-xs">
                <FiAward size={11} className="text-amber-400" />
                {category.totalEventos ?? 0} {category.totalEventos === 1 ? 'evento' : 'eventos'}
              </span>
            </div>

            {/* Nombre de la categoría en el centro inferior */}
            <div className="mb-3">
              <h3 className="font-display text-sm sm:text-base font-black uppercase text-white tracking-wide leading-tight drop-shadow-md group-hover:text-amber-300 transition-colors">
                {category.nombre}
              </h3>
              <p className="text-[10px] text-amber-200/80 font-semibold mt-0.5 flex items-center justify-center gap-1">
                <span>Ver planes</span>
                <FiArrowRight size={10} className="group-hover:translate-x-1 transition-transform" />
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const FALLBACK_CATEGORIES = [
  { id: '1', nombre: 'Festivales', totalEventos: 8, urlFoto: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?auto=format&fit=crop&w=800&q=80' },
  { id: '2', nombre: 'Conciertos', totalEventos: 14, urlFoto: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=800&q=80' },
  { id: '3', nombre: 'Gastronomía', totalEventos: 6, urlFoto: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80' },
  { id: '4', nombre: 'Arte & Cultura', totalEventos: 9, urlFoto: 'https://images.unsplash.com/photo-1460661419200-1860a1df649f?auto=format&fit=crop&w=800&q=80' },
  { id: '5', nombre: 'Vida Nocturna', totalEventos: 12, urlFoto: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=800&q=80' },
  { id: '6', nombre: 'Deportes', totalEventos: 4, urlFoto: 'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?auto=format&fit=crop&w=800&q=80' },
];

/**
 * HexCategoryFilter
 * Contenedor de la retícula de panal de categorías.
 */
export default function HexCategoryFilter({ categories = [] }) {
  const navigate = useNavigate();
  const displayCategories = categories.length > 0 ? categories : FALLBACK_CATEGORIES;

  const handleCategoryClick = (cat) => {
    navigate(`/buscar?categoriaId=${encodeURIComponent(cat.id)}&categoria=${encodeURIComponent(cat.nombre)}`);
  };

  return (
    <div className="w-full">
      {/* Retícula de hexágonos con espaciado orgánico */}
      <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-8 lg:gap-10 max-w-6xl mx-auto py-4">
        {displayCategories.map((cat) => (
          <HexCategoryCard
            key={cat.id || cat.nombre}
            category={cat}
            onSelect={handleCategoryClick}
          />
        ))}
      </div>
    </div>
  );
}
