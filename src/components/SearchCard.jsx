import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Calendar, Sparkles, ArrowRight } from 'lucide-react';

/**
 * SearchCard
 * Cápsula flotante moderna en fondo blanco limpio (bg-white) con borde cálido sutil,
 * sombra profunda y elementos en armonía con la paleta de la colmena y Cartagena.
 */
export default function SearchCard({ onInputFocus, onInputBlur }) {
  const navigate = useNavigate();
  const [titulo, setTitulo] = useState('');
  const [fecha, setFecha] = useState('');

  const handleSearch = (event) => {
    event.preventDefault();

    const params = new URLSearchParams();
    if (titulo.trim()) params.set('titulo', titulo.trim());
    if (fecha) params.set('fecha', fecha);

    navigate(`/buscar${params.toString() ? `?${params.toString()}` : ''}`);
  };

  return (
    <div className="relative w-full group">
      {/* Resplandor ambiental suave de miel/ámbar */}
      <div
        aria-hidden="true"
        className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-amber-400/20 via-yellow-400/25 to-amber-400/20 blur-xl opacity-60 group-hover:opacity-90 transition-opacity duration-500 pointer-events-none"
      />

      {/* Cápsula Flotante Blanca con Sombra 2xl y Borde Sutil Cálido */}
      <form
        onSubmit={handleSearch}
        className="relative z-10 bg-white rounded-2xl sm:rounded-3xl border border-amber-200/90 hover:border-amber-300 p-5 sm:p-7 shadow-[0_20px_50px_rgba(11,25,44,0.12),0_0_20px_rgba(245,158,11,0.1)] transition-all duration-300 hover:shadow-[0_25px_60px_rgba(11,25,44,0.16)]"
      >
        {/* Cabecera del Buscador con Icono de Lupa y Badge */}
        <div className="flex items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            {/* Contenedor del icono en azul marino de gala con acento dorado */}
            <div className="w-10 h-10 rounded-xl bg-[#0B1B3D] text-amber-400 flex items-center justify-center shadow-md shadow-[#0B1B3D]/20 shrink-0">
              <Search size={20} strokeWidth={2.5} />
            </div>
            <div>
              <span className="text-[11px] font-black tracking-wider uppercase text-amber-900 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200/80 inline-flex items-center gap-1.5 shadow-2xs">
                <Sparkles size={12} className="text-amber-600" />
                Encuentra tu próximo plan
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-[#0B1B3D] tracking-tight">
                BUSCAR EXPERIENCIAS
              </h2>
            </div>
          </div>
        </div>

        {/* Separador fino suave */}
        <div className="w-full h-px bg-gradient-to-r from-transparent via-amber-200/70 to-transparent mb-4" />

        {/* Formulario con 2 inputs limpios + Botón dorado de acción */}
        <div className="grid grid-cols-1 sm:grid-cols-[1.2fr_1fr_auto] gap-3.5 items-end">
          {/* 1. Título del evento */}
          <div className="space-y-1.5 text-left">
            <label
              htmlFor="search-title"
              className="text-xs font-black text-slate-700 uppercase tracking-wider block"
            >
              ¿Qué quieres vivir?
            </label>
            <div className="relative">
              <Search
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
              />
              <input
                id="search-title"
                type="text"
                value={titulo}
                onFocus={onInputFocus}
                onBlur={onInputBlur}
                onChange={(e) => setTitulo(e.target.value)}
                placeholder="Festival, concierto, arte, gastronomía..."
                className="w-full pl-10 pr-3 py-2.5 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 focus:border-amber-400 focus:ring-4 focus:ring-amber-400/15 rounded-xl text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 outline-none transition-all font-normal shadow-2xs"
              />
            </div>
          </div>

          {/* 2. Fecha */}
          <div className="space-y-1.5 text-left">
            <label
              htmlFor="search-date"
              className="text-xs font-black text-slate-700 uppercase tracking-wider block"
            >
              ¿Cuándo?
            </label>
            <div className="relative">
              <Calendar
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
              />
              <input
                id="search-date"
                type="date"
                value={fecha}
                onFocus={onInputFocus}
                onBlur={onInputBlur}
                onChange={(e) => setFecha(e.target.value)}
                className="w-full pl-10 pr-3 py-2.5 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 focus:border-amber-400 focus:ring-4 focus:ring-amber-400/15 rounded-xl text-xs sm:text-sm text-slate-800 outline-none transition-all font-normal shadow-2xs"
              />
            </div>
          </div>

          {/* 3. Botón Buscar en Gradiente Dorado con Flecha */}
          <div>
            <button
              type="submit"
              className="group/btn relative w-full sm:w-auto h-[42px] px-7 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all duration-300 shadow-md shadow-amber-500/20 hover:shadow-amber-500/35 hover:scale-[1.02] active:scale-[0.98] cursor-pointer overflow-hidden"
            >
              {/* Brillo dinámico en hover */}
              <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/35 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700 pointer-events-none" />

              <span className="relative z-10 text-slate-950 font-black tracking-wide">BUSCAR</span>
              <div className="relative z-10 w-6 h-6 rounded-lg bg-[#0B1B3D] text-amber-400 flex items-center justify-center group-hover/btn:translate-x-1 transition-transform">
                <ArrowRight size={13} strokeWidth={3} />
              </div>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
