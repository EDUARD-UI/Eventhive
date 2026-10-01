import { useEffect, useMemo, useState } from 'react';
import L from 'leaflet';
import { Link, useNavigate } from 'react-router-dom';
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet';
import Swal from 'sweetalert2';
import { showLocationPromptAlert } from '../utils/alertUtils.js';
import {
  FiArrowRight,
  FiMapPin,
  FiPlusCircle,
  FiNavigation,
  FiCompass,
} from 'react-icons/fi';
import Navbar from '../components/usersComponets/Navbar.jsx';
import Hero from '../components/Hero.jsx';
import SearchCard from '../components/SearchCard.jsx';
import FeaturedEventsCarousel from '../components/home/FeaturedEventsCarousel.jsx';
import HiveEventCard from '../components/home/HiveEventCard.jsx';
import HexCategoryFilter from '../components/home/HexCategoryFilter.jsx';
import HiveOrganizerCard from '../components/home/HiveOrganizerCard.jsx';
import HiveEmptyState from '../components/home/HiveEmptyState.jsx';
import Footer from '../components/usersComponets/Footer.jsx';
import { getFeaturedEvents, getMapEvents, getUpcomingEvents } from '../services/eventService.js';
import { organizationService } from '../services/organizerService.js';
import { getFeaturedCategories, getCategoryNames } from '../services/categoryService.js';

