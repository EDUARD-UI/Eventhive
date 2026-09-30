import { useEffect, useState, useMemo } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { FiCalendar, FiMapPin, FiArrowLeft, FiHeart, FiShare2, FiShield, FiTag, FiClock, FiCheckCircle } from 'react-icons/fi';
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
import { getCategoryGradient } from '../utils/formatters.js';

/**
 * Pin temático de panal ámbar/dorado para Leaflet
 */
const amberHivePinIcon = () =>
  L.divIcon({
    className: 'custom-hive-map-pin',
    html: `
      <div style="position: relative; width: 36px; height: 44px; display: flex; align-items: center; justify-content: center; filter: drop-shadow(0 6px 14px rgba(245,158,11,0.5)); cursor: pointer;">
        <svg viewBox="0 0 34 42" width="36" height="44" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M17 0C7.61 0 0 7.61 0 17C0 27.5 14.5 40.5 16.1 41.9C16.6 42.3 17.4 42.3 17.9 41.9C19.5 40.5 34 27.5 34 17C34 7.61 26.39 0 17 0Z" fill="url(#honeyPinGrad)" stroke="#FFFFFF" stroke-width="2.2"/>
          <polygon points="17,9 23,12.5 23,19.5 17,23 11,19.5 11,12.5" fill="#0B172C"/>
          <circle cx="17" cy="16" r="3" fill="#FCD34D"/>
          <defs>
            <linearGradient id="honeyPinGrad" x1="0" y1="0" x2="34" y2="42" gradientUnits="userSpaceOnUse">
              <stop stop-color="#FCD34D"/>
              <stop offset="0.5" stop-color="#F59E0B"/>
              <stop offset="1" stop-color="#D97706"/>
            </linearGradient>
          </defs>
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
    <div className="relative w-14 h-16 flex items-center justify-center filter drop-shadow-md shrink-0">
      <div className="absolute inset-0 clip-hexagon-horiz bg-gradient-to-b from-yellow-300 via-amber-400 to-amber-600" />
      <div className="absolute inset-[2.5px] clip-hexagon-horiz bg-[#0B172C] flex flex-col items-center justify-center text-center p-1">
        <span className="text-[10px] font-black uppercase text-amber-300 tracking-wider leading-none">
          {month}
        </span>
        <span className="font-display text-base font-black text-white leading-tight mt-0.5">
          {day || '★'}
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

    // Cargar eventos similares para la colmena
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

  const handlePurchase = async () => {
    const user = session.getUser();
    if (!user) {
      showLoginAlert({
        title: 'Inicia sesión',
        text: 'Debes iniciar sesión para adquirir tus entradas en la Colmena.',
        navigate,
      });
      return;
    }

    const { value: cantidad } = await Swal.fire({
      title: 'Comprar Entradas',
      html: `
        <div style="text-align: left; font-size: 14px; background: #FAF8F5; padding: 16px; border-radius: 16px; border: 1px solid #FDE68A;">
          <p style="margin-bottom: 6px; color: #0B1B3D;"><strong>⬡ Evento:</strong> ${event.title}</p>
          <p style="margin-bottom: 6px; color: #0B1B3D;"><strong>⬡ Localidad:</strong> ${selectedLocalidad?.nombre || 'General'}</p>
          <p style="color: #B45309;"><strong>⬡ Precio unitario:</strong> $${displayedPrice.toLocaleString('es-CO')} COP</p>
        </div>
      `,
      input: 'number',
      inputValue: 1,
      inputAttributes: {
        min: '1',
        max: '10',
        step: '1',
      },
      showCancelButton: true,
      confirmButtonText: 'Confirmar y Proceder',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#F59E0B',
      cancelButtonColor: '#64748B',
      inputValidator: (val) => {
        if (!val || val < 1) return 'Ingresa una cantidad válida.';
        return null;
      },
    });

    if (cantidad) {
      try {
        const payload = {
          eventoId: Number(event.id),
          localidadId: selectedLocalidad?.id && typeof selectedLocalidad.id === 'number' ? selectedLocalidad.id : undefined,
          cantidad: Number(cantidad),
        };
        await httpClient.post('/compras', payload);
        Swal.fire({
          icon: 'success',
          title: '¡Compra confirmada!',
          html: `Has adquirido <strong>${cantidad}</strong> entrada(s) para <strong>${event.title}</strong>.<br/><br/><span style="color:#D97706; font-size:13px;">Revisa tu panel de usuario para ver tus tickets y código QR de acceso.</span>`,
          confirmButtonColor: '#0B1B3D',
        });
      } catch (err) {
        Swal.fire({
          icon: 'error',
          title: 'No se pudo procesar la compra',
          text: err.message || 'Ocurrió un error al procesar la transacción.',
          confirmButtonColor: '#0B1B3D',
        });
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-[#FAF8F5]">
        <Navbar />
        <div className="flex-1 flex items-center justify-center py-24">
          <div className="flex flex-col items-center gap-4">
            <div className="relative w-16 h-16 flex items-center justify-center">
              <div className="absolute inset-0 clip-hexagon-horiz bg-gradient-to-r from-amber-400 to-amber-500 animate-spin" />
              <div className="absolute inset-[3px] clip-hexagon-horiz bg-[#FAF8F5] flex items-center justify-center">
                <span className="text-amber-500 text-lg">⬡</span>
              </div>
            </div>
            <p className="text-sm font-black text-[#0B1B3D] tracking-wide">Cargando experiencia en la Colmena...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen flex flex-col bg-[#FAF8F5]">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center px-4 py-20 text-center">
          <div className="w-16 h-16 rounded-3xl bg-amber-100 flex items-center justify-center text-amber-600 text-2xl mb-4 shadow-inner">
            ⬡
          </div>
          <h2 className="text-xl font-extrabold text-[#0B1B3D] mb-2">Evento no encontrado</h2>
          <p className="text-sm font-medium text-slate-600 max-w-md mb-6 leading-relaxed">
            {error || 'El evento que buscas no está disponible o ha sido retirado de la cartelera cultural.'}
          </p>
          <Link
            to="/buscar"
            className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 px-6 py-3 text-xs font-black uppercase tracking-wider hover:from-amber-500 hover:to-amber-600 shadow-md shadow-amber-500/20 transition active:scale-95"
          >
            <FiArrowLeft size={16} />
            Explorar otras experiencias
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5] text-slate-900 selection:bg-amber-400 selection:text-slate-950">
      <Navbar />

      {/* Franja de navegación superior / Breadcrumbs */}
      <div className="border-b border-amber-200/60 bg-[#F5EFE6]/60 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => {
              if (window.history.length > 1) {
                navigate(-1);
              } else {
                navigate('/buscar');
              }
            }}
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-extrabold text-slate-700 hover:text-amber-700 transition-colors group cursor-pointer"
          >
            <div className="w-8 h-8 rounded-full bg-white border border-amber-200/90 flex items-center justify-center shadow-xs group-hover:scale-105 group-hover:border-amber-400 transition-all">
              <FiArrowLeft className="transition-transform group-hover:-translate-x-0.5 text-slate-800" size={15} />
            </div>
            <span className="hidden sm:inline">Volver al catálogo</span>
            <span className="sm:hidden">Volver</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-amber-200/80 text-xs font-bold text-slate-700 hover:text-amber-800 hover:border-amber-400 shadow-xs transition-all cursor-pointer"
              title="Compartir evento"
            >
              <FiShare2 size={13} className="text-amber-600" />
              <span className="hidden sm:inline">Compartir</span>
            </button>

            <button
              type="button"
              onClick={handleToggleFavorite}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border text-xs font-bold shadow-xs transition-all cursor-pointer ${
                isFavorite
                  ? 'bg-amber-500 text-slate-950 border-amber-600 shadow-amber-500/20 font-black'
                  : 'bg-white text-slate-700 border-amber-200/80 hover:border-amber-400 hover:text-amber-800'
              }`}
            >
              <FiHeart size={13} className={isFavorite ? 'fill-slate-950' : 'text-amber-600'} />
              <span>{isFavorite ? 'Guardado' : 'Guardar'}</span>
            </button>
          </div>
        </div>
      </div>

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-10">
        
        {/* Encabezado Principal del Evento */}
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2.5">
            {event.category && (
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-amber-100 text-amber-950 border border-amber-300 shadow-xs">
                <span>⬡</span>
                <span>{event.category}</span>
              </span>
            )}

            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold text-slate-700 bg-white border border-amber-200/80 shadow-xs">
              <FiShield className="text-amber-600" size={13} />
              <span>Cartelera Oficial Cartagena</span>
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-[#0B1B3D] tracking-tight leading-tight">
            {event.title}
          </h1>

          {/* Fila de metadatos: fecha y ubicación */}
          <div className="flex flex-wrap items-center gap-y-3 gap-x-6 text-sm text-slate-700 pt-1">
            {event.date && (
              <div className="flex items-center gap-2 font-semibold">
                <FiCalendar className="text-amber-600 shrink-0" size={18} />
                <span className="text-slate-900">{event.date}</span>
              </div>
            )}

            {event.location && (
              <div className="flex items-center gap-2 font-medium">
                <FiMapPin className="text-amber-600 shrink-0" size={18} />
                <span className="text-slate-800 truncate max-w-md">{event.location}</span>
              </div>
            )}
          </div>
        </div>

        {/* Rejilla de contenido principal: Columna izquierda (Detalles) + Columna derecha (Aside Compra) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
          
          {/* Contenido izquierdo */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* Imagen Principal del Evento con marcos Colmena */}
            <div className="relative overflow-hidden rounded-3xl border-2 border-amber-200/90 bg-white shadow-xl group">
              <ImageWithFallback
                src={event.photo}
                alt={event.title}
                className="w-full h-72 sm:h-96 md:h-[430px]"
                imgClassName="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-700 ease-out"
                fallbackClassName="w-full h-72 sm:h-96 md:h-[430px]"
                fallbackGradient={getCategoryGradient(event.category)}
                fallbackText={event.title}
                iconSize={42}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent pointer-events-none" />

                {/* Badge hexagonal flotante de fecha en la esquina inferior izquierda */}
                {event.date && (
                  <div className="absolute bottom-4 left-4 z-10 flex items-center gap-3 bg-white/95 backdrop-blur-md p-2 sm:p-2.5 rounded-2xl border border-amber-300 shadow-xl">
                    <HoneycombDateBadge dateStr={event.date} />
                    <div className="pr-3">
                      <span className="text-[10px] font-black uppercase tracking-wider text-amber-700 block">
                        Fecha Confirmada
                      </span>
                      <p className="text-xs sm:text-sm font-extrabold text-[#0B1B3D] leading-tight">
                        {event.date}
                      </p>
                    </div>
                  </div>
                )}
              </ImageWithFallback>
            </div>

            {/* Tarjeta: Sobre el Evento */}
            <section className="rounded-3xl border border-amber-200/80 bg-white p-6 sm:p-8 shadow-[0_8px_25px_-5px_rgba(0,0,0,0.05)] space-y-4">
              <div className="flex items-center gap-2.5 text-[#0B1B3D] border-b border-amber-100 pb-3">
                <span className="text-amber-500 font-black text-xl">⬡</span>
                <h2 className="text-xl sm:text-2xl font-black tracking-tight">Sobre la Experiencia</h2>
              </div>
              <p className="text-slate-700 leading-relaxed text-sm sm:text-base whitespace-pre-line font-medium">
                {event.description || 'Disfruta de esta enriquecedora experiencia cultural en el corazón de Cartagena de Indias. Todos los protocolos y localidades están coordinados por la organización oficial.'}
              </p>
            </section>

            {/* Tarjeta: Organizador con Avatar Hexagonal y Badge de Verificación */}
            <section className="rounded-3xl border border-amber-200/80 bg-white p-6 sm:p-7 shadow-[0_8px_25px_-5px_rgba(0,0,0,0.05)] space-y-4">
              <div className="flex items-center gap-2 text-[#0B1B3D] border-b border-amber-100 pb-3">
                <span className="text-amber-500 font-black text-xl">⬡</span>
                <h2 className="text-xl font-black tracking-tight">Organizador Responsable</h2>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-[#FAF8F5] border border-amber-200/70">
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="relative w-14 h-14 shrink-0 flex items-center justify-center filter drop-shadow-sm">
                    <div className="absolute inset-0 clip-hexagon-horiz bg-gradient-to-tr from-amber-400 to-amber-500" />
                    <div className="absolute inset-[2px] clip-hexagon-horiz bg-white overflow-hidden flex items-center justify-center">
                      <ImageWithFallback
                        src={orgAvatar}
                        alt={orgName}
                        showText={false}
                        className="w-full h-full object-cover"
                        imgClassName="w-full h-full object-cover"
                        fallbackClassName="w-full h-full"
                        iconSize={20}
                      />
                    </div>
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-extrabold text-[#0B1B3D] text-base truncate">
                        {orgName}
                      </span>
                      <FiCheckCircle className="text-amber-500 shrink-0" size={16} title="Organizador Verificado" />
                    </div>
                    <span className="text-xs font-semibold text-slate-500 block">
                      Miembro activo de la Colmena EventHive
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleToggleFollow}
                  className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-200 shrink-0 cursor-pointer ${
                    isFollowing
                      ? 'bg-slate-200 hover:bg-slate-300 text-slate-800 border border-slate-300'
                      : 'bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 shadow-md shadow-amber-500/20 active:scale-95'
                  }`}
                >
                  {isFollowing ? '✓ Siguiendo' : '+ Seguir Organizador'}
                </button>
              </div>
            </section>

            {/* Tarjeta: Ubicación y Mapa con Leaflet aislado */}
            <section className="rounded-3xl border border-amber-200/80 bg-white p-6 sm:p-7 shadow-[0_8px_25px_-5px_rgba(0,0,0,0.05)] space-y-4">
              <div className="flex items-center justify-between border-b border-amber-100 pb-3">
                <div className="flex items-center gap-2 text-[#0B1B3D]">
                  <span className="text-amber-500 font-black text-xl">⬡</span>
                  <h2 className="text-xl font-black tracking-tight">Ubicación de la Experiencia</h2>
                </div>
                {event.location && (
                  <span className="text-xs font-bold text-slate-600 hidden sm:inline">
                    {event.location}
                  </span>
                )}
              </div>

              {event.location && (
                <div className="flex items-center gap-2 text-sm text-slate-700 bg-amber-50/60 p-3 rounded-xl border border-amber-200/80">
                  <FiMapPin className="text-amber-600 shrink-0" size={17} />
                  <span className="font-semibold text-[#0B1B3D]">{event.location}</span>
                </div>
              )}

              {/* Contenedor del Mapa con contención estricta para evitar leaks de z-index y desbordes */}
              <div className="relative z-0 isolate overflow-hidden rounded-2xl border-2 border-amber-200/90 shadow-inner h-72 sm:h-80 w-full">
                <MapContainer
                  center={mapCenter}
                  zoom={15}
                  scrollWheelZoom={false}
                  className="h-full w-full"
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <Marker position={mapCenter} icon={amberHivePinIcon()} />
                </MapContainer>
              </div>
            </section>
          </div>

          {/* Columna Derecha: Aside Flotante de Compra de Entradas */}
          <aside className="lg:col-span-4 lg:sticky lg:top-20">
            <div className="rounded-3xl border-2 border-amber-200/90 bg-white p-6 sm:p-7 shadow-2xl shadow-amber-500/10 space-y-6 relative overflow-hidden">
              
              {/* Resplandor decorativo de colmena en esquina */}
              <div className="absolute -top-12 -right-12 w-28 h-28 bg-amber-200/30 rounded-full blur-2xl pointer-events-none" />

              {/* Bloque de Precio */}
              <div className="border-b border-amber-100 pb-5">
                <span className="text-[10px] font-black uppercase tracking-widest text-amber-950 bg-amber-100/90 border border-amber-300 px-2.5 py-1 rounded-md inline-block mb-2">
                  ⬡ Boletos Oficiales
                </span>
                
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl sm:text-4xl font-black text-[#0B1B3D] tracking-tight">
                    ${displayedPrice.toLocaleString('es-CO')}
                  </span>
                  <span className="text-xs font-black text-amber-700 uppercase">COP</span>
                </div>

                <p className="mt-1 text-xs font-semibold text-slate-500">
                  {selectedLocalidad?.nombre
                    ? `${selectedLocalidad.nombre} · Impuestos incluidos`
                    : 'Entrada General · Impuestos incluidos'}
                </p>
              </div>

              {/* Selector de Localidades */}
              {localidades.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-[#0B1B3D] uppercase tracking-wider block">
                      Selecciona tu Localidad
                    </span>
                    <span className="text-[11px] font-bold text-amber-700">
                      {localidades.length} disponible{localidades.length > 1 ? 's' : ''}
                    </span>
                  </div>

                  <div className="space-y-2">
                    {localidades.map((loc) => {
                      const isSelected = selectedLocalidad?.id === loc.id;
                      return (
                        <label
                          key={loc.id}
                          onClick={() => setSelectedLocalidad(loc)}
                          className={`flex items-center justify-between p-3.5 rounded-2xl border-2 cursor-pointer transition-all duration-200 ${
                            isSelected
                              ? 'border-amber-400 bg-amber-50/70 shadow-sm ring-2 ring-amber-400/20'
                              : 'border-slate-200 hover:border-amber-300 bg-white'
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
                            <span className="text-xs sm:text-sm font-extrabold text-[#0B1B3D]">
                              {loc.nombre}
                            </span>
                          </div>
                          <span className="text-xs sm:text-sm font-black text-slate-900">
                            ${Number(loc.precio).toLocaleString('es-CO')}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Botones de Acción */}
              <div className="space-y-3 pt-2">
                <button
                  type="button"
                  onClick={handlePurchase}
                  className="w-full py-4 px-5 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-500 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-black text-xs sm:text-sm tracking-wider uppercase shadow-lg shadow-amber-500/25 hover:shadow-xl hover:shadow-amber-500/35 transition-all duration-300 active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Sparkles size={16} className="text-slate-950 fill-slate-950" />
                  <span>Comprar Entradas Ahora</span>
                </button>

                <button
                  type="button"
                  onClick={handleToggleFavorite}
                  className={`w-full py-3 px-4 rounded-xl border-2 text-xs sm:text-sm font-extrabold transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98] ${
                    isFavorite
                      ? 'border-amber-400 bg-amber-100/70 text-amber-950 shadow-xs'
                      : 'border-amber-200/90 hover:border-amber-400 text-slate-700 bg-amber-50/40 hover:bg-amber-50'
                  }`}
                >
                  <FiHeart className={isFavorite ? 'fill-amber-600 text-amber-600 scale-110' : 'text-amber-600'} size={16} />
                  <span>{isFavorite ? 'Evento guardado en deseos' : 'Guardar en mi lista de deseos'}</span>
                </button>
              </div>

              {/* Garantía y Confianza Colmena */}
              <div className="pt-3 border-t border-amber-100 flex items-center gap-2.5 text-slate-500">
                <FiShield className="text-amber-600 shrink-0" size={17} />
                <span className="text-[11px] font-semibold text-slate-600 leading-tight">
                  Transacción protegida y verificada por el sistema central de EventHive Cartagena.
                </span>
              </div>
            </div>
          </aside>
        </div>

        {/* Sección: Eventos Similares en la Colmena */}
        {similarEvents.length > 0 && (
          <section className="pt-10 border-t border-amber-200/80 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-amber-900 bg-amber-100 border border-amber-300 px-2.5 py-0.5 rounded-md">
                  ⬡ MÁS EN LA COLMENA
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-[#0B1B3D] tracking-tight mt-2">
                  Otras Experiencias Cercanas
                </h2>
              </div>
              <Link
                to="/buscar"
                className="text-xs font-black uppercase tracking-wider text-amber-700 hover:text-amber-800 inline-flex items-center gap-1 group"
              >
                <span>Ver todas las experiencias</span>
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {similarEvents.map((simEvent) => (
                <HiveEventCard key={simEvent.id} event={simEvent} />
              ))}
            </div>
          </section>
        )}

        {/* Banner Inferior: Llamado a Organizadores (Estilo Colmena) */}
        <div className="rounded-3xl bg-[#0B1B3D] p-8 sm:p-10 text-white flex flex-col lg:flex-row items-center justify-between gap-6 shadow-2xl relative overflow-hidden border border-amber-500/20">
          <div className="absolute top-0 right-0 w-80 h-80 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 max-w-2xl space-y-2">
            <span className="text-amber-400 font-black text-xs uppercase tracking-widest flex items-center gap-1.5">
              <span>⬡</span>
              <span>¿ORGANIZAS EVENTOS EN CARTAGENA?</span>
            </span>
            <h3 className="text-xl sm:text-2xl font-black text-white">
              Conecta tu cartelera con miles de asistentes y turistas
            </h3>
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
              Publica en minutos, administra localidades y entradas, genera códigos QR de acceso seguro y obtén métricas detalladas en tiempo real.
            </p>
          </div>

          <div className="relative z-10 shrink-0">
            <Link
              to="/registro"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-amber-500/25 transition-all active:scale-95"
            >
              Únete a la Colmena →
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
