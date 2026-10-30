import { useEffect, useMemo, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { FiSearch, FiX, FiCalendar, FiGrid, FiArrowUpRight } from 'react-icons/fi';
import Navbar from '../components/usersComponets/Navbar.jsx';
import HiveBeeLoader from '../components/common/HiveBeeLoader.jsx';
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
import CityRhythmPreFooter from '../components/home/CityRhythmPreFooter.jsx';
import { formatFecha } from '../utils/formatters.js';
import { useTheme } from '../context/ThemeContext.jsx';
import { useLenisScroll } from '../hooks/useLenisScroll.js';

const PAGE_SIZE = 12;

// Caché en memoria para retorno instantáneo entre vistas
let cachedEventsData = null;
let cachedCategoriesData = null;

const hasVisitedBuscar = () => {
  try {
    return sessionStorage.getItem('eh_visited_buscar') === 'true';
  } catch {
    return false;
  }
};

export default function BuscarEventosPage() {
  useLenisScroll();
  const { isDark } = useTheme();
  const [searchParams, setSearchParams] = useSearchParams();
  const [ribbonTilt, setRibbonTilt] = useState(0);

  useEffect(() => {
    let frame = 0;
    const updateTilt = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const scrollProgress = Math.min(window.scrollY / 900, 1);
        setRibbonTilt(scrollProgress * 5);
      });
    };
    updateTilt();
    window.addEventListener('scroll', updateTilt, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', updateTilt);
    };
  }, []);

  // Determinar si es la primera vez que se visita la página en esta sesión
  const isFirstVisit = !hasVisitedBuscar();

  // Columnas dinámicas para que las tarjetas encajen orgánicamente sin dejar huecos vacíos
  const [colCount, setColCount] = useState(() => {
    if (typeof window === 'undefined') return 4;
    const w = window.innerWidth;
    if (w >= 1024) return 4;
    if (w >= 768) return 3;
    if (w >= 640) return 2;
    return 1;
  });

  useEffect(() => {
    const handleResize = () => {
      const w = window.innerWidth;
      const nextCols = w >= 1024 ? 4 : w >= 768 ? 3 : w >= 640 ? 2 : 1;
      setColCount((prev) => (prev !== nextCols ? nextCols : prev));
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const tituloParam = searchParams.get('titulo') || '';
  const fechaParam = searchParams.get('fecha') || '';
  const categoriaIdParam = searchParams.get('categoriaId') || '';
  const pageParam = Math.max(0, parseInt(searchParams.get('page') || '0', 10));

  // Inicializar con caché si existe para evitar mostrar pantalla de carga al reingresar
  const [events, setEvents] = useState(() => (cachedEventsData ? cachedEventsData.events : []));
  const [loading, setLoading] = useState(() => !cachedEventsData);
  const [initialScreenLoading, setInitialScreenLoading] = useState(
    () => isFirstVisit && !cachedEventsData
  );
  const [categoryList, setCategoryList] = useState(
    () => (cachedCategoriesData ? cachedCategoriesData.names : [])
  );
  const [featuredCategories, setFeaturedCategories] = useState(
    () => (cachedCategoriesData ? cachedCategoriesData.featured : [])
  );
  const [loadingCategories, setLoadingCategories] = useState(() => !cachedCategoriesData);
  const [totalElements, setTotalElements] = useState(
    () => (cachedEventsData ? cachedEventsData.totalElements : 0)
  );
  const [totalPages, setTotalPages] = useState(
    () => (cachedEventsData ? cachedEventsData.totalPages : 1)
  );
  const [searchInput, setSearchInput] = useState(tituloParam);

  useEffect(() => {
    if (!loading) {
      try {
        sessionStorage.setItem('eh_visited_buscar', 'true');
      } catch {
        // Safe fallback
      }
      const timer = setTimeout(() => {
        setInitialScreenLoading(false);
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [loading]);

  // Cargar categorías disponibles y categorías destacadas desde el backend
  useEffect(() => {
    let isMounted = true;
    if (!cachedCategoriesData) {
      setLoadingCategories(true);
    }
    Promise.allSettled([
      getCategoryNames(),
      getFeaturedCategories(),
    ]).then(([namesRes, featRes]) => {
      if (!isMounted) return;
      const names = namesRes.status === 'fulfilled' && Array.isArray(namesRes.value) ? namesRes.value : [];
      const feat = featRes.status === 'fulfilled' && Array.isArray(featRes.value) ? featRes.value : [];
      setCategoryList(names);
      setFeaturedCategories(feat);
      cachedCategoriesData = { names, featured: feat };
      setLoadingCategories(false);
    });

    return () => {
      isMounted = false;
    };
  }, []);

  // Sincronizar input con URL
  useEffect(() => {
    setSearchInput(tituloParam);
  }, [tituloParam]);

  // Cargar eventos con exactamente 12 eventos por página (size=12)
  useEffect(() => {
    let isMounted = true;
    if (!cachedEventsData || tituloParam || fechaParam || categoriaIdParam || pageParam > 0) {
      setLoading(true);
    }

    const loadData = async () => {
      try {
        const hasTitle = Boolean(tituloParam.trim());
        const hasDate = Boolean(fechaParam.trim());
        const hasCategory = Boolean(categoriaIdParam);

        // Caso 1: Búsqueda por término textual
        if (hasTitle) {
          const fetchSize = (hasDate || hasCategory) ? 60 : PAGE_SIZE;
          const result = await searchEvents({
            titulo: tituloParam.trim(),
            page: (hasDate || hasCategory) ? 0 : pageParam,
            size: fetchSize,
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
            const start = pageParam * PAGE_SIZE;
            const paginated = filtered.slice(start, start + PAGE_SIZE);
            return {
              events: paginated,
              total: filtered.length,
              totalPages: Math.max(1, Math.ceil(filtered.length / PAGE_SIZE)),
              currentPage: pageParam,
            };
          }

          return result;
        }

        // Caso 2: Sin término textual -> consulta paginada al backend con size: 12
        return await getEvents({
          categoriaId: hasCategory ? Number(categoriaIdParam) : undefined,
          fecha: hasDate ? fechaParam.trim() : undefined,
          page: pageParam,
          size: PAGE_SIZE,
        });
      } catch (err) {
        console.warn('Error al cargar eventos:', err?.message);
        return { events: [], total: 0, totalPages: 1, currentPage: 0 };
      }
    };

    loadData()
      .then(({ events: results, total, totalPages: pages }) => {
        if (!isMounted) return;
        const validEvents = results || [];
        const validTotal = total || validEvents.length;
        const validPages = pages || 1;
        setEvents(validEvents);
        setTotalElements(validTotal);
        setTotalPages(validPages);

        if (!tituloParam.trim() && !fechaParam.trim() && !categoriaIdParam && pageParam === 0) {
          cachedEventsData = {
            events: validEvents,
            totalElements: validTotal,
            totalPages: validPages,
          };
        }
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [tituloParam, fechaParam, categoriaIdParam, pageParam]);

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

  const handleSearchSubmit = (e) => {
    if (e && e.preventDefault) e.preventDefault();
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
    { label: 'Todas las categorías', value: '' },
    ...categoryList.map((cat) => ({ label: cat.nombre, value: String(cat.id) })),
  ], [categoryList]);

  const hasActiveFilters = Boolean(tituloParam || fechaParam || categoriaIdParam);
  const activeCategory = categoryList.find((c) => String(c.id) === String(categoriaIdParam));

  // Distribución en columnas orgánicas: permite que la primera card sea alta y que las demás encajen perfectamente sin dejar huecos
  const masonryColumns = useMemo(() => {
    const cols = Array.from({ length: colCount }, () => []);
    events.forEach((ev, idx) => {
      cols[idx % colCount].push({ event: ev, index: idx });
    });
    return cols;
  }, [events, colCount]);

  const skeletonColumns = useMemo(() => {
    const cols = Array.from({ length: colCount }, () => []);
    Array.from({ length: PAGE_SIZE }).forEach((_, idx) => {
      cols[idx % colCount].push(idx);
    });
    return cols;
  }, [colCount]);

  if (initialScreenLoading) {
    return (
      <HiveBeeLoader
        text="Cargando..."
        subtext="Cartelera de eventos en Cartagena"
        fullScreen={true}
      />
    );
  }

  return (
    <div className="w-full min-h-screen bg-slate-50 dark:bg-[#070D1B] text-slate-900 dark:text-slate-100 flex flex-col justify-between font-body relative transition-colors duration-200">
      {/* Fondo interactivo de puntitos */}
      <FloatingDotsBackground />

      {/* Navbar de EventHive */}
      <Navbar />

      <main className="flex-1 max-w-[1550px] w-full mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 py-6 sm:py-8 relative z-10">
        {/* BARRA DE FILTROS FLOTANTE CON SEARCH ALARGADO Y Z-INDEX ELEVADO */}
        {/* 1) Search (Alargado) -> 2) Categorías -> 3) Fecha (Cuándo) -> Botón "Buscar eventos" */}
        <section aria-label="Buscador y filtros" className="w-full max-w-6xl mx-auto mb-10 sm:mb-12 relative z-50">
          <form
            onSubmit={handleSearchSubmit}
            className="w-full relative z-50 rounded-2xl md:rounded-full bg-white dark:bg-[#111A2E]/95 border border-slate-200 dark:border-white/10 p-2 sm:p-2.5 shadow-lg dark:shadow-2xl backdrop-blur-md flex flex-col md:flex-row items-center gap-2.5 md:gap-3 transition-colors"
          >
            {/* 1. Buscador ALARGADO (Mayor ancho y expansión visual) */}
            <div className="relative flex-1 w-full min-w-[280px] lg:min-w-[420px]">
              <FiSearch
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500"
                size={18}
              />
              <input
                id="event-search"
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Buscar por evento, lugar o artista..."
                className="h-11 sm:h-12 w-full rounded-xl md:rounded-full bg-transparent pl-11 pr-9 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
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
                  aria-label="Limpiar término"
                  className="absolute right-3 top-1/2 -translate-y-1/2 flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-xs text-slate-500 hover:text-slate-800 dark:hover:text-white cursor-pointer"
                >
                  ✕
                </button>
              )}
            </div>
            {/* Botón Buscar eventos */}
            <button
              type="submit"
              aria-label="Buscar eventos"
              className="flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-full bg-amber-500 p-0 text-slate-950 shadow-md transition-all duration-200 hover:bg-amber-400 active:scale-95 sm:h-12 sm:w-12"
            >
              <FiSearch size={18} className="block shrink-0" />
            </button>

            {/* Divisor en desktop */}
            <div className="hidden md:block h-7 w-[1px] bg-slate-200 dark:bg-white/10 shrink-0" />

            {/* 2. Categorías */}
            <div className="w-full md:w-auto md:min-w-[190px] relative z-50">
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

            {/* Divisor en desktop */}
            <div className="hidden md:block h-7 w-[1px] bg-slate-200 dark:bg-white/10 shrink-0" />

            {/* 3. Fecha (Cuándo) */}
            <div className="w-full md:w-auto md:min-w-[180px] relative z-50">
              <StyledDatePicker
                id="filtro-fecha"
                name="filtro-fecha"
                inlineLabel="Cuándo"
                value={formatFecha(fechaParam)}
                onChange={handleDateChange}
                variant={isDark ? 'dark' : 'light'}
                placeholder="Cualquier fecha"
              />
            </div>


          </form>

          {/* Chips de filtros activos si los hay */}
          {hasActiveFilters && (
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-3 px-2">
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                Filtros activos:
              </span>
              {activeCategory && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-700 dark:text-amber-300 text-xs font-bold">
                  {activeCategory.nombre}
                  <button
                    type="button"
                    onClick={() => {
                      const next = new URLSearchParams(searchParams);
                      next.delete('categoriaId');
                      next.delete('page');
                      setSearchParams(next);
                    }}
                    className="hover:text-amber-900 dark:hover:text-white cursor-pointer"
                  >
                    ×
                  </button>
                </span>
              )}
              {fechaParam && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-700 dark:text-amber-300 text-xs font-bold">
                  {fechaParam}
                  <button
                    type="button"
                    onClick={() => {
                      const next = new URLSearchParams(searchParams);
                      next.delete('fecha');
                      next.delete('page');
                      setSearchParams(next);
                    }}
                    className="hover:text-amber-900 dark:hover:text-white cursor-pointer"
                  >
                    ×
                  </button>
                </span>
              )}
              {tituloParam && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-700 dark:text-amber-300 text-xs font-bold">
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
                    className="hover:text-amber-900 dark:hover:text-white cursor-pointer"
                  >
                    ×
                  </button>
                </span>
              )}
              <button
                type="button"
                onClick={handleClearFilters}
                className="text-xs text-rose-500 hover:text-rose-600 dark:hover:text-rose-400 font-bold ml-1 cursor-pointer flex items-center gap-1"
              >
                <FiX size={13} />
                <span>Limpiar filtros</span>
              </button>
            </div>
          )}
        </section>

        {/* TÍTULO DE SELECCIÓN EDITORIAL */}
        <section aria-label="Selección Editorial" className="w-full mb-6 sm:mb-8 relative z-0">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <span className="text-amber-500 dark:text-amber-400 font-black text-xs uppercase tracking-widest block mb-1">
                SELECCIÓN EDITORIAL
              </span>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black uppercase tracking-tight text-slate-950 dark:text-white">
                Lo que está pasando
              </h2>
            </div>


          </div>
        </section>

        {/* GRID DE EVENTOS: Las cards encajan orgánicamente sin dejar huecos vacíos */}
        <section aria-label="Cartelera de eventos" className="w-full relative z-0">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 sm:gap-6 items-start w-full">
              {skeletonColumns.map((colItems, colIdx) => (
                <div key={colIdx} className="flex flex-col gap-5 sm:gap-6 w-full min-w-0">
                  {colItems.map((n) => (
                    <div key={n} className="w-full">
                      <EventCardSkeleton
                        featured={n === 0}
                        masonry={true}
                        notchBg="bg-[#F8FAFC] dark:bg-[#070D1B]"
                      />
                    </div>
                  ))}
                </div>
              ))}
            </div>
          ) : events.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 sm:gap-6 items-start w-full">
                {masonryColumns.map((colItems, colIdx) => (
                  <div key={colIdx} className="flex flex-col gap-5 sm:gap-6 w-full min-w-0">
                    {colItems.map(({ event, index }) => (
                      <div key={event.id || index} className="w-full">
                        <EventListCard
                          event={event}
                          featured={index === 0}
                          masonry={true}
                          notchBg="bg-[#F8FAFC] dark:bg-[#070D1B]"
                        />
                      </div>
                    ))}
                  </div>
                ))}
              </div>

              {/* Paginación exacta de 12 eventos por página */}
              {totalElements > PAGE_SIZE && (
                <div className="mt-12 w-full max-w-lg mx-auto flex justify-center">
                  <Pagination
                    currentPage={pageParam + 1}
                    totalItems={totalElements}
                    pageSize={PAGE_SIZE}
                    onPageChange={(p) => handlePageChange(p - 1)}
                    minimal={true}
                  />
                </div>
              )}
            </>
          ) : (
            <div className="w-full max-w-lg mx-auto flex flex-col items-center rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111A2E] p-10 text-center shadow-sm my-8">
              <div className="w-14 h-14 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                <FiCalendar size={24} />
              </div>
              <h3 className="text-lg sm:text-xl font-extrabold text-slate-950 dark:text-white tracking-tight uppercase mb-2">
                No encontramos eventos con estos criterios
              </h3>
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

        {/* 3. CINTA CINÉTICA Y CATEGORÍAS DESTACADAS */}
        {(loadingCategories || featuredCategories.length > 0) && (
          <section aria-label="Explora por interés" className="relative isolate w-full mt-16 sm:mt-24 pt-10 border-t border-slate-200 dark:border-white/10 overflow-hidden">
            <style>{`
              @keyframes categoryDrift { 0%, 100% { transform: translate3d(0, 0, 0) rotate(0deg); } 50% { transform: translate3d(12px, -18px, 0) rotate(12deg); } }
              @keyframes categoryShimmer { 0% { transform: translateX(-120%); } 100% { transform: translateX(120%); } }
              @keyframes categoryGlow { to { transform: rotate(360deg); } }
              @media (prefers-reduced-motion: reduce) { .category-motion { animation: none !important; transition: none !important; } }
            `}</style>
            <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
              <div className="absolute -top-10 left-[12%] h-40 w-40 rounded-full bg-amber-400/10 blur-3xl" />
              <div className="absolute top-1/3 right-[8%] h-48 w-48 rounded-full bg-fuchsia-500/10 blur-3xl" />
              {Array.from({ length: 9 }).map((_, i) => (
                <span key={i} className="category-motion absolute h-1.5 w-1.5 rounded-full bg-amber-400/70 shadow-[0_0_14px_rgba(251,191,36,0.8)]" style={{ left: `${8 + ((i * 13) % 87)}%`, top: `${10 + ((i * 19) % 78)}%`, animation: `categoryDrift ${4 + (i % 4)}s ease-in-out ${i * -0.6}s infinite` }} />
              ))}
            </div>

            <div className="relative z-10 mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between sm:mb-8">
              <div>
                <span className="text-amber-500 dark:text-amber-400 font-black text-xs uppercase tracking-widest block mb-1">EXPLORA POR INTERÉS</span>
                <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-slate-950 dark:text-white">Tu ciudad, a tu manera</h2>
              </div>
              <Link to="/categorias" className="inline-flex items-center gap-1 text-xs sm:text-sm font-bold text-amber-500 hover:text-amber-400 uppercase tracking-wider transition-colors">
                <span>Ver todas</span><FiArrowUpRight size={16} />
              </Link>
            </div>

            {loadingCategories ? (
              <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6 w-full">
                {Array.from({ length: 4 }).map((_, i) => <div key={i} className="rounded-2xl h-52 sm:h-60 md:h-64 bg-slate-200 dark:bg-slate-800 animate-pulse" />)}
              </div>
            ) : (
              <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6 w-full">
                {featuredCategories.slice(0, 4).map((cat, index) => {
                  const imageUrl = cat.imagenUrl || cat.urlFoto || cat.foto || cat.imagen;
                  const eventCount = cat.totalEventos ?? 0;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      aria-label={`${cat.nombre}, ${eventCount} ${eventCount === 1 ? 'evento' : 'eventos'}`}
                      onClick={() => {
                        const next = new URLSearchParams(searchParams);
                        next.delete('page');
                        next.set('categoriaId', String(cat.id));
                        setSearchParams(next);
                        window.scrollTo({ top: 180, behavior: 'smooth' });
                      }}
                      className="group category-motion relative isolate flex h-52 w-full cursor-pointer flex-col justify-end overflow-hidden rounded-2xl border border-white/20 bg-slate-900 p-4 text-left shadow-lg transition-all duration-300 ease-out hover:-translate-y-2 hover:rotate-1 hover:shadow-[0_20px_50px_rgba(245,158,11,0.25)] active:scale-95 sm:h-60 sm:p-5 md:h-64"
                      style={{ transitionDelay: `${index * 35}ms` }}
                    >
                      <div aria-hidden="true" className="absolute -inset-[2px] -z-10 rounded-[18px] bg-[conic-gradient(from_var(--glow-angle),#f59e0b,#ec4899,#8b5cf6,#22d3ee,#f59e0b)] opacity-0 blur-sm transition-opacity duration-300 group-hover:opacity-100 category-motion" style={{ animation: 'categoryGlow 5s linear infinite' }} />
                      {imageUrl && <div className="absolute inset-0"><ImageWithFallback src={imageUrl} alt={cat.nombre} className="w-full h-full" imgClassName="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-110" /></div>}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent pointer-events-none" />
                      <span className="absolute right-3 top-3 z-10 rounded-full border border-white/25 bg-black/45 px-3 py-1.5 text-[10px] font-extrabold tracking-wide text-white backdrop-blur-md">
                        {eventCount} {eventCount === 1 ? 'EVENTO' : 'EVENTOS'}
                      </span>
                      <span aria-hidden="true" className="absolute right-3 bottom-14 z-10 flex h-9 w-9 translate-y-2 items-center justify-center rounded-full bg-amber-400 text-slate-950 opacity-0 shadow-lg transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100"><FiArrowUpRight size={18} /></span>
                      <div className="relative z-10 w-full min-w-0">
                        <h4 className="text-sm sm:text-base font-extrabold uppercase text-white truncate tracking-tight transition-colors group-hover:text-amber-300 drop-shadow-sm">{cat.nombre}</h4>
                        <span className="mt-1 block text-xs font-semibold text-slate-200 drop-shadow-xs">Descubre experiencias</span>
                      </div>
                      <span aria-hidden="true" className="absolute bottom-0 left-0 h-1 w-full origin-left scale-x-0 bg-gradient-to-r from-amber-400 via-pink-500 to-violet-500 transition-transform duration-500 group-hover:scale-x-100" />
                      <span aria-hidden="true" className="pointer-events-none absolute inset-y-0 -left-1/2 w-1/3 skew-x-[-20deg] bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 category-motion" style={{ animation: 'categoryShimmer 1.1s ease-out' }} />
                    </button>
                  );
                })}
              </div>
            )}
          </section>
        )}
      </main>

      {/* Pre-Footer compartido */}
      <CityRhythmPreFooter />

      {/* Footer corporativo */}
      <Footer />
    </div>
  );
}
