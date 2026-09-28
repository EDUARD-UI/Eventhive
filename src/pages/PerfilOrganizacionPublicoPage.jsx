import { useEffect, useState, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  FiArrowLeft,
  FiCheckCircle,
  FiCalendar,
  FiMapPin,
  FiUsers,
  FiStar,
  FiFilter,
  FiArrowRight,
} from 'react-icons/fi';
import Navbar from '../components/usersComponets/Navbar.jsx';
import Footer from '../components/usersComponets/Footer.jsx';
import ImageWithFallback from '../components/common/ImageWithFallback.jsx';
import EventCard from '../components/EventCard.jsx';
import { organizationService } from '../services/organizerService.js';
import { httpClient } from '../services/httpClient.js';
import { session } from '../services/session.js';
import { showLoginAlert } from '../utils/alertUtils.js';
import Pagination from '../components/Shared/Pagination.jsx';

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
      // Cambio optimista en caso de fallo de red
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
      <div className="w-full min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col justify-between">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center py-24">
          <div className="w-10 h-10 border-3 border-brand border-t-transparent rounded-full animate-spin mb-3" />
          <p className="text-slate-500 text-sm font-medium">Cargando perfil de la organización...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (!organization) {
    return (
      <div className="w-full min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col justify-between">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center py-24 px-6 text-center">
          <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center mb-4">
            <FiUsers size={32} />
          </div>
          <h2 className="text-2xl font-black text-[#0a1838] mb-2">Organización no encontrada</h2>
          <p className="text-slate-500 text-sm max-w-md mb-6">
            La organización solicitada no existe o no tiene un perfil público disponible.
          </p>
          <Link
            to="/organizaciones"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand text-white text-sm font-bold shadow-md hover:bg-brand-dark transition-all"
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
    <div className="w-full min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col justify-between">
      <Navbar />

      <main className="flex-1">
        {/* Banner de Cabecera con degradado */}
        <section className="w-full bg-[#0a1838] text-white pt-10 pb-16 px-6 sm:px-12 lg:px-20 border-b-2 border-[#ffc107] relative overflow-hidden">
          <div className="max-w-6xl mx-auto relative z-10">
            {/* Botón de retroceso */}
            <Link
              to="/organizaciones"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-300 hover:text-white mb-6 transition-colors"
            >
              <FiArrowLeft size={14} />
              Volver a todas las organizaciones
            </Link>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              {/* Información principal del Organizador */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
                <div className="relative shrink-0">
                  <ImageWithFallback
                    src={organization.avatar}
                    alt={organization.name}
                    showText={false}
                    className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl border-2 border-white/20 bg-white/10 shadow-lg object-cover"
                    imgClassName="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover"
                    fallbackClassName="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-white/10"
                    iconSize={36}
                  />
                  {organization.verified && (
                    <span
                      title="Organización Verificada"
                      className="absolute -bottom-1.5 -right-1.5 bg-[#ffc107] text-[#0a1838] p-1.5 rounded-full shadow-md z-10"
                    >
                      <FiCheckCircle size={14} className="stroke-[3]" />
                    </span>
                  )}
                </div>

                <div>
                  <div className="flex flex-wrap items-center gap-2.5 mb-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#ffc107] bg-white/10 px-2.5 py-0.5 rounded-md">
                      {organization.category}
                    </span>
                    {organization.verified && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-md border border-emerald-500/20">
                        <FiCheckCircle size={12} />
                        Verificada
                      </span>
                    )}
                  </div>

                  <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight leading-tight">
                    {organization.name}
                  </h1>

                  <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-slate-300 mt-2 font-medium">
                    <span className="flex items-center gap-1.5">
                      <FiUsers className="text-[#ffc107]" size={15} />
                      {followersCount} seguidores
                    </span>
                    {organization.rating ? (
                      <span className="flex items-center gap-1 text-amber-300">
                        <FiStar className="fill-amber-400 text-amber-400" size={14} />
                        {Number(organization.rating).toFixed(1)} / 5.0
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-amber-300">
                        <FiStar className="fill-amber-400 text-amber-400" size={14} />
                        Top
                      </span>
                    )}
                    <span className="flex items-center gap-1.5 text-slate-400">
                      <FiCalendar size={14} />
                      {events.length} evento{events.length === 1 ? '' : 's'} publicados
                    </span>
                  </div>
                </div>
              </div>

              {/* Botón Seguir */}
              <div className="shrink-0 flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleToggleFollow}
                  className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all shadow-sm active:scale-95 flex items-center gap-2 ${
                    isFollowing
                      ? 'bg-white/20 text-white border border-white/30 hover:bg-white/30'
                      : 'bg-[#ffc107] hover:bg-[#e0a800] text-[#0a1838]'
                  }`}
                >
                  <FiUsers size={16} />
                  <span>{isFollowing ? 'Siguiendo' : 'Seguir organización'}</span>
                </button>
              </div>
            </div>

            {/* Descripción de la organización */}
            {organization.description && (
              <p className="text-slate-300 text-xs sm:text-sm mt-6 max-w-3xl leading-relaxed border-t border-white/10 pt-4">
                {organization.description}
              </p>
            )}
          </div>

          <div className="absolute -top-24 -right-24 w-96 h-96 bg-brand/20 rounded-full blur-3xl pointer-events-none" />
        </section>

        {/* Sección de Eventos de la Organización */}
        <section className="max-w-6xl mx-auto px-6 sm:px-12 lg:px-8 py-10 sm:py-14">
          {/* Barra de pestañas por estado: Todos, Publicados, Finalizados */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 border-b border-slate-200 pb-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-[#0a1838]">
                Eventos de {organization.name}
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Explora los eventos organizados, clasificados por su estado actual
              </p>
            </div>

            {/* Pestañas de estado */}
            <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-xl self-start sm:self-auto">
              <button
                type="button"
                onClick={() => handleTabChange('todos')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  activeTab === 'todos'
                    ? 'bg-white text-[#0a1838] shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Todos ({counts.todos})
              </button>
              <button
                type="button"
                onClick={() => handleTabChange('publicados')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  activeTab === 'publicados'
                    ? 'bg-white text-[#0a1838] shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Publicados ({counts.publicados})
              </button>
              <button
                type="button"
                onClick={() => handleTabChange('finalizados')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  activeTab === 'finalizados'
                    ? 'bg-white text-[#0a1838] shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
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
                  const isPast = event.startsAt ? new Date(event.startsAt) < new Date() : false;
                  const estado = (event.estado || (isPast ? 'FINALIZADO' : 'PUBLICADO')).toUpperCase();

                  return (
                    <div key={event.id} className="relative flex flex-col">
                      {/* Badge distintivo de estado sobre la tarjeta */}
                      <div className="mb-2 flex items-center justify-between">
                        <span
                          className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md border ${
                            estado === 'FINALIZADO'
                              ? 'bg-slate-100 text-slate-600 border-slate-300'
                              : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          }`}
                        >
                          {estado === 'FINALIZADO' ? '● Evento finalizado' : '● Publicado / Activo'}
                        </span>
                      </div>

                      <EventCard event={event} />
                    </div>
                  );
                })}
              </div>

              {/* Componente de Paginación para eventos de la organización */}
              {filteredEvents.length > EVENTS_PAGE_SIZE && (
                <div className="mt-10 rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
                  <Pagination
                    currentPage={eventsPage}
                    totalItems={filteredEvents.length}
                    pageSize={EVENTS_PAGE_SIZE}
                    onPageChange={(p) => {
                      setEventsPage(p);
                      window.scrollTo({ top: 450, behavior: 'smooth' });
                    }}
                    showPageSize={false}
                  />
                </div>
              )}
            </>
          ) : (
            <div className="border-2 border-dashed border-slate-300 rounded-2xl bg-white p-12 text-center max-w-xl mx-auto shadow-sm my-6">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-brand flex items-center justify-center mx-auto mb-3">
                <FiCalendar size={24} />
              </div>
              <h3 className="text-base font-bold text-[#0a1838] mb-1">
                No hay eventos {activeTab !== 'todos' ? activeTab : 'registrados'}
              </h3>
              <p className="text-xs text-slate-500 mb-5">
                Esta organización actualmente no tiene eventos en estado{' '}
                <strong>{activeTab}</strong>.
              </p>
              {activeTab !== 'todos' && (
                <button
                  type="button"
                  onClick={() => setActiveTab('todos')}
                  className="text-xs font-bold text-brand hover:underline"
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
