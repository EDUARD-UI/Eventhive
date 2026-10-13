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
import StyledDatePicker from '../components/common/StyledDatePicker.jsx';
import { useTheme } from '../context/ThemeContext.jsx';


const SORT_OPTIONS = [
  { label: 'Fecha más próxima', value: 'fecha,asc' },
  { label: 'Fecha más lejana', value: 'fecha,desc' },
  { label: 'Título (A - Z)', value: 'titulo,asc' },
  { label: 'Título (Z - A)', value: 'titulo,desc' },
];

export default function BuscarEventosPage() {
  const { isDark } = useTheme();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // En computadores y pantallas grandes: 12 (para ubicar 4, 4, 4); en móviles y tablets: 8
  const [pageSize, setPageSize] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth >= 1024 ? 12 : 8;
    }
    return 12;
  });

  useEffect(() => {
    const handleResize = () => {
      const nextSize = window.innerWidth >= 1024 ? 12 : 8;
      setPageSize((prev) => (prev !== nextSize ? nextSize : prev));
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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

  // Cargar eventos según filtros (12 en desktop, 8 en mobile)
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
          const size = (hasDate || hasCategory) ? 60 : pageSize;
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

        // Caso 2: Sin término textual -> consulta nativa al backend con el tamaño dinámico
        return await getEvents({
          categoriaId: hasCategory ? Number(categoriaIdParam) : undefined,
          fecha: hasDate ? fechaParam.trim() : undefined,
          page: pageParam,
          size: pageSize,
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
  }, [tituloParam, fechaParam, categoriaIdParam, sortParam, pageParam, pageSize]);

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
    <div className="w-full min-h-screen bg-slate-50 dark:bg-[#0B0F19] text-slate-900 dark:text-slate-100 flex flex-col justify-between font-body relative transition-colors duration-200">
      {/* Fondo interactivo de puntitos */}
      <FloatingDotsBackground />

      {/* Navbar idéntico */}
      <Navbar />

      <main className="flex-1 max-w-[1900px] w-full mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 py-8 sm:py-12 relative z-10">
        {/* Encabezado centrado, en armonía con el directorio de organizaciones */}
        <header className="relative mb-8 overflow-hidden rounded-3xl border border-slate-200/80 bg-white/80 px-5 py-7 text-center shadow-sm backdrop-blur-sm dark:border-slate-800 dark:bg-[#0B1428]/80 sm:px-8 sm:py-9">
          <div aria-hidden="true" className="pointer-events-none absolute -left-16 -top-20 h-56 w-56 rounded-full bg-amber-400/10 blur-3xl" />
          <div className="relative flex flex-col items-center">
            <h1 className="text-3xl font-extrabold tracking-tight text-[#0B132B] dark:text-white sm:text-4xl md:text-5xl">
              Eventos en Cartagena
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-600 dark:text-slate-400 sm:text-base">
              Descubre conciertos, festivales, experiencias culturales y deportivas en La Heroica.
            </p>
            <form role="search" onSubmit={handleSearchSubmit} className="relative mt-6 w-full max-w-xl">
              <label htmlFor="event-search" className="sr-only">
                Buscar eventos por nombre
              </label>
              <input
                id="event-search"
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Buscar eventos por nombre..."
                className="h-12 w-full rounded-2xl border border-slate-300 bg-white pl-11 pr-11 text-sm text-slate-900 shadow-sm transition-all placeholder:text-slate-400 hover:border-slate-400 focus:border-amber-500 focus:outline-none focus:ring-4 focus:ring-amber-500/10 dark:border-slate-700 dark:bg-[#0B0F19] dark:text-white dark:placeholder:text-slate-500 dark:hover:border-slate-600"
              />
              <FiSearch className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              {searchInput && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchInput('');
                    const next = new URLSearchParams(searchParams);
                    next.delete('titulo');
                    next.delete('page');
                    setSearchParams(next);
                  }}
                  aria-label="Limpiar búsqueda"
                  className="absolute right-3 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-500 transition-colors hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                >
                  ✕
                </button>
              )}
            </form>
          </div>
        </header>

        {/* Layout de 2 columnas: Filtros Sticky a la izquierda y Eventos con Scroll a la derecha */}
        <div className="flex flex-col lg:flex-row items-start gap-8">
          {/* Columna Izquierda: Filtros Sticky que permanecen fijos al hacer scroll */}
          <aside className="w-full lg:w-72 xl:w-80 shrink-0 lg:sticky lg:top-20 z-20">
            <div className="bg-white/95 dark:bg-[#0B1428]/95 backdrop-blur-md border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200/80 dark:border-slate-800">
                <h2 className="text-xs font-black uppercase tracking-wider text-slate-950 dark:text-white">
                  Filtros
                </h2>
                {hasActiveFilters && (
                  <button
                    type="button"
                    onClick={handleClearFilters}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-600 dark:text-amber-400 hover:underline cursor-pointer"
                  >
                    <FiX size={12} />
                    <span>Limpiar todo</span>
                  </button>
                )}
              </div>

              {/* Filtro Categorías con CustomSelect */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                  Categoría
                </label>
                <CustomSelect
                  value={categoriaIdParam}
                  onChange={handleCategoryChange}
                  options={categorySelectOptions}
                  placeholder="Todas las categorías"
                  variant={isDark ? 'dark' : 'light'}
                />
              </div>

              {/* Filtro Fechas */}
              <div>
                <StyledDatePicker
                  id="filtro-fecha"
                  name="filtro-fecha"
                  label="Fecha"
                  value={fechaParam}
                  onChange={handleDateChange}
                  variant={isDark ? 'dark' : 'light'}
                  helperText="Filtrar eventos por día exacto"
                />
              </div>

              {/* Filtro Ordenar por con CustomSelect */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                  Ordenar por
                </label>
                <CustomSelect
                  value={sortParam}
                  onChange={handleSortChange}
                  options={SORT_OPTIONS}
                  placeholder="Ordenar por"
                  variant={isDark ? 'dark' : 'light'}
                />
              </div>

              {/* Chips de filtros activos */}
              {hasActiveFilters && (
                <div className="pt-3 border-t border-slate-200/80 dark:border-slate-800 space-y-2">
                  <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                    Filtros aplicados:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {activeCategory && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-[11px] font-semibold">
                        {activeCategory.nombre}
                        <button
                          type="button"
                          onClick={() => {
                            const next = new URLSearchParams(searchParams);
                            next.delete('categoriaId');
                            setSearchParams(next);
                          }}
                          className="hover:text-amber-600 font-bold ml-0.5 cursor-pointer"
                        >
                          ×
                        </button>
                      </span>
                    )}
                    {fechaParam && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-[11px] font-semibold">
                        {fechaParam}
                        <button
                          type="button"
                          onClick={() => {
                            const next = new URLSearchParams(searchParams);
                            next.delete('fecha');
                            setSearchParams(next);
                          }}
                          className="hover:text-amber-600 font-bold ml-0.5 cursor-pointer"
                        >
                          ×
                        </button>
                      </span>
                    )}
                    {tituloParam && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-[11px] font-semibold">
                        “{tituloParam}”
                        <button
                          type="button"
                          onClick={() => {
                            setSearchInput('');
                            const next = new URLSearchParams(searchParams);
                            next.delete('titulo');
                            setSearchParams(next);
                          }}
                          className="hover:text-amber-600 font-bold ml-0.5 cursor-pointer"
                        >
                          ×
                        </button>
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </aside>

          {/* Columna Derecha: Grilla de Eventos (4 cards para ubicar 4, 4, 4 en pantallas grandes) */}
          <div className="flex-1 min-w-0 w-full">
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4 gap-5 sm:gap-6 items-start">
                {[...Array(pageSize).keys()].map((n) => (
                  <div key={n} className="w-full">
                    <EventCardSkeleton
                      notchBg="bg-[#F8FAFC] dark:bg-[#070D1B]"
                      aspectVariant="standard"
                    />
                  </div>
                ))}
              </div>
            ) : events.length > 0 ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4 gap-5 sm:gap-6 items-start">
                  {events.map((event) => (
                    <div key={event.id} className="w-full">
                      <EventListCard
                        event={event}
                        notchBg="bg-[#F8FAFC] dark:bg-[#070D1B]"
                        aspectVariant={event.promocionado ? 'gold' : 'standard'}
                      />
                    </div>
                  ))}
                </div>

                {/* Componente de Paginación Minimalista y Centrado */}
                {totalElements > pageSize && (
                  <div className="mt-12 w-full max-w-lg mx-auto lg:-translate-x-40 xl:-translate-x-44 flex justify-center">
                    <Pagination
                      currentPage={pageParam + 1}
                      totalItems={totalElements}
                      pageSize={pageSize}
                      onPageChange={(p) => handlePageChange(p - 1)}
                      minimal={true}
                    />
                  </div>
                )}
              </>
            ) : (
              <div className="w-full max-w-lg mx-auto lg:-translate-x-40 xl:-translate-x-44 flex flex-col items-center rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B1428] p-12 text-center shadow-sm my-8">
                <div className="w-14 h-14 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                  <FiCalendar size={24} />
                </div>
                <h2 className="text-lg sm:text-xl font-extrabold text-slate-950 dark:text-white tracking-tight uppercase mb-2">
                  No encontramos eventos con estos criterios
                </h2>
                <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm max-w-md mx-auto mb-6 leading-relaxed">
                  Prueba ajustando la fecha, cambiando de categoría o restableciendo los filtros para ver toda la cartelera cultural.
                </p>
                <button
                  type="button"
                  onClick={handleClearFilters}
                  className="px-6 py-2.5 rounded-xl bg-slate-950 dark:bg-amber-500 hover:bg-amber-500 hover:text-slate-950 text-white dark:text-slate-950 text-xs font-black uppercase tracking-wider transition-all duration-200 cursor-pointer shadow-xs active:scale-95"
                >
                  Ver todos los eventos
                </button>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* 2. Sección de Categorías Destacadas (Ocupa todo el ancho de la pantalla en pantallas grandes) */}
      {featuredCategories.length > 0 && (
        <section className="w-full py-10 sm:py-14 px-4 sm:px-6 md:px-8 lg:px-8 xl:px-10 border-t border-slate-200/80 dark:border-slate-800 bg-white/70 dark:bg-[#0B1428]/80 backdrop-blur-xs relative z-10 transition-colors duration-200">
          <div className="w-full mb-6 sm:mb-8">
            <h3 className="text-xl sm:text-2xl font-extrabold text-slate-950 dark:text-white tracking-tight uppercase">
              Categorías Destacadas
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 font-normal">
              Explora las experiencias culturales más populares en Cartagena.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-[repeat(auto-fit,minmax(190px,1fr))] gap-4 sm:gap-5 w-full">
            {featuredCategories.map((cat) => {
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
                  className="group relative rounded-2xl h-48 sm:h-56 md:h-60 bg-slate-900 border border-slate-200/90 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-600 overflow-hidden flex flex-col justify-end p-4 sm:p-5 text-left transition-all duration-300 ease-out hover:-translate-y-1 shadow-md active:scale-95 cursor-pointer w-full"
                >
                  {imageUrl && (
                    <div className="absolute inset-0">
                      <ImageWithFallback
                        src={imageUrl}
                        alt={cat.nombre}
                        className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity duration-300"
                        showText={false}
                      />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-slate-950/65 pointer-events-none" />

                  <div className="relative z-10 w-full min-w-0">
                    <h4 className="text-sm sm:text-base font-extrabold uppercase text-white truncate tracking-tight group-hover:text-amber-300 transition-colors">
                      {cat.nombre}
                    </h4>
                    <span className="text-xs text-slate-300 font-semibold block mt-1">
                      {cat.totalEventos ?? 0} {(cat.totalEventos ?? 0) === 1 ? 'evento' : 'eventos'}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </section>
      )}

      {/* Footer idéntico */}
      <Footer />
    </div>
  );
}
