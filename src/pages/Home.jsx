import { useEffect, useMemo, useState } from 'react';
import L from 'leaflet';
import { Link, useNavigate } from 'react-router-dom';
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet';
import Swal from 'sweetalert2';
import mascotaImg from '../assets/mascota.jpg';
import { showLocationPromptAlert } from '../utils/alertUtils.js';
import {
  FiArrowRight,
  FiMapPin,
  FiCheckCircle,
  FiAward,
  FiPlusCircle,
  FiSliders,
  FiNavigation,
} from 'react-icons/fi';
import Navbar from '../components/usersComponets/Navbar.jsx';
import Hero from '../components/Hero.jsx';
import FeaturedEventCard from '../components/FeaturedEventCard.jsx';
import EventCard from '../components/EventCard.jsx';
import Footer from '../components/usersComponets/Footer.jsx';
import ImageWithFallback from '../components/common/ImageWithFallback.jsx';
import { getFeaturedEvents, getMapEvents, getUpcomingEvents } from '../services/eventService.js';
import { organizationService } from '../services/organizerService.js';
import { getFeaturedCategories, getCategoryNames } from '../services/categoryService.js';

const CARTAGENA_CENTER = { lat: 10.3951, lng: -75.4834 };
const DISTANCE_OPTIONS = [
  { value: 'all', label: 'Todas las distancias' },
  { value: '5', label: 'Hasta 5 km' },
  { value: '10', label: 'Hasta 10 km' },
  { value: '15', label: 'Hasta 15 km' },
];

const CATEGORY_COLORS = [
  'bg-gradient-to-br from-blue-600 to-indigo-700',
  'bg-gradient-to-br from-indigo-600 to-purple-700',
  'bg-gradient-to-br from-sky-600 to-blue-800',
  'bg-gradient-to-br from-amber-500 to-orange-600',
  'bg-gradient-to-br from-emerald-600 to-teal-700',
  'bg-gradient-to-br from-rose-600 to-pink-700',
];

const toRad = (value) => (value * Math.PI) / 180;

const getDistanceKm = (lat1, lng1, lat2, lng2) => {
  const earthRadiusKm = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return earthRadiusKm * c;
};

const locationPinIcon = () =>
  L.divIcon({
    className: 'custom-map-pin-wrapper',
    html: `
      <div class="custom-map-pin">
        <span class="custom-map-pin__dot"></span>
      </div>
    `,
    iconSize: [18, 22],
    iconAnchor: [9, 22],
    popupAnchor: [0, -18],
  });

const userLocationPinIcon = () =>
  L.divIcon({
    className: 'custom-user-pin-wrapper',
    html: `
      <div style="position: relative; display: flex; align-items: center; justify-content: center; width: 28px; height: 28px;">
        <span style="position: absolute; width: 28px; height: 28px; border-radius: 9999px; background: rgba(0, 123, 255, 0.35); animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></span>
        <span style="position: relative; width: 14px; height: 14px; border-radius: 9999px; background: #007BFF; border: 2.5px solid #ffffff; box-shadow: 0 2px 6px rgba(0,0,0,0.35);"></span>
      </div>
    `,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -14],
  });

function MapViewController({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center && center[0] && center[1]) {
      map.flyTo(center, zoom || 13, { duration: 1.2 });
    }
  }, [center, zoom, map]);
  return null;
}

