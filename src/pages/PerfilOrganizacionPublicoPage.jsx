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
import HiveBeeLoader from '../components/common/HiveBeeLoader.jsx';
import Footer from '../components/usersComponets/Footer.jsx';
import CityRhythmPreFooter from '../components/home/CityRhythmPreFooter.jsx';
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
      <HiveBeeLoader
        text="Cargando..."
        subtext="Perfil de la organización"
        fullScreen={true}
      />
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
        {/* Componente pre-footer compartido */}
        <CityRhythmPreFooter />
        <Footer />
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-[#F8FAFC] dark:bg-[#070D1B] text-slate-900 dark:text-slate-100 flex flex-col justify-between selection:bg-amber-400 selection:text-slate-950 relative transition-colors duration-200">
      <FloatingDotsBackground />
      <Navbar />

      <main className="flex-1 relative z-10">
        {/* Banner de Cabecera Colmena con Brillos Hero y Fondo Corporativo */}
        <section className="w-full bg-[#0B132B] dark:bg-[#070D1B] text-white pt-8 pb-12 sm:pb-14 px-4 sm:px-8 lg:px-12 border-b border-slate-200/10 relative overflow-hidden transition-colors">
          {/* Brillos ambientales como en el <Hero> */}
          <div aria-hidden="true" className="absolute inset-0 pointer-events-none overflow-hidden">
            {/* Resplandor ámbar superior derecho */}
            <div className="absolute -top-32 right-1/4 w-[500px] h-[500px] rounded-full bg-amber-500/15 blur-3xl" />
            {/* Resplandor azul zafiro inferior izquierdo */}
            <div className="absolute -bottom-32 -left-20 w-[450px] h-[450px] rounded-full bg-blue-600/15 blur-3xl" />
            {/* Línea sutil superior de acento dorado */}
            <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-amber-400/50 to-transparent" />

            
          </div>

          <div className="max-w-5xl mx-auto relative z-10">
            {/* Barra Superior del Banner: Volver a la izquierda y Botón Seguir pequeño en la parte superior derecha */}
            <div className="flex items-center justify-between gap-4 mb-7">
              <Link
                to="/organizaciones"
                className="inline-flex items-center gap-2 text-xs font-semibold text-slate-300 hover:text-white transition-colors group bg-white/5 hover:bg-white/10 px-3.5 py-1.5 rounded-full border border-white/10 backdrop-blur-md shadow-xs"
              >
                <FiArrowLeft size={13} className="transition-transform duration-200 group-hover:-translate-x-1" />
                <span>Volver</span>
              </Link>

              {/* Botón Seguir más pequeño y en la parte superior derecha */}
              <button
                type="button"
                onClick={handleToggleFollow}
                className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-200 shadow-sm active:scale-95 cursor-pointer ${
                  isFollowing
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30'
                    : 'bg-amber-500 hover:bg-amber-400 text-slate-950 hover:shadow-amber-500/25'
                }`}
              >
                <FiUsers size={13} />
                <span>{isFollowing ? 'Siguiendo' : 'Seguir'}</span>
              </button>
            </div>

            {/* Contenedor Principal Centrado y Armónico */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
              {/* Avatar Institucional con marco pulido */}
              <div className="relative shrink-0">
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl p-[3px] bg-gradient-to-br from-amber-400/80 via-amber-500/40 to-slate-800 shadow-2xl">
                  <div className="w-full h-full rounded-[22px] bg-[#090F1E] overflow-hidden flex items-center justify-center">
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
                    title="Organización Verificada Oficial"
                    className="absolute -bottom-1 -right-1 bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 p-1.5 rounded-full shadow-lg z-10 flex items-center justify-center"
                  >
                    <FiCheckCircle size={13} strokeWidth={3} />
                  </span>
                )}
              </div>

              {/* Información y métricas corporativas */}
              <div className="flex-1 min-w-0">
                {/* Badges de Categoría y Verificación */}
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-2">
                  <span className="text-[10px] font-black uppercase tracking-wider text-amber-300 bg-amber-400/15 border border-amber-400/30 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                    <span>⬡</span>
                    <span>{organization.category}</span>
                  </span>

                  {organization.verified && (
                    <span className="inline-flex items-center gap-1 text-[10.5px] font-bold text-emerald-300 bg-emerald-500/15 px-2.5 py-0.5 rounded-full border border-emerald-400/30">
                      <FiCheckCircle size={11} className="text-emerald-400" />
                      <span>Verificada en EventHive</span>
                    </span>
                  )}
                </div>

                {/* Nombre de la Organización */}
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight leading-snug">
                  {organization.name}
                </h1>

                {/* Cápsulas de Métricas con diseño corporativo elegante */}
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5 mt-3 text-xs">
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-xs text-slate-300">
                    <FiUsers className="text-amber-400" size={13} />
                    <span><strong className="text-white font-bold">{followersCount}</strong> seguidores</span>
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-xs text-slate-300">
                    <FiStar className="fill-amber-400 text-amber-400" size={13} />
                    <span className="text-amber-300 font-bold">{organization.rating ? Number(organization.rating).toFixed(1) : '5.0'}</span>
                    <span className="text-slate-400 text-[11px]">/ 5.0</span>
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-xs text-slate-300">
                    <FiCalendar className="text-amber-400" size={13} />
                    <span><strong className="text-white font-bold">{events.length}</strong> evento{events.length === 1 ? '' : 's'} en cartelera</span>
                  </div>
                </div>

                {/* Descripción de la organización */}
                {organization.description && (
                  <p className="text-slate-300/90 text-xs sm:text-sm mt-4 leading-relaxed font-normal max-w-2xl">
                    {organization.description}
                  </p>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Sección de Eventos de la Organización */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">

          {/* Barra de pestañas por estado: Todos, Publicados, Finalizados (Bordes limpios neutros en modo claro) */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 border-b border-slate-200 dark:border-white/[0.08] pb-5">
            <div>
              
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                Experiencias de {organization.name}
              </h2>
            </div>

            {/* Pestañas de estado con bordes neutros limpios sin tonos dorados excesivos */}
            <div className="inline-flex p-1 rounded-2xl bg-slate-100 dark:bg-[#0B1428] border border-slate-200 dark:border-white/[0.08] shadow-xs self-start sm:self-auto">
              <button
                type="button"
                onClick={() => handleTabChange('todos')}
                className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                  activeTab === 'todos'
                    ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Todos ({counts.todos})
              </button>
              <button
                type="button"
                onClick={() => handleTabChange('publicados')}
                className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                  activeTab === 'publicados'
                    ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Activos ({counts.publicados})
              </button>
              <button
                type="button"
                onClick={() => handleTabChange('finalizados')}
                className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                  activeTab === 'finalizados'
                    ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
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
            <div className="border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl bg-white dark:bg-[#0B1428] p-14 text-center max-w-xl mx-auto shadow-sm my-6">
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

      {/* Componente pre-footer compartido */}
      <CityRhythmPreFooter />
      <Footer />
    </div>
  );
}