const DISTANCE_OPTIONS = [
  { value: 'all', label: 'Todas las distancias' },
  { value: '5', label: 'Hasta 5 km' },
  { value: '10', label: 'Hasta 10 km' },
  { value: '15', label: 'Hasta 15 km' },
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
      <div class="custom-map-pin" style="background: #F59E0B; border-color: #ffffff;">
        <span class="custom-map-pin__dot" style="background: #0B172C;"></span>
      </div>
    `,
    iconSize: [20, 24],
    iconAnchor: [10, 24],
    popupAnchor: [0, -20],
  });

const userLocationPinIcon = () =>
  L.divIcon({
    className: 'custom-user-pin-wrapper',
    html: `
      <div style="position: relative; display: flex; items-center justify-content: center; width: 30px; height: 30px;">
        <span style="position: absolute; width: 30px; height: 30px; border-radius: 9999px; background: rgba(245, 158, 11, 0.4); animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></span>
        <span style="position: relative; width: 15px; height: 15px; border-radius: 9999px; background: #F59E0B; border: 2.5px solid #ffffff; box-shadow: 0 2px 8px rgba(0,0,0,0.4);"></span>
      </div>
    `,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
    popupAnchor: [0, -15],
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

    organizationService
      .listTopOrganizations({ page: 0, size: 4 })
      .then(({ organizations }) => {
        if (organizations?.length > 0) setFeaturedOrganizations(organizations.slice(0, 4));
      })
      .catch(() => {});

    getFeaturedCategories()
      .then((data) => setFeaturedCategories(data || []))
      .catch(() => setFeaturedCategories([]));

    getCategoryNames()
      .then((data) => setCategoryList(data || []))
      .catch(() => setCategoryList([]));
  }, []);

  const requestLocation = (targetDistance = null) => {
    if (!navigator.geolocation) {
      Swal.fire({
        icon: 'warning',
        title: 'Geolocalización no soportada',
        text: 'Tu navegador no admite geolocalización para calcular distancias.',
        confirmButtonColor: '#0D1527',
        customClass: {
          popup: 'rounded-3xl shadow-2xl border border-slate-100',
        },
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
          text: 'El mapa ahora buscará los eventos según tu ubicación actual en Cartagena.',
          timer: 2000,
          showConfirmButton: false,
          customClass: {
            popup: 'rounded-3xl shadow-2xl border border-slate-100',
          },
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
          icon: 'warning',
          title: 'Ubicación requerida',
          text: message,
          confirmButtonColor: '#0D1527',
          confirmButtonText: 'Entendido',
          customClass: {
            popup: 'rounded-3xl shadow-2xl border border-slate-100',
          },
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
      const distanceLabel =
        DISTANCE_OPTIONS.find((o) => o.value === distanceValue)?.label.toLowerCase() ||
        'esta distancia';
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

  return (
    <div className="w-full min-h-screen bg-[#FAF8F5] text-slate-900 selection:bg-amber-400 selection:text-slate-950 font-body">
      {/* Barra de Navegación */}
      <Navbar />

      {/* Hero Principal Nocturno de la Colmena */}
      <Hero />

      {/* ========================================================
          1. BARRA FLOTANTE DE TRANSICIÓN: BUSCADOR DE EXPERIENCIAS
          (Ubicado fuera del Hero, cápsula blanca limpia flotante con sombra 2xl)
          ======================================================== */}
      <div className="relative z-20 max-w-5xl mx-auto -mt-14 sm:-mt-16 px-4 sm:px-6">
        <SearchCard />
      </div>

      {/* ========================================================
          2. AGENDA DESTACADA DE LA COLMENA (CARRUSEL PANORÁMICO)
          ======================================================== */}
      <section className="w-full px-3 sm:px-6 md:px-8 lg:px-10 xl:px-12 pt-8 sm:pt-12 pb-12 sm:pb-16 max-w-[1850px] mx-auto relative z-10">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 sm:mb-8 gap-4 px-1 sm:px-2">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-widest bg-amber-100 text-amber-950 border border-amber-300 shadow-xs">
                <span>⬡</span> AGENDA DE LA COLMENA
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#0B172C] tracking-tight">
              Eventos Destacados
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1.5 max-w-xl leading-relaxed font-medium">
              Desliza para explorar las experiencias, festivales y conciertos más esperados en Cartagena.
            </p>
          </div>

          <Link
            to="/buscar"
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-black uppercase tracking-wider text-amber-800 hover:text-amber-950 transition-colors group shrink-0"
          >
            <span>Ver cartelera completa</span>
            <FiArrowRight size={15} className="transition-transform duration-200 group-hover:translate-x-1" />
          </Link>
        </div>

        {featuredEvents.length > 0 ? (
          <FeaturedEventsCarousel events={featuredEvents} />
        ) : (
          <HiveEmptyState
            title="Las abejas están preparando la agenda para este fin de semana en Cartagena."
            subtitle="¡Vuelve pronto o sé el primero en publicar tu experiencia!"
            showAction={true}
            actionType="publish"
          />
        )}
      </section>

      {/* ========================================================
          3. CARTELERA SEMANAL (PRÓXIMOS EVENTOS)
          ======================================================== */}
      <section id="proximos" className="w-full px-3 sm:px-6 md:px-8 lg:px-10 xl:px-12 py-12 sm:py-16 max-w-[1850px] mx-auto border-t border-amber-200/50">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 sm:mb-10 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#0B172C] tracking-tight">
              Próximos Eventos
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1.5 max-w-xl leading-relaxed font-medium">
              Descubre música, arte, gastronomía y cultura que suceden esta semana en Cartagena.
            </p>
          </div>

          <Link
            to="/buscar"
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-black uppercase tracking-wider text-amber-800 hover:text-amber-950 transition-colors group shrink-0"
          >
            <span>Ver todos los eventos</span>
            <FiArrowRight size={15} className="transition-transform duration-200 group-hover:translate-x-1" />
          </Link>
        </div>

        {upcomingEvents.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {upcomingEvents.slice(0, 4).map((event) => (
              <HiveEventCard key={event.id} event={event} />
            ))}
          </div>
        ) : (
          <HiveEmptyState
            title="Las abejas están preparando la agenda para este fin de semana en Cartagena."
            subtitle="Pronto verás más eventos programados para los próximos días."
            showAction={true}
            actionType="explore"
          />
        )}
      </section>

      {/* ========================================================
          4. MAPA DE EVENTOS EN CARTAGENA
          (Con aislamiento estricto de contexto z-0, isolate y overflow-hidden para neutralizar Leaflet)
          ======================================================== */}
      <section id="mapa" className="w-full bg-[#F3ECE1] border-y border-amber-200/60 px-6 sm:px-12 lg:px-20 py-16 sm:py-20 relative z-0 isolate overflow-hidden">
        <div className="max-w-7xl mx-auto relative z-0 isolate">
          <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#0B172C] tracking-tight">
                Mapa de la Colmena
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 mt-1.5 max-w-xl leading-relaxed font-medium">
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
                className={`flex items-center gap-2 rounded-xl border px-3.5 py-2.5 text-xs sm:text-sm font-black transition-all shadow-md active:scale-95 ${
                  userLocation
                    ? 'border-emerald-500 bg-emerald-600 text-white hover:bg-emerald-700'
                    : 'border-amber-400 bg-amber-400 hover:bg-amber-300 text-slate-950'
                }`}
                title={userLocation ? 'Tu ubicación está activa' : 'Activar mi ubicación'}
              >
                {isLocating ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                    <span>Obteniendo ubicación...</span>
                  </>
                ) : userLocation ? (
                  <>
                    <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                    <span>Mi ubicación activa</span>
                  </>
                ) : (
                  <>
                    <FiNavigation className="text-slate-950 shrink-0" size={14} />
                    <span>Activar mi ubicación</span>
                  </>
                )}
              </button>

              <div className="flex items-center gap-2 rounded-xl border border-amber-200/90 bg-white px-3.5 py-2 text-xs sm:text-sm shadow-sm">
                <span className="text-slate-600 font-bold">Categoría:</span>
                <select
                  value={selectedCategory}
                  onChange={(event) => setSelectedCategory(event.target.value)}
                  className="bg-transparent text-[#0B172C] font-black outline-none cursor-pointer"
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

              <div className="flex items-center gap-2 rounded-xl border border-amber-200/90 bg-white px-3.5 py-2 text-xs sm:text-sm shadow-sm">
                <span className="text-slate-600 font-bold">Distancia:</span>
                <select
                  value={selectedDistance}
                  onChange={(event) => handleDistanceChange(event.target.value)}
                  className="bg-transparent text-[#0B172C] font-black outline-none cursor-pointer"
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
            <div className="mb-5 p-4 rounded-2xl bg-amber-100 border border-amber-300 text-amber-950 text-xs sm:text-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm font-medium">
              <div className="flex items-center gap-2.5">
                <FiMapPin className="text-amber-700 shrink-0" size={17} />
                <span>
                  No se encontraron eventos dentro de{' '}
                  <strong>
                    {DISTANCE_OPTIONS.find((o) => o.value === selectedDistance)?.label.toLowerCase()}
                  </strong>{' '}
                  de tu ubicación.
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedDistance('all')}
                className="text-xs font-black uppercase tracking-wider text-amber-800 hover:text-amber-950 hover:underline shrink-0"
              >
                Ver todas las distancias →
              </button>
            </div>
          )}

          {/* Contenedor estricto con overflow-hidden, rounded-3xl, relative, z-0 e isolate */}
          <div className="relative z-0 isolate overflow-hidden rounded-3xl border border-amber-200/90 shadow-xl h-[440px] sm:h-[500px] bg-white">
            <MapContainer
              center={userLocation ? [userLocation.lat, userLocation.lng] : [10.415, -75.54]}
              zoom={13}
              minZoom={9}
              maxZoom={17}
              scrollWheelZoom={false}
              dragging={true}
              doubleClickZoom={false}
              boxZoom={false}
              keyboard={false}
              zoomControl={true}
              className="h-full w-full relative z-0 overflow-hidden rounded-3xl"
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              <MapViewController
                center={userLocation ? [userLocation.lat, userLocation.lng] : [10.415, -75.54]}
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
                      <span className="font-bold text-xs text-amber-600 block mb-0.5">
                        📍 Tu ubicación actual
                      </span>
                      <span className="text-[11px] text-slate-600 block">
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
                          <span className="text-[10px] font-bold text-amber-700 uppercase block">
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
                          className="text-[11px] font-bold text-amber-600 hover:underline inline-block"
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
        </div>
      </section>

      {/* ========================================================
          5. CATEGORÍAS DESTACADAS EN MOSAICO HEXAGONAL CON LLENADO DE MIEL
          ======================================================== */}
      <section className="w-full py-16 sm:py-24 px-6 sm:px-12 lg:px-20 relative overflow-hidden">
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
            <div>
              
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black uppercase tracking-tight text-[#0B172C]">
                Categorías de la Colmena
              </h2>
              <p className="text-slate-600 text-xs sm:text-sm mt-1.5 max-w-xl leading-relaxed font-medium">
                Selecciona una celda para descubrir los eventos de tu temática favorita.
                Experimenta la microanimación de miel dorada al hacer clic.
              </p>
            </div>

            <Link
              to="/categorias"
              className="inline-flex items-center gap-2 text-amber-800 hover:text-amber-950 text-xs sm:text-sm font-black uppercase tracking-wider transition-colors group shrink-0"
            >
              <span>Ver todas las categorías</span>
              <FiArrowRight size={15} className="transition-transform duration-200 group-hover:translate-x-1" />
            </Link>
          </div>

          {/* Mosaico de Hexágonos Regulares Grandes con imágenes y animación de miel */}
          <HexCategoryFilter categories={featuredCategories} />
        </div>
      </section>

      {/* ========================================================
          6. DIRECTORIO DE ORGANIZACION
          ======================================================== */}
      <section id="organizaciones" className="w-full bg-[#F3ECE1] py-16 sm:py-24 px-6 sm:px-12 lg:px-20 border-t border-amber-200/60">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
            <div>
              <span className="text-amber-800 font-black text-xs sm:text-sm tracking-widest uppercase block mb-2">
                COMUNIDAD & PRODUCTORES
              </span>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#0B172C] tracking-tight">
                Organizaciones Destacadas
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 mt-2 max-w-xl leading-relaxed font-medium">
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

      {/* Pie de Página */}
      <Footer />
    </div>
  );
}