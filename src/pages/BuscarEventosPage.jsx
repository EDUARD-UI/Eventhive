import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FiSearch, FiX, FiCalendar, FiSliders, FiGrid } from 'react-icons/fi';
import Navbar from '../components/usersComponets/Navbar.jsx';
import Footer from '../components/usersComponets/Footer.jsx';
import EventListCard from '../components/common/EventListCard.jsx';
import EventCardSkeleton from '../components/common/EventCardSkeleton.jsx';
import Pagination from '../components/Shared/Pagination.jsx';
import CustomSelect from '../components/common/CustomSelect.jsx';
import { searchEvents, getEvents, getFeaturedEvents } from '../services/eventService.js';
import { getCategoryNames, getFeaturedCategories } from '../services/categoryService.js';
import ImageWithFallback from '../components/common/ImageWithFallback.jsx';
import FloatingDotsBackground from '../components/common/FloatingDotsBackground.jsx';
import StyledDatePicker from '../components/common/StyledDatePicker.jsx';
import CityRhythmPreFooter from '../components/home/CityRhythmPreFooter.jsx';
import FeaturedEventCountdownBanner from '../components/common/FeaturedEventCountdownBanner.jsx';
import { useTheme } from '../context/ThemeContext.jsx';
import { useLenisScroll } from '../hooks/useLenisScroll.js';

const SORT_OPTIONS = [
  { label: 'Fecha más próxima', value: 'fecha,asc' },
  { label: 'Fecha más lejana', value: 'fecha,desc' },
  { label: 'Título (A - Z)', value: 'titulo,asc' },
  { label: 'Título (Z - A)', value: 'titulo,desc' },
];

const MASONRY_ASPECTS = [
  'standard',
  'tall',
  'wide',
  'portrait',
  'standard',
  'wide',
  'compact',
  'tall',
];