export default function Home() {
  const navigate = useNavigate();
  const [featuredEvents, setFeaturedEvents] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [mapEvents, setMapEvents] = useState([]);
  const [featuredOrganizations, setFeaturedOrganizations] = useState([]);
  const [featuredCategories, setFeaturedCategories] = useState([]);
  const [categoryList, setCategoryList] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDistance, setSelectedDistance] = useState('all');
  const [userLocation, setUserLocation] = useState(null);
  const [isLocating, setIsLocating] = useState(false);

  useEffect(() => {
    getFeaturedEvents()
      .then((data) => setFeaturedEvents(data || []))
      .catch(() => setFeaturedEvents([]));

    getUpcomingEvents()
      .then((data) => setUpcomingEvents(data || []))
      .catch(() => setUpcomingEvents([]));

    getMapEvents()
      .then((data) => setMapEvents(data || []))
      .catch(() => setMapEvents([]));

    organizationService.listTopOrganizations({ page: 0, size: 4 })
      .then(({ organizations }) => {
        if (organizations?.length > 0) setFeaturedOrganizations(organizations.slice(0, 4));
      })
      .catch(() => {});

    getFeaturedCategories()
      .then((data) => setFeaturedCategories(data || []))
      .catch(() => setFeaturedCategories([]));

    // Conectar el endpoint /api/categorias/nombres para el menú desplegable
    getCategoryNames()
      .then((data) => setCategoryList(data || []))
      .catch(() => setCategoryList([]));
  }, []);

  const requestLocation = (targetDistance = null) => {
    if (!navigator.geolocation) {
      Swal.fire({
        imageUrl: mascotaImg,
        imageWidth: 120,
        imageHeight: 140,
        imageAlt: 'Mascota EventHive',
        title: 'Geolocalización no soportada',
        text: 'Tu navegador no admite geolocalización para calcular distancias.',
        confirmButtonColor: '#007BFF',
      });
      setSelectedDistance('all');
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setUserLocation(coords);
        setIsLocating(false);

        if (targetDistance && targetDistance !== 'all') {
          setSelectedDistance(targetDistance);
        }

        Swal.fire({
          icon: 'success',
          title: '¡Ubicación activada!',
          text: 'El mapa ahora buscará los eventos según tu ubicación actual.',
          timer: 2000,
          showConfirmButton: false,
        });
      },
      (error) => {
        setIsLocating(false);
        let message = 'No fue posible obtener tu ubicación.';
        if (error.code === error.PERMISSION_DENIED) {
          message = 'Permiso denegado. Para buscar eventos por distancia cercana, permite el acceso a tu ubicación en tu navegador.';
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          message = 'La señal de tu ubicación no está disponible en este momento.';
        } else if (error.code === error.TIMEOUT) {
          message = 'Se agotó el tiempo esperando tu ubicación.';
        }

        Swal.fire({
          imageUrl: mascotaImg,
          imageWidth: 120,
          imageHeight: 140,
          imageAlt: 'Mascota EventHive',
          title: 'Ubicación requerida',
          text: message,
          confirmButtonColor: '#007BFF',
          confirmButtonText: 'Entendido',
        });
        setSelectedDistance('all');
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    );
  };

  const handleDistanceChange = async (distanceValue) => {
    if (distanceValue === 'all') {
      setSelectedDistance('all');
      return;
    }

    if (!userLocation) {
      const distanceLabel = DISTANCE_OPTIONS.find((o) => o.value === distanceValue)?.label.toLowerCase() || 'esta distancia';
      const result = await showLocationPromptAlert({
        title: 'Activa tu ubicación',
        text: `Para buscar eventos a ${distanceLabel}, necesitamos conocer tu ubicación actual. ¿Deseas activarla ahora?`,
        confirmButtonText: 'Activar ubicación',
        cancelButtonText: 'Cancelar',
      });

      if (result.isConfirmed) {
        requestLocation(distanceValue);
      }
    } else {
      setSelectedDistance(distanceValue);
    }
  };

  const filteredMapEvents = useMemo(() => {
    return mapEvents.filter((event) => {
      const matchesCategory =
        selectedCategory === 'all' ||
        event.category?.toLowerCase() === selectedCategory.toLowerCase() ||
        String(event.categoriaId) === String(selectedCategory);

      if (!matchesCategory) return false;

      if (selectedDistance === 'all') return true;

      // Si se filtra por distancia, requerimos ubicación del usuario y coordenadas del evento
      if (!userLocation || event.lat == null || event.lng == null) {
        return false;
      }

      const distance = getDistanceKm(
        userLocation.lat,
        userLocation.lng,
        Number(event.lat),
        Number(event.lng)
      );

      return distance <= Number(selectedDistance);
    });
  }, [mapEvents, selectedCategory, selectedDistance, userLocation]);

  const handleCategoryRedirect = (cat) => {
    navigate(`/buscar?categoriaId=${encodeURIComponent(cat.id)}&categoria=${encodeURIComponent(cat.nombre)}`);
  };

  return (
    <div className="w-full min-h-screen bg-white text-slate-900">
      <Navbar />
      <Hero />

      {/* 1. EVENTOS DESTACADOS */}
      <section className="w-full px-6 sm:px-12 lg:px-20 pt-32 sm:pt-36 pb-14 sm:pb-20 bg-white max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10.5px] font-extrabold uppercase tracking-widest bg-brand/10 text-brand">
                AGENDA DESTACADA
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#0a1838] tracking-tight">
              Eventos destacados
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1.5 max-w-xl leading-relaxed">
              Las experiencias, festivales y conciertos más esperados de la temporada en Cartagena.
            </p>
          </div>
          <Link
            to="/buscar"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-brand hover:text-brand-dark transition-colors group shrink-0"
          >
            <span>Ver toda la agenda</span>
            <FiArrowRight size={14} className="transition-transform duration-200 group-hover:translate-x-1" />
          </Link>
        </div>

        {featuredEvents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-7">
            {featuredEvents.slice(0, 2).map((event) => (
              <FeaturedEventCard key={event.id} event={event} />
            ))}
          </div>
        ) : (
          <div className="border border-dashed border-slate-300 rounded-2xl p-12 text-center text-slate-400 text-sm">
            No hay eventos destacados disponibles en este momento
          </div>
        )}
      </section>

      {/* 2. PRÓXIMOS EVENTOS */}
      <section id="proximos" className="w-full bg-[#f8fafc] border-y border-slate-200/70 px-6 sm:px-12 lg:px-20 py-14 sm:py-20">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10.5px] font-extrabold uppercase tracking-widest bg-amber-400/20 text-amber-900 border border-amber-300/40">
                  CARTELERA SEMANAL
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#0a1838] tracking-tight">
                Próximos Eventos
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1.5 max-w-xl leading-relaxed">
                Descubre planes de música, arte, gastronomía y cultura que suceden esta semana.
              </p>
            </div>
            <Link
              to="/buscar"
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-brand hover:text-brand-dark transition-colors group shrink-0"
            >
              <span>Ver todos los eventos</span>
              <FiArrowRight size={14} className="transition-transform duration-200 group-hover:translate-x-1" />
            </Link>
          </div>

          {upcomingEvents.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {upcomingEvents.slice(0, 4).map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          ) : (
            <div className="border border-dashed border-slate-300 rounded-2xl p-12 text-center text-slate-400 text-sm">
              No hay eventos disponibles actualmente
            </div>
          )}
        </div>
      </section>

      {/* 3. MAPA DE EVENTOS */}
      <section className="w-full px-6 sm:px-12 lg:px-20 py-14 sm:py-20 max-w-7xl mx-auto">
        <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10.5px] font-extrabold uppercase tracking-widest bg-blue-500/10 text-brand">
                GEOLOCALIZACIÓN
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#0a1838] tracking-tight">
              Mapa de Eventos
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1.5 max-w-xl leading-relaxed">
              {userLocation
                ? 'Mostrando eventos calculados a partir de tu ubicación actual en tiempo real.'
                : 'Explora y ubica visualmente las experiencias más cercanas a ti en Cartagena.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Botón interactivo de Geolocalización */}
            <button
              type="button"
              onClick={() => requestLocation(selectedDistance !== 'all' ? selectedDistance : null)}
              disabled={isLocating}
              className={`flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs sm:text-sm font-semibold transition-all shadow-sm ${
                userLocation
                  ? 'border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                  : 'border-blue-200 bg-blue-50 text-brand hover:bg-blue-100'
              }`}
              title={userLocation ? 'Tu ubicación está activa. Haz clic para actualizarla' : 'Activar mi ubicación para calcular distancias'}
            >
              {isLocating ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-brand border-t-transparent rounded-full animate-spin" />
                  <span>Obteniendo ubicación...</span>
                </>
              ) : userLocation ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Mi ubicación activa</span>
                </>
              ) : (
                <>
                  <FiNavigation className="text-brand shrink-0" size={14} />
                  <span>Activar mi ubicación</span>
                </>
              )}
            </button>

            <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs sm:text-sm shadow-sm">
              <span className="text-slate-500 font-medium">Categoría:</span>
              <select
                value={selectedCategory}
                onChange={(event) => setSelectedCategory(event.target.value)}
                className="bg-transparent text-[#0a1838] font-semibold outline-none cursor-pointer"
                aria-label="Filtrar eventos por categoría"
              >
                <option value="all">Todas las categorías</option>
                {categoryList.map((category) => (
                  <option key={category.id || category.nombre} value={category.nombre}>
                    {category.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs sm:text-sm shadow-sm">
              <span className="text-slate-500 font-medium">Distancia:</span>
              <select
                value={selectedDistance}
                onChange={(event) => handleDistanceChange(event.target.value)}
                className="bg-transparent text-[#0a1838] font-semibold outline-none cursor-pointer"
                aria-label="Filtrar eventos por distancia"
              >
                {DISTANCE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Mensaje informativo cuando el filtro de distancia no encuentra resultados */}
        {selectedDistance !== 'all' && filteredMapEvents.length === 0 && (
          <div className="mb-4 p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs sm:text-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
            <div className="flex items-center gap-2">
              <FiMapPin className="text-amber-600 shrink-0" size={16} />
              <span>
                No se encontraron eventos dentro de <strong>{DISTANCE_OPTIONS.find((o) => o.value === selectedDistance)?.label.toLowerCase()}</strong> de tu ubicación.
              </span>
            </div>
            <button
              type="button"
              onClick={() => setSelectedDistance('all')}
              className="text-xs font-bold text-brand hover:underline shrink-0"
            >
              Ver todas las distancias →
            </button>
          </div>
        )}

        <div className="overflow-hidden rounded-2xl border border-slate-200 shadow-md h-[420px] sm:h-[480px]">
          <MapContainer
            center={userLocation ? [userLocation.lat, userLocation.lng] : [10.4150, -75.5400]}
            zoom={13}
            minZoom={9}
            maxZoom={17}
            scrollWheelZoom={false}
            dragging={true}
            doubleClickZoom={false}
            boxZoom={false}
            keyboard={false}
            zoomControl={true}
            className="h-full w-full"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            <MapViewController
              center={userLocation ? [userLocation.lat, userLocation.lng] : [10.4150, -75.5400]}
              zoom={13}
            />

            {/* Marcador de la ubicación del usuario */}
            {userLocation && (
              <Marker
                position={[userLocation.lat, userLocation.lng]}
                icon={userLocationPinIcon()}
              >
                <Popup>
                  <div className="p-1 text-center min-w-[150px]">
                    <span className="font-bold text-xs text-brand block mb-0.5">
                      📍 Tu ubicación actual
                    </span>
                    <span className="text-[11px] text-slate-500 block">
                      {selectedDistance === 'all'
                        ? 'Ubicación de referencia'
                        : `Buscando eventos en un radio de ${selectedDistance} km`}
                    </span>
                  </div>
                </Popup>
              </Marker>
            )}

            {filteredMapEvents.map((event) => {
              const distanceToUser =
                userLocation && event.lat != null && event.lng != null
                  ? getDistanceKm(userLocation.lat, userLocation.lng, Number(event.lat), Number(event.lng))
                  : null;

              return (
                <Marker
                  key={event.id}
                  position={[event.lat, event.lng]}
                  icon={locationPinIcon()}
                >
                  <Popup>
                    <div className="p-1 min-w-[190px]">
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className="text-[10px] font-bold text-brand uppercase block">
                          {event.category}
                        </span>
                        {distanceToUser != null && (
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                            {distanceToUser.toFixed(1)} km
                          </span>
                        )}
                      </div>
                      <h4 className="text-xs font-bold text-slate-900 mb-1">
                        {event.title}
                      </h4>
                      <p className="text-[11px] text-slate-600 mb-2">
                        {event.description}
                      </p>
                      <Link
                        to={`/eventos/${event.id}`}
                        className="text-[11px] font-bold text-brand hover:underline inline-block"
                      >
                        Ver detalle →
                      </Link>
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </MapContainer>
        </div>
      </section>

      {/* 4. CATEGORÍAS DESTACADAS */}
      <section className="w-full bg-[#0a1838] text-white py-16 sm:py-20 px-6 sm:px-12 lg:px-20 border-t-2 border-b-2 border-[#ffc107]/40 relative overflow-hidden">
        {/* Subtle background mesh glows */}
        <div aria-hidden className="absolute -top-32 -left-32 w-96 h-96 bg-brand/15 rounded-full blur-3xl pointer-events-none" />
        <div aria-hidden className="absolute -bottom-32 -right-32 w-96 h-96 bg-[#ffc107]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
            <div>
              <span className="text-[#ffc107] font-bold text-xs sm:text-sm tracking-widest uppercase block mb-2">
                EXPLORA POR INTERÉS
              </span>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold uppercase tracking-tight">
                CATEGORÍAS DESTACADAS
              </h2>
              <p className="text-slate-300 text-xs sm:text-sm mt-1.5 max-w-xl leading-relaxed">
                Descubre eventos organizados por temática y encuentra exactamente lo que te apasiona.
              </p>
            </div>
            <Link
              to="/categorias"
              className="inline-flex items-center gap-1.5 text-[#ffc107] hover:text-amber-300 text-xs sm:text-sm font-bold tracking-wide transition-colors group shrink-0"
            >
              <span>Ver todas las categorías</span>
              <FiArrowRight size={14} className="transition-transform duration-200 group-hover:translate-x-1" />
            </Link>
          </div>

          {/* Grid of the colorful category cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredCategories.map((cat, index) => {
              const bgClass = cat.bgColor || CATEGORY_COLORS[index % CATEGORY_COLORS.length];
              const imageUrl = cat.urlFoto || cat.foto || cat.imagen;
              const hasImage = Boolean(imageUrl);

              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => handleCategoryRedirect(cat)}
                  className={`group relative rounded-2xl p-6 sm:p-7 text-white card-interactive flex flex-col justify-between min-h-[185px] text-left cursor-pointer active:scale-[0.98] overflow-hidden ${
                    hasImage ? 'bg-slate-900 border border-slate-700/80 shadow-md' : `${bgClass} border border-white/15 shadow-md`
                  }`}
                >
                  {/* Si tiene imagen, se muestra con overlay para lectura clara */}
                  {hasImage ? (
                    <>
                      <div
                        className="absolute inset-0 bg-cover bg-center opacity-40 group-hover:scale-105 group-hover:opacity-55 transition-all duration-500 ease-out"
                        style={{ backgroundImage: `url(${imageUrl})` }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/50 to-slate-950/20 pointer-events-none" />
                    </>
                  ) : (
                    <>
                      {/* Efectos de luz para estética viva cuando no hay imagen */}
                      <div className="absolute -right-8 -bottom-8 w-36 h-36 bg-white/10 rounded-full blur-2xl pointer-events-none group-hover:scale-125 transition-transform duration-500" />
                      <div className="absolute -left-6 -top-6 w-28 h-28 bg-black/25 rounded-full blur-xl pointer-events-none" />
                    </>
                  )}

                  <div className="relative z-10 flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md border border-white/20 flex items-center justify-center text-white text-lg shadow-inner group-hover:rotate-6 transition-transform duration-300">
                      <FiAward size={20} />
                    </div>

                    {cat.totalEventos > 0 && (
                      <span className="bg-white/20 backdrop-blur-md text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-white/25">
                        {cat.totalEventos} {cat.totalEventos === 1 ? 'evento' : 'eventos'}
                      </span>
                    )}
                  </div>

                  <div className="relative z-10 flex items-end justify-between mt-6">
                    <div>
                      <h3 className="text-lg sm:text-xl font-black uppercase tracking-wide leading-snug drop-shadow-sm group-hover:text-[#ffc107] transition-colors duration-200">
                        {cat.nombre}
                      </h3>
                      <p className="text-white/85 text-xs mt-0.5 font-medium">
                        {cat.totalEventos} {cat.totalEventos === 1 ? 'evento publicado' : 'eventos publicados'}
                      </p>
                    </div>

                    <div className="w-9 h-9 rounded-full bg-white/20 backdrop-blur-sm border border-white/25 flex items-center justify-center group-hover:translate-x-1 group-hover:bg-[#ffc107] group-hover:text-[#0a1838] transition-all duration-200 shadow-xs">
                      <FiArrowRight size={16} />
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* 5. DIRECTORIO DE ORGANIZACIONES */}
      <section id="organizaciones" className="w-full bg-slate-50 py-16 sm:py-24 px-6 sm:px-12 lg:px-20 border-b border-slate-200">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
            <div>
              <span className="text-brand font-bold text-xs sm:text-sm tracking-widest uppercase block mb-2">
                COMUNIDAD & PRODUCTORES
              </span>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#0a1838] tracking-tight">
                Organizaciones Destacadas
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-2 max-w-xl leading-relaxed">
                Las mentes y colectivos detrás de los festivales, conciertos y experiencias culturales más vibrantes de Cartagena.
              </p>
            </div>

            <Link
              to="/organizacion"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0a1838] hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider transition-all duration-200 shadow-xs hover:shadow active:scale-95 shrink-0 self-start md:self-end"
            >
              <FiPlusCircle size={15} className="text-[#ffc107]" />
              Publicar mi evento
            </Link>
          </div>

          {/* Cards of Organizers */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredOrganizations.slice(0, 4).map((org) => (
              <div
                key={org.id}
                onClick={() => navigate(`/organizaciones/${org.id}`)}
                className="bg-white rounded-2xl border border-slate-200/90 p-6 card-interactive flex flex-col justify-between group cursor-pointer relative overflow-hidden shadow-xs"
              >
                <div className="absolute top-0 right-0 bg-[#ffc107] text-[#0a1838] text-[9px] font-black uppercase px-2.5 py-0.5 rounded-bl-lg shadow-xs">
                  ★ Top
                </div>

                <div>
                  <div className="flex items-start justify-between mb-4">
                    <div className="relative">
                      <ImageWithFallback
                        src={org.avatar}
                        alt={org.name}
                        showText={false}
                        className="w-14 h-14 rounded-2xl border-2 border-slate-100 shadow-xs"
                        imgClassName="w-14 h-14 rounded-2xl object-cover"
                        fallbackClassName="w-14 h-14 rounded-2xl"
                        iconSize={20}
                      />
                      {org.verified && (
                        <span
                          title="Organización Verificada"
                          className="absolute -bottom-1 -right-1 bg-brand text-white p-1 rounded-full shadow-xs z-10"
                        >
                          <FiCheckCircle size={11} />
                        </span>
                      )}
                    </div>

                    <span className="text-[11px] font-bold text-amber-950 bg-amber-100 px-2 py-0.5 rounded-full flex items-center gap-1 mr-8">
                      ★ {org.rating ? Number(org.rating).toFixed(1) : 'Top'}
                    </span>
                  </div>

                  <span className="text-[10px] font-bold uppercase tracking-wider text-brand block mb-1">
                    {org.category}
                  </span>
                  <h3 className="font-display text-base font-extrabold text-slate-900 group-hover:text-brand transition-colors duration-200 mb-2">
                    {org.name}
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed line-clamp-3 mb-4">
                    {org.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-600">
                    <strong className="text-slate-900 font-bold">{org.eventsCount || 0}</strong> eventos
                  </span>

                  <span className="text-xs font-bold text-brand hover:text-brand-dark flex items-center gap-1 group-hover:translate-x-0.5 transition-transform duration-200">
                    Ver perfil →
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Banner for Cartagena Organizers Call to Action */}
          <div className="mt-12 rounded-3xl bg-gradient-to-r from-[#0a1838] via-[#0d2352] to-[#007bff] p-8 sm:p-12 text-white flex flex-col lg:flex-row items-center justify-between gap-6 shadow-xl relative overflow-hidden">
            <div className="relative z-10 max-w-2xl">
              <span className="text-[#ffc107] font-bold text-xs uppercase tracking-widest block mb-2">
                ¿ORGANIZAS EVENTOS EN CARTAGENA?
              </span>
              <h3 className="text-xl sm:text-2xl font-extrabold mb-2">
                Conecta tu cartelera con miles de asistentes y turistas
              </h3>
              <p className="text-slate-200 text-xs sm:text-sm leading-relaxed">
                Publica en minutos, administra localidades y entradas, genera códigos QR de acceso seguro y obtén métricas detalladas en tiempo real.
              </p>
            </div>

            <div className="relative z-10 shrink-0">
              <Link
                to="/registro"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-[#ffc107] hover:bg-[#e0a800] text-[#0a1838] font-bold text-xs uppercase tracking-wider shadow-md transition-all active:scale-95 duration-200"
              >
                Únete como Organización
                <FiArrowRight size={14} />
              </Link>
            </div>

            {/* Decorative background circle */}
            <div className="absolute -bottom-16 -right-16 w-64 h-64 bg-white/5 rounded-full blur-2xl pointer-events-none" />
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}