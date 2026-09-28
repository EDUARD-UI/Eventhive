import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Calendar, Sparkles, ArrowRight } from 'lucide-react';

export default function SearchCard() {
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
      {/* Resplandor ambiental de fondo (Amber/Blue Glow) */}
      <div
        aria-hidden="true"
        className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-[#007BFF]/30 via-[#FFC107]/40 to-[#007BFF]/30 blur-xl opacity-75 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
      />

      {/* Tarjeta Flotante Premium con Glassmorphism y Bordes Redondeados */}
      <form
        onSubmit={handleSearch}
        className="relative z-10 bg-white/95 backdrop-blur-xl rounded-2xl sm:rounded-3xl border border-white/60 p-5 sm:p-7 shadow-[0_20px_50px_rgba(11,25,44,0.18)] transition-all duration-300 hover:shadow-[0_25px_60px_rgba(11,25,44,0.24)]"
      >
        {/* Cabecera del Buscador con Badge y Título */}
        <div className="flex items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#0B192C] text-[#FFC107] flex items-center justify-center shadow-md">
              <Search size={20} strokeWidth={2.5} />
            </div>
            <div>
              <span className="text-[11px] font-bold tracking-wider uppercase text-[#007BFF] flex items-center gap-1.5">
                <Sparkles size={12} className="text-[#FFC107]" />
                Encuentra tu próximo plan
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-[#0B192C] tracking-tight">
                BUSCAR EVENTOS
              </h2>
            </div>
          </div>
        </div>

        {/* Separador fino */}
        <div className="w-full h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent mb-4" />

        {/* Formulario de 2 inputs + Botón principal con microinteracción */}
        <div className="grid grid-cols-1 sm:grid-cols-[1.2fr_1fr_auto] gap-3.5 items-end">
          {/* 1. Título del evento */}
          <div className="space-y-1.5 text-left">
            <label
              htmlFor="search-title"
              className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block"
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
                onChange={(e) => setTitulo(e.target.value)}
                placeholder="Festival, concierto, arte..."
                className="w-full pl-10 pr-3 py-2.5 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 outline-none transition-all focus:border-[#007BFF] focus:ring-4 focus:ring-[#007BFF]/10 font-normal"
              />
            </div>
          </div>

          {/* 2. Fecha */}
          <div className="space-y-1.5 text-left">
            <label
              htmlFor="search-date"
              className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block"
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
                onChange={(e) => setFecha(e.target.value)}
                className="w-full pl-10 pr-3 py-2.5 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 outline-none transition-all focus:border-[#007BFF] focus:ring-4 focus:ring-[#007BFF]/10 font-normal"
              />
            </div>
          </div>

          {/* 3. Botón Buscar optimizado en Navy Profundo con interacción dorada */}
          <div>
            <button
              type="submit"
              className="group/btn relative w-full sm:w-auto h-[42px] px-7 rounded-xl bg-[#0B192C] hover:bg-[#0F172A] text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all duration-300 shadow-md hover:shadow-xl hover:shadow-[#0B192C]/25 active:scale-95 cursor-pointer border border-[#0B192C] overflow-hidden"
            >
              {/* Brillo dinámico en hover */}
              <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-[#FFC107]/20 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700 pointer-events-none" />

              <span className="relative z-10 text-white font-black tracking-wide">BUSCAR</span>
              <div className="relative z-10 w-6 h-6 rounded-lg bg-[#FFC107] text-[#0B192C] flex items-center justify-center group-hover/btn:translate-x-1 transition-transform">
                <ArrowRight size={13} strokeWidth={3} />
              </div>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
