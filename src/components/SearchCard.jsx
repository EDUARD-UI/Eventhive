import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiSearch, FiArrowRight } from 'react-icons/fi';

/**
 * SearchCard
 * Restablece el diseño exacto de la tarjeta de búsqueda flotante con acento amarillo desplazado
 * según la imagen de referencia (media_1791174537681_5b7945c4.png),
 * utilizando fielmente la paleta de colores actual de EventHive:
 * - Acento de fondo colmena ámbar desplazado (#F59E0B)
 * - Tarjeta blanca con bordes redondeados y borde ámbar colmena (#F59E0B)
 * - Eyebrow azul de marca 'ENCUENTRA TU PRÓXIMO PLAN'
 * - Título en azul marino (#0B132B) 'BUSCAR EVENTOS'
 * - Lupa ámbar grande en la esquina superior derecha
 * - Entradas 'Título del evento' y 'Fecha' estilizadas con fondo suave (#F8FAFC)
 * - Botón 'BUSCAR ->' en azul marino (#0B132B) con texto blanco y flecha
 */
export default function SearchCard({ onInputFocus, onInputBlur }) {
  const navigate = useNavigate();
  const [titulo, setTitulo] = useState('');
  const [fecha, setFecha] = useState('');

  const handleSearch = (event) => {
    event.preventDefault();

    const params = new URLSearchParams();
    if (titulo.trim()) params.set('titulo', titulo.trim());
    if (fecha.trim()) params.set('fecha', fecha.trim());

    const queryString = params.toString();
    navigate(queryString ? `/buscar?${queryString}` : '/buscar');
  };

  return (
    <div className="relative w-full max-w-5xl mx-auto">
      {/* Tarjeta de Búsqueda estilizada, contenida y compacta */}
      <form
        onSubmit={handleSearch}
        className="relative bg-white/95 backdrop-blur-md rounded-2xl border border-slate-100 p-4 sm:p-5 sm:px-6 shadow-[0_12px_32px_-8px_rgba(11,19,43,0.18)] transition-all duration-300 hover:shadow-[0_18px_40px_-8px_rgba(11,19,43,0.22)]"
      >
        <div className="grid grid-cols-1 sm:grid-cols-[minmax(0,1fr)_auto] gap-3 sm:gap-3.5 items-end">
          {/* 1. Título o palabra clave del evento */}
          <div className="space-y-1.5 text-left">
            <label
              htmlFor="search-title"
              className="text-[11px] sm:text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5"
            >
              <span>¿Qué evento buscas?</span>
            </label>
            <div className="relative flex items-center">
              <FiSearch className="absolute left-3.5 text-slate-400 pointer-events-none" size={16} />
              <input
                id="search-title"
                type="text"
                value={titulo}
                onFocus={onInputFocus}
                onBlur={onInputBlur}
                onChange={(e) => setTitulo(e.target.value)}
                placeholder="Festival, concierto, teatro..."
                className="w-full h-11 bg-slate-50 border border-slate-200/90 focus:border-amber-500 focus:bg-white rounded-xl pl-10 pr-3.5 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:ring-3 focus:ring-amber-500/15 transition-all font-medium"
              />
            </div>
          </div>

          {/* 3. Botón de Búsqueda */}
          <div className="pt-1 sm:pt-0">
            <button
              type="submit"
              className="w-full sm:w-auto h-11 px-7 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs sm:text-sm font-extrabold uppercase tracking-wider flex items-center justify-center gap-2 transition-all duration-200 active:scale-95 cursor-pointer shadow-md shadow-amber-500/20 shrink-0"
            >
              <span>Buscar</span>
              <FiArrowRight size={15} strokeWidth={2.5} />
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}