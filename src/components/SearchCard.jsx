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
    <div className="relative w-full max-w-2xl sm:max-w-[740px] mx-auto group">
      {/* Marco de acento amarillo colmena detrás, desplazado acorde a la imagen de referencia */}
      <div
        aria-hidden="true"
        className="absolute inset-0 translate-x-2 translate-y-2 sm:translate-x-2.5 sm:translate-y-2.5 rounded-2xl sm:rounded-3xl bg-[#F59E0B] pointer-events-none transition-transform duration-300 group-hover:translate-x-3 group-hover:translate-y-3"
      />

      {/* Tarjeta de Búsqueda con Fondo Blanco y Borde Ámbar Colmena */}
      <form
        onSubmit={handleSearch}
        className="relative z-10 bg-white rounded-2xl sm:rounded-3xl border-2 border-[#F59E0B] p-5 sm:p-6 sm:px-8 shadow-xl text-left transition-shadow duration-300 hover:shadow-2xl"
      >
        {/* Cabecera del Buscador */}
        <div className="flex items-start justify-between gap-4 mb-3 sm:mb-4">
          <div>
            <span className="text-[#007BFF] font-bold text-[11px] sm:text-xs uppercase tracking-wider block mb-0.5">
              ENCUENTRA TU PRÓXIMO PLAN
            </span>
            <h2 className="text-xl sm:text-2xl font-black uppercase text-[#0B132B] tracking-tight">
              BUSCAR EVENTOS
            </h2>
          </div>

          <div className="text-[#F59E0B] p-0.5 shrink-0">
            <FiSearch size={28} strokeWidth={2.5} />
          </div>
        </div>

        {/* Separador fino */}
        <div className="w-full h-px bg-slate-100 mb-4 sm:mb-5" />

        {/* Inputs de Título, Fecha y Botón de Búsqueda */}
        <div className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto] gap-3.5 sm:gap-4 items-end">
          {/* 1. Título del evento */}
          <div className="space-y-1">
            <label
              htmlFor="search-title"
              className="block text-xs font-bold text-slate-800"
            >
              Título del evento
            </label>
            <input
              id="search-title"
              type="text"
              value={titulo}
              onFocus={onInputFocus}
              onBlur={onInputBlur}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Ej. festival, concierto..."
              className="w-full h-11 bg-[#F8FAFC] border border-slate-200 focus:border-[#F59E0B] focus:bg-white rounded-xl px-3.5 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-[#F59E0B]/20 transition-all font-medium"
            />
          </div>

          {/* 2. Fecha */}
          <div className="space-y-1">
            <label
              htmlFor="search-date"
              className="block text-xs font-bold text-slate-800"
            >
              Fecha
            </label>
            <input
              id="search-date"
              type="date"
              value={fecha}
              onFocus={onInputFocus}
              onBlur={onInputBlur}
              onChange={(e) => setFecha(e.target.value)}
              className="w-full h-11 bg-[#F8FAFC] border border-slate-200 focus:border-[#F59E0B] focus:bg-white rounded-xl px-3.5 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-[#F59E0B]/20 transition-all font-medium"
            />
          </div>

          {/* 3. Botón Buscar */}
          <div>
            <button
              type="submit"
              className="w-full sm:w-auto h-11 px-7 rounded-xl bg-[#0B132B] hover:bg-[#1C2541] text-white text-xs sm:text-sm font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all duration-200 active:scale-95 cursor-pointer shadow-md shrink-0"
            >
              <span>BUSCAR</span>
              <FiArrowRight size={15} strokeWidth={2.5} />
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}