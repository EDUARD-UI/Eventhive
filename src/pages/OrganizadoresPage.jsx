import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FiSearch,
  FiTrendingUp,
  FiSmartphone,
  FiArrowRight,
  FiCalendar,
  FiUsers,
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

export default function OrganizadoresPage() {
  useLenisScroll();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState('directorio'); // 'directorio' | 'informacion'
  const [organizations, setOrganizations] = useState([]);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(true);
  const [initialScreenLoading, setInitialScreenLoading] = useState(true);

  // Determinar rol para el botón de acción principal
  const currentUser = session.getUser();
  const userRole = normalizeRole(currentUser?.rol || currentUser?.role);
  const isOrganizer = ['REPRESENTANTE', 'OPERADOR', 'ADMINISTRADOR'].includes(userRole);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

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
        setOrganizations(res?.organizations || []);
        setTotalElements(res?.total ?? (res?.organizations ? res.organizations.length : 0));
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
      const timer = setTimeout(() => {
        setInitialScreenLoading(false);
      }, 550);
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
      {/* Fondo interactivo de puntitos que se adapta al modo claro y oscuro */}
      <FloatingDotsBackground />

      {/* Navbar idéntico */}
      <Navbar />

      <main className="flex-1 w-[94%] sm:w-[90%] lg:w-[85%] max-w-7xl mx-auto py-8 sm:py-12 min-w-0 relative z-10">
        {/* Encabezado del directorio y búsqueda, agrupados y centrados */}
        <header className="relative mb-8 overflow-hidden rounded-3xl border border-slate-200/80 bg-white/85 px-5 py-8 text-center shadow-sm backdrop-blur-sm dark:border-slate-800 dark:bg-[#0B1428]/85 sm:px-8 sm:py-10">
          <div aria-hidden="true" className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-amber-400/10 blur-3xl" />
          <div className="relative flex flex-col items-center">
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-950 dark:text-white sm:text-4xl lg:text-5xl">
              Organizaciones y Productores
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-600 dark:text-slate-400 sm:text-base">
              Directorio oficial de colectivos, promotores y productores culturales en Cartagena.
            </p>

            <div role="search" className="relative mt-6 w-full max-w-xl">
              <label htmlFor="organization-search" className="sr-only">
                Buscar organización por nombre
              </label>
              <input
                id="organization-search"
                type="text"
                value={searchTerm}
                onChange={handleSearchChange}
                placeholder="Buscar organización por nombre..."
                className="h-12 w-full rounded-2xl border-2 border-slate-900 dark:border-white bg-white pl-11 pr-11 text-sm text-slate-900 shadow-sm transition-all placeholder:text-slate-400 focus:border-amber-500 dark:focus:border-amber-400 focus:outline-none focus:ring-4 focus:ring-amber-500/15 dark:bg-[#0B0F19] dark:text-white dark:placeholder:text-slate-500"
              />
              <FiSearch className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  aria-label="Limpiar búsqueda"
                  className="absolute right-3 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-500 transition-colors hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        </header>

        {/* Barra de Filtros: Tabs segmentados a la izquierda y Botón de Acción destacado a la derecha */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-6 mb-8">
          <div className="inline-flex p-1 bg-slate-200/70 dark:bg-slate-900/80 rounded-2xl border border-slate-200/80 dark:border-slate-800 gap-1 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setActiveTab('directorio')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 cursor-pointer ${
                activeTab === 'directorio'
                  ? 'bg-[#0B132B] dark:bg-amber-500 text-white dark:text-slate-950 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/60 dark:hover:bg-slate-800/60'
              }`}
            >
              Directorios
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('informacion')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 cursor-pointer ${
                activeTab === 'informacion'
                  ? 'bg-[#0B132B] dark:bg-amber-500 text-white dark:text-slate-950 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/60 dark:hover:bg-slate-800/60'
              }`}
            >
              Información
            </button>
          </div>

          <div className="self-end sm:self-auto">
            <Link
              to={isOrganizer ? '/organizacion' : '/registro'}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs sm:text-sm tracking-wide shadow-sm hover:shadow transition-all duration-200 active:scale-95 group"
            >
              <span>{isOrganizer ? 'Crear evento' : 'Registrar organización'}</span>
              <FiArrowRight
                size={15}
                className="transition-transform duration-200 group-hover:translate-x-0.5"
              />
            </Link>
          </div>
        </div>

        {/* Tab Directorio: Grid de Organizaciones (2 luego 2) */}
        {activeTab === 'directorio' && (
          <section className="w-full">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6 w-full">
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <OrganizationCardSkeleton key={n} />
                ))}
              </div>
            ) : organizations.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6 w-full">
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
              <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B1428] p-12 text-center max-w-lg mx-auto shadow-sm my-8">
                <div className="w-14 h-14 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto mb-4 text-xl">
                  <FiUsers size={24} />
                </div>
                <h2 className="text-lg sm:text-xl font-extrabold text-slate-950 dark:text-white tracking-tight uppercase mb-2">
                  No se encontraron organizaciones
                </h2>
                <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm max-w-md mx-auto mb-6 leading-relaxed">
                  {searchTerm.trim()
                    ? `No hay coincidencias para el término “${searchTerm}”.`
                    : 'Aún no hay organizaciones activas registradas en la plataforma.'}
                </p>
                {searchTerm.trim() && (
                  <button
                    type="button"
                    onClick={() => setSearchTerm('')}
                    className="px-6 py-2.5 rounded-xl bg-slate-950 dark:bg-amber-500 hover:bg-amber-500 hover:text-slate-950 text-white dark:text-slate-950 text-xs font-black uppercase tracking-wider transition-all duration-200 cursor-pointer shadow-xs active:scale-95"
                  >
                    Limpiar búsqueda
                  </button>
                )}
              </div>
            )}
          </section>
        )}

        {/* Tab Información Para Productores */}
        {activeTab === 'informacion' && (
          <section className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white dark:bg-[#0B132B] rounded-2xl border border-slate-200/90 dark:border-white/[0.08] p-6 shadow-sm hover:shadow-md hover:border-amber-400/50 dark:hover:border-amber-400/30 transition-all duration-200">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 dark:bg-amber-400/15 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-4">
                  <FiCalendar size={20} />
                </div>
                <h3 className="font-extrabold text-slate-900 dark:text-white text-base mb-2">
                  Publicación Inmediata
                </h3>
                <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm leading-relaxed font-normal">
                  Crea eventos en minutos, añade fotografías, fechas, horarios y ubicación en el mapa interactivo de Cartagena.
                </p>
              </div>

              <div className="bg-white dark:bg-[#0B132B] rounded-2xl border border-slate-200/90 dark:border-white/[0.08] p-6 shadow-sm hover:shadow-md hover:border-amber-400/50 dark:hover:border-amber-400/30 transition-all duration-200">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 dark:bg-amber-400/15 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-4">
                  <FiSmartphone size={20} />
                </div>
                <h3 className="font-extrabold text-slate-900 dark:text-white text-base mb-2">
                  Pases Digitales con QR
                </h3>
                <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm leading-relaxed font-normal">
                  Valida entradas en segundos con lector QR seguro, sin riesgo de pases duplicados.
                </p>
              </div>

              <div className="bg-white dark:bg-[#0B132B] rounded-2xl border border-slate-200/90 dark:border-white/[0.08] p-6 shadow-sm hover:shadow-md hover:border-amber-400/50 dark:hover:border-amber-400/30 transition-all duration-200">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 dark:bg-amber-400/15 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-4">
                  <FiTrendingUp size={20} />
                </div>
                <h3 className="font-extrabold text-slate-900 dark:text-white text-base mb-2">
                  Métricas en Tiempo Real
                </h3>
                <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm leading-relaxed font-normal">
                  Supervisa la venta de entradas, afluencia y el impacto de tus actividades culturales.
                </p>
              </div>
            </div>

            {/* Banner de Registro */}
            <div className="rounded-3xl bg-white dark:bg-[#0B132B] p-8 sm:p-10 text-slate-900 dark:text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 border border-slate-200/90 dark:border-white/[0.08] transition-colors duration-200">
              <div className="max-w-xl space-y-2">
                <span className="text-amber-600 dark:text-amber-400 font-bold text-xs uppercase tracking-widest block">
                  IMPULSA TUS EVENTOS EN CARTAGENA
                </span>
                <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
                  Lleva tu cartelera al siguiente nivel
                </h2>
                <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm leading-relaxed">
                  Únete a la red de productores y colectivos que impulsan la cultura y el entretenimiento en Cartagena.
                </p>
              </div>

              <Link
                to="/registro"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs uppercase tracking-wider shadow-sm transition-all duration-200 ease-out active:scale-95 shrink-0"
              >
                <span>Registrarme como Organización</span>
                <FiArrowRight size={14} />
              </Link>
            </div>
          </section>
        )}
      </main>

      {/* Pre-Footer compartido */}
      <CityRhythmPreFooter />

      {/* Footer idéntico */}
      <Footer />
    </div>
  );
}
