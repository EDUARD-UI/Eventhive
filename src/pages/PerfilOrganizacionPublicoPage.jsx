import { useEffect, useState, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  FiArrowLeft,
  FiCheckCircle,
  FiCalendar,
  FiUsers,
  FiStar,
  FiMapPin,
  FiInstagram,
} from 'react-icons/fi';
import Navbar from '../components/usersComponets/Navbar.jsx';
import HiveBeeLoader from '../components/common/HiveBeeLoader.jsx';
import Footer from '../components/usersComponets/Footer.jsx';
import CityRhythmPreFooter from '../components/home/CityRhythmPreFooter.jsx';
import ImageWithFallback from '../components/common/ImageWithFallback.jsx';
import FavoriteButton from '../components/FavoriteButton.jsx';
import { organizationService } from '../services/organizerService.js';
import { httpClient } from '../services/httpClient.js';
import { session } from '../services/session.js';
import { showLoginAlert } from '../utils/alertUtils.js';
import Pagination from '../components/Shared/Pagination.jsx';
import FloatingDotsBackground from '../components/common/FloatingDotsBackground.jsx';

const EVENTS_PAGE_SIZE = 6;

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
  const [activeSlide, setActiveSlide] = useState(0);

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

  //Hasta 3 eventos destacados para el carrusel superior del Hero
  const featuredSlides = useMemo(() => {
    const promoted = events.filter((ev) => ev.promocionado);
    const baseList = promoted.length > 0 ? [...promoted, ...events.filter((e) => !e.promocionado)] : events;
    return baseList.slice(0, 3);
  }, [events]);

  useEffect(() => {
    if (featuredSlides.length <= 1) return;
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % featuredSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [featuredSlides.length]);

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
        
        <CityRhythmPreFooter />
        <Footer />
      </div>
    );
  }

  const currentHeroEvent = featuredSlides[activeSlide] || featuredSlides[0] || null;
  const socialInstagram =
    organization.instagram ||
    organization.redesSociales?.instagram ||
    organization.socialLinks?.instagram ||
    null;

  return (
    <div className="w-full min-h-screen bg-[#F8FAFC] dark:bg-[#070D1B] text-slate-900 dark:text-slate-100 flex flex-col justify-between selection:bg-amber-400 selection:text-slate-950 relative transition-colors duration-200">
      {/* NO MODIFICAR EL FONDO CON PUNTOS FLOTANTES */}
      <FloatingDotsBackground />
      <Navbar />

      <main className="flex-1 relative z-10">
        {/* 1. HERO BANNER / CARRUSEL SUPERIOR DE 3 EVENTOS DESTACADOS */}
        <section className="w-full bg-gradient-to-b from-[#04499E] via-[#0A2652] to-[#0B132B] text-white pt-6 pb-8 sm:pb-10 px-4 sm:px-8 lg:px-12 border-b border-white/10 relative overflow-hidden">
          {/* Brillos ambientales */}
          <div aria-hidden="true" className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute -top-32 right-1/4 w-[500px] h-[500px] rounded-full bg-amber-500/15 blur-3xl" />
            <div className="absolute -bottom-32 -left-20 w-[450px] h-[450px] rounded-full bg-blue-500/20 blur-3xl" />
            <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-amber-400/50 to-transparent" />
          </div>

          <div className="max-w-7xl mx-auto relative z-10">
            {/* Botón Volver superior izquierdo */}
            <div className="mb-4">
              <Link
                to="/organizaciones"
                className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-white/90 hover:text-white transition-colors group"
              >
                <FiArrowLeft size={15} className="transition-transform duration-200 group-hover:-translate-x-1" />
                <span>Volver</span>
              </Link>
            </div>

            {/* Slide del Evento Destacado */}
            {currentHeroEvent ? (
              <div className="flex flex-col md:flex-row items-center gap-6 md:gap-10 lg:gap-12">
                {/* Imagen / Contenedor cálido dorado del Slide */}
                <div className="w-full md:w-[380px] lg:w-[440px] shrink-0">
                  <div className="relative aspect-[16/9] w-full rounded-2xl overflow-hidden bg-gradient-to-br from-[#A6783A] via-[#8F652D] to-[#6E4B1F] shadow-2xl border border-amber-300/25">
                    {currentHeroEvent.photo && (
                      <ImageWithFallback
                        src={currentHeroEvent.photo}
                        alt={currentHeroEvent.title}
                        showText={false}
                        className="w-full h-full object-cover"
                        imgClassName="w-full h-full object-cover transition-transform duration-700"
                        fallbackClassName="w-full h-full bg-[#9C7038]"
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent pointer-events-none" />
                  </div>
                </div>

                {/* Texto del Evento Destacado y CTA */}
                <div className="flex-1 text-center md:text-left">
                  <p className="text-base sm:text-xl font-extrabold text-white tracking-tight mb-1">
                    Eventos Destacados
                  </p>
                  <h2 className="text-2xl sm:text-4xl lg:text-[42px] font-black text-white uppercase tracking-tight leading-tight mb-5 line-clamp-2">
                    {currentHeroEvent.title}
                  </h2>
                  <Link
                    to={`/eventos/${currentHeroEvent.id}`}
                    className="inline-flex items-center justify-center px-7 py-2.5 rounded-full border border-white/60 hover:border-amber-400 hover:bg-amber-400 hover:text-slate-950 text-white text-xs font-bold uppercase tracking-widest transition-all duration-200 shadow-sm"
                  >
                    VER DETALLES
                  </Link>
                </div>
              </div>
            ) : (
              <div className="flex flex-col md:flex-row items-center gap-6 md:gap-10 lg:gap-12">
                <div className="w-full md:w-[380px] lg:w-[440px] shrink-0">
                  <div className="relative aspect-[16/9] w-full rounded-2xl overflow-hidden bg-gradient-to-br from-[#A6783A] via-[#8F652D] to-[#6E4B1F] shadow-2xl border border-amber-300/25" />
                </div>
                <div className="flex-1 text-center md:text-left">
                  <p className="text-base sm:text-xl font-extrabold text-white tracking-tight mb-1">
                    Eventos Destacados
                  </p>
                  <h2 className="text-2xl sm:text-4xl font-black text-white uppercase tracking-tight leading-tight mb-4">
                    {organization.name}
                  </h2>
                </div>
              </div>
            )}

            {/* Indicadores / Puntos de navegación del carrusel centrados abajo */}
            <div className="flex items-center justify-center gap-2 mt-6">
              {(featuredSlides.length > 0 ? featuredSlides : [null, null, null]).map((slide, idx) => {
                const isActive = idx === activeSlide;
                return (
                  <button
                    key={slide?.id || idx}
                    type="button"
                    aria-label={`Ir al evento destacado ${idx + 1}`}
                    onClick={() => slide && setActiveSlide(idx)}
                    className={`transition-all duration-300 rounded-full cursor-pointer ${
                      isActive
                        ? 'w-7 h-1.5 bg-white shadow-xs'
                        : 'w-1.5 h-1.5 bg-white/45 hover:bg-white/75'
                    }`}
                  />
                );
              })}
            </div>
          </div>
        </section>

        {/* 2. LAYOUT DE 2 COLUMNAS (Abajo del Hero) */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-16">
          <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] xl:grid-cols-[340px_1fr] gap-8 lg:gap-10 items-start">
            {/* COLUMNA IZQUIERDA: Card de Perfil de la Organización (Sidebar) */}
            <aside className="relative w-full max-w-md mx-auto lg:max-w-none">
              <div className="rounded-[26px] bg-white dark:bg-[#14171E]/95 border border-slate-200 dark:border-amber-500/30 px-6 pb-7 pt-20 text-center shadow-2xl relative">
                {/* Avatar Circular que sobresale en la parte superior del card */}
                <div className="absolute -top-16 left-1/2 -translate-x-1/2">
                  <div className="w-32 h-32 sm:w-36 sm:h-36 rounded-full p-[3px] bg-gradient-to-b from-amber-300 via-amber-500 to-amber-700 shadow-2xl">
                    <div className="w-full h-full rounded-full bg-[#0E131F] overflow-hidden flex items-center justify-center">
                      <ImageWithFallback
                        src={organization.avatar}
                        alt={organization.name}
                        showText={false}
                        className="w-full h-full object-cover rounded-full"
                        imgClassName="w-full h-full object-cover rounded-full"
                        fallbackClassName="w-full h-full rounded-full"
                        iconSize={42}
                      />
                    </div>
                  </div>
                </div>

                {/* Nombre de la Organización */}
                <h1 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white uppercase tracking-wide leading-snug mt-2">
                  {organization.name}
                </h1>

                {/* Badge VERIFICADA EN EVENTHIVE en tono turquesa/verde */}
                {organization.verified !== false && (
                  <div className="mt-3 flex justify-center">
                    <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300 bg-emerald-500/15 px-3.5 py-1 rounded-full border border-emerald-500/35">
                      <FiCheckCircle size={11} className="text-emerald-500 dark:text-emerald-400 shrink-0" />
                      <span>VERIFICADA EN EVENTHIVE</span>
                    </span>
                  </div>
                )}

                {/* Fila de métricas dividida con bordes finos: SEGUIDORES | RATINGS | EVENTOS ACTIVOS */}
                <div className="grid grid-cols-3 divide-x divide-slate-200 dark:divide-white/15 border-b border-slate-200 dark:border-amber-500/20 py-5 my-5">
                  {/* Seguidores */}
                  <div className="px-1.5 flex flex-col items-center justify-center">
                    <FiUsers className="text-amber-500 dark:text-amber-400 mb-1.5" size={15} />
                    <span className="text-sm sm:text-base font-black text-slate-900 dark:text-white leading-tight">
                      {followersCount}
                    </span>
                    <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mt-0.5">
                      SEGUIDORES
                    </span>
                  </div>

                  {/* Ratings */}
                  <div className="px-1.5 flex flex-col items-center justify-center">
                    <FiStar className="text-amber-500 dark:text-amber-400 mb-1.5" size={15} />
                    <span className="text-sm sm:text-base font-black text-slate-900 dark:text-white leading-tight">
                      {organization.rating ? Number(organization.rating).toFixed(1) : '4.5'} / 5.0
                    </span>
                    <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mt-0.5">
                      RATINGS
                    </span>
                  </div>

                  {/* Eventos Activos */}
                  <div className="px-1.5 flex flex-col items-center justify-center">
                    <FiCalendar className="text-amber-500 dark:text-amber-400 mb-1.5" size={15} />
                    <span className="text-sm sm:text-base font-black text-slate-900 dark:text-white leading-tight">
                      {counts.publicados}
                    </span>
                    <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mt-0.5 leading-tight">
                      EVENTOS ACTIVOS
                    </span>
                  </div>
                </div>

                {/* Texto descriptivo de la organización */}
                <p className="text-xs sm:text-[13px] text-slate-600 dark:text-slate-200 leading-relaxed text-left mb-6 font-normal">
                  {organization.description ||
                    'Producción cultural de excelencia, uniendo tradición y modernidad en Cartagena. Descubre experiencias únicas en Cartagena.'}
                </p>

                {/* Botón principal de acción destacado en amarillo/dorado corporativo: SEGUIR */}
                <button
                  type="button"
                  onClick={handleToggleFollow}
                  className={`w-full py-3 px-6 rounded-full text-xs font-black uppercase tracking-widest transition-all duration-200 shadow-md active:scale-95 cursor-pointer ${
                    isFollowing
                      ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30'
                      : 'bg-[#F5A60B] hover:bg-amber-400 text-slate-950 shadow-amber-500/20'
                  }`}
                >
                  {isFollowing ? 'SIGUIENDO' : 'SEGUIR'}
                </button>

                {/* Icono de redes sociales en la parte inferior (solo Instagram) */}
                <div className="mt-7 pt-1 flex items-center justify-center">
                  {socialInstagram ? (
                    <a
                      href={socialInstagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Instagram de la organización"
                      className="text-amber-600/80 dark:text-amber-400/75 hover:text-amber-500 dark:hover:text-amber-300 transition-colors p-1.5"
                    >
                      <FiInstagram size={18} />
                    </a>
                  ) : (
                    <span
                      aria-label="Instagram"
                      className="text-amber-600/80 dark:text-amber-400/75 hover:text-amber-500 dark:hover:text-amber-300 transition-colors p-1.5 cursor-pointer"
                    >
                      <FiInstagram size={18} />
                    </span>
                  )}
                </div>
              </div>
            </aside>

            {/* COLUMNA DERECHA: Grid de Eventos / Contenido Principal */}
            <div className="min-w-0 w-full">
              {/* Encabezado Principal */}
              <h2 className="text-xl sm:text-2xl lg:text-[26px] font-black text-slate-900 dark:text-white uppercase tracking-tight mb-4">
                NUESTRAS EXPERIENCIAS CULTURALES
              </h2>

              {/* Pestañas de Filtro (Tabs pill style): TODOS, ACTIVOS, FINALIZADOS */}
              <div className="inline-flex flex-wrap items-center p-1 rounded-full bg-slate-200/80 dark:bg-[#1C2029] border border-slate-300/80 dark:border-white/10 mb-7">
                <button
                  type="button"
                  onClick={() => handleTabChange('todos')}
                  className={`px-5 py-1.5 rounded-full text-xs font-extrabold uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                    activeTab === 'todos'
                      ? 'bg-white text-slate-950 shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  TODOS ({counts.todos})
                </button>
                <button
                  type="button"
                  onClick={() => handleTabChange('publicados')}
                  className={`px-5 py-1.5 rounded-full text-xs font-extrabold uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                    activeTab === 'publicados'
                      ? 'bg-white text-slate-950 shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  ACTIVOS ({counts.publicados})
                </button>
                <button
                  type="button"
                  onClick={() => handleTabChange('finalizados')}
                  className={`px-5 py-1.5 rounded-full text-xs font-extrabold uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                    activeTab === 'finalizados'
                      ? 'bg-white text-slate-950 shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  FINALIZADOS ({counts.finalizados})
                </button>
              </div>

              {/* Grid de tarjetas de eventos (3 columnas como en la maqueta) */}
              {filteredEvents.length > 0 ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                    {paginatedEvents.map((event, idx) => {
                      // Paleta alternada suave de respaldo para cuando la imagen carga o usa fallback
                      const fallbackTone =
                        idx % 2 === 0
                          ? 'from-[#A5793E] via-[#8F652E] to-[#4A3519]'
                          : 'from-[#60858E] via-[#4D6E76] to-[#27393E]';

                      return (
                        <article
                          key={event.id}
                          className="group rounded-2xl bg-white dark:bg-[#131720] border border-slate-200 dark:border-white/15 hover:border-amber-500/50 overflow-hidden flex flex-col justify-between shadow-lg transition-all duration-300 hover:-translate-y-1"
                        >
                          {/* Banner Superior con Imagen, Badges Flotantes, Corazón y Título superpuesto */}
                          <div className={`relative aspect-[16/11] w-full overflow-hidden bg-gradient-to-b ${fallbackTone}`}>
                            {event.photo && (
                              <ImageWithFallback
                                src={event.photo}
                                alt={event.title}
                                showText={false}
                                className="w-full h-full object-cover"
                                imgClassName="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                                fallbackClassName="w-full h-full bg-transparent"
                              />
                            )}

                            {/* Degradado oscuro inferior para contraste del título */}
                            <div
                              className="absolute inset-0 pointer-events-none"
                              style={{
                                background:
                                  'linear-gradient(180deg, rgba(0,0,0,0.08) 0%, rgba(0,0,0,0.18) 45%, rgba(10,13,20,0.92) 100%)',
                              }}
                            />

                            {/* Badges Flotantes Esquina Superior Izquierda */}
                            <div className="absolute top-3 left-3 z-10 flex flex-col items-start gap-1.5">
                              <span className="px-2.5 py-1 rounded-md bg-[#EFECE6] text-slate-900 font-extrabold text-[10px] uppercase tracking-wider shadow-sm">
                                {event.category || 'EVENTO'}
                              </span>

                              {event.promocionado && (
                                <span className="px-2.5 py-0.5 rounded-md bg-[#F5B82E] text-slate-950 font-black text-[10px] uppercase tracking-wider shadow-sm flex items-center gap-1">
                                  <span>★</span>
                                  <span>PROMOCIONADO</span>
                                </span>
                              )}
                            </div>

                            {/* Icono de Favorito (Corazón) Esquina Superior Derecha */}
                            <div className="absolute top-3 right-3 z-10">
                              <FavoriteButton initialActive={event.favorite} eventId={event.id} />
                            </div>

                            {/* Título en mayúsculas negrita en la base del banner */}
                            <div className="absolute bottom-2.5 inset-x-3.5 z-10">
                              <Link to={`/eventos/${event.id}`} className="block">
                                <h3 className="font-black text-[15px] sm:text-base text-white uppercase tracking-tight leading-tight line-clamp-2 group-hover:text-amber-300 transition-colors drop-shadow-sm">
                                  {event.title}
                                </h3>
                              </Link>
                            </div>
                          </div>

                          {/* Metadata Inferior (Fecha/Hora y Ubicación) + Botón Píldora Blanco "Ver evento" */}
                          <div className="p-3.5 pt-2.5 bg-slate-50 dark:bg-[#0F131A] flex flex-col justify-between flex-1 gap-3">
                            <div className="space-y-1 text-[11px] sm:text-xs text-slate-600 dark:text-slate-300">
                              <div className="flex items-center gap-2 truncate">
                                <FiCalendar className="text-amber-500 dark:text-amber-400 shrink-0" size={13} />
                                <span className="truncate font-medium">
                                  {event.date || event.shortDate || 'Fecha por confirmar'}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 truncate">
                                <FiMapPin className="text-amber-500 dark:text-amber-400 shrink-0" size={13} />
                                <span className="truncate text-slate-500 dark:text-slate-400">
                                  {event.location || 'Cartagena de Indias'}
                                </span>
                              </div>
                            </div>

                            <Link
                              to={`/eventos/${event.id}`}
                              className="w-full py-2 px-4 rounded-full bg-slate-900 hover:bg-slate-800 text-white dark:bg-[#F1F5F9] dark:hover:bg-white dark:text-slate-950 text-xs font-extrabold text-center transition-all duration-200 shadow-xs active:scale-[0.98]"
                            >
                              Ver evento
                            </Link>
                          </div>
                        </article>
                      );
                    })}
                  </div>

                  {/* Paginación Minimalista y Centrada */}
                  {filteredEvents.length > EVENTS_PAGE_SIZE && (
                    <div className="mt-10 flex justify-center w-full">
                      <Pagination
                        currentPage={eventsPage}
                        totalItems={filteredEvents.length}
                        pageSize={EVENTS_PAGE_SIZE}
                        onPageChange={(p) => {
                          setEventsPage(p);
                          window.scrollTo({ top: 380, behavior: 'smooth' });
                        }}
                        minimal={true}
                      />
                    </div>
                  )}
                </>
              ) : (
                <div className="border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl bg-white dark:bg-[#131720] p-14 text-center max-w-xl mx-auto shadow-sm my-6">
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
            </div>
          </div>
        </section>
      </main>

      {/* Componente pre-footer compartido */}
      <CityRhythmPreFooter />
      <Footer />
    </div>
  );
}
