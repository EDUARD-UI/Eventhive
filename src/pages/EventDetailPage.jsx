import { useEffect, useState, useMemo } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { FiCalendar, FiMapPin, FiArrowLeft, FiHeart, FiShare2, FiShield, FiTag, FiClock, FiCheckCircle, FiPlus, FiMinus } from 'react-icons/fi';
import { Sparkles } from 'lucide-react';
import L from 'leaflet';
import { MapContainer, Marker, TileLayer } from 'react-leaflet';
import Swal from 'sweetalert2';
import { showLoginAlert } from '../utils/alertUtils.js';
import Navbar from '../components/usersComponets/Navbar.jsx';
import Footer from '../components/usersComponets/Footer.jsx';
import { getEventById, getUpcomingEvents } from '../services/eventService.js';
import { httpClient } from '../services/httpClient.js';
import { session } from '../services/session.js';
import ImageWithFallback from '../components/common/ImageWithFallback.jsx';
import HiveEventCard from '../components/home/HiveEventCard.jsx';
import EventListCard from '../components/common/EventListCard.jsx';
import PasarelaPagoSimuladaModal from '../components/common/PasarelaPagoSimuladaModal.jsx';
import FloatingDotsBackground from '../components/common/FloatingDotsBackground.jsx';
import { getCategoryGradient } from '../utils/formatters.js';

/**
 * Pin temático de panal ámbar/dorado para Leaflet
 */
const amberHivePinIcon = () =>
  L.divIcon({
    className: 'custom-hive-map-pin',
    html: `
      <div style="position: relative; width: 36px; height: 44px; display: flex; align-items: center; justify-content: center; filter: drop-shadow(0 4px 8px rgba(0,0,0,0.25)); cursor: pointer;">
        <svg viewBox="0 0 34 42" width="36" height="44" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M17 0C7.61 0 0 7.61 0 17C0 27.5 14.5 40.5 16.1 41.9C16.6 42.3 17.4 42.3 17.9 41.9C19.5 40.5 34 27.5 34 17C34 7.61 26.39 0 17 0Z" fill="#F59E0B" stroke="#FFFFFF" stroke-width="2.2"/>
          <circle cx="17" cy="17" r="6" fill="#0B132B"/>
          <circle cx="17" cy="17" r="3" fill="#FCD34D"/>
        </svg>
      </div>
    `,
    iconSize: [36, 44],
    iconAnchor: [18, 44],
    popupAnchor: [0, -44],
  });

/**
 * Celda hexagonal de fecha estilo Colmena
 */
function HoneycombDateBadge({ dateStr }) {
  const parts = (dateStr || '').split(' ');
  const day = parts.find((p) => /^\d{1,2}$/.test(p)) || '';
  const month = parts.find((p) => p.length === 3 && isNaN(p)) || 'HOY';

  return (
    <div className="relative w-14 h-16 flex items-center justify-center shrink-0">
      <div className="absolute inset-0 clip-hexagon-horiz bg-amber-500" />
      <div className="absolute inset-[2.5px] clip-hexagon-horiz bg-[#0B172C] flex flex-col items-center justify-center text-center p-1">
        <span className="text-[10px] font-black uppercase text-amber-300 tracking-wider leading-none">
          {month}
        </span>
        <span className="font-display text-base font-black text-white leading-tight mt-0.5">
          {day || '--'}
        </span>
      </div>
    </div>
  );
}

export default function EventDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedLocalidad, setSelectedLocalidad] = useState(null);
  const [ticketQuantity, setTicketQuantity] = useState(1);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [similarEvents, setSimilarEvents] = useState([]);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);

    getEventById(id)
      .then((data) => {
        if (!isMounted) return;
        setEvent(data);
        if (data?.localidades?.length > 0) {
          setSelectedLocalidad(data.localidades[0]);
        }
      })
      .catch((err) => {
        if (isMounted) setError(err.message || 'No fue posible cargar el evento.');
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    // Cargar eventos similares 
    getUpcomingEvents()
      .then((upcoming) => {
        if (!isMounted) return;
        const filtered = (upcoming || [])
          .filter((ev) => String(ev.id) !== String(id))
          .slice(0, 3);
        setSimilarEvents(filtered);
      })
      .catch(() => {
        // En caso de error silencioso no rompemos la vista
      });

    return () => {
      isMounted = false;
    };
  }, [id]);

  const localidades = useMemo(() => {
    if (event?.localidades && event.localidades.length > 0) {
      return event.localidades;
    }
    if (event?.price !== undefined) {
      return [
        {
          id: 'general',
          nombre: 'Entrada General',
          precio: event.price,
        },
      ];
    }
    return [];
  }, [event]);

  useEffect(() => {
    if (!selectedLocalidad && localidades.length > 0) {
      setSelectedLocalidad(localidades[0]);
    }
  }, [localidades, selectedLocalidad]);

  const displayedPrice = selectedLocalidad?.precio ?? event?.price ?? 0;

  const orgName = useMemo(() => {
    if (!event?.organization) return 'Organización Cultural';
    if (typeof event.organization === 'object') {
      return event.organization.nombre || event.organization.razonSocial || 'Organización Cultural';
    }
    return event.organization;
  }, [event]);

  const orgAvatar = useMemo(() => {
    if (typeof event?.organization === 'object') {
      return event.organization.logo || event.organization.imagen || null;
    }
    return null;
  }, [event]);

  const mapCenter = useMemo(() => {
    const lat = Number(event?.lat);
    const lng = Number(event?.lng);
    if (!Number.isNaN(lat) && !Number.isNaN(lng) && lat !== 0 && lng !== 0) {
      return [lat, lng];
    }
    return [10.4236, -75.5513];
  }, [event]);

  const handleToggleFollow = async () => {
    const user = session.getUser();
    if (!user) {
      showLoginAlert({
        title: 'Inicia sesión',
        text: 'Debes iniciar sesión para seguir a este organizador.',
        navigate,
      });
      return;
    }

    const orgId = typeof event?.organization === 'object' ? event.organization.id : null;
    try {
      if (orgId) {
        if (isFollowing) {
          await httpClient.delete(`/seguidores/${orgId}/seguir`);
        } else {
          await httpClient.post(`/seguidores/${orgId}/seguir`);
        }
      }
      setIsFollowing(!isFollowing);
    } catch {
      setIsFollowing(!isFollowing);
    }
  };

  const handleToggleFavorite = async () => {
    const user = session.getUser();
    if (!user) {
      showLoginAlert({
        title: 'Inicia sesión',
        text: 'Debes iniciar sesión para guardar eventos en tu lista de deseos.',
        navigate,
      });
      return;
    }

    try {
      if (isFavorite) {
        await httpClient.delete(`/deseos/${event.id}`);
        setIsFavorite(false);
      } else {
        await httpClient.post(`/deseos/${event.id}`);
        setIsFavorite(true);
      }
    } catch {
      setIsFavorite(!isFavorite);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: event?.title || 'Evento en EventHive',
          text: `¡Mira esta experiencia cultural en Cartagena: ${event?.title}!`,
          url: window.location.href,
        });
      } catch {
        // Ignorar cancelaciones
      }
    } else {
      await navigator.clipboard.writeText(window.location.href);
      Swal.fire({
        icon: 'success',
        title: '¡Enlace copiado!',
        text: 'El enlace del evento se ha copiado al portapapeles.',
        timer: 1800,
        showConfirmButton: false,
      });
    }
  };

  const handlePurchase = () => {
    const user = session.getUser();
    if (!user) {
      showLoginAlert({
        title: 'Inicia sesión',
        text: 'Debes iniciar sesión para adquirir tus entradas.',
        navigate,
      });
      return;
    }

    // Redirigir a la interfaz dedicada de pasarela de pago minimalista
    navigate(`/pago/${event.id}`, {
      state: {
        event,
        localidad: selectedLocalidad,
        cantidad: ticketQuantity,
      },
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-[#F8FAFC] dark:bg-[#070D1B] text-slate-900 dark:text-slate-100 font-body transition-colors duration-200">
        <Navbar />
        <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-pulse">
          <div className="space-y-3">
            <div className="h-6 w-32 bg-slate-200 dark:bg-slate-800 rounded-md" />
            <div className="h-10 w-2/3 bg-slate-200 dark:bg-slate-800 rounded-xl" />
            <div className="h-5 w-1/3 bg-slate-100 dark:bg-slate-800/60 rounded" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-8 space-y-6">
              <div className="h-80 sm:h-96 bg-white dark:bg-[#0B1428] border border-slate-200 dark:border-slate-800 rounded-3xl" />
              <div className="h-44 bg-white dark:bg-[#0B1428] border border-slate-200 dark:border-slate-800 rounded-3xl p-6" />
            </div>
            <div className="lg:col-span-4 h-96 bg-white dark:bg-[#0B1428] border border-slate-200 dark:border-slate-800 rounded-3xl p-6" />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen flex flex-col bg-[#F8FAFC] dark:bg-[#070D1B] text-slate-900 dark:text-slate-100 font-body transition-colors duration-200">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center px-4 py-20 text-center">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-400/20 flex items-center justify-center text-amber-600 dark:text-amber-400 text-2xl mb-4 shadow-sm">
            <FiCalendar size={28} />
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-950 dark:text-white mb-2 uppercase tracking-tight">Evento no disponible</h2>
          <p className="text-sm font-medium text-slate-600 dark:text-slate-400 max-w-md mb-6 leading-relaxed">
            {error || 'El evento que buscas no está disponible o ha sido retirado de la cartelera cultural.'}
          </p>
          <Link
            to="/buscar"
            className="inline-flex items-center gap-2 rounded-xl bg-slate-950 dark:bg-amber-500 hover:bg-slate-800 dark:hover:bg-amber-400 text-white dark:text-slate-950 px-6 py-3 text-xs font-bold uppercase tracking-wider transition-all active:scale-95 shadow-md"
          >
            <FiArrowLeft size={16} />
            Explorar otros eventos
          </Link>
        </div>
        <Footer />
      </div>
    );
  }
  
  return (
    <div className="w-full min-h-screen flex flex-col bg-[#F8FAFC] dark:bg-[#070D1B] text-slate-900 dark:text-slate-100 selection:bg-amber-400 selection:text-slate-950 font-body overflow-x-hidden max-w-full relative transition-colors duration-200">
      <FloatingDotsBackground />
      <Navbar />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8 min-w-0 relative z-10">
        {/* Enlace discreto de retorno */}
        <div>
          <button
            type="button"
            onClick={() => {
              if (window.history.length > 1) {
                navigate(-1);
              } else {
                navigate('/buscar');
              }
            }}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer group"
          >
            <FiArrowLeft className="transition-transform group-hover:-translate-x-1" size={16} />
            <span>Volver a eventos</span>
          </button>
        </div>

        {/* Encabezado Principal del Evento */}
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            {/* Badges de Categoría y Cartelera Oficial */}
            <div className="flex flex-wrap items-center gap-2.5">
              {event.category && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-black uppercase tracking-wider bg-slate-900 dark:bg-amber-500 text-amber-400 dark:text-slate-950 border border-slate-800 dark:border-amber-400 shadow-xs">
                  <span>{event.category}</span>
                </span>
              )}

              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-[11px] font-bold text-slate-700 dark:text-slate-300 bg-white dark:bg-[#0B1428] border border-slate-200 dark:border-slate-800 shadow-xs">
                <FiShield className="text-amber-500" size={13} />
                <span>Cartelera Oficial Cartagena</span>
              </span>
            </div>

            {/* Acciones del evento: Compartir y Guardar */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleShare}
                className="inline-flex items-center gap-1.5 border border-slate-200 dark:border-slate-800 rounded-full px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-[#0B1428] hover:bg-slate-50 dark:hover:bg-slate-800 transition-all cursor-pointer shadow-2xs"
                title="Compartir evento"
              >
                <FiShare2 size={13} className="text-amber-500" />
                <span>Compartir</span>
              </button>

              <button
                type="button"
                onClick={handleToggleFavorite}
                className={`inline-flex items-center gap-1.5 border rounded-full px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer shadow-2xs ${
                  isFavorite
                    ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 border-amber-300 dark:border-amber-800 font-bold'
                    : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 bg-white dark:bg-[#0B1428] hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
                title={isFavorite ? 'Quitar de favoritos' : 'Guardar en favoritos'}
              >
                <FiHeart
                  size={13}
                  className={isFavorite ? 'fill-amber-500 text-amber-500' : 'text-slate-400'}
                />
                <span>{isFavorite ? 'Guardado' : 'Guardar'}</span>
              </button>
            </div>
          </div>

          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-slate-950 dark:text-white tracking-tight uppercase leading-tight break-words">
            {event.title}
          </h1>

          {/* Fila de metadatos: fecha y ubicación */}
          <div className="flex flex-wrap items-center gap-y-3 gap-x-6 text-sm text-slate-600 dark:text-slate-400 pt-1">
            {event.date && (
              <div className="flex items-center gap-2 font-semibold shrink-0">
                <FiCalendar className="text-amber-500 shrink-0" size={18} />
                <span className="text-slate-900 dark:text-white">{event.date}</span>
              </div>
            )}

            {event.location && (
              <div className="flex items-start sm:items-center gap-2 font-medium min-w-0 max-w-full">
                <FiMapPin className="text-amber-500 shrink-0 mt-0.5 sm:mt-0" size={18} />
                <span className="text-slate-800 dark:text-slate-200 break-words leading-snug min-w-0 flex-1">{event.location}</span>
              </div>
            )}
          </div>
        </div>

        {/* Rejilla de contenido principal: Columna izquierda (Detalles) + Columna derecha (Aside Ticket Compra) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">

          {/* Contenido izquierdo */}
          <div className="lg:col-span-8 space-y-8">

            {/* Imagen Principal del Evento con encaje impecable */}
            <div className="relative overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B1428] shadow-md group">
              <ImageWithFallback
                src={event.photo}
                alt={event.title}
                className="w-full h-72 sm:h-96 md:h-[430px]"
                imgClassName="w-full h-full object-cover object-center group-hover:scale-102 transition-transform duration-700 ease-out"
                fallbackClassName="w-full h-72 sm:h-96 md:h-[430px]"
                fallbackGradient={getCategoryGradient(event.category)}
                fallbackText={event.title}
                iconSize={42}
              >
                <div className="absolute inset-0 bg-black/40 pointer-events-none" />

                {/* Badge flotante de fecha en la esquina inferior izquierda */}
                {event.date && (
                  <div className="absolute bottom-4 left-4 z-10 flex items-center gap-3 bg-white/95 dark:bg-[#0B1428]/95 backdrop-blur-md p-2.5 sm:p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl">
                    <div className="w-12 h-14 rounded-xl bg-slate-950 dark:bg-amber-500 text-amber-400 dark:text-slate-950 flex flex-col items-center justify-center text-center font-black">
                      <span className="text-[10px] tracking-wider uppercase leading-none">
                        {(event.date.split(' ').find((p) => p.length === 3 && isNaN(p)) || 'FECHA').slice(0, 3)}
                      </span>
                      <span className="text-lg leading-tight mt-0.5 text-white dark:text-slate-950">
                        {event.date.split(' ').find((p) => /^\d{1,2}$/.test(p)) || ''}
                      </span>
                    </div>
                    <div className="pr-3">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                        Fecha Programada
                      </span>
                      <p className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white leading-tight">
                        {event.date}
                      </p>
                    </div>
                  </div>
                )}
              </ImageWithFallback>
            </div>

            {/* Tarjeta: Sobre el Evento */}
            <section className="rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-[#0B1428] p-6 sm:p-8 shadow-sm space-y-4">
              <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
                <h2 className="text-xl sm:text-2xl font-extrabold text-slate-950 dark:text-white tracking-tight uppercase">
                  Sobre el Evento
                </h2>
              </div>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-sm sm:text-base whitespace-pre-line font-normal">
                {event.description || 'Disfruta de esta enriquecedora experiencia cultural en el corazón de Cartagena de Indias. Todos los protocolos y localidades están coordinados por la organización oficial.'}
              </p>
            </section>

            {/* Tarjeta: Organizador Responsable */}
            <section className="rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-[#0B1428] p-6 sm:p-7 shadow-sm space-y-4">
              <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
                <h2 className="text-xl font-extrabold text-slate-950 dark:text-white tracking-tight uppercase">
                  Organizador Responsable
                </h2>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="relative w-14 h-14 shrink-0 rounded-2xl overflow-hidden bg-slate-900 text-amber-400 border border-slate-200 dark:border-slate-800 flex items-center justify-center font-black text-lg shadow-xs">
                    {orgAvatar ? (
                      <img
                        src={orgAvatar}
                        alt={orgName}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.style.display = 'none';
                        }}
                      />
                    ) : (
                      <span>{orgName ? orgName.slice(0, 2).toUpperCase() : 'EH'}</span>
                    )}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-extrabold text-slate-950 dark:text-white text-base truncate">
                        {orgName}
                      </span>
                      <FiCheckCircle className="text-amber-500 shrink-0" size={16} title="Organizador Verificado" />
                    </div>
                    <span className="text-xs font-medium text-slate-500 dark:text-slate-400 block">
                      Organizador Oficial EventHive Cartagena
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleToggleFollow}
                  className={`px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-200 shrink-0 cursor-pointer ${isFollowing
                      ? 'bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700'
                      : 'bg-slate-950 dark:bg-amber-500 hover:bg-amber-500 dark:hover:bg-amber-400 hover:text-slate-950 text-white dark:text-slate-950 font-black shadow-sm active:scale-95'
                    }`}
                >
                  {isFollowing ? 'Siguiendo' : 'Seguir'}
                </button>
              </div>
            </section>

            {/* Tarjeta: Ubicación y Mapa */}
            <section className="rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-[#0B1428] p-6 sm:p-7 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <h2 className="text-xl font-extrabold text-slate-950 dark:text-white tracking-tight uppercase">
                  Ubicación del Evento
                </h2>
                {event.location && (
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400 hidden sm:inline max-w-xs truncate">
                    {event.location}
                  </span>
                )}
              </div>

              {event.location && (
                <div className="flex items-start sm:items-center gap-2.5 text-sm text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-900 p-3 rounded-xl border border-slate-200/80 dark:border-slate-800 min-w-0 max-w-full overflow-hidden">
                  <FiMapPin className="text-amber-500 shrink-0 mt-0.5 sm:mt-0" size={17} />
                  <span className="font-semibold text-slate-900 dark:text-white break-words leading-snug min-w-0 flex-1">{event.location}</span>
                </div>
              )}

              {/* Contenedor del Mapa con OSM estándar */}
              <div className="relative z-0 isolate overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 shadow-inner h-72 sm:h-80 w-full bg-slate-100 dark:bg-slate-900">
                <MapContainer
                  center={mapCenter}
                  zoom={15}
                  scrollWheelZoom={false}
                  className="h-full w-full"
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    maxZoom={19}
                  />
                  <Marker position={mapCenter} icon={amberHivePinIcon()} />
                </MapContainer>
              </div>
            </section>
          </div>

          {/* Columna Derecha: Aside Flotante de Compra en formato BOLETO */}
          <aside className="lg:col-span-4 lg:sticky lg:top-20">
            <div className="relative rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B1428] text-slate-900 dark:text-slate-100 p-6 sm:p-7 shadow-xl space-y-6 overflow-hidden">

              {/* Muescas semicirculares de boleto en los laterales */}
              <div className="absolute -left-3 top-28 w-6 h-6 rounded-full bg-[#F8FAFC] dark:bg-[#070D1B] border-r border-slate-200 dark:border-slate-800 pointer-events-none" />
              <div className="absolute -right-3 top-28 w-6 h-6 rounded-full bg-[#F8FAFC] dark:bg-[#070D1B] border-l border-slate-200 dark:border-slate-800 pointer-events-none" />

              {/* Encabezado del Boleto */}
              <div className="border-b border-slate-100 dark:border-slate-800 pb-5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded">
                    BOLETO OFICIAL
                  </span>
                  <span className="text-[11px] font-mono font-bold text-amber-500 uppercase tracking-widest">
                    Acceso Oficial
                  </span>
                </div>

                <div className="flex items-baseline gap-2 mt-2">
                  <span className="text-3xl sm:text-4xl font-black text-slate-950 dark:text-white tracking-tight">
                    ${displayedPrice.toLocaleString('es-CO')}
                  </span>
                  <span className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase">COP</span>
                </div>

                <p className="mt-1 text-xs font-semibold text-slate-500 dark:text-slate-400">
                  {selectedLocalidad?.nombre
                    ? `${selectedLocalidad.nombre} · Impuestos incluidos`
                    : 'Entrada General · Impuestos incluidos'}
                </p>
              </div>

              {/* Selector de Localidades */}
              {localidades.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider block">
                      Selecciona Localidad
                    </span>
                    <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                      {localidades.length} tipo{localidades.length > 1 ? 's' : ''}
                    </span>
                  </div>

                  <div className="space-y-2">
                    {localidades.map((loc) => {
                      const isSelected = selectedLocalidad?.id === loc.id;
                      return (
                        <label
                          key={loc.id}
                          onClick={() => setSelectedLocalidad(loc)}
                          className={`flex items-center justify-between p-3.5 rounded-2xl border-2 cursor-pointer transition-all duration-200 ${isSelected
                              ? 'border-amber-500 bg-amber-50/60 dark:bg-amber-950/30 shadow-xs'
                              : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/60 dark:bg-slate-900/60'
                            }`}
                        >
                          <div className="flex items-center gap-3">
                            <input
                              type="radio"
                              name="localidad"
                              checked={isSelected}
                              onChange={() => setSelectedLocalidad(loc)}
                              className="w-4 h-4 text-amber-500 focus:ring-amber-400 accent-amber-500 cursor-pointer"
                            />
                            <span className="text-xs sm:text-sm font-extrabold text-slate-950 dark:text-white">
                              {loc.nombre}
                            </span>
                          </div>
                          <span className="text-xs sm:text-sm font-black text-slate-900 dark:text-amber-400">
                            ${Number(loc.precio).toLocaleString('es-CO')}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Selector de Cantidad de Boletas */}
              <div className="space-y-2 p-3.5 bg-slate-50 dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider block">
                      Cantidad de Boletas
                    </span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                      Mínimo 1 · Máximo 5
                    </span>
                  </div>
                  <div className="flex items-center gap-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-1 shadow-2xs">
                    <button
                      type="button"
                      onClick={() => setTicketQuantity((q) => Math.max(1, q - 1))}
                      disabled={ticketQuantity <= 1}
                      className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-amber-100 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 flex items-center justify-center transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                      title="Disminuir boletas"
                    >
                      <FiMinus size={12} />
                    </button>
                    <span className="w-6 text-center font-black text-sm text-slate-950 dark:text-white">
                      {ticketQuantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => setTicketQuantity((q) => Math.min(5, q + 1))}
                      disabled={ticketQuantity >= 5}
                      className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-amber-100 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 flex items-center justify-center transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                      title="Aumentar boletas"
                    >
                      <FiPlus size={12} />
                    </button>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200/80 dark:border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-slate-600 dark:text-slate-400 font-semibold">Subtotal estimado:</span>
                  <span className="font-extrabold text-[#0B1B3D] dark:text-amber-400">
                    ${(displayedPrice * ticketQuantity).toLocaleString('es-CO')} COP
                  </span>
                </div>
              </div>

              {/* Botones de Acción */}
              <div className="space-y-3 pt-2">
                <button
                  type="button"
                  onClick={handlePurchase}
                  className="w-full py-4 px-5 rounded-xl bg-slate-950 dark:bg-amber-500 hover:bg-amber-500 dark:hover:bg-amber-400 hover:text-slate-950 text-white dark:text-slate-950 font-black text-xs sm:text-sm tracking-wider uppercase shadow-md transition-all duration-200 active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Sparkles size={16} className="text-amber-400 dark:text-slate-950 fill-current" />
                  <span>Comprar Entradas</span>
                </button>

                <button
                  type="button"
                  onClick={handleToggleFavorite}
                  className={`w-full py-2.5 px-4 rounded-xl border text-xs sm:text-sm font-bold transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98] ${isFavorite
                      ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-300'
                      : 'border-slate-300 dark:border-slate-700 hover:border-slate-400 text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800'
                    }`}
                >
                  <FiHeart className={isFavorite ? 'fill-amber-600 text-amber-600' : 'text-slate-500'} size={15} />
                  <span>{isFavorite ? 'Guardado en favoritos' : 'Guardar en favoritos'}</span>
                </button>
              </div>

              {/* Garantía y Seguridad */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2.5 text-slate-500 dark:text-slate-400">
                <FiShield className="text-emerald-600 dark:text-emerald-400 shrink-0" size={17} />
                <span className="text-[11px] font-medium text-slate-600 dark:text-slate-400 leading-tight">
                  Transacción protegida y verificada por EventHive Cartagena.
                </span>
              </div>
            </div>
          </aside>
        </div>

        {/* Sección: Eventos Similares */}
        {similarEvents.length > 0 && (
          <section className="pt-10 border-t border-slate-200 dark:border-slate-800 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
              <div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-950 dark:text-white tracking-tight uppercase">
                  Otros Eventos Similares
                </h2>
              </div>
              <Link
                to="/buscar"
                className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 inline-flex items-center gap-1 group transition-colors"
              >
                <span>Ver toda la cartelera</span>
                <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {similarEvents.map((simEvent) => (
                <EventListCard key={simEvent.id} event={simEvent} notchBg="bg-[#F8FAFC] dark:bg-[#070D1B]" />
              ))}
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}