export default function BuscarEventosPage() {
  useLenisScroll();
  const { isDark } = useTheme();
  const [searchParams, setSearchParams] = useSearchParams();

  // Columnas dinámicas estilo Pinterest y tamaño de página orgánico
  const [colCount, setColCount] = useState(() => {
    if (typeof window === 'undefined') return 5;
    const w = window.innerWidth;
    if (w >= 1280) return 5;
    if (w >= 1024) return 4;
    if (w >= 768) return 3;
    if (w >= 640) return 2;
    return 1;
  });

  const [pageSize, setPageSize] = useState(() => {
    if (typeof window !== 'undefined') {
      const w = window.innerWidth;
      return w >= 1280 ? 15 : w >= 1024 ? 12 : 8;
    }
    return 15;
  });

  useEffect(() => {
    const handleResize = () => {
      const w = window.innerWidth;
      const nextCols = w >= 1280 ? 5 : w >= 1024 ? 4 : w >= 768 ? 3 : w >= 640 ? 2 : 1;
      setColCount((prev) => (prev !== nextCols ? nextCols : prev));
      const nextSize = w >= 1280 ? 15 : w >= 1024 ? 12 : 8;
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
  const [featuredEvents, setFeaturedEvents] = useState([]);
  const [loadingFeatured, setLoadingFeatured] = useState(true);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [searchInput, setSearchInput] = useState(tituloParam);

  // Cargar categorías disponibles y eventos destacados para el temporizador
  useEffect(() => {
    let isMounted = true;
    Promise.allSettled([
      getCategoryNames(),
      getFeaturedCategories(),
      getFeaturedEvents({ page: 0, size: 20 }),
    ]).then(([namesRes, featRes, featEventsRes]) => {
      if (!isMounted) return;
      if (namesRes.status === 'fulfilled' && Array.isArray(namesRes.value)) {
        setCategoryList(namesRes.value);
      }
      if (featRes.status === 'fulfilled' && Array.isArray(featRes.value)) {
        setFeaturedCategories(featRes.value);
      }
      if (featEventsRes.status === 'fulfilled' && Array.isArray(featEventsRes.value)) {
        setFeaturedEvents(featEventsRes.value);
      }
      setLoadingFeatured(false);
    });

    return () => {
      isMounted = false;
    };
  }, []);

  // Evento destacado más próximo a la fecha actual (con respaldo en eventos generales)
  const closestFeaturedEvent = useMemo(() => {
    const list = featuredEvents.length > 0 ? featuredEvents : events;
    if (!list || list.length === 0) return null;
    const now = Date.now();

    const sorted = [...list].sort((a, b) => {
      const timeA = a.startsAt
        ? new Date(a.startsAt).getTime()
        : a.fecha
        ? new Date(`${a.fecha}T${a.hora || '00:00:00'}`).getTime()
        : 0;
      const timeB = b.startsAt
        ? new Date(b.startsAt).getTime()
        : b.fecha
        ? new Date(`${b.fecha}T${b.hora || '00:00:00'}`).getTime()
        : 0;

      const diffA = timeA - now;
      const diffB = timeB - now;

      // Priorizar eventos futuros más próximos a la fecha actual
      if (diffA >= 0 && diffB >= 0) return diffA - diffB;
      if (diffA >= 0) return -1;
      if (diffB >= 0) return 1;
      return Math.abs(diffA) - Math.abs(diffB);
    });

    return sorted[0] || list[0] || null;
  }, [featuredEvents, events]);

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
    window.scrollTo({ top: 220, behavior: 'smooth' });
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

  // Toggle rápido de categorías chips
  const handleQuickCategoryToggle = (catId) => {
    const next = new URLSearchParams(searchParams);
    next.delete('page');
    if (String(categoriaIdParam) === String(catId)) {
      next.delete('categoriaId');
    } else {
      next.set('categoriaId', String(catId));
    }
    setSearchParams(next);
  };

  const categorySelectOptions = useMemo(() => [
    { label: 'Eventos (Todas las categorías)', value: '' },
    ...categoryList.map((cat) => ({ label: cat.nombre, value: String(cat.id) })),
  ], [categoryList]);

  // Categorías rápidas dinámicas (prioriza "Conciertos", "Gastronomía", "Deportes" si están presentes)
  const quickCategories = useMemo(() => {
    const source = categoryList.length > 0 ? categoryList : featuredCategories;
    if (!source || source.length === 0) return [];
    const preferredKeywords = ['concierto', 'gastronom', 'deport', 'cultural', 'festival', 'teatro'];
    const prioritized = [...source].sort((a, b) => {
      const nameA = (a.nombre || '').toLowerCase();
      const nameB = (b.nombre || '').toLowerCase();
      const idxA = preferredKeywords.findIndex((k) => nameA.includes(k));
      const idxB = preferredKeywords.findIndex((k) => nameB.includes(k));
      if (idxA !== -1 && idxB !== -1) return idxA - idxB;
      if (idxA !== -1) return -1;
      if (idxB !== -1) return 1;
      return 0;
    });
    return prioritized.slice(0, 3);
  }, [categoryList, featuredCategories]);

  const hasActiveFilters = Boolean(
    tituloParam || fechaParam || categoriaIdParam || (sortParam && sortParam !== 'fecha,asc')
  );
  const activeCategory = categoryList.find((c) => String(c.id) === String(categoriaIdParam));

  // Distribución en columnas para Grid estilo Pinterest (Masonry)
  const masonryColumns = useMemo(() => {
    const cols = Array.from({ length: colCount }, () => []);
    events.forEach((ev, idx) => {
      cols[idx % colCount].push({ event: ev, index: idx });
    });
    return cols;
  }, [events, colCount]);

  const skeletonColumns = useMemo(() => {
    const cols = Array.from({ length: colCount }, () => []);
    Array.from({ length: pageSize }).forEach((_, idx) => {
      cols[idx % colCount].push(idx);
    });
    return cols;
  }, [pageSize, colCount]);

  return (
    <div className="w-full min-h-screen bg-slate-50 dark:bg-[#0B0F19] text-slate-900 dark:text-slate-100 flex flex-col justify-between font-body relative transition-colors duration-200">
      {/* Fondo interactivo de puntitos */}
      <FloatingDotsBackground />

      {/* Navbar idéntico */}
      <Navbar />

      <main className="flex-1 max-w-[1900px] w-full mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 py-5 sm:py-8 relative z-10">
        {/* Encabezado con tarjeta de búsqueda ancha y filtros integrados justo debajo del buscador */}
        <header className="relative mb-6 rounded-3xl border border-slate-200/80 bg-white/85 px-5 py-7 sm:px-8 sm:py-9 text-center shadow-sm backdrop-blur-sm dark:border-slate-800 dark:bg-[#0B1428]/85 max-w-7xl xl:max-w-[1440px] mx-auto w-full transition-colors duration-200">
          {/* Contenedor con overflow-hidden exclusivo para el resplandor de fondo para no cortar los desplegables */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 overflow-hidden rounded-3xl"
          >
            <div className="absolute -right-16 -top-20 h-56 w-56 rounded-full bg-amber-400/10 blur-3xl" />
          </div>

          <div className="relative flex flex-col items-center">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-slate-950 dark:text-white max-w-4xl text-center leading-tight">
              Descubre conciertos, festivales, experiencias culturales y deportivas en La Heroica.
            </h1>

            {/* Buscador dentro de la tarjeta */}
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
                className="h-12 w-full rounded-2xl border-2 border-slate-900 dark:border-white bg-white pl-11 pr-11 text-sm text-slate-900 shadow-sm transition-all placeholder:text-slate-400 focus:border-amber-500 dark:focus:border-amber-400 focus:outline-none focus:ring-4 focus:ring-amber-500/15 dark:bg-[#0B0F19] dark:text-white dark:placeholder:text-slate-500"
              />
              <FiSearch
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                size={18}
              />
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
                  className="absolute right-3 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-500 transition-colors hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 cursor-pointer"
                >
                  ✕
                </button>
              )}
            </form>

            {/* Filtros Horizontales y Compactos: DENTRO de la tarjeta y justo debajo del buscador */}
            <div className="w-full mt-6 pt-5 sm:mt-7 sm:pt-6 border-t border-slate-200/60 dark:border-slate-800/80">
              <div className="flex flex-wrap xl:flex-nowrap items-center justify-center gap-2.5 sm:gap-3 w-full">
                {/* 1. Selector en línea "Categoría" */}
                <div className="w-full sm:w-[calc(50%-6px)] lg:w-auto lg:min-w-[210px] xl:min-w-[220px] lg:flex-1">
                  <CustomSelect
                    value={categoriaIdParam}
                    onChange={handleCategoryChange}
                    options={categorySelectOptions}
                    placeholder="Todas las categorías"
                    variant={isDark ? 'dark' : 'light'}
                    inlineLabel="Categoría"
                    icon={FiGrid}
                  />
                </div>

                {/* 2. Selector en línea "Fecha" */}
                <div className="w-full sm:w-[calc(50%-6px)] lg:w-auto lg:min-w-[190px] xl:min-w-[200px] lg:flex-1">
                  <StyledDatePicker
                    id="filtro-fecha"
                    name="filtro-fecha"
                    inlineLabel="Fecha"
                    value={fechaParam}
                    onChange={handleDateChange}
                    variant={isDark ? 'dark' : 'light'}
                    placeholder="Cualquier fecha"
                  />
                </div>

                {/* 3. Sección dinámica de categorías rápidas en forma de chips o botones directos */}
                <div className="w-full sm:w-[calc(50%-6px)] lg:w-auto lg:flex-1 h-[54px] px-3.5 py-1.5 rounded-2xl bg-white/95 dark:bg-[#0B1428]/95 border border-slate-200/90 dark:border-slate-800 backdrop-blur-md shadow-xs flex flex-col justify-center min-w-[240px]">
                  <span className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 leading-none mb-1 text-left">
                    Categorías rápidas
                  </span>
                  <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
                    {quickCategories.map((cat) => {
                      const isCatActive = String(cat.id) === String(categoriaIdParam);
                      return (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => handleQuickCategoryToggle(cat.id)}
                          className={`px-2.5 py-0.5 rounded-lg text-xs font-bold transition-all duration-150 cursor-pointer whitespace-nowrap select-none ${
                            isCatActive
                              ? 'bg-amber-500 text-slate-950 font-black shadow-xs ring-1 ring-amber-400'
                              : 'bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 hover:bg-amber-500/15 hover:text-amber-700 dark:hover:text-amber-300'
                          }`}
                        >
                          {cat.nombre}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 4. Selector en línea "Ordenar Por" */}
                <div className="w-full sm:w-[calc(50%-6px)] lg:w-auto lg:min-w-[190px] xl:min-w-[200px] lg:flex-1">
                  <CustomSelect
                    value={sortParam}
                    onChange={handleSortChange}
                    options={SORT_OPTIONS}
                    placeholder="Ordenar por"
                    variant={isDark ? 'dark' : 'light'}
                    inlineLabel="Ordenar Por"
                    icon={FiSliders}
                  />
                </div>

                {/* Botón rápido Limpiar todo cuando hay filtros aplicados */}
                {hasActiveFilters && (
                  <button
                    type="button"
                    onClick={handleClearFilters}
                    className="h-[54px] px-4 rounded-2xl bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-600 dark:bg-slate-800/80 dark:hover:bg-rose-950/40 dark:text-slate-300 dark:hover:text-rose-400 border border-slate-200 dark:border-slate-700/80 flex items-center justify-center gap-1.5 text-xs font-bold transition-all duration-200 cursor-pointer shrink-0 shadow-xs active:scale-95"
                    title="Limpiar todos los filtros"
                  >
                    <FiX size={15} />
                    <span className="hidden sm:inline">Limpiar</span>
                  </button>
                )}
              </div>

              {/* Chips informativos de filtros activos */}
              {hasActiveFilters && (
                <div className="flex flex-wrap items-center justify-center gap-1.5 mt-2.5 px-2">
                  <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mr-1">
                    Filtros activos:
                  </span>
                  {activeCategory && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-300 text-[11px] font-bold">
                      {activeCategory.nombre}
                      <button
                        type="button"
                        onClick={() => {
                          const next = new URLSearchParams(searchParams);
                          next.delete('categoriaId');
                          next.delete('page');
                          setSearchParams(next);
                        }}
                        className="hover:text-amber-900 dark:hover:text-white cursor-pointer ml-0.5"
                      >
                        ×
                      </button>
                    </span>
                  )}
                  {fechaParam && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-300 text-[11px] font-bold">
                      {fechaParam}
                      <button
                        type="button"
                        onClick={() => {
                          const next = new URLSearchParams(searchParams);
                          next.delete('fecha');
                          next.delete('page');
                          setSearchParams(next);
                        }}
                        className="hover:text-amber-900 dark:hover:text-white cursor-pointer ml-0.5"
                      >
                        ×
                      </button>
                    </span>
                  )}
                  {tituloParam && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-300 text-[11px] font-bold">
                      “{tituloParam}”
                      <button
                        type="button"
                        onClick={() => {
                          setSearchInput('');
                          const next = new URLSearchParams(searchParams);
                          next.delete('titulo');
                          next.delete('page');
                          setSearchParams(next);
                        }}
                        className="hover:text-amber-900 dark:hover:text-white cursor-pointer ml-0.5"
                      >
                        ×
                      </button>
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Contador de próximo evento destacado en formato cinemático */}
        <div className="w-full max-w-7xl xl:max-w-[1440px] mx-auto mt-2 mb-6 sm:mb-8">
          <FeaturedEventCountdownBanner
            event={closestFeaturedEvent}
            isLoading={loadingFeatured}
          />
        </div>

        {/* Distribución de Tarjetas Estilo Pinterest (Masonry Grid al 100% de ancho sin barra lateral) */}
        <section aria-label="Cartelera de eventos" className="w-full">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5 sm:gap-6 items-start w-full">
              {skeletonColumns.map((colItems, colIdx) => (
                <div key={colIdx} className="flex flex-col gap-5 sm:gap-6 w-full min-w-0">
                  {colItems.map((n) => (
                    <div key={n} className="w-full">
                      <EventCardSkeleton
                        notchBg="bg-[#F8FAFC] dark:bg-[#070D1B]"
                        masonry={true}
                        aspectVariant={MASONRY_ASPECTS[n % MASONRY_ASPECTS.length]}
                      />
                    </div>
                  ))}
                </div>
              ))}
            </div>
          ) : events.length > 0 ? (
            <>
              {/* Cuadrícula Masonry: Adaptabilidad de alturas y densidad orgánica */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5 sm:gap-6 items-start w-full">
                {masonryColumns.map((colItems, colIdx) => (
                  <div key={colIdx} className="flex flex-col gap-5 sm:gap-6 w-full min-w-0">
                    {colItems.map(({ event, index }) => (
                      <div key={event.id} className="w-full">
                        <EventListCard
                          event={event}
                          masonry={true}
                          notchBg="bg-[#F8FAFC] dark:bg-[#070D1B]"
                          aspectVariant={MASONRY_ASPECTS[index % MASONRY_ASPECTS.length]}
                        />
                      </div>
                    ))}
                  </div>
                ))}
              </div>

              {/* Componente de Paginación Minimalista y Centrado (sin offset de sidebar) */}
              {totalElements > pageSize && (
                <div className="mt-12 w-full max-w-lg mx-auto flex justify-center">
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
            <div className="w-full max-w-lg mx-auto flex flex-col items-center rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B1428] p-12 text-center shadow-sm my-8">
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
        </section>
      </main>

      {/* 2. Sección de Categorías Destacadas (Ocupa todo el ancho de la pantalla) */}
      {featuredCategories.length > 0 && (
        <section className="w-full py-10 sm:py-14 px-4 sm:px-6 md:px-8 lg:px-8 xl:px-10 border-t border-slate-200/80 dark:border-transparent bg-white/70 dark:bg-transparent relative z-10 transition-colors duration-200">
          <div className="w-full mb-6 sm:mb-8 text-center max-w-2xl mx-auto">
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
                        className="w-full h-full object-cover opacity-100 group-hover:scale-105 transition-transform duration-500"
                        showText={false}
                      />
                    </div>
                  )}
                  {/* Máscara inferior suave para legibilidad sin oscurecer la imagen completa */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent pointer-events-none" />

                  <div className="relative z-10 w-full min-w-0">
                    <h4 className="text-sm sm:text-base font-extrabold uppercase text-white truncate tracking-tight group-hover:text-amber-300 transition-colors drop-shadow-sm">
                      {cat.nombre}
                    </h4>
                    <span className="text-xs text-slate-200 font-semibold block mt-1 drop-shadow-xs">
                      {cat.totalEventos ?? 0} {(cat.totalEventos ?? 0) === 1 ? 'evento' : 'eventos'}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </section>
      )}

      {/* Pre-Footer compartido */}
      <CityRhythmPreFooter />

      {/* Footer idéntico */}
      <Footer />
    </div>
  );
}