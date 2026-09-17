import { useEffect, useMemo, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { FiSliders, FiFilter, FiX } from 'react-icons/fi';
import Navbar from '../components/usersComponets/Navbar.jsx';
import Footer from '../components/usersComponets/Footer.jsx';
import EventCard from '../components/EventCard.jsx';
import { searchEvents, getEventsByCategory } from '../services/eventService.js';
import { MOCK_EVENTS } from '../constants/mockEvents.js';

const CATEGORY_OPTIONS = [
  { label: 'Todas las categorías', value: '' },
  { label: 'Música', value: 'Música' },
  { label: 'Arte y Cultura', value: 'Cultural' },
  { label: 'Negocios', value: 'Negocios' },
  { label: 'Deportes', value: 'Deportivo' },
  { label: 'Gastronomía', value: 'Gastronómico' },
  { label: 'Educación', value: 'Educación' },
];

const DATE_OPTIONS = [
  { label: 'Cualquier fecha', value: '' },
  { label: 'Hoy', value: 'hoy' },
  { label: 'Esta semana', value: 'semana' },
  { label: 'Este mes', value: 'mes' },
];

// Helper to check category matching including common aliases
const matchCategory = (eventCat, targetCat) => {
  if (!targetCat) return true;
  const e = (eventCat || '').toLowerCase().trim();
  const t = targetCat.toLowerCase().trim();

  if (e === t || e.includes(t) || t.includes(e)) return true;
  if ((t.includes('cultur') || t.includes('arte')) && (e.includes('cultur') || e.includes('arte'))) return true;
  if (t.includes('músic') && e.includes('music')) return true;
  if (t.includes('deport') && e.includes('deport')) return true;
  if (t.includes('gastro') && e.includes('gastro')) return true;
  if ((t.includes('educa') || t.includes('acad')) && (e.includes('educa') || e.includes('acad'))) return true;
  if (t.includes('negocio') && e.includes('negocio')) return true;

  return false;
};

export default function BuscarEventosPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const tituloParam = searchParams.get('titulo') || '';
  const fechaParam = searchParams.get('fecha') || '';
  const categoriaParam = searchParams.get('categoria') || '';
  const categoriaIdParam = searchParams.get('categoriaId') || '';

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    const load = async () => {
      try {
        if (categoriaIdParam) {
          return await getEventsByCategory({ categoriaId: categoriaIdParam });
        }
        return await searchEvents({ titulo: tituloParam, fecha: fechaParam });
      } catch {
        return { events: [], total: 0 };
      }
    };

    load()
      .then(({ events: results }) => {
        if (!isMounted) return;
        if (results && results.length > 0) {
          // If category filter is also set in text, filter
          const filtered = categoriaParam
            ? results.filter((ev) => matchCategory(ev.category, categoriaParam))
            : results;
          setEvents(filtered);
        } else {
          // Fallback to MOCK_EVENTS so navigation between categories displays real mock events
          let filtered = [...MOCK_EVENTS];

          if (categoriaParam) {
            filtered = filtered.filter((ev) => matchCategory(ev.category, categoriaParam));
          }

          if (tituloParam) {
            const q = tituloParam.toLowerCase();
            filtered = filtered.filter(
              (ev) =>
                ev.title.toLowerCase().includes(q) ||
                ev.location.toLowerCase().includes(q) ||
                ev.category.toLowerCase().includes(q)
            );
          }

          setEvents(filtered);
        }
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [tituloParam, fechaParam, categoriaParam, categoriaIdParam]);

  const handleCategoryChange = (e) => {
    const val = e.target.value;
    const next = new URLSearchParams(searchParams);
    if (val) {
      next.set('categoria', val);
      next.delete('categoriaId');
    } else {
      next.delete('categoria');
      next.delete('categoriaId');
    }
    setSearchParams(next);
  };

  const handleDateChange = (e) => {
    const val = e.target.value;
    const next = new URLSearchParams(searchParams);
    if (val) {
      next.set('fecha', val);
    } else {
      next.delete('fecha');
    }
    setSearchParams(next);
  };

  const handleClearFilters = () => {
    setSearchParams({});
  };

  const hasActiveFilters = Boolean(tituloParam || fechaParam || categoriaParam || categoriaIdParam);

  const activeCategoryLabel = useMemo(() => {
    if (!categoriaParam) return '';
    const found = CATEGORY_OPTIONS.find(
      (opt) => opt.value && matchCategory(opt.value, categoriaParam)
    );
    return found ? found.label : categoriaParam;
  }, [categoriaParam]);

  return (
    <div className="w-full min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col justify-between">
      <Navbar />

      <main className="flex-1">
        {/* Mockup Top Banner: Dark Navy + Gold Underline */}
        <section className="w-full bg-[#0a1838] text-white pt-14 pb-16 px-6 sm:px-12 lg:px-20 border-b-2 border-[#ffc107] relative overflow-hidden">
          <div className="max-w-6xl mx-auto relative z-10">
            <span className="text-[#ffc107] font-bold text-xs sm:text-sm tracking-widest uppercase block mb-3">
              AGENDA EVENTHIVE
            </span>
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight uppercase">
              {activeCategoryLabel ? `EVENTOS: ${activeCategoryLabel}` : 'TODOS LOS EVENTOS'}
            </h1>
            <p className="text-slate-300 text-sm sm:text-base mt-4 max-w-xl font-normal leading-relaxed">
              Filtra, compara y elige dónde quieres estar.
            </p>
          </div>

          <div className="absolute -top-24 -right-24 w-96 h-96 bg-brand/20 rounded-full blur-3xl pointer-events-none" />
        </section>

        {/* Filter Bar (Matching Mockup 3 & 5) */}
        <section className="max-w-6xl mx-auto px-6 sm:px-12 lg:px-8 -mt-6 relative z-20">
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Left: Filter title & icon */}
            <div className="flex items-center gap-2.5 text-[#0a1838]">
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-brand flex items-center justify-center">
                <FiSliders size={18} />
              </div>
              <span className="font-extrabold text-sm sm:text-base tracking-wide uppercase">
                FILTRAR EVENTOS
              </span>
            </div>

            {/* Right: Selectors & Clear button */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Category selector */}
              <select
                value={categoriaParam}
                onChange={handleCategoryChange}
                className="bg-slate-50 border border-slate-200 text-slate-700 text-xs sm:text-sm rounded-xl px-3.5 py-2.5 outline-none focus:border-brand focus:ring-1 focus:ring-brand font-medium transition-colors cursor-pointer"
                aria-label="Filtrar por categoría"
              >
                {CATEGORY_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>

              {/* Date selector */}
              <select
                value={fechaParam}
                onChange={handleDateChange}
                className="bg-slate-50 border border-slate-200 text-slate-700 text-xs sm:text-sm rounded-xl px-3.5 py-2.5 outline-none focus:border-brand focus:ring-1 focus:ring-brand font-medium transition-colors cursor-pointer"
                aria-label="Filtrar por fecha"
              >
                {DATE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>

              {/* Clear filters pill */}
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={handleClearFilters}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 text-xs font-semibold transition-colors"
                >
                  <FiX size={14} />
                  Limpiar filtros
                </button>
              )}
            </div>
          </div>
        </section>

        {/* Events Grid or Empty State (Matching Mockups) */}
        <section className="max-w-6xl mx-auto px-6 sm:px-12 lg:px-8 py-10 sm:py-14">
          {loading ? (
            <div className="flex items-center justify-center py-20 text-slate-500 text-sm">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand mr-3" />
              Cargando agenda de eventos…
            </div>
          ) : events.length > 0 ? (
            <div>
              <div className="flex items-center justify-between mb-6">
                <p className="text-xs sm:text-sm font-semibold text-slate-600">
                  Mostrando <span className="text-brand font-bold">{events.length}</span> evento
                  {events.length === 1 ? '' : 's'} en Cartagena
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {events.map((event) => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            </div>
          ) : (
            /* EXACT Mockup 3 & 5 Empty State */
            <div className="border-2 border-dashed border-slate-300 rounded-2xl bg-white p-12 sm:p-16 text-center max-w-3xl mx-auto shadow-sm my-6">
              <div className="w-14 h-14 rounded-2xl bg-blue-50 text-brand flex items-center justify-center mx-auto mb-5">
                <FiFilter size={28} />
              </div>

              <h2 className="text-lg sm:text-xl font-extrabold uppercase text-[#0a1838] tracking-wide mb-2">
                EVENTOS LISTOS PARA APARECER
              </h2>

              <p className="text-slate-500 text-xs sm:text-sm max-w-md mx-auto mb-7 leading-relaxed">
                {hasActiveFilters
                  ? 'No encontramos eventos programados con estos filtros seleccionados. Vuelve pronto o explora otras opciones.'
                  : 'Conecta el endpoint indicado en el código para cargar el catálogo real y mantener estos filtros activos.'}
              </p>

              <button
                type="button"
                onClick={() => navigate('/categorias')}
                className="inline-flex items-center justify-center px-7 py-3 rounded-lg bg-[#ffc107] hover:bg-[#e0a800] text-[#0a1838] font-bold text-xs uppercase tracking-wider shadow-sm transition-colors active:scale-95 cursor-pointer"
              >
                VER CATEGORÍAS
              </button>
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}
