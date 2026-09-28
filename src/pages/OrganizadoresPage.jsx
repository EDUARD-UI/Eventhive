import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  FiSearch,
  FiPlusCircle,
  FiCheckCircle,
  FiShield,
  FiTrendingUp,
  FiSmartphone,
  FiArrowRight,
  FiCalendar,
} from 'react-icons/fi';
import Navbar from '../components/usersComponets/Navbar.jsx';
import Footer from '../components/usersComponets/Footer.jsx';
import { organizationService } from '../services/organizerService.js';
import ImageWithFallback from '../components/common/ImageWithFallback.jsx';
import Pagination from '../components/Shared/Pagination.jsx';

const PAGE_SIZE = 8;

export default function OrganizadoresPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState('directorio'); // 'directorio' | 'informacion'
  const [topOrganizations, setTopOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    organizationService.listTopOrganizations({ page: 0, size: 24 })
      .then((topRes) => {
        if (!isMounted) return;
        setTopOrganizations(topRes?.organizations || []);
      })
      .catch(() => {})
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredOrganizations = useMemo(() => {
    if (!searchTerm.trim()) return topOrganizations;
    const term = searchTerm.toLowerCase();
    return topOrganizations.filter(
      (org) =>
        org.name?.toLowerCase().includes(term) ||
        org.category?.toLowerCase().includes(term) ||
        org.description?.toLowerCase().includes(term)
    );
  }, [searchTerm, topOrganizations]);

  const paginatedOrganizations = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredOrganizations.slice(start, start + PAGE_SIZE);
  }, [filteredOrganizations, currentPage]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  return (
    <div className="w-full min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col justify-between">
      <Navbar />

      <main className="flex-1">
        {/* Encabezado: Mockup Exacto */}
        <section className="max-w-6xl mx-auto px-6 sm:px-12 lg:px-8 pt-12 sm:pt-16 pb-6">
          <span className="text-brand font-bold text-xs sm:text-sm tracking-wider uppercase block mb-2">
            COMUNIDAD EVENTHIVE
          </span>
          <h1 className="text-3xl sm:text-5xl font-black text-[#0a1838] tracking-tight mb-3">
            Conoce a nuestras organizaciones
          </h1>
          <p className="text-slate-500 text-sm sm:text-base max-w-2xl leading-relaxed mb-8">
            Descubre organizaciones verificadas, explora sus perfiles públicos y encuentra sus eventos activos y pasados.
          </p>

          {/* Barra de búsqueda y Selector de pestañas */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 mb-8">
            <div className="relative w-full max-w-md">
              <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-base" />
              <input
                type="text"
                value={searchTerm}
                onChange={handleSearchChange}
                placeholder="Buscar organización por nombre o categoría..."
                className="w-full bg-white border border-slate-200 rounded-xl pl-11 pr-4 py-2.5 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 shadow-xs transition-all"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Segmented control tabs */}
            <div className="inline-flex p-1 rounded-2xl bg-slate-200/80 border border-slate-200 shadow-inner self-start">
              <button
                type="button"
                onClick={() => setActiveTab('directorio')}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 cursor-pointer ${
                  activeTab === 'directorio'
                    ? 'bg-white text-[#0a1838] shadow-sm'
                    : 'text-slate-600 hover:text-[#0a1838]'
                }`}
              >
                Directorio
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('informacion')}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 cursor-pointer ${
                  activeTab === 'informacion'
                    ? 'bg-white text-[#0a1838] shadow-sm'
                    : 'text-slate-600 hover:text-[#0a1838]'
                }`}
              >
                Información para Productores
              </button>
            </div>
          </div>
        </section>

        {/* Contenido: Tab Directorio */}
        {activeTab === 'directorio' && (
          <section className="max-w-6xl mx-auto px-6 sm:px-12 lg:px-8 pb-16">
            {loading ? (
              <div className="py-20 flex flex-col items-center justify-center text-slate-400 text-sm">
                <div className="w-8 h-8 border-2 border-brand border-t-transparent rounded-full animate-spin mb-3" />
                Cargando organizaciones destacadas...
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <span className="text-[10px] font-bold text-brand uppercase tracking-widest block mb-0.5">
                      {searchTerm.trim() ? 'BÚSQUEDA' : 'DESTACADAS'}
                    </span>
                    <h3 className="text-lg sm:text-2xl font-black text-[#0a1838]">
                      {searchTerm.trim()
                        ? `Resultados para “${searchTerm}” (${filteredOrganizations.length})`
                        : `Top Organizaciones (${filteredOrganizations.length})`}
                    </h3>
                  </div>
                  {!searchTerm.trim() && (
                    <span className="text-xs font-semibold text-slate-400 hidden sm:inline">
                      Líderes de eventos en Cartagena
                    </span>
                  )}
                </div>

                {filteredOrganizations.length > 0 ? (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      {paginatedOrganizations.map((org) => (
                        <Link
                          key={org.id}
                          to={`/organizaciones/${org.id}`}
                          className="group bg-white rounded-2xl border border-slate-200/90 p-5 card-interactive flex flex-col justify-between block relative overflow-hidden shadow-xs"
                        >
                          <div className="absolute top-0 right-0 bg-[#ffc107] text-[#0a1838] text-[9px] font-black uppercase px-2.5 py-0.5 rounded-bl-lg shadow-xs">
                            ★ Top
                          </div>

                          <div>
                            <div className="flex items-start justify-between mb-3.5">
                              <div className="relative">
                                <ImageWithFallback
                                  src={org.avatar}
                                  alt={org.name}
                                  showText={false}
                                  className="w-13 h-13 rounded-xl border border-slate-100 shadow-xs"
                                  imgClassName="w-13 h-13 rounded-xl object-cover"
                                  fallbackClassName="w-13 h-13 rounded-xl"
                                  iconSize={20}
                                />
                                {org.verified && (
                                  <span className="absolute -bottom-1 -right-1 bg-brand text-white p-0.5 rounded-full shadow-xs text-[10px] z-10">
                                    <FiCheckCircle size={10} />
                                  </span>
                                )}
                              </div>
                              <span className="text-[11px] font-bold text-amber-950 bg-amber-100 px-2 py-0.5 rounded-full mr-8">
                                ★ {org.rating ? Number(org.rating).toFixed(1) : 'Top'}
                              </span>
                            </div>

                            <span className="text-[10px] font-bold uppercase tracking-wider text-brand block mb-1">
                              {org.category}
                            </span>
                            <h4 className="font-bold text-base text-slate-900 group-hover:text-brand transition-colors duration-200 mb-1.5 line-clamp-1">
                              {org.name}
                            </h4>
                            <p className="text-xs text-slate-500 leading-relaxed line-clamp-2 mb-3">
                              {org.description}
                            </p>
                          </div>

                          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                            <span className="font-semibold text-slate-500">
                              <strong className="text-slate-800 font-bold">{org.eventsCount || 0}</strong> eventos
                            </span>
                            <span className="font-bold text-brand group-hover:translate-x-1 transition-transform duration-200 inline-flex items-center gap-1">
                              Ver perfil →
                            </span>
                          </div>
                        </Link>
                      ))}
                    </div>

                    {/* Componente de Paginación */}
                    {filteredOrganizations.length > PAGE_SIZE && (
                      <div className="mt-10 rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
                        <Pagination
                          currentPage={currentPage}
                          totalItems={filteredOrganizations.length}
                          pageSize={PAGE_SIZE}
                          onPageChange={(p) => {
                            setCurrentPage(p);
                            window.scrollTo({ top: 320, behavior: 'smooth' });
                          }}
                          showPageSize={false}
                        />
                      </div>
                    )}
                  </>
                ) : (
                  <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center max-w-lg mx-auto">
                    <p className="text-slate-500 text-sm mb-4">
                      {searchTerm.trim()
                        ? `No encontramos organizaciones destacadas con el término “${searchTerm}”.`
                        : 'No hay organizaciones destacadas disponibles en este momento.'}
                    </p>
                    {searchTerm.trim() && (
                      <button
                        type="button"
                        onClick={() => setSearchTerm('')}
                        className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
                      >
                        Limpiar búsqueda
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </section>
        )}

      {/* Contenido: Tab Información Para Organizaciones */}
        {activeTab === 'informacion' && (
          <section className="max-w-6xl mx-auto px-6 sm:px-12 lg:px-8 pb-16">
            {/* Beneficios */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                <div className="w-11 h-11 rounded-xl bg-blue-50 text-brand flex items-center justify-center mb-4 text-xl">
                  <FiCalendar size={22} />
                </div>
                <h3 className="font-extrabold text-[#0a1838] text-base mb-2">
                  Publicación Inmediata
                </h3>
                <p className="text-slate-500 text-xs sm:text-sm leading-relaxed">
                  Crea eventos en minutos, añade fotografías, fechas, horarios y ubicación geolocalizada en el mapa de Cartagena.
                </p>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4 text-xl">
                  <FiSmartphone size={22} />
                </div>
                <h3 className="font-extrabold text-[#0a1838] text-base mb-2">
                  Pases Digitales con QR
                </h3>
                <p className="text-slate-500 text-xs sm:text-sm leading-relaxed">
                  Valida entradas en segundos en la puerta del evento con nuestro lector de códigos QR seguro, sin riesgo de duplicados.
                </p>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4 text-xl">
                  <FiTrendingUp size={22} />
                </div>
                <h3 className="font-extrabold text-[#0a1838] text-base mb-2">
                  Panel de Estadísticas
                </h3>
                <p className="text-slate-500 text-xs sm:text-sm leading-relaxed">
                  Conoce cuántas entradas se han vendido, la afluencia en tiempo real y el rendimiento de tus promociones.
                </p>
              </div>
            </div>

            {/* Banner de Registro para Organizaciones */}
            <div className="rounded-3xl bg-gradient-to-r from-[#0a1838] via-[#0d2352] to-[#007bff] p-8 sm:p-12 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="max-w-xl">
                <span className="text-[#ffc107] font-bold text-xs uppercase tracking-widest block mb-2">
                  EMPIEZA HOY MISMO
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold mb-3">
                  Lleva tus eventos en Cartagena al siguiente nivel
                </h2>
                <p className="text-slate-200 text-xs sm:text-sm leading-relaxed">
                  Únete a la red de productores y colectivos que impulsan la cultura, entretenimiento y turismo en La Heroica.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 shrink-0">
                <Link
                  to="/registro"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#ffc107] hover:bg-[#e0a800] text-[#0a1838] font-bold text-xs uppercase tracking-wider shadow-md transition-all active:scale-95"
                >
                  Registrarme como Organización
                  <FiArrowRight size={14} />
                </Link>
                
              </div>
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}
