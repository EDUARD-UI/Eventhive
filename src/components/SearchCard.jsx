import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiSearch, FiArrowRight } from 'react-icons/fi';

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
    <div className="relative w-full max-w-2xl sm:max-w-[720px] mx-auto">
      {/* Marco de acento amarillo detrás, desplazado acorde al logo */}
      <div
        aria-hidden="true"
        className="absolute inset-0 translate-x-2 translate-y-2 rounded-xl bg-[#ffc107] pointer-events-none"
      />

      {/* Tarjeta de Búsqueda Mediana con Fondo Blanco y Borde Amarillo */}
      <form
        onSubmit={handleSearch}
        className="relative z-10 bg-white rounded-xl border-2 border-[#ffc107] p-5 sm:p-6 shadow-lg text-left"
      >
        {/* Cabecera del Buscador */}
        <div className="flex items-start justify-between">
          <div>
            <span className="text-brand font-bold text-[10.5px] uppercase tracking-wider block mb-0.5">
              ENCUENTRA TU PRÓXIMO PLAN
            </span>
            <h2 className="text-lg sm:text-xl font-extrabold uppercase text-[#0a1838] tracking-tight">
              BUSCAR EVENTOS
            </h2>
          </div>

          <div className="text-[#ffc107] p-0.5">
            <FiSearch size={24} strokeWidth={2.5} />
          </div>
        </div>

        {/* Separador fino */}
        <div className="w-full h-px bg-slate-100 my-3.5" />

        {/* Solo los 2 inputs exactos + botón */}
        <div className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto] gap-3 items-end">
          {/* 1. Título del evento */}
          <div>
            <label
              htmlFor="search-title"
              className="block text-[11px] font-bold text-slate-700 mb-1"
            >
              Título del evento
            </label>
            <input
              id="search-title"
              type="text"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Ej. festival, concierto..."
              className="w-full bg-[#f8fafc] border border-slate-200 rounded-lg px-3 py-2 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 outline-none focus:border-[#ffc107] focus:bg-white focus:ring-2 focus:ring-[#ffc107]/20 transition-all"
            />
          </div>

          {/* 2. Fecha */}
          <div>
            <label
              htmlFor="search-date"
              className="block text-[11px] font-bold text-slate-700 mb-1"
            >
              Fecha
            </label>
            <input
              id="search-date"
              type="date"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
              className="w-full bg-[#f8fafc] border border-slate-200 rounded-lg px-3 py-2 text-xs sm:text-sm text-slate-800 outline-none focus:border-[#ffc107] focus:bg-white focus:ring-2 focus:ring-[#ffc107]/20 transition-all"
            />
          </div>

          {/* Botón Buscar */}
          <div>
            <button
              type="submit"
              className="w-full sm:w-auto h-[38px] px-6 rounded-lg bg-[#0a1838] hover:bg-[#11234f] text-white text-xs font-extrabold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all shadow-sm active:scale-95 cursor-pointer"
            >
              <span>BUSCAR</span>
              <FiArrowRight size={13} />
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
