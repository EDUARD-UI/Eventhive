import { useEffect, useMemo, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { FiSliders, FiFilter, FiX } from 'react-icons/fi';
import Navbar from '../components/usersComponets/Navbar.jsx';
import Footer from '../components/usersComponets/Footer.jsx';
import EventCard from '../components/EventCard.jsx';
import Pagination from '../components/Shared/Pagination.jsx';
import { searchEvents, getEvents, getEventsByCategory } from '../services/eventService.js';
import { getCategoryNames } from '../services/categoryService.js';

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
  const pageParam = Math.max(0, parseInt(searchParams.get('page') || '0', 10));

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoryList, setCategoryList] = useState([]);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    let isMounted = true;
    getCategoryNames()
      .then((data) => {
        if (isMounted && data?.length > 0) {
          setCategoryList(data);
        }
      })
      .catch(() => {});
    return () => {
      isMounted = false;
    };
  }, []);

  const categoryOptions = useMemo(() => {
    return [
      { label: 'Todas las categorías', value: '' },
      ...categoryList.map((c) => ({
        label: c.nombre,
        value: c.nombre,
        id: c.id,
      })),
    ];
  }, [categoryList]);

  const hasCategoryFilter = Boolean(categoriaIdParam || categoriaParam);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    const load = async () => {
      try {
        // 1. Al filtrar por categoría: usar /eventos con categoriaId (NO recibe fecha)
        if (hasCategoryFilter) {
          let catId = categoriaIdParam;
          if (!catId && categoriaParam) {
            const found = categoryOptions.find((c) => matchCategory(c.value, categoriaParam));
            if (found && found.id) catId = String(found.id);
          }
          return await getEvents({
            categoriaId: catId || undefined,
            page: pageParam,
            size: 12,
          });
        }

        // 2. Solo el buscar debe recibir fecha: GET /eventos/buscar
        if (tituloParam || fechaParam) {
          return await searchEvents({
            titulo: tituloParam ? tituloParam.trim() : undefined,
            fecha: fechaParam ? fechaParam.trim() : undefined,
            page: pageParam,
            size: 12,
          });
        }

        // 3. Catálogo general por defecto: GET /eventos (todos los eventos)
        return await getEvents({ page: pageParam, size: 12 });
      } catch {
        return { events: [], total: 0, totalPages: 1, currentPage: 0 };
      }
    };

    load()
      .then(({ events: results, total, totalPages: pages }) => {
        if (!isMounted) return;
        if (results && results.length > 0) {
          // Filtrar adicionalmente si hay nombre de categoría textual
          const filtered = categoriaParam && !categoriaIdParam
            ? results.filter((ev) => matchCategory(ev.category, categoriaParam))
            : results;
          setEvents(filtered);
          setTotalElements(total || results.length);
          setTotalPages(pages || 1);
        } else {
          setEvents([]);
          setTotalElements(0);
          setTotalPages(1);
        }
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [tituloParam, fechaParam, categoriaParam, categoriaIdParam, pageParam, categoryOptions, hasCategoryFilter]);

  const handlePageChange = (newPage) => {
    const next = new URLSearchParams(searchParams);
    next.set('page', String(newPage));
    setSearchParams(next);
    window.scrollTo({ top: 320, behavior: 'smooth' });
  };

  const handleCategoryChange = (e) => {
    const val = e.target.value;
    const next = new URLSearchParams(searchParams);
    next.delete('page');
    if (val) {
      next.set('categoria', val);
      // Al filtrar por categoría, la fecha no se requiere y se deshabilita
      next.delete('fecha');
      const found = categoryOptions.find((opt) => opt.value === val);
      if (found && found.id) {
        next.set('categoriaId', String(found.id));
      } else {
        next.delete('categoriaId');
      }
    } else {
      next.delete('categoria');
      next.delete('categoriaId');
    }
    setSearchParams(next);
  };

  const handleDateChange = (e) => {
    const val = e.target.value;
    const next = new URLSearchParams(searchParams);
    next.delete('page');
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

  const hasActiveFilters = Boolean(tituloParam || (!hasCategoryFilter && fechaParam) || categoriaParam || categoriaIdParam);

  const activeCategoryLabel = useMemo(() => {
    if (!categoriaParam) return '';
    const found = categoryOptions.find(
      (opt) => opt.value && matchCategory(opt.value, categoriaParam)
    );
    return found ? found.label : categoriaParam;
  }, [categoriaParam, categoryOptions]);

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

        {/* Filter Bar */}
        <section className="max-w-6xl mx-auto px-6 sm:px-12 lg:px-8 -mt-6 relative z-20">
          <div
            aria-hidden="true"
            className="absolute inset-x-6 sm:inset-x-12 lg:inset-x-8 top-2 bottom-[-4px] rounded-2xl bg-[#ffc107] pointer-events-none"
          />
          <div className="relative bg-white rounded-2xl border-2 border-[#ffc107] shadow-lg p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Left: Filter title & icon */}
            <div className="flex items-center gap-2.5 text-[#0a1838]">
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-brand flex items-center justify-center shadow-xs">
                <FiSliders size={18} />
              </div>
              <div>
                <span className="text-[10px] font-bold text-brand uppercase tracking-wider block">
                  EXPLORAR AGENDA
                </span>
                <span className="font-extrabold text-sm sm:text-base tracking-wide uppercase text-[#0a1838]">
                  FILTRAR EVENTOS
                </span>
              </div>
            </div>

            {/* Right: Selectors & Clear button */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Category selector */}
              <select
                value={categoriaParam}
                onChange={handleCategoryChange}
                className="bg-slate-50 border border-slate-200 text-slate-700 text-xs sm:text-sm rounded-xl px-3.5 py-2.5 outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 font-medium transition-all cursor-pointer shadow-xs"
                aria-label="Filtrar por categoría"
              >
                {categoryOptions.map((opt) => (
                  <option key={opt.value || 'all'} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>

              {/* Date selector */}
              <div className="relative group">
                <input
                  type="date"
                  value={hasCategoryFilter ? '' : fechaParam}
                  onChange={handleDateChange}
                  disabled={hasCategoryFilter}
                  className={`border text-xs sm:text-sm rounded-xl px-3.5 py-2.5 outline-none font-medium transition-all shadow-xs ${
                    hasCategoryFilter
                      ? 'opacity-40 cursor-not-allowed border-slate-200 text-slate-400 bg-slate-100'
                      : 'border-slate-200 text-slate-700 bg-slate-50 hover:border-slate-300 focus:border-brand focus:ring-2 focus:ring-brand/20 cursor-pointer'
                  }`}
                  aria-label="Filtrar por fecha"
                  title={hasCategoryFilter ? 'El filtro por fecha no es requerido al filtrar por categoría' : 'Buscar por fecha'}
                />
                {hasCategoryFilter && (
                  <span className="hidden group-hover:block absolute bottom-full mb-1 left-0 bg-[#0a1838] text-white text-[11px] px-2.5 py-1 rounded shadow-md whitespace-nowrap z-30 pointer-events-none">
                    Fecha deshabilitada al filtrar por categoría
                  </span>
                )}
              </div>

              {/* Clear filters pill */}
              <button
                type="button"
                onClick={handleClearFilters}
                disabled={!hasActiveFilters}
                className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-bold transition-all disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer active:scale-95"
              >
                <FiX size={14} />
                Limpiar filtros
              </button>
            </div>
          </div>
        </section>

        {/* Events Grid or Empty State (Matching Mockups) */}
        <section className="max-w-6xl mx-auto px-6 sm:px-12 lg:px-8 py-10 sm:py-14">
          {/* Banner cuando se filtró por categoría desde una card o selector */}
          {hasCategoryFilter && (
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3 bg-blue-50/90 border border-blue-200 px-4 py-3 rounded-xl text-xs sm:text-sm shadow-sm">
              <div className="flex items-center gap-2 text-brand font-semibold">
                <FiSliders size={16} />
                <span>
                  Mostrando eventos de la categoría: <strong className="text-[#0a1838]">{categoriaParam || activeCategoryLabel || 'Seleccionada'}</strong>
                  <span className="text-slate-500 font-normal ml-2 hidden sm:inline">(Filtro de fecha deshabilitado)</span>
                </span>
              </div>
              <button
                type="button"
                onClick={handleClearFilters}
                className="text-xs font-bold text-slate-600 hover:text-brand underline transition-colors cursor-pointer"
              >
                ✕ Ver todos los eventos
              </button>
            </div>
          )}

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
                  {events.length === 1 ? '' : 's'} {totalElements > events.length ? `de ${totalElements}` : ''} en Cartagena
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {events.map((event) => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>

              {/* Componente de Paginación */}
              {totalElements > 12 && (
                <div className="mt-10 rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
                  <Pagination
                    currentPage={pageParam + 1}
                    totalItems={totalElements}
                    pageSize={12}
                    onPageChange={(p) => handlePageChange(p - 1)}
                    showPageSize={false}
                  />
                </div>
              )}
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
