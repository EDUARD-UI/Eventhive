import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ArrowRight } from 'lucide-react';

/**
 * SearchCard
 * Cápsula flotante minimalista para el Home.
 * Solo contiene el input para buscar eventos por nombre y el botón de búsqueda.
 */
export default function SearchCard({ onInputFocus, onInputBlur }) {
  const navigate = useNavigate();
  const [titulo, setTitulo] = useState('');

  const handleSearch = (event) => {
    event.preventDefault();

    const params = new URLSearchParams();
    if (titulo.trim()) params.set('titulo', titulo.trim());

    navigate(`/buscar${params.toString() ? `?${params.toString()}` : ''}`);
  };

  return (
    <div className="relative w-full group max-w-3xl mx-auto">
      {/* Resplandor ambiental suave de miel/ámbar */}
      <div
        aria-hidden="true"
        className="absolute -inset-1 rounded-3xl sm:rounded-full bg-gradient-to-r from-amber-400/20 via-yellow-400/25 to-amber-400/20 blur-xl opacity-60 group-hover:opacity-90 transition-opacity duration-500 pointer-events-none"
      />

      {/* Cápsula Flotante Blanca */}
      <form
        onSubmit={handleSearch}
        className="relative z-10 bg-white rounded-2xl sm:rounded-full border border-amber-200/90 hover:border-amber-300 p-2 sm:p-2.5 shadow-[0_20px_50px_rgba(11,25,44,0.12),0_0_20px_rgba(245,158,11,0.1)] transition-all duration-300 hover:shadow-[0_25px_60px_rgba(11,25,44,0.16)] flex flex-col sm:flex-row items-center gap-2"
      >
        <div className="relative flex-1 w-full flex items-center">
          <Search
            size={18}
            className="absolute left-4 text-slate-400 pointer-events-none"
          />
          <input
            id="search-title"
            type="text"
            value={titulo}
            onFocus={onInputFocus}
            onBlur={onInputBlur}
            onChange={(e) => setTitulo(e.target.value)}
            placeholder="Buscar eventos por nombre..."
            className="w-full pl-11 pr-4 py-3 bg-transparent text-sm sm:text-base text-slate-900 placeholder:text-slate-400 outline-none font-medium"
          />
        </div>

        <button
          type="submit"
          className="group/btn relative w-full sm:w-auto h-[46px] px-8 rounded-xl sm:rounded-full bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 text-xs sm:text-sm font-black uppercase tracking-wider flex items-center justify-center gap-2.5 transition-all duration-300 shadow-md shadow-amber-500/20 hover:shadow-amber-500/35 hover:scale-[1.02] active:scale-[0.98] cursor-pointer shrink-0 overflow-hidden"
        >
          <span className="relative z-10 text-slate-950 font-black tracking-wide">Buscar</span>
          <div className="relative z-10 w-6 h-6 rounded-full bg-[#0B1B3D] text-amber-400 flex items-center justify-center group-hover/btn:translate-x-1 transition-transform">
            <ArrowRight size={13} strokeWidth={3} />
          </div>
        </button>
      </form>
    </div>
  );
}
