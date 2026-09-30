import { useEffect, useMemo, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { FiSliders, FiCalendar, FiX, FiSearch, FiLayers } from 'react-icons/fi';
import Navbar from '../components/usersComponets/Navbar.jsx';
import Footer from '../components/usersComponets/Footer.jsx';
import HiveEventCard from '../components/home/HiveEventCard.jsx';
import Pagination from '../components/Shared/Pagination.jsx';
import { searchEvents, getEvents } from '../services/eventService.js';
import { getCategoryNames } from '../services/categoryService.js';

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
    <div className="w-full min-h-screen bg-[#FAF8F5] text-slate-900 flex flex-col justify-between selection:bg-amber-400 selection:text-slate-950">
      <Navbar />

      <main className="flex-1">
        {/* Header Colmena Cultural */}
        <section className="w-full bg-[#0B1B3D] text-white pt-14 pb-20 px-6 sm:px-12 lg:px-20 relative overflow-hidden border-b border-amber-500/20">
          <div className="absolute inset-0 bg-[radial-gradient(#F59E0B_1px,transparent_1px)] [background-size:24px_24px] opacity-10 pointer-events-none" />
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
          
          <div className="max-w-6xl mx-auto relative z-10">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest text-amber-300 bg-amber-500/10 border border-amber-400/30 mb-4">
              <span>⬡</span>
              <span>CARTELERA EVENTHIVE</span>
            </span>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight uppercase text-white">
              {activeCategoryLabel ? (
                <>
                  EXPERIENCIAS: <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-amber-500">{activeCategoryLabel}</span>
                </>
              ) : (
                <>
                  EXPLORA LA <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-amber-500">COLMENA CULTURAL</span>
                </>
              )}
            </h1>

            <p className="text-slate-300 text-sm sm:text-base mt-4 max-w-xl font-medium leading-relaxed">
              Filtra, descubre y reserva las mejores experiencias culturales, artísticas y gastronómicas de Cartagena de Indias.
            </p>
          </div>
        </section>

        {/* Barra de Filtros Flotante Estilo Cápsula */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-9 relative z-20">
          <div className="bg-white rounded-3xl border-2 border-amber-200/90 shadow-2xl p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
            
            {/* Título de Filtros */}
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 shadow-xs">
                <FiSliders size={20} />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-amber-800 block">
                  AGENDA CULTURAL
                </span>
                <span className="font-black text-sm sm:text-base text-[#0B1B3D] tracking-tight uppercase">
                  Filtrar Experiencias
                </span>
              </div>
            </div>

            {/* Selectores */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Selector de Categorías */}
              <div className="relative">
                <select
                  value={categoriaParam}
                  onChange={handleCategoryChange}
                  className="bg-[#FAF8F5] border border-amber-200/90 text-slate-800 text-xs sm:text-sm font-bold rounded-xl px-4 py-2.5 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-400/20 transition-all cursor-pointer shadow-xs hover:border-amber-300"
                  aria-label="Filtrar por categoría"
                >
                  {categoryOptions.map((opt) => (
                    <option key={opt.value || 'all'} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Selector de Fecha */}
              <div className="relative group">
                <input
                  type="date"
                  value={hasCategoryFilter ? '' : fechaParam}
                  onChange={handleDateChange}
                  disabled={hasCategoryFilter}
                  className={`border text-xs sm:text-sm font-bold rounded-xl px-4 py-2.5 outline-none transition-all shadow-xs ${
                    hasCategoryFilter
                      ? 'opacity-40 cursor-not-allowed border-slate-200 text-slate-400 bg-slate-100'
                      : 'border-amber-200/90 text-slate-800 bg-[#FAF8F5] hover:border-amber-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-400/20 cursor-pointer'
                  }`}
                  aria-label="Filtrar por fecha"
                  title={hasCategoryFilter ? 'El filtro por fecha no es requerido al filtrar por categoría' : 'Buscar por fecha'}
                />
                {hasCategoryFilter && (
                  <span className="hidden group-hover:block absolute bottom-full mb-1 left-0 bg-[#0B1B3D] text-white text-[11px] font-medium px-3 py-1.5 rounded-lg shadow-xl whitespace-nowrap z-30 pointer-events-none border border-amber-400/30">
                    Fecha deshabilitada al filtrar por categoría
                  </span>
                )}
              </div>

              {/* Botón Limpiar Filtros */}
              <button
                type="button"
                onClick={handleClearFilters}
                disabled={!hasActiveFilters}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-xs font-black uppercase tracking-wider transition-all disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer active:scale-95 shadow-xs"
              >
                <FiX size={14} />
                <span>Limpiar</span>
              </button>
            </div>
          </div>
        </section>

        {/* Cuadrícula de Eventos o Estado Vacío */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
          
          {/* Tag de Categoría Activa */}
          {hasCategoryFilter && (
            <div className="mb-8 flex flex-wrap items-center justify-between gap-3 bg-white border-2 border-amber-200/90 px-5 py-3.5 rounded-2xl shadow-sm">
              <div className="flex items-center gap-2.5 text-slate-800 font-bold text-xs sm:text-sm">
                <span className="text-amber-500 font-black text-lg">⬡</span>
                <span>
                  Explorando la colmena de: <strong className="text-[#0B1B3D] uppercase font-black">{categoriaParam || activeCategoryLabel || 'Categoría'}</strong>
                </span>
              </div>
              <button
                type="button"
                onClick={handleClearFilters}
                className="text-xs font-black text-amber-700 hover:text-amber-800 uppercase tracking-wider underline cursor-pointer"
              >
                ✕ Ver toda la colmena
              </button>
            </div>
          )}

          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 gap-3">
              <div className="relative w-14 h-14 flex items-center justify-center">
                <div className="absolute inset-0 clip-hexagon-horiz bg-gradient-to-r from-amber-400 to-amber-500 animate-spin" />
                <div className="absolute inset-[3px] clip-hexagon-horiz bg-[#FAF8F5] flex items-center justify-center">
                  <span className="text-amber-500 text-base">⬡</span>
                </div>
              </div>
              <p className="text-xs font-black uppercase tracking-widest text-[#0B1B3D]">
                Sincronizando eventos culturales...
              </p>
            </div>
          ) : events.length > 0 ? (
            <div>
              <div className="flex items-center justify-between mb-7">
                <p className="text-xs sm:text-sm font-extrabold text-slate-700">
                  Mostrando <span className="text-amber-700 font-black">{events.length}</span> experiencia{events.length === 1 ? '' : 's'} {totalElements > events.length ? `de ${totalElements}` : ''} en Cartagena
                </p>
              </div>

              {/* Grid usando HiveEventCard */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {events.map((event) => (
                  <HiveEventCard key={event.id} event={event} />
                ))}
              </div>

              {/* Paginación */}
              {totalElements > 12 && (
                <div className="mt-12 rounded-2xl border-2 border-amber-200/90 bg-white overflow-hidden shadow-sm">
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
            /* Estado Vacío Temático Colmena */
            <div className="border-2 border-dashed border-amber-300 rounded-3xl bg-white p-12 sm:p-16 text-center max-w-2xl mx-auto shadow-sm my-6">
              <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto mb-5 text-2xl shadow-inner">
                ⬡
              </div>

              <h2 className="text-xl sm:text-2xl font-black text-[#0B1B3D] tracking-tight mb-2 uppercase">
                Ninguna experiencia encontrada
              </h2>

              <p className="text-slate-600 text-xs sm:text-sm max-w-md mx-auto mb-8 font-medium leading-relaxed">
                {hasActiveFilters
                  ? 'No encontramos eventos programados que coincidan con estos filtros en la colmena. Prueba limpiando los filtros o explorando otras fechas.'
                  : 'Aún no hay eventos registrados en este momento. Vuelve pronto para descubrir la cartelera cultural.'}
              </p>

              <div className="flex flex-wrap items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={handleClearFilters}
                  className="px-6 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-black uppercase tracking-wider transition-all cursor-pointer"
                >
                  Restablecer Filtros
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/categorias')}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-black text-xs uppercase tracking-wider shadow-md shadow-amber-500/20 transition-all active:scale-95 cursor-pointer"
                >
                  Ver Categorías
                </button>
              </div>
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}
