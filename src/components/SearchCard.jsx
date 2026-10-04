import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ArrowRight } from 'lucide-react';

/**
 * SearchCard
 * Cápsula flotante blanca para el Home con alto contraste y legibilidad.
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
      {/* Resplandor suave */}
      <div
        aria-hidden="true"
        className="absolute -inset-1 rounded-3xl sm:rounded-full bg-amber-400/20 blur-xl opacity-60 group-hover:opacity-90 transition-opacity duration-300 pointer-events-none"
      />

      {/* Cápsula Flotante Blanca */}
      <form
        onSubmit={handleSearch}
        className="relative z-10 bg-white rounded-2xl sm:rounded-full border border-slate-200/90 p-2 sm:p-2.5 shadow-[0_20px_50px_rgba(0,0,0,0.25)] transition-all duration-200 ease-out flex flex-col sm:flex-row items-center gap-2"
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
          className="group/btn relative w-full sm:w-auto h-[46px] px-8 rounded-xl sm:rounded-full bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs sm:text-sm font-bold uppercase tracking-wider flex items-center justify-center gap-2.5 transition-all duration-200 active:scale-95 cursor-pointer shrink-0 shadow-sm"
        >
          <span className="font-bold tracking-wide">Buscar</span>
          <div className="w-5 h-5 rounded-full bg-slate-950 text-white flex items-center justify-center group-hover/btn:translate-x-0.5 transition-transform duration-200">
            <ArrowRight size={12} strokeWidth={2.5} />
          </div>
        </button>
      </form>
    </div>
  );
}
