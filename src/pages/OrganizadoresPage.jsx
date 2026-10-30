import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FiSearch,
  FiTrendingUp,
  FiSmartphone,
  FiArrowRight,
  FiCalendar,
  FiUsers,
  FiGrid,
  FiInfo,
  FiAward,
  FiShield,
  FiZap,
} from 'react-icons/fi';
import Navbar from '../components/usersComponets/Navbar.jsx';
import HiveBeeLoader from '../components/common/HiveBeeLoader.jsx';
import Footer from '../components/usersComponets/Footer.jsx';
import { organizationService } from '../services/organizerService.js';
import { session, normalizeRole } from '../services/session.js';
import OrganizationListCard from '../components/common/OrganizationListCard.jsx';
import OrganizationCardSkeleton from '../components/common/OrganizationCardSkeleton.jsx';
import Pagination from '../components/Shared/Pagination.jsx';
import FloatingDotsBackground from '../components/common/FloatingDotsBackground.jsx';
import CityRhythmPreFooter from '../components/home/CityRhythmPreFooter.jsx';
import { useLenisScroll } from '../hooks/useLenisScroll.js';

const PAGE_SIZE = 6;

// Caché en memoria para transiciones instantáneas entre páginas
let cachedOrgsData = null;

const hasVisitedOrganizaciones = () => {
  try {
    return sessionStorage.getItem('eh_visited_organizaciones') === 'true';
  } catch {
    return false;
  }
};

