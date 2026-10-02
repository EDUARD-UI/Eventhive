import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  FiSearch,
  FiTrendingUp,
  FiSmartphone,
  FiArrowRight,
  FiCalendar,
} from 'react-icons/fi';
import Navbar from '../components/usersComponets/Navbar.jsx';
import Footer from '../components/usersComponets/Footer.jsx';
import { organizationService } from '../services/organizerService.js';
import HiveOrganizerCard from '../components/home/HiveOrganizerCard.jsx';
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
    <div className="w-full min-h-screen bg-[#FAF8F5] text-slate-900 flex flex-col justify-between selection:bg-amber-400 selection:text-slate-950">
      <Navbar />

      <main className="flex-1">
        {/* Header  Cultural */}
        <section className="w-full bg-[#0B1B3D] text-white pt-14 pb-18 px-6 sm:px-12 lg:px-20 relative overflow-hidden border-b border-amber-500/20">
          <div className="absolute inset-0 bg-[radial-gradient(#F59E0B_1px,transparent_1px)] [background-size:24px_24px] opacity-10 pointer-events-none" />
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-6xl mx-auto relative z-10">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-widest text-amber-300 bg-amber-500/10 border border-amber-400/30 mb-4">
              <span>⬡</span>
              <span>COMUNIDAD EVENTHIVE</span>
            </span>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight uppercase text-white">
              PRODUCTORES Y <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-amber-500">
                ORGANIZACIONES CULTURALES
              </span>
            </h1>

            <p className="text-slate-300 text-sm sm:text-base mt-4 max-w-2xl font-medium leading-relaxed">
              Descubre las entidades y colectivos que impulsan la cartelera de eventos en Cartagena de Indias. Explora sus perfiles, trayectoria y cartelera activa.
            </p>
          </div>
        </section>

        {/* Barra de Búsqueda y Pestañas Flotantes */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-9 relative z-20 mb-8">
          <div className="bg-white rounded-3xl border-2 border-amber-200/90 shadow-2xl p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
            
            {/* Buscador */}
            <div className="relative w-full max-w-md">
              <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-600 text-base" />
              <input
                type="text"
                value={searchTerm}
                onChange={handleSearchChange}
                placeholder="Buscar por nombre o temática cultural..."
                className="w-full bg-[#FAF8F5] border border-amber-200/90 rounded-2xl pl-11 pr-10 py-3 text-xs sm:text-sm font-semibold text-slate-800 placeholder:text-slate-400 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-400/20 shadow-xs transition-all"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-amber-700 text-xs font-black p-1"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Segmented control tabs */}
            <div className="inline-flex p-1 rounded-2xl bg-[#FAF8F5] border border-amber-200/80 shadow-inner self-start md:self-auto">
              <button
                type="button"
                onClick={() => setActiveTab('directorio')}
                className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-black uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                  activeTab === 'directorio'
                    ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 shadow-md'
                    : 'text-slate-600 hover:text-[#0B1B3D]'
                }`}
              >
                Directorio
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('informacion')}
                className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-black uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                  activeTab === 'informacion'
                    ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 shadow-md'
                    : 'text-slate-600 hover:text-[#0B1B3D]'
                }`}
              >
                Información para Productores
              </button>
            </div>
          </div>
        </section>

        {/* Tab Directorio */}
        {activeTab === 'directorio' && (
          <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
            {loading ? (
              <div className="py-24 flex flex-col items-center justify-center gap-3">
                <div className="relative w-14 h-14 flex items-center justify-center">
                  <div className="absolute inset-0 clip-hexagon-horiz bg-gradient-to-r from-amber-400 to-amber-500 animate-spin" />
                  <div className="absolute inset-[3px] clip-hexagon-horiz bg-[#FAF8F5] flex items-center justify-center">
                    <span className="text-amber-500 text-base">⬡</span>
                  </div>
                </div>
                <p className="text-xs font-black uppercase tracking-widest text-[#0B1B3D]">
                  Cargando organizaciones destacadas...
                </p>
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-between mb-7">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-amber-900 bg-amber-100 border border-amber-300 px-2.5 py-0.5 rounded-md inline-block mb-1.5">
                      {searchTerm.trim() ? 'RESULTADOS DE BÚSQUEDA' : 'LÍDERES DE CARTELERA'}
                    </span>
                    <h3 className="text-xl sm:text-2xl font-black text-[#0B1B3D]">
                      {searchTerm.trim()
                        ? `Organizaciones para “${searchTerm}” (${filteredOrganizations.length})`
                        : `Top Organizaciones Verificadas (${filteredOrganizations.length})`}
                    </h3>
                  </div>
                  {!searchTerm.trim() && (
                    <span className="text-xs font-bold text-slate-500 hidden sm:inline">
                      Colectivos y productores con mayor trayectoria
                    </span>
                  )}
                </div>

                {filteredOrganizations.length > 0 ? (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      {paginatedOrganizations.map((org) => (
                        <HiveOrganizerCard key={org.id} org={org} />
                      ))}
                    </div>

                    {/* Componente de Paginación */}
                    {filteredOrganizations.length > PAGE_SIZE && (
                      <div className="mt-12 rounded-2xl border-2 border-amber-200/90 bg-white overflow-hidden shadow-sm">
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
                  <div className="rounded-3xl border-2 border-dashed border-amber-300 bg-white p-14 text-center max-w-lg mx-auto shadow-sm">
                    <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-4 text-xl">
                      ⬡
                    </div>
                    <p className="text-slate-800 font-black text-base mb-2">
                      {searchTerm.trim()
                        ? `No encontramos organizaciones con el término “${searchTerm}”.`
                        : 'No hay organizaciones disponibles en este momento.'}
                    </p>
                    {searchTerm.trim() && (
                      <button
                        type="button"
                        onClick={() => setSearchTerm('')}
                        className="px-5 py-2.5 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-950 text-xs font-black uppercase tracking-wider transition-all cursor-pointer"
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

        {/* Tab Información Para Productores */}
        {activeTab === 'informacion' && (
          <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 space-y-12">
            {/* Tarjetas de Beneficios */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-3xl border-2 border-amber-200/90 p-7 shadow-[0_8px_25px_-5px_rgba(0,0,0,0.05)] hover:border-amber-400 transition-all">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mb-5 text-xl shadow-inner">
                  <FiCalendar size={22} />
                </div>
                <h3 className="font-black text-[#0B1B3D] text-lg mb-2">
                  Publicación Inmediata
                </h3>
                <p className="text-slate-600 text-xs sm:text-sm leading-relaxed font-medium">
                  Crea eventos en minutos, añade fotografías, fechas, horarios y ubicación geolocalizada en el mapa interactivo de Cartagena.
                </p>
              </div>

              <div className="bg-white rounded-3xl border-2 border-amber-200/90 p-7 shadow-[0_8px_25px_-5px_rgba(0,0,0,0.05)] hover:border-amber-400 transition-all">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mb-5 text-xl shadow-inner">
                  <FiSmartphone size={22} />
                </div>
                <h3 className="font-black text-[#0B1B3D] text-lg mb-2">
                  Pases Digitales con QR
                </h3>
                <p className="text-slate-600 text-xs sm:text-sm leading-relaxed font-medium">
                  Valida entradas en segundos en la puerta del evento con nuestro lector de códigos QR seguro, sin riesgo de duplicados ni fraude.
                </p>
              </div>

              <div className="bg-white rounded-3xl border-2 border-amber-200/90 p-7 shadow-[0_8px_25px_-5px_rgba(0,0,0,0.05)] hover:border-amber-400 transition-all">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mb-5 text-xl shadow-inner">
                  <FiTrendingUp size={22} />
                </div>
                <h3 className="font-black text-[#0B1B3D] text-lg mb-2">
                  Métricas en Tiempo Real
                </h3>
                <p className="text-slate-600 text-xs sm:text-sm leading-relaxed font-medium">
                  Conoce cuántas entradas se han adquirido, la afluencia prevista y el impacto de tus actividades en la comunidad cartagenera.
                </p>
              </div>
            </div>

            {/* Banner de Registro  */}
            <div className="rounded-3xl bg-[#0B1B3D] p-8 sm:p-12 text-white shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8 border border-amber-500/20 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-80 h-80 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />

              <div className="max-w-xl relative z-10 space-y-2">
                <span className="text-amber-400 font-black text-xs uppercase tracking-widest flex items-center gap-1.5">
                  <span>⬡</span>
                  <span>IMPULSA TUS EVENTOS EN CARTAGENA</span>
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-white">
                  Lleva tu cartelera al siguiente nivel
                </h2>
                <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
                  Únete a la red de productores y colectivos que impulsan la cultura, entretenimiento y turismo en La Heroica.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 shrink-0 relative z-10">
                <Link
                  to="/registro"
                  className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-amber-500/25 transition-all active:scale-95"
                >
                  <span>Registrarme como Organización</span>
                  <FiArrowRight size={15} />
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
