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
import Footer from '../components/usersComponets/Footer.jsx';
import { organizationService } from '../services/organizerService.js';
import { session, normalizeRole } from '../services/session.js';
import OrganizationListCard from '../components/common/OrganizationListCard.jsx';
import OrganizationCardSkeleton from '../components/common/OrganizationCardSkeleton.jsx';
import Pagination from '../components/Shared/Pagination.jsx';
import FloatingDotsBackground from '../components/common/FloatingDotsBackground.jsx';

const PAGE_SIZE = 8;

export default function OrganizadoresPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState('directorio'); // 'directorio' | 'informacion'
  const [organizations, setOrganizations] = useState([]);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(true);

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

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  return (
    <div className="w-full min-h-screen text-slate-900 flex flex-col justify-between font-body relative">
      {/* Fondo interactivo de puntitos negros brillantes flotando */}
      <FloatingDotsBackground />

      {/* Navbar idéntico */}
      <Navbar />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 relative z-10">
        {/* Cabecera / Título de la sección + Buscador integrado */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-5 pb-6 border-b border-slate-200/80">
          <div className="space-y-1.5 max-w-xl">
            <div className="flex items-center flex-wrap gap-2.5">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-950 tracking-tight uppercase">
                Organizaciones y Productores
              </h1>
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200/80 shadow-2xs">
                {loading ? (
                  <span className="inline-block animate-pulse">Cargando...</span>
                ) : (
                  `${totalElements} ${totalElements === 1 ? 'registrado' : 'registrados'}`
                )}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 font-normal leading-relaxed">
              Directorio oficial de colectivos, promotores y productores culturales en Cartagena.
            </p>
          </div>

          {/* Buscador Rápido con ancho óptimo y sin truncamiento */}
          <div className="relative w-full md:w-84 lg:w-96 shrink-0">
            <input
              type="text"
              value={searchTerm}
              onChange={handleSearchChange}
              placeholder="Buscar organización por nombre..."
              className="w-full h-11 bg-white border border-slate-300 hover:border-slate-400 focus:border-amber-500 rounded-xl pl-10 pr-9 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 transition-all shadow-xs"
            />
            <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-base pointer-events-none" />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                aria-label="Limpiar búsqueda"
                className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center text-xs font-bold transition-colors cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Barra de Filtros: Tabs segmentados a la izquierda y Botón de Acción destacado a la derecha */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-6 mb-8">
          <div className="inline-flex p-1 bg-slate-200/70 rounded-2xl border border-slate-200/80 gap-1 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setActiveTab('directorio')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 cursor-pointer ${
                activeTab === 'directorio'
                  ? 'bg-[#0B132B] text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              Directorio
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('informacion')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 cursor-pointer ${
                activeTab === 'informacion'
                  ? 'bg-[#0B132B] text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              Información para Productores
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

        {/* Tab Directorio: Grilla de Credenciales / Boletos Verticales */}
        {activeTab === 'directorio' && (
          <section>
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7">
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <OrganizationCardSkeleton key={n} notchBg="bg-white" />
                ))}
              </div>
            ) : organizations.length > 0 ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7">
                  {organizations.map((org) => (
                    <OrganizationListCard key={org.id} org={org} notchBg="bg-white" />
                  ))}
                </div>

                {/* Paginación */}
                {totalElements > PAGE_SIZE && (
                  <div className="mt-10 rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs">
                    <Pagination
                      currentPage={currentPage}
                      totalItems={totalElements}
                      pageSize={PAGE_SIZE}
                      onPageChange={(p) => {
                        setCurrentPage(p);
                        window.scrollTo({ top: 180, behavior: 'smooth' });
                      }}
                      showPageSize={false}
                    />
                  </div>
                )}
              </>
            ) : (
              <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center max-w-lg mx-auto shadow-sm my-8">
                <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-4 text-xl">
                  <FiUsers size={24} />
                </div>
                <h2 className="text-lg sm:text-xl font-extrabold text-slate-950 tracking-tight uppercase mb-2">
                  No se encontraron organizaciones
                </h2>
                <p className="text-slate-600 text-xs sm:text-sm max-w-md mx-auto mb-6 leading-relaxed">
                  {searchTerm.trim()
                    ? `No hay coincidencias para el término “${searchTerm}”.`
                    : 'Aún no hay organizaciones activas registradas en la plataforma.'}
                </p>
                {searchTerm.trim() && (
                  <button
                    type="button"
                    onClick={() => setSearchTerm('')}
                    className="px-6 py-2.5 rounded-xl bg-slate-950 hover:bg-amber-500 hover:text-slate-950 text-white text-xs font-black uppercase tracking-wider transition-all duration-200 cursor-pointer shadow-xs active:scale-95"
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
              <div className="bg-[#0D182E] rounded-2xl border border-slate-800 p-6 shadow-md hover:border-slate-700 transition-all duration-200">
                <div className="w-10 h-10 rounded-xl bg-slate-800 text-amber-400 flex items-center justify-center mb-4">
                  <FiCalendar size={20} />
                </div>
                <h3 className="font-extrabold text-white text-base mb-2">
                  Publicación Inmediata
                </h3>
                <p className="text-slate-300 text-xs sm:text-sm leading-relaxed font-normal">
                  Crea eventos en minutos, añade fotografías, fechas, horarios y ubicación en el mapa interactivo de Cartagena.
                </p>
              </div>

              <div className="bg-[#0D182E] rounded-2xl border border-slate-800 p-6 shadow-md hover:border-slate-700 transition-all duration-200">
                <div className="w-10 h-10 rounded-xl bg-slate-800 text-amber-400 flex items-center justify-center mb-4">
                  <FiSmartphone size={20} />
                </div>
                <h3 className="font-extrabold text-white text-base mb-2">
                  Pases Digitales con QR
                </h3>
                <p className="text-slate-300 text-xs sm:text-sm leading-relaxed font-normal">
                  Valida entradas en segundos con lector QR seguro, sin riesgo de pases duplicados.
                </p>
              </div>

              <div className="bg-[#0D182E] rounded-2xl border border-slate-800 p-6 shadow-md hover:border-slate-700 transition-all duration-200">
                <div className="w-10 h-10 rounded-xl bg-slate-800 text-amber-400 flex items-center justify-center mb-4">
                  <FiTrendingUp size={20} />
                </div>
                <h3 className="font-extrabold text-white text-base mb-2">
                  Métricas en Tiempo Real
                </h3>
                <p className="text-slate-300 text-xs sm:text-sm leading-relaxed font-normal">
                  Supervisa la venta de entradas, afluencia y el impacto de tus actividades culturales.
                </p>
              </div>
            </div>

            {/* Banner de Registro */}
            <div className="rounded-3xl bg-[#0D182E] p-8 sm:p-10 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 border border-slate-800">
              <div className="max-w-xl space-y-2">
                <span className="text-amber-400 font-bold text-xs uppercase tracking-widest block">
                  IMPULSA TUS EVENTOS EN CARTAGENA
                </span>
                <h2 className="text-xl sm:text-2xl font-extrabold text-white">
                  Lleva tu cartelera al siguiente nivel
                </h2>
                <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
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

      {/* Footer idéntico */}
      <Footer />
    </div>
  );
}
