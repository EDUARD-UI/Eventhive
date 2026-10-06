import { useEffect, useMemo, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { FiSearch, FiX, FiCalendar, FiArrowRight } from 'react-icons/fi';
import Navbar from '../components/usersComponets/Navbar.jsx';
import Footer from '../components/usersComponets/Footer.jsx';
import EventListCard from '../components/common/EventListCard.jsx';
import EventCardSkeleton from '../components/common/EventCardSkeleton.jsx';
import Pagination from '../components/Shared/Pagination.jsx';
import CustomSelect from '../components/common/CustomSelect.jsx';
import { searchEvents, getEvents } from '../services/eventService.js';
import { getCategoryNames, getFeaturedCategories } from '../services/categoryService.js';
import ImageWithFallback from '../components/common/ImageWithFallback.jsx';
import FloatingDotsBackground from '../components/common/FloatingDotsBackground.jsx';

const SORT_OPTIONS = [
  { label: 'Fecha más próxima', value: 'fecha,asc' },
  { label: 'Fecha más lejana', value: 'fecha,desc' },
  { label: 'Título (A - Z)', value: 'titulo,asc' },
  { label: 'Título (Z - A)', value: 'titulo,desc' },
];

export default function BuscarEventosPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const tituloParam = searchParams.get('titulo') || '';
  const fechaParam = searchParams.get('fecha') || '';
  const categoriaIdParam = searchParams.get('categoriaId') || '';
  const sortParam = searchParams.get('sort') || 'fecha,asc';
  const pageParam = Math.max(0, parseInt(searchParams.get('page') || '0', 10));

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoryList, setCategoryList] = useState([]);
  const [featuredCategories, setFeaturedCategories] = useState([]);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [searchInput, setSearchInput] = useState(tituloParam);

  // Cargar categorías disponibles y destacadas
  useEffect(() => {
    let isMounted = true;
    Promise.allSettled([
      getCategoryNames(),
      getFeaturedCategories(),
    ]).then(([namesRes, featRes]) => {
      if (!isMounted) return;
      if (namesRes.status === 'fulfilled' && Array.isArray(namesRes.value)) {
        setCategoryList(namesRes.value);
      }
      if (featRes.status === 'fulfilled' && Array.isArray(featRes.value)) {
        setFeaturedCategories(featRes.value);
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  // Sincronizar input con URL
  useEffect(() => {
    setSearchInput(tituloParam);
  }, [tituloParam]);

  // Cargar eventos según filtros
  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    const loadData = async () => {
      try {
        const hasTitle = Boolean(tituloParam.trim());
        const hasDate = Boolean(fechaParam.trim());
        const hasCategory = Boolean(categoriaIdParam);

        // Caso 1: Búsqueda por título textual
        if (hasTitle) {
          // Si el usuario combinó búsqueda por texto con fecha o categoría,
          // consultamos un lote amplio de coincidencias de título para filtrar exactamente en cliente
          const size = (hasDate || hasCategory) ? 60 : 10;
          const result = await searchEvents({
            titulo: tituloParam.trim(),
            page: (hasDate || hasCategory) ? 0 : pageParam,
            size,
            sort: sortParam,
          });

          let filtered = result.events || [];

          if (hasDate) {
            filtered = filtered.filter((ev) => {
              const evDate = ev.fecha || (ev.startsAt ? String(ev.startsAt).slice(0, 10) : '');
              return evDate === fechaParam.trim();
            });
          }

          if (hasCategory) {
            filtered = filtered.filter((ev) => {
              const catId = ev.categoriaId ?? ev.categoria?.id;
              return String(catId) === String(categoriaIdParam);
            });
          }

          if (hasDate || hasCategory) {
            const pageSize = 10;
            const start = pageParam * pageSize;
            const paginated = filtered.slice(start, start + pageSize);
            return {
              events: paginated,
              total: filtered.length,
              totalPages: Math.max(1, Math.ceil(filtered.length / pageSize)),
              currentPage: pageParam,
            };
          }

          return result;
        }

        // Caso 2: Sin término textual -> consulta nativa con filtros directos al backend /api/eventos
        return await getEvents({
          categoriaId: hasCategory ? Number(categoriaIdParam) : undefined,
          fecha: hasDate ? fechaParam.trim() : undefined,
          page: pageParam,
          size: 10,
          sort: sortParam,
        });
      } catch (err) {
        console.warn('Error al cargar eventos:', err?.message);
        return { events: [], total: 0, totalPages: 1, currentPage: 0 };
      }
    };

    loadData()
      .then(({ events: results, total, totalPages: pages }) => {
        if (!isMounted) return;
        setEvents(results || []);
        setTotalElements(total || (results ? results.length : 0));
        setTotalPages(pages || 1);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [tituloParam, fechaParam, categoriaIdParam, sortParam, pageParam]);

  const handlePageChange = (newPage) => {
    const next = new URLSearchParams(searchParams);
    next.set('page', String(newPage));
    setSearchParams(next);
    window.scrollTo({ top: 180, behavior: 'smooth' });
  };

  const handleCategoryChange = (e) => {
    const val = e.target.value;
    const next = new URLSearchParams(searchParams);
    next.delete('page');
    if (val) {
      next.set('categoriaId', val);
    } else {
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

  const handleSortChange = (e) => {
    const val = e.target.value;
    const next = new URLSearchParams(searchParams);
    next.delete('page');
    if (val) {
      next.set('sort', val);
    } else {
      next.delete('sort');
    }
    setSearchParams(next);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const next = new URLSearchParams(searchParams);
    next.delete('page');
    if (searchInput.trim()) {
      next.set('titulo', searchInput.trim());
    } else {
      next.delete('titulo');
    }
    setSearchParams(next);
  };

  const handleClearFilters = () => {
    setSearchInput('');
    setSearchParams({});
  };

  const categorySelectOptions = useMemo(() => [
    { label: 'Eventos (Todas las categorías)', value: '' },
    ...categoryList.map((cat) => ({ label: cat.nombre, value: String(cat.id) })),
  ], [categoryList]);

  const hasActiveFilters = Boolean(tituloParam || fechaParam || categoriaIdParam || (sortParam && sortParam !== 'fecha,asc'));
  const activeCategory = categoryList.find((c) => String(c.id) === String(categoriaIdParam));

  return (
    <div className="w-full min-h-screen text-slate-900 flex flex-col justify-between font-body relative">
      {/* Fondo interactivo de puntitos negros brillantes flotando */}
      <FloatingDotsBackground />

      {/* Navbar idéntico */}
      <Navbar />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 relative z-10">
        {/* Cabecera / Título Principal Refactorizada (Opción 1 Directa + Flex Balanceado) */}
        <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-5 pb-3 border-b border-slate-200/70">
          <div className="max-w-2xl">
            <div className="flex flex-wrap items-center gap-3 mb-1.5">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0B132B] tracking-tight">
                Eventos en Cartagena
              </h1>
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200/80 shadow-2xs">
                {loading ? 'Cargando...' : `${totalElements} disponibles`}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 font-normal leading-relaxed">
              Descubre conciertos, festivales, experiencias culturales y deportivas en La Heroica.
            </p>
          </div>

          {/* Buscador Rápido por Título alineado limpiamente a la derecha */}
          <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80 shrink-0">
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Busca tu evento..."
              className="w-full h-11 bg-white border border-slate-300 hover:border-slate-400 focus:border-[#0B132B] rounded-xl pl-10 pr-9 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0B132B]/10 transition-all shadow-xs"
            />
            <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm pointer-events-none" />
            {searchInput && (
              <button
                type="button"
                onClick={() => {
                  setSearchInput('');
                  const next = new URLSearchParams(searchParams);
                  next.delete('titulo');
                  setSearchParams(next);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 text-xs font-bold cursor-pointer p-1"
                title="Limpiar búsqueda"
              >
                ✕
              </button>
            )}
          </form>
        </div>

        {/* Barra de Filtros con CustomSelect (mantiene su estilo al desplegarse) */}
        <section className="mb-8">
          <div className="flex flex-wrap items-center gap-3">
            {/* Filtro Categorías con CustomSelect */}
            <div className="min-w-[170px] sm:min-w-[210px] flex-1 sm:flex-none">
              <CustomSelect
                value={categoriaIdParam}
                onChange={handleCategoryChange}
                options={categorySelectOptions}
                placeholder="Eventos (Todas)"
                variant="light"
              />
            </div>

            {/* Filtro Fechas */}
            <div className="min-w-[140px] sm:min-w-[160px] flex-1 sm:flex-none">
              <input
                type="date"
                value={fechaParam}
                onChange={handleDateChange}
                className="w-full bg-white border border-slate-300 hover:border-slate-400 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-slate-900 focus:outline-none focus:border-slate-800 focus:ring-2 focus:ring-slate-800/10 transition-all cursor-pointer shadow-xs"
                aria-label="Filtrar por fecha específica"
                title="Filtrar por día exacto (yyyy-MM-dd)"
              />
            </div>

            {/* Filtro Ordenar por con CustomSelect */}
            <div className="min-w-[160px] sm:min-w-[190px] flex-1 sm:flex-none">
              <CustomSelect
                value={sortParam}
                onChange={handleSortChange}
                options={SORT_OPTIONS}
                placeholder="Ordenar por"
                variant="light"
              />
            </div>

            {/* Botón Limpiar Filtros */}
            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleClearFilters}
                className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 text-xs sm:text-sm font-semibold transition-all duration-200 active:scale-95 shadow-xs cursor-pointer"
              >
                <FiX size={14} />
                <span>Limpiar filtros</span>
              </button>
            )}
          </div>

          {/* Chips de filtros activos */}
          {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-2 mt-3 pt-2">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Filtros activos:
              </span>
              {activeCategory && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-white border border-slate-300 text-slate-800 text-xs font-semibold shadow-xs">
                  Categoría: {activeCategory.nombre}
                  <button
                    type="button"
                    onClick={() => {
                      const next = new URLSearchParams(searchParams);
                      next.delete('categoriaId');
                      setSearchParams(next);
                    }}
                    className="hover:text-amber-600 font-bold ml-1 cursor-pointer"
                  >
                    ×
                  </button>
                </span>
              )}
              {fechaParam && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-white border border-slate-300 text-slate-800 text-xs font-semibold shadow-xs">
                  Fecha: {fechaParam}
                  <button
                    type="button"
                    onClick={() => {
                      const next = new URLSearchParams(searchParams);
                      next.delete('fecha');
                      setSearchParams(next);
                    }}
                    className="hover:text-amber-600 font-bold ml-1 cursor-pointer"
                  >
                    ×
                  </button>
                </span>
              )}
              {tituloParam && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-white border border-slate-300 text-slate-800 text-xs font-semibold shadow-xs">
                  Búsqueda: “{tituloParam}”
                  <button
                    type="button"
                    onClick={() => {
                      setSearchInput('');
                      const next = new URLSearchParams(searchParams);
                      next.delete('titulo');
                      setSearchParams(next);
                    }}
                    className="hover:text-amber-600 font-bold ml-1 cursor-pointer"
                  >
                    ×
                  </button>
                </span>
              )}
            </div>
          )}
        </section>

        {/* 1. Grilla Vertical de Boletos de Eventos en Blanco Puro */}
        <section>
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <EventCardSkeleton key={n} notchBg="bg-white" />
              ))}
            </div>
          ) : events.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7">
                {events.map((event) => (
                  <EventListCard key={event.id} event={event} notchBg="bg-white" />
                ))}
              </div>

              {/* Componente de Paginación */}
              {totalElements > 10 && (
                <div className="mt-10 rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs">
                  <Pagination
                    currentPage={pageParam + 1}
                    totalItems={totalElements}
                    pageSize={10}
                    onPageChange={(p) => handlePageChange(p - 1)}
                    showPageSize={false}
                  />
                </div>
              )}
            </>
          ) : (
            <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center max-w-lg mx-auto shadow-sm my-8">
              <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                <FiCalendar size={24} />
              </div>
              <h2 className="text-lg sm:text-xl font-extrabold text-slate-950 tracking-tight uppercase mb-2">
                No encontramos eventos con estos criterios
              </h2>
              <p className="text-slate-600 text-xs sm:text-sm max-w-md mx-auto mb-6 leading-relaxed">
                Prueba ajustando la fecha, cambiando de categoría o restableciendo los filtros para ver toda la cartelera cultural.
              </p>
              <button
                type="button"
                onClick={handleClearFilters}
                className="px-6 py-2.5 rounded-xl bg-slate-950 hover:bg-amber-500 hover:text-slate-950 text-white text-xs font-black uppercase tracking-wider transition-all duration-200 cursor-pointer shadow-xs active:scale-95"
              >
                Ver todos los eventos
              </button>
            </div>
          )}
        </section>

        {/* 2. Sección de Categorías Destacadas (debajo de eventos y paginación) */}
        {featuredCategories.length > 0 && (
          <section className="mt-16 pt-12 border-t border-slate-200">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl sm:text-2xl font-extrabold text-slate-950 tracking-tight uppercase">
                  Categorías Destacadas
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 mt-0.5 font-normal">
                  Explora las experiencias culturales más populares en Cartagena.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
              {featuredCategories.slice(0, 6).map((cat) => {
                const imageUrl = cat.imagenUrl || cat.urlFoto || cat.foto || cat.imagen;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => {
                      const next = new URLSearchParams();
                      next.set('categoriaId', String(cat.id));
                      setSearchParams(next);
                      window.scrollTo({ top: 120, behavior: 'smooth' });
                    }}
                    className="group relative rounded-2xl h-32 sm:h-36 bg-slate-900 border border-slate-200 hover:border-slate-400 overflow-hidden flex flex-col justify-end p-3 text-left transition-all duration-200 ease-out hover:-translate-y-0.5 shadow-sm active:scale-95 cursor-pointer"
                  >
                    {imageUrl && (
                      <div className="absolute inset-0">
                        <ImageWithFallback
                          src={imageUrl}
                          alt={cat.nombre}
                          className="w-full h-full object-cover opacity-55 group-hover:opacity-75 transition-opacity duration-300"
                          showText={false}
                        />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/45 to-transparent pointer-events-none" />

                    <div className="relative z-10">
                      <h4 className="text-xs sm:text-sm font-extrabold uppercase text-white truncate tracking-tight group-hover:text-amber-300 transition-colors">
                        {cat.nombre}
                      </h4>
                      <span className="text-[10px] text-slate-300 font-semibold block mt-0.5">
                        {cat.totalEventos ?? 0} {(cat.totalEventos ?? 0) === 1 ? 'evento' : 'eventos'}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>
        )}
      </main>

      {/* Footer idéntico */}
      <Footer />
    </div>
  );
}
