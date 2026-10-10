import { useEffect, useState, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  FiArrowLeft,
  FiCheckCircle,
  FiCalendar,
  FiUsers,
  FiStar,
} from 'react-icons/fi';
import Navbar from '../components/usersComponets/Navbar.jsx';
import Footer from '../components/usersComponets/Footer.jsx';
import ImageWithFallback from '../components/common/ImageWithFallback.jsx';
import HiveEventCard from '../components/home/HiveEventCard.jsx';
import { organizationService } from '../services/organizerService.js';
import { httpClient } from '../services/httpClient.js';
import { session } from '../services/session.js';
import { showLoginAlert } from '../utils/alertUtils.js';
import Pagination from '../components/Shared/Pagination.jsx';
import FloatingDotsBackground from '../components/common/FloatingDotsBackground.jsx';

const EVENTS_PAGE_SIZE = 8;

export default function PerfilOrganizacionPublicoPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [organization, setOrganization] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [activeTab, setActiveTab] = useState('todos'); // 'todos' | 'publicados' | 'finalizados'
  const [eventsPage, setEventsPage] = useState(1);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    Promise.all([
      organizationService.getOrganizationById(id),
      organizationService.getOrganizationEvents(id),
    ])
      .then(([orgData, orgEvents]) => {
        if (!isMounted) return;
        if (orgData) {
          setOrganization(orgData);
          setFollowersCount(orgData.followers || 0);
        }
        setEvents(orgEvents || []);
      })
      .catch((err) => {
        console.error('Error cargando organización:', err);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [id]);

  const handleToggleFollow = async () => {
    const user = session.getUser();
    if (!user) {
      showLoginAlert({
        title: 'Inicia sesión',
        text: 'Debes iniciar sesión para seguir a esta organización.',
        navigate,
      });
      return;
    }

    try {
      if (isFollowing) {
        await httpClient.delete(`/seguidores/${id}/seguir`);
        setIsFollowing(false);
        setFollowersCount((prev) => Math.max(0, prev - 1));
      } else {
        await httpClient.post(`/seguidores/${id}/seguir`);
        setIsFollowing(true);
        setFollowersCount((prev) => prev + 1);
      }
    } catch {
      setIsFollowing(!isFollowing);
      setFollowersCount((prev) => (isFollowing ? Math.max(0, prev - 1) : prev + 1));
    }
  };

  const filteredEvents = useMemo(() => {
    return events.filter((ev) => {
      const isPast = ev.startsAt ? new Date(ev.startsAt) < new Date() : false;
      const estado = (ev.estado || (isPast ? 'FINALIZADO' : 'PUBLICADO')).toUpperCase();

      if (activeTab === 'publicados') {
        return estado === 'PUBLICADO' || (!isPast && estado !== 'FINALIZADO');
      }
      if (activeTab === 'finalizados') {
        return estado === 'FINALIZADO' || isPast;
      }
      return true;
    });
  }, [events, activeTab]);

  const paginatedEvents = useMemo(() => {
    const start = (eventsPage - 1) * EVENTS_PAGE_SIZE;
    return filteredEvents.slice(start, start + EVENTS_PAGE_SIZE);
  }, [filteredEvents, eventsPage]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setEventsPage(1);
  };

  const counts = useMemo(() => {
    let publicados = 0;
    let finalizados = 0;
    events.forEach((ev) => {
      const isPast = ev.startsAt ? new Date(ev.startsAt) < new Date() : false;
      const estado = (ev.estado || (isPast ? 'FINALIZADO' : 'PUBLICADO')).toUpperCase();
      if (estado === 'FINALIZADO' || isPast) {
        finalizados++;
      } else {
        publicados++;
      }
    });
    return {
      todos: events.length,
      publicados,
      finalizados,
    };
  }, [events]);

  if (loading) {
    return (
      <div className="w-full min-h-screen bg-[#F8FAFC] dark:bg-[#070D1B] text-slate-900 dark:text-slate-100 flex flex-col justify-between relative transition-colors duration-200">
        <FloatingDotsBackground />
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center py-24 gap-3">
          <div className="w-12 h-12 border-3 border-amber-400 border-t-[#0B1B3D] dark:border-t-white rounded-full animate-spin" />
          <p className="text-xs font-black uppercase tracking-widest text-[#0B1B3D] dark:text-slate-200">
            Cargando perfil de la organización...
          </p>
        </div>
        <Footer />
      </div>
    );
  }

  if (!organization) {
    return (
      <div className="w-full min-h-screen bg-[#F8FAFC] dark:bg-[#070D1B] text-slate-900 dark:text-slate-100 flex flex-col justify-between relative transition-colors duration-200">
        <FloatingDotsBackground />
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center py-24 px-6 text-center">
          <div className="w-16 h-16 rounded-3xl bg-amber-100 dark:bg-slate-800 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-4 text-2xl shadow-inner">
            <FiUsers size={28} />
          </div>
          <h2 className="text-2xl font-black text-[#0B1B3D] dark:text-white mb-2">Organización no encontrada</h2>
          <p className="text-slate-600 dark:text-slate-400 text-sm max-w-md mb-6 font-medium">
            La organización solicitada no está disponible o no tiene un perfil público registrado.
          </p>
          <Link
            to="/organizaciones"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black uppercase tracking-wider shadow-md transition-all active:scale-95"
          >
            <FiArrowLeft size={16} />
            Volver a Organizaciones
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-[#F8FAFC] dark:bg-[#070D1B] text-slate-900 dark:text-slate-100 flex flex-col justify-between selection:bg-amber-400 selection:text-slate-950 relative transition-colors duration-200">
      <FloatingDotsBackground />
      <Navbar />

      <main className="flex-1 relative z-10">
        {/* Banner de Cabecera Colmena */}
        <section className="w-full bg-[#0B1B3D] dark:bg-[#081021] text-white pt-10 pb-16 px-6 sm:px-12 lg:px-20 border-b border-amber-500/20 relative overflow-hidden">
          <div className="max-w-6xl mx-auto relative z-10">
            {/* Botón de retroceso */}
            <Link
              to="/organizaciones"
              className="inline-flex items-center gap-2 text-xs font-bold text-amber-200 hover:text-white mb-6 transition-colors group bg-white/10 px-3.5 py-1.5 rounded-full border border-white/15 backdrop-blur-md"
            >
              <FiArrowLeft size={14} className="transition-transform duration-200 group-hover:-translate-x-1" />
              <span>Volver a todas las organizaciones</span>
            </Link>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              {/* Información principal del Organizador */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
                {/* Avatar */}
                <div className="relative shrink-0">
                  <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl border-2 border-amber-400 p-[3px] shadow-md bg-[#0B172C]">
                    <div className="w-full h-full rounded-xl bg-[#0B172C] overflow-hidden flex items-center justify-center">
                      <ImageWithFallback
                        src={organization.avatar}
                        alt={organization.name}
                        showText={false}
                        className="w-full h-full object-cover"
                        imgClassName="w-full h-full object-cover"
                        fallbackClassName="w-full h-full"
                        iconSize={36}
                      />
                    </div>
                  </div>

                  {organization.verified && (
                    <span
                      title="Organización Verificada"
                      className="absolute -bottom-1 -right-1 bg-amber-500 text-slate-950 p-1.5 rounded-full shadow-lg z-10 font-black"
                    >
                      <FiCheckCircle size={14} strokeWidth={3} />
                    </span>
                  )}
                </div>

                <div>
                  <div className="flex flex-wrap items-center gap-2.5 mb-2">
                    <span className="text-[10px] font-black uppercase tracking-wider text-amber-950 dark:text-amber-300 bg-amber-100 dark:bg-amber-950/60 px-3 py-0.5 rounded-full border border-amber-300 dark:border-amber-800 flex items-center gap-1">
                      <span>{organization.category}</span>
                    </span>

                    {organization.verified && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-300 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-400/30">
                        <FiCheckCircle size={12} />
                        Verificada en EventHive
                      </span>
                    )}
                  </div>

                  <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight leading-tight">
                    {organization.name}
                  </h1>

                  <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-slate-300 mt-2.5 font-medium">
                    <span className="flex items-center gap-1.5">
                      <FiUsers className="text-amber-400" size={15} />
                      <strong className="text-white font-bold">{followersCount}</strong> seguidores
                    </span>
                    <span className="flex items-center gap-1 text-amber-300 font-bold">
                      <FiStar className="fill-amber-400 text-amber-400" size={14} />
                      {organization.rating ? Number(organization.rating).toFixed(1) : '5.0'} / 5.0
                    </span>
                    <span className="flex items-center gap-1.5 text-slate-300">
                      <FiCalendar className="text-amber-400" size={14} />
                      <strong className="text-white font-bold">{events.length}</strong> evento{events.length === 1 ? '' : 's'} en cartelera
                    </span>
                  </div>
                </div>
              </div>

              {/* Botón Seguir */}
              <div className="shrink-0 flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleToggleFollow}
                  className={`px-6 py-3 rounded-2xl text-xs sm:text-sm font-black uppercase tracking-wider transition-all shadow-md active:scale-95 flex items-center gap-2 cursor-pointer ${isFollowing
                      ? 'bg-white/20 text-white border border-white/30 hover:bg-white/30'
                      : 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                    }`}
                >
                  <FiUsers size={16} />
                  <span>{isFollowing ? 'Siguiendo' : 'Seguir Organización'}</span>
                </button>
              </div>
            </div>

            {/* Descripción de la organización */}
            {organization.description && (
              <p className="text-slate-300 text-xs sm:text-sm mt-6 max-w-3xl leading-relaxed border-t border-white/10 pt-4 font-normal">
                {organization.description}
              </p>
            )}
          </div>
        </section>

        {/* Sección de Eventos de la Organización */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">

          {/* Barra de pestañas por estado: Todos, Publicados, Finalizados */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 border-b border-amber-200/80 dark:border-slate-800 pb-5">
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-amber-900 dark:text-amber-300 bg-amber-100 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800 px-2.5 py-0.5 rounded-md inline-block mb-1">
                CARTELERA DE EVENTOS
              </span>
              <h2 className="text-2xl font-black text-[#0B1B3D] dark:text-white">
                Experiencias de {organization.name}
              </h2>
            </div>

            {/* Pestañas de estado */}
            <div className="inline-flex p-1 rounded-2xl bg-white dark:bg-[#0B1428] border-2 border-amber-200/90 dark:border-slate-800 shadow-sm self-start sm:self-auto">
              <button
                type="button"
                onClick={() => handleTabChange('todos')}
                className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-200 cursor-pointer ${activeTab === 'todos'
                    ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-[#0B1B3D] dark:hover:text-white'
                  }`}
              >
                Todos ({counts.todos})
              </button>
              <button
                type="button"
                onClick={() => handleTabChange('publicados')}
                className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-200 cursor-pointer ${activeTab === 'publicados'
                    ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-[#0B1B3D] dark:hover:text-white'
                  }`}
              >
                Activos ({counts.publicados})
              </button>
              <button
                type="button"
                onClick={() => handleTabChange('finalizados')}
                className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-200 cursor-pointer ${activeTab === 'finalizados'
                    ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-[#0B1B3D] dark:hover:text-white'
                  }`}
              >
                Finalizados ({counts.finalizados})
              </button>
            </div>
          </div>

          {/* Grid de eventos */}
          {filteredEvents.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {paginatedEvents.map((event) => {
                  return (
                    <div key={event.id} className="relative flex flex-col">
                      <HiveEventCard event={event} />
                    </div>
                  );
                })}
              </div>

              {/* Paginación Minimalista y Centrada */}
              {filteredEvents.length > EVENTS_PAGE_SIZE && (
                <div className="mt-12 flex justify-center w-full">
                  <Pagination
                    currentPage={eventsPage}
                    totalItems={filteredEvents.length}
                    pageSize={EVENTS_PAGE_SIZE}
                    onPageChange={(p) => {
                      setEventsPage(p);
                      window.scrollTo({ top: 450, behavior: 'smooth' });
                    }}
                    minimal={true}
                  />
                </div>
              )}
            </>
          ) : (
            <div className="border-2 border-dashed border-amber-300 dark:border-slate-700 rounded-3xl bg-white dark:bg-[#0B1428] p-14 text-center max-w-xl mx-auto shadow-sm my-6">
              <div className="w-14 h-14 rounded-2xl bg-amber-50 dark:bg-slate-800 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto mb-3 text-xl">
                <FiCalendar size={24} />
              </div>
              <h3 className="text-lg font-black text-[#0B1B3D] dark:text-white mb-1 uppercase">
                No hay eventos {activeTab !== 'todos' ? activeTab : 'registrados'}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mb-6 font-medium">
                Esta organización actualmente no tiene eventos en la sección de{' '}
                <strong className="text-amber-800 dark:text-amber-400">{activeTab}</strong>.
              </p>
              {activeTab !== 'todos' && (
                <button
                  type="button"
                  onClick={() => setActiveTab('todos')}
                  className="px-5 py-2.5 rounded-xl bg-amber-100 dark:bg-slate-800 hover:bg-amber-200 dark:hover:bg-slate-700 text-amber-950 dark:text-amber-300 text-xs font-black uppercase tracking-wider transition-colors cursor-pointer"
                >
                  Ver todos los eventos ({counts.todos})
                </button>
              )}
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}