export default function OrganizadoresPage() {
  useLenisScroll();
  const isFirstVisit = !hasVisitedOrganizaciones();

  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState('directorio'); // 'directorio' | 'informacion'

  // Inicializar con datos en caché para evitar pantalla de carga al reingresar
  const [organizations, setOrganizations] = useState(() => (cachedOrgsData ? cachedOrgsData.organizations : []));
  const [totalElements, setTotalElements] = useState(() => (cachedOrgsData ? cachedOrgsData.totalElements : 0));
  const [loading, setLoading] = useState(() => !cachedOrgsData);
  const [initialScreenLoading, setInitialScreenLoading] = useState(
    () => isFirstVisit && !cachedOrgsData
  );

  // Determinar rol para el botón de acción principal
  const currentUser = session.getUser();
  const userRole = normalizeRole(currentUser?.rol || currentUser?.role);
  const isOrganizer = ['REPRESENTANTE', 'OPERADOR', 'ADMINISTRADOR'].includes(userRole);

  useEffect(() => {
    let isMounted = true;
    if (!cachedOrgsData || searchTerm.trim() || currentPage > 1) {
      setLoading(true);
    }

    const fetchOrgs = async () => {
      try {
        if (searchTerm.trim()) {
          const res = await organizationService.searchOrganizations(searchTerm.trim(), {
            page: currentPage - 1,
            size: PAGE_SIZE,
          });
          return res;
        }

        const res = await organizationService.listOrganizations({
          page: currentPage - 1,
          size: PAGE_SIZE,
          estado: 'APROBADA',
          skipAuth: true,
        });
        return res;
      } catch (err) {
        console.warn('Error al cargar organizaciones:', err?.message);
        return { organizations: [], total: 0 };
      }
    };

    fetchOrgs()
      .then((res) => {
        if (!isMounted) return;
        const orgs = res?.organizations || [];
        const total = res?.total ?? orgs.length;
        setOrganizations(orgs);
        setTotalElements(total);

        if (!searchTerm.trim() && currentPage === 1) {
          cachedOrgsData = {
            organizations: orgs,
            totalElements: total,
          };
        }
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [searchTerm, currentPage]);

  useEffect(() => {
    if (!loading) {
      try {
        sessionStorage.setItem('eh_visited_organizaciones', 'true');
      } catch {
        // Safe fallback
      }
      const timer = setTimeout(() => {
        setInitialScreenLoading(false);
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [loading]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  if (initialScreenLoading) {
    return (
      <HiveBeeLoader
        text="Cargando..."
        subtext="Directorio de Organizaciones de Cartagena"
        fullScreen={true}
      />
    );
  }

  return (
    <div className="w-full min-h-screen bg-[#F8FAFC] dark:bg-[#070D1B] text-slate-900 dark:text-slate-100 flex flex-col justify-between font-body overflow-x-clip max-w-full relative transition-colors duration-200">
      {/* Fondo interactivo de puntitos adaptable a temas */}
      <FloatingDotsBackground />

      {/* Navbar principal */}
      <Navbar />

      <main className="flex-1 w-[94%] sm:w-[90%] lg:w-[85%] max-w-6xl xl:max-w-7xl mx-auto py-6 sm:py-8 min-w-0 relative z-10">
        {/* Encabezado del directorio con badge de marca y búsqueda elegante */}
        <header className="relative mb-6 sm:mb-8 overflow-hidden rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-white/80 dark:bg-[#0E1626]/80 px-6 py-8 sm:px-10 sm:py-10 text-center shadow-xs backdrop-blur-md transition-colors">
          {/* Luces decorativas ambientales de tono ámbar */}
          <div aria-hidden="true" className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-amber-500/10 dark:bg-amber-400/10 blur-3xl" />
          <div aria-hidden="true" className="pointer-events-none absolute -left-16 -bottom-20 h-56 w-56 rounded-full bg-amber-500/5 dark:bg-amber-400/5 blur-3xl" />

          <div className="relative flex w-full flex-col items-stretch">

            <h1 className="w-full font-display text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-slate-950 dark:text-white text-left leading-tight">
              Organizaciones y Productores
            </h1>
            <p className="mt-2.5 w-full text-left text-xs sm:text-sm leading-relaxed text-slate-600 dark:text-slate-400">
              Conecta con los productores, colectivos y promotores independientes que impulsan la cartelera cultural y de entretenimiento en Cartagena.
            </p>

            {/* Input de Búsqueda Sutil y Ergonómico */}
            <div role="search" className="relative mt-6 sm:mt-7 w-full">
              <label htmlFor="organization-search" className="sr-only">
                Buscar organización por nombre
              </label>
              <input
                id="organization-search"
                type="text"
                value={searchTerm}
                onChange={handleSearchChange}
                placeholder="Buscar por nombre de organización..."
                className="h-12 w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#070D1B] pl-11 pr-11 text-xs sm:text-sm text-slate-900 dark:text-white shadow-2xs transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-amber-500 dark:focus:border-amber-400 focus:outline-none focus:ring-4 focus:ring-amber-500/15"
              />
              <FiSearch className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={17} />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  aria-label="Limpiar búsqueda"
                  className="absolute right-3.5 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-bold text-slate-500 dark:text-slate-400 transition-colors cursor-pointer"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        </header>

        {/* Barra de Filtros: Tabs segmentados a la izquierda y Botón de Acción destacado a la derecha */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-6 mb-7">
          <div className="inline-flex p-1 bg-slate-200/60 dark:bg-slate-900/80 rounded-2xl border border-slate-200/80 dark:border-slate-800 gap-1 self-start sm:self-auto backdrop-blur-xs">
            <button
              type="button"
              onClick={() => setActiveTab('directorio')}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 cursor-pointer ${
                activeTab === 'directorio'
                  ? 'bg-white dark:bg-[#0E1626] text-slate-950 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white'
              }`}
            >
              <FiGrid size={14} className={activeTab === 'directorio' ? 'text-amber-500' : ''} />
              <span>Directorio</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('informacion')}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 cursor-pointer ${
                activeTab === 'informacion'
                  ? 'bg-white dark:bg-[#0E1626] text-slate-950 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white'
              }`}
            >
              <FiInfo size={14} className={activeTab === 'informacion' ? 'text-amber-500' : ''} />
              <span>Información</span>
            </button>
          </div>

          
        </div>

        {/* Tab 1: Directorio de Tarjetas de Organización */}
        {activeTab === 'directorio' && (
          <section className="w-full">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 w-full">
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <OrganizationCardSkeleton key={n} />
                ))}
              </div>
            ) : organizations.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 w-full">
                  {organizations.map((org) => (
                    <OrganizationListCard key={org.id} org={org} />
                  ))}
                </div>

                {/* Paginación Minimalista y Centrada */}
                {totalElements > PAGE_SIZE && (
                  <div className="mt-10 flex justify-center w-full">
                    <Pagination
                      currentPage={currentPage}
                      totalItems={totalElements}
                      pageSize={PAGE_SIZE}
                      onPageChange={(p) => {
                        setCurrentPage(p);
                        window.scrollTo({ top: 180, behavior: 'smooth' });
                      }}
                      minimal={true}
                    />
                  </div>
                )}
              </>
            ) : (
              <div className="rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-[#0E1626] p-10 sm:p-12 text-center max-w-lg mx-auto shadow-xs my-8">
                <div className="w-14 h-14 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto mb-4 text-xl shadow-2xs">
                  <FiUsers size={24} />
                </div>
                <h2 className="text-lg sm:text-xl font-black text-slate-950 dark:text-white tracking-tight uppercase mb-2">
                  No se encontraron organizaciones
                </h2>
                <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm max-w-md mx-auto mb-6 leading-relaxed">
                  {searchTerm.trim()
                    ? `No hay coincidencias para el término “${searchTerm}”. Intenta con otra palabra clave.`
                    : 'Aún no hay organizaciones activas registradas en el catálogo.'}
                </p>
                {searchTerm.trim() && (
                  <button
                    type="button"
                    onClick={() => setSearchTerm('')}
                    className="px-6 py-2.5 rounded-xl bg-slate-900 dark:bg-amber-500 hover:bg-amber-500 hover:text-slate-950 text-white dark:text-slate-950 text-xs font-black uppercase tracking-wider transition-all duration-200 cursor-pointer shadow-xs active:scale-95"
                  >
                    Limpiar búsqueda
                  </button>
                )}
              </div>
            )}
          </section>
        )}

        {/* Tab 2: Información Para Productores y Promotores */}
        {activeTab === 'informacion' && (
          <section className="space-y-8 animate-in fade-in duration-300">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white dark:bg-[#0E1626] rounded-3xl border border-slate-200/90 dark:border-slate-800 p-6 sm:p-7 shadow-xs hover:shadow-md hover:border-amber-400/50 dark:hover:border-amber-400/30 transition-all duration-200 group">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 dark:bg-amber-400/15 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <FiCalendar size={22} />
                </div>
                <h3 className="font-display font-black text-slate-900 dark:text-white text-base sm:text-lg mb-2">
                  Publicación Inmediata
                </h3>
                <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm leading-relaxed font-normal">
                  Crea eventos en minutos, añade galerías fotográficas, fechas, múltiples localidades de boletería y geolocalización en el mapa interactivo de Cartagena.
                </p>
              </div>

              <div className="bg-white dark:bg-[#0E1626] rounded-3xl border border-slate-200/90 dark:border-slate-800 p-6 sm:p-7 shadow-xs hover:shadow-md hover:border-amber-400/50 dark:hover:border-amber-400/30 transition-all duration-200 group">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 dark:bg-amber-400/15 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <FiSmartphone size={22} />
                </div>
                <h3 className="font-display font-black text-slate-900 dark:text-white text-base sm:text-lg mb-2">
                  Pases Digitales con QR Seguro
                </h3>
                <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm leading-relaxed font-normal">
                  Valida entradas en el acceso a tu evento en segundos con nuestro lector QR seguro en tiempo real, erradicando pases duplicados o falsificados.
                </p>
              </div>

              <div className="bg-white dark:bg-[#0E1626] rounded-3xl border border-slate-200/90 dark:border-slate-800 p-6 sm:p-7 shadow-xs hover:shadow-md hover:border-amber-400/50 dark:hover:border-amber-400/30 transition-all duration-200 group">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 dark:bg-amber-400/15 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <FiTrendingUp size={22} />
                </div>
                <h3 className="font-display font-black text-slate-900 dark:text-white text-base sm:text-lg mb-2">
                  Métricas y Analíticas en Vivo
                </h3>
                <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm leading-relaxed font-normal">
                  Supervisa la velocidad de venta de entradas, volumen de recaudación y el nivel de interacción de los asistentes en un panel analítico completo.
                </p>
              </div>
            </div>

            {/* Banner de Registro de Organización con acabados finos */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#0B132B] via-[#0E1626] to-[#131E3A] p-8 sm:p-10 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 border border-slate-700/60 transition-colors duration-200">
              <div aria-hidden="true" className="pointer-events-none absolute -right-20 -bottom-20 w-64 h-64 bg-amber-500/15 rounded-full blur-3xl" />

              <div className="max-w-xl space-y-2 relative z-10">
                <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 text-[10px] font-bold uppercase tracking-widest">
                  <FiZap size={11} className="text-amber-400" />
                  Al ritmo de la ciudad
                </span>
                <h2 className="font-display text-xl sm:text-2xl font-black text-white">
                  Lleva tu cartelera de eventos al siguiente nivel
                </h2>
                <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
                  Únete hoy a la mayor red de productores culturales en Cartagena de Indias y aprovecha nuestras herramientas de venta y difusión.
                </p>
              </div>

              <Link
                to="/registro"
                className="relative z-10 inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs uppercase tracking-wider shadow-sm transition-all duration-200 ease-out active:scale-95 shrink-0 cursor-pointer"
              >
                <span>Registrar mi Organización</span>
                <FiArrowRight size={14} />
              </Link>
            </div>
          </section>
        )}
      </main>

      {/* Pre-Footer y Footer compartidos */}
      <CityRhythmPreFooter />
      <Footer />
    </div>
  );
}
