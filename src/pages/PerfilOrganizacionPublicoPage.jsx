import { useEffect, useState, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  FiArrowLeft,
  FiCheckCircle,
  FiCalendar,
  FiUsers,
  FiStar,
  FiMapPin,
} from 'react-icons/fi';
import Navbar from '../components/usersComponets/Navbar.jsx';
import Footer from '../components/usersComponets/Footer.jsx';
import CityRhythmPreFooter from '../components/home/CityRhythmPreFooter.jsx';
import ImageWithFallback from '../components/common/ImageWithFallback.jsx';
import FavoriteButton from '../components/FavoriteButton.jsx';
import EventCardSkeleton from '../components/common/EventCardSkeleton.jsx';
import ModalValoracionOrganizacion from '../components/organizacion/ModalValoracionOrganizacion.jsx';
import { organizationService } from '../services/organizerService.js';
import { session } from '../services/session.js';
import { showErrorAlert, showLoginAlert } from '../utils/alertUtils.js';
import followService from '../services/followService.js';
import Pagination from '../components/Shared/Pagination.jsx';
import FloatingDotsBackground from '../components/common/FloatingDotsBackground.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';
import { apiCache } from '../services/cacheService.js';

const EVENTS_PAGE_SIZE = 6;

export default function PerfilOrganizacionPublicoPage() {
  const { t } = useLanguage();
  const { id } = useParams();
  const navigate = useNavigate();

  const user = session.getUser();
  const userId = user?.id ?? user?.usuarioId;

  const [organization, setOrganization] = useState(() => apiCache.get(`org_detail_${id}`) || null);
  const [events, setEvents] = useState(() => apiCache.get(`org_events_${id}`) || []);
  const [loading, setLoading] = useState(() => !apiCache.has(`org_detail_${id}`));
  const [isFollowing, setIsFollowing] = useState(() => followService.isFollowing(id, userId));
  const [isFollowingBusy, setIsFollowingBusy] = useState(false);
  const [followersCount, setFollowersCount] = useState(() => apiCache.get(`org_detail_${id}`)?.followers || 0);
  const [eventsPage, setEventsPage] = useState(1);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const userOrganizationId =
    user?.organizacionId ?? user?.organizationId ?? user?.organizacion?.id ?? user?.organization?.id;
  const representativeId =
    organization?.representante?.id ??
    organization?.representanteId ??
    organization?.representanteLegalId;
  const isOwnOrganization = Boolean(
    user &&
      ((userOrganizationId && String(userOrganizationId) === String(id)) ||
        (userId && representativeId && String(userId) === String(representativeId)))
  );

  const handleValoracionGuardada = (nuevaValoracion) => {
    if (nuevaValoracion && organization) {
      setOrganization((prev) => {
        if (!prev) return prev;
        const currentCount = Number(prev.totalValoraciones || 0);
        const currentRating = Number(prev.rating || 4.5);
        const newScore = Number(nuevaValoracion.calificacion || 5);
        const newCount = currentCount + 1;
        const updatedRating =
          currentCount > 0
            ? ((currentRating * currentCount + newScore) / newCount).toFixed(1)
            : newScore.toFixed(1);
        const updated = {
          ...prev,
          rating: updatedRating,
          totalValoraciones: newCount,
        };
        apiCache.set(`org_detail_${id}`, updated, 120000);
        return updated;
      });
    }
  };

  // Sincronizar estado de seguimiento en tiempo real y con backend
  useEffect(() => {
    setIsFollowing(followService.isFollowing(id, userId));

    if (user && userId) {
      followService.syncWithBackend(userId).then(() => {
        setIsFollowing(followService.isFollowing(id, userId));
      });
    }

    const onFollowChange = (e) => {
      if (e.detail?.orgId && String(e.detail.orgId) === String(id)) {
        setIsFollowing(Boolean(e.detail.isFollowing));
        setFollowersCount((prev) => (e.detail.isFollowing ? prev + 1 : Math.max(0, prev - 1)));
      }
    };
    window.addEventListener('eventhive:follow_changed', onFollowChange);
    return () => window.removeEventListener('eventhive:follow_changed', onFollowChange);
  }, [id, user, userId]);

  useEffect(() => {
    let isMounted = true;
    setEventsPage(1);

    const cacheKeyOrg = `org_detail_${id}`;
    const cacheKeyEvents = `org_events_${id}`;

    // Si no teníamos datos en memoria, marcar cargando
    if (!apiCache.has(cacheKeyOrg)) {
      setLoading(true);
    }

    Promise.all([
      apiCache.fetchWithCache(cacheKeyOrg, () => organizationService.getOrganizationById(id), {
        ttlMs: 90000,
        staleWhileRevalidate: true,
      }),
      apiCache.fetchWithCache(cacheKeyEvents, () => organizationService.getOrganizationEvents(id), {
        ttlMs: 90000,
        staleWhileRevalidate: true,
      }),
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

  useEffect(() => {
    let isMounted = true;
    if (!user || !id || isOwnOrganization) {
      setIsFollowing(false);
      return () => {
        isMounted = false;
      };
    }

    organizationService
      .isFollowingOrganization(id)
      .then((following) => {
        if (isMounted) setIsFollowing(following);
      })
      .catch((error) => {
        console.warn('No se pudo consultar el seguimiento de la organización:', error);
      });

    return () => {
      isMounted = false;
    };
  }, [id, isOwnOrganization, Boolean(userId)]);

  const handleToggleFollow = async () => {
    if (!user) {
      showLoginAlert({
        title: 'Inicia sesión',
        text: 'Debes iniciar sesión para seguir a esta organización.',
        navigate,
      });
      return;
    }
    if (isOwnOrganization || isFollowingBusy) return;

    setIsFollowingBusy(true);
    try {
      if (isFollowing) {
        await followService.unfollow(id, userId);
        setIsFollowing(false);
        setFollowersCount((prev) => Math.max(0, prev - 1));
      } else {
        await followService.follow(id, userId);
        setIsFollowing(true);
        setFollowersCount((prev) => prev + 1);
      }
    } catch (error) {
      await showErrorAlert({
        title: 'No se pudo actualizar el seguimiento',
        text: error.message || 'Intenta de nuevo más tarde.',
      });
    } finally {
      setIsFollowingBusy(false);
    }
  };

  const activeEvents = useMemo(() => {
    return events.filter((ev) => {
      const isPast = ev.startsAt ? new Date(ev.startsAt) < new Date() : false;
      const estado = (ev.estado || (isPast ? 'FINALIZADO' : 'PUBLICADO')).toUpperCase();
      return estado === 'PUBLICADO' && !isPast;
    });
  }, [events]);

  const paginatedEvents = useMemo(() => {
    const start = (eventsPage - 1) * EVENTS_PAGE_SIZE;
    return activeEvents.slice(start, start + EVENTS_PAGE_SIZE);
  }, [activeEvents, eventsPage]);

  if (loading) {
    return (
      <div className="w-full min-h-screen bg-[#F8FAFC] dark:bg-[#070D1B] text-slate-900 dark:text-slate-100 flex flex-col justify-between selection:bg-amber-400 selection:text-slate-950 relative transition-colors duration-200">
        <FloatingDotsBackground />
        <Navbar />

        <main className="flex-1 relative z-10 animate-pulse">
          {/* Header Skeleton */}
          <section className="w-full bg-gradient-to-b from-[#04499E] via-[#0A2652] to-[#0B132B] text-white pt-6 pb-8 sm:pb-10 px-4 sm:px-8 lg:px-12 border-b border-white/10 relative overflow-hidden">
            <div className="max-w-6xl mx-auto">
              <div className="h-4 w-32 bg-white/20 rounded-md mb-6" />
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <div className="h-3 w-40 bg-amber-400/30 rounded-md mb-2" />
                  <div className="h-8 w-64 sm:w-96 bg-white/20 rounded-xl" />
                </div>
                <div className="h-6 w-24 bg-white/10 rounded-full" />
              </div>
            </div>
          </section>

          {/* Body Skeleton */}
          <section className="max-w-6xl mx-auto px-4 sm:px-8 lg:px-12 py-10 sm:py-12">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Sidebar Skeleton */}
              <div className="lg:col-span-4 rounded-3xl bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 p-6 shadow-sm flex flex-col items-center">
                <div className="w-24 h-24 rounded-full bg-slate-200 dark:bg-slate-800 mb-4" />
                <div className="h-5 w-44 bg-slate-200 dark:bg-slate-800 rounded-md mb-2" />
                <div className="h-4 w-28 bg-emerald-500/20 rounded-full mb-6" />
                <div className="w-full grid grid-cols-3 gap-2 border-y border-slate-100 dark:border-slate-800 py-4 mb-6">
                  <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded-md" />
                  <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded-md" />
                  <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded-md" />
                </div>
                <div className="w-full h-10 bg-amber-500/40 rounded-full" />
              </div>

              {/* Events Grid Skeleton */}
              <div className="lg:col-span-8 space-y-6">
                <div className="h-6 w-48 bg-slate-200 dark:bg-slate-800 rounded-md" />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  <EventCardSkeleton />
                  <EventCardSkeleton />
                  <EventCardSkeleton />
                  <EventCardSkeleton />
                  <EventCardSkeleton />
                  <EventCardSkeleton />
                </div>
              </div>
            </div>
          </section>
        </main>

        <CityRhythmPreFooter />
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
          <h2 className="text-2xl font-black text-[#0B1B3D] dark:text-white mb-2">{t("Organización no encontrada")}</h2>
          <p className="text-slate-600 dark:text-slate-400 text-sm max-w-md mb-6 font-medium">
            La organización solicitada no está disponible o no tiene un perfil público registrado.
          </p>
          <Link
            to="/organizaciones"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black uppercase tracking-wider shadow-md transition-all active:scale-95"
          >
            <FiArrowLeft size={16} />
            {t("Volver a Organizaciones")}
          </Link>
        </div>

        <CityRhythmPreFooter />
        <Footer />
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-[#F8FAFC] dark:bg-[#070D1B] text-slate-900 dark:text-slate-100 flex flex-col justify-between selection:bg-amber-400 selection:text-slate-950 relative transition-colors duration-200">
      {/* NO MODIFICAR EL FONDO CON PUNTOS FLOTANTES */}
      <FloatingDotsBackground />
      <Navbar />

      <main className="flex-1 relative z-10">
        {/* Encabezado del perfil público de la organización */}
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
                <span>{t("Volver")}</span>
              </Link>
            </div>

            <div className="py-8 sm:py-12 text-center">
              <p className="text-xs sm:text-sm font-extrabold uppercase tracking-[0.2em] text-amber-300 mb-3">
                organización
              </p>
              <h1 className="text-2xl sm:text-4xl lg:text-[42px] font-black text-white uppercase tracking-tight leading-tight">
                {organization.name}
              </h1>
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
                      <span>{t("VERIFICADA EN EVENTHIVE")}</span>
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
                  {!isOwnOrganization ? (
                    <button
                      type="button"
                      onClick={() => setShowRatingModal(true)}
                      title="Calificar a esta organización"
                      className="px-1.5 flex flex-col items-center justify-center hover:opacity-85 transition-opacity cursor-pointer group"
                    >
                      <FiStar className="text-amber-500 dark:text-amber-400 mb-1.5 group-hover:scale-110 transition-transform fill-amber-400/20" size={15} />
                      <span className="text-sm sm:text-base font-black text-slate-900 dark:text-white leading-tight group-hover:text-amber-500 transition-colors">
                        {organization.rating ? Number(organization.rating).toFixed(1) : '4.5'} / 5.0
                      </span>
                      <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mt-0.5 underline decoration-dotted decoration-amber-500/50">
                        RATINGS
                      </span>
                    </button>
                  ) : (
                    <div className="px-1.5 flex flex-col items-center justify-center">
                      <FiStar className="text-amber-500 dark:text-amber-400 mb-1.5" size={15} />
                      <span className="text-sm sm:text-base font-black text-slate-900 dark:text-white leading-tight">
                        {organization.rating ? Number(organization.rating).toFixed(1) : '4.5'} / 5.0
                      </span>
                      <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mt-0.5">
                        RATINGS
                      </span>
                    </div>
                  )}

                  {/* Eventos Activos */}
                  <div className="px-1.5 flex flex-col items-center justify-center">
                    <FiCalendar className="text-amber-500 dark:text-amber-400 mb-1.5" size={15} />
                    <span className="text-sm sm:text-base font-black text-slate-900 dark:text-white leading-tight">
                      {activeEvents.length}
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
                {!isOwnOrganization && (
                  <button
                    type="button"
                    onClick={handleToggleFollow}
                    disabled={isFollowingBusy}
                    className={`w-full py-3 px-6 rounded-full text-xs font-black uppercase tracking-widest transition-all duration-200 shadow-md active:scale-95 cursor-pointer ${
                      isFollowing
                        ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30'
                        : 'bg-[#F5A60B] hover:bg-amber-400 text-slate-950 shadow-amber-500/20'
                    }`}
                  >
                    {isFollowing ? t('SIGUIENDO') : t('SEGUIR')}
                  </button>
                )}

                {/* Botón para abrir modal de valoraciones */}
                {!isOwnOrganization && (
                  <button
                    type="button"
                    onClick={() => setShowRatingModal(true)}
                    className="w-full mt-2.5 py-2.5 px-5 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-200 border border-amber-500/40 text-amber-600 dark:text-amber-400 hover:bg-amber-500/10 active:scale-95 cursor-pointer flex items-center justify-center gap-2"
                  >
                    <FiStar size={13} className="text-amber-500" />
                    <span>Valorar Organización</span>
                  </button>
                )}
              </div>
            </aside>

            {/* COLUMNA DERECHA: Grid de Eventos / Contenido Principal */}
            <div className="min-w-0 w-full">
              {/* Encabezado Principal */}
              <h2 className="text-xl sm:text-2xl lg:text-[26px] font-black text-slate-900 dark:text-white uppercase tracking-tight mb-4">
                {t("NUESTRAS EXPERIENCIAS CULTURALES")}
              </h2>

              {/* Grid de tarjetas de eventos (3 columnas como en la maqueta) */}
              {activeEvents.length > 0 ? (
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
                                  <span>{t("PROMOCIONADO")}</span>
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
                  {activeEvents.length > EVENTS_PAGE_SIZE && (
                    <div className="mt-10 flex justify-center w-full">
                      <Pagination
                        currentPage={eventsPage}
                        totalItems={activeEvents.length}
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
                    {t("No hay eventos activos")}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mb-6 font-medium">
                    {t("Esta organización actualmente no tiene eventos publicados y activos.")}
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>

      {/* Modal exclusivo para emitir valoración a la organización */}
      <ModalValoracionOrganizacion
        isOpen={showRatingModal}
        onClose={() => setShowRatingModal(false)}
        organization={organization}
        organizacionId={id}
        onValoracionGuardada={handleValoracionGuardada}
      />

      {/* Componente pre-footer compartido */}
      <CityRhythmPreFooter />
      <Footer />
    </div>
  );
}
