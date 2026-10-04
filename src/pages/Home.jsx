import { useEffect, useMemo, useState } from 'react';
import L from 'leaflet';
import { Link } from 'react-router-dom';
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet';
import Swal from 'sweetalert2';
import { showLocationPromptAlert } from '../utils/alertUtils.js';
import {
  FiArrowRight,
  FiMapPin,
  FiNavigation,
} from 'react-icons/fi';
import Navbar from '../components/usersComponets/Navbar.jsx';
import Hero from '../components/Hero.jsx';
import FeaturedEventsCarousel from '../components/home/FeaturedEventsCarousel.jsx';
import HiveEventCard from '../components/home/HiveEventCard.jsx';
import CategoryTickerCarousel from '../components/home/CategoryTickerCarousel.jsx';
import HiveEmptyState from '../components/home/HiveEmptyState.jsx';
import HomeBannersSection from '../components/home/HomeBannersSection.jsx';
import Footer from '../components/usersComponets/Footer.jsx';
import CustomSelect from '../components/common/CustomSelect.jsx';
import EventListCard from '../components/common/EventListCard.jsx';
import EventCardSkeleton from '../components/common/EventCardSkeleton.jsx';
import { getFeaturedEvents, getMapEvents, getUpcomingEvents } from '../services/eventService.js';
import { getCategoryNames } from '../services/categoryService.js';

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
      <div class="custom-map-pin" style="background: #F59E0B; border-color: #0B132B;">
        <span class="custom-map-pin__dot" style="background: #0B132B;"></span>
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
        <span style="position: relative; width: 15px; height: 15px; border-radius: 9999px; background: #F59E0B; border: 2.5px solid #0B132B; box-shadow: 0 2px 8px rgba(0,0,0,0.6);"></span>
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
  const [featuredEvents, setFeaturedEvents] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [isLoadingEvents, setIsLoadingEvents] = useState(true);
  const [mapEvents, setMapEvents] = useState([]);
  const [categoryList, setCategoryList] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDistance, setSelectedDistance] = useState('all');
  const [userLocation, setUserLocation] = useState(null);
  const [isLocating, setIsLocating] = useState(false);

  useEffect(() => {
    setIsLoadingEvents(true);

    Promise.allSettled([
      getFeaturedEvents(),
      getUpcomingEvents(),
      getMapEvents(),
      getCategoryNames(),
    ]).then(([featuredRes, upcomingRes, mapRes, catNamesRes]) => {
      if (featuredRes.status === 'fulfilled' && Array.isArray(featuredRes.value)) {
        setFeaturedEvents(featuredRes.value);
      }
      if (upcomingRes.status === 'fulfilled' && Array.isArray(upcomingRes.value)) {
        setUpcomingEvents(upcomingRes.value);
      }
      if (mapRes.status === 'fulfilled' && Array.isArray(mapRes.value)) {
        setMapEvents(mapRes.value);
      }
      if (catNamesRes.status === 'fulfilled' && Array.isArray(catNamesRes.value)) {
        setCategoryList(catNamesRes.value);
      }
      setIsLoadingEvents(false);
    });
  }, []);

  const requestLocation = (targetDistance = null) => {
    if (!navigator.geolocation) {
      Swal.fire({
        icon: 'warning',
        title: 'Geolocalización no soportada',
        text: 'Tu navegador no admite geolocalización para calcular distancias.',
        confirmButtonColor: '#0B132B',
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
          confirmButtonColor: '#0B132B',
        });
      },
      (error) => {
        setIsLocating(false);
        let message = 'No fue posible obtener tu ubicación.';
        if (error.code === error.PERMISSION_DENIED) {
          message = 'Permiso denegado. Para buscar eventos cercanos, autoriza el acceso a tu ubicación en tu navegador.';
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          message = 'La señal de tu ubicación no está disponible en este momento.';
        } else if (error.code === error.TIMEOUT) {
          message = 'Se agotó el tiempo esperando tu ubicación.';
        }

        Swal.fire({
          icon: 'warning',
          title: 'Ubicación requerida',
          text: message,
          confirmButtonColor: '#0B132B',
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

  const categoryOptions = useMemo(() => [
    { value: 'all', label: 'Todas las categorías' },
    ...categoryList.map((category) => ({
      value: category.nombre,
      label: category.nombre,
    })),
  ], [categoryList]);

  return (
    <div className="w-full min-h-screen bg-[#F8FAFC] text-slate-900 selection:bg-amber-400 selection:text-slate-950 font-body">
      {/* Barra de Navegación idéntica y sobria */}
      <Navbar />

      {/* Hero Principal con Buscador Integrado */}
      <Hero />

      {/* 2. Eventos Destacados: Título centrado sin descripción ni badges */}
      <section className="w-full px-4 sm:px-6 md:px-8 lg:px-12 py-10 sm:py-14 max-w-[1850px] mx-auto relative z-10">
        <div className="flex flex-col items-center justify-center mb-8 text-center">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-950 tracking-tight uppercase">
            Eventos Destacados
          </h2>
        </div>

        {(() => {
          const carouselEvents = featuredEvents.length > 0 ? featuredEvents : upcomingEvents;
          if (carouselEvents.length > 0) {
            return <FeaturedEventsCarousel events={carouselEvents} />;
          }
          if (isLoadingEvents) {
            return (
              <div className="w-full rounded-3xl aspect-[16/9] sm:aspect-[21/9] min-h-[340px] max-h-[480px] bg-slate-200 animate-pulse relative overflow-hidden flex flex-col justify-end p-6 sm:p-12 shadow-sm">
                <div className="w-28 h-6 bg-slate-300 rounded-md mb-4" />
                <div className="w-2/3 h-8 sm:h-10 bg-slate-300 rounded-lg mb-3" />
                <div className="w-1/2 h-4 bg-slate-300 rounded mb-6 hidden sm:block" />
                <div className="w-36 h-10 bg-slate-300 rounded-xl" />
              </div>
            );
          }
          return (
            <HiveEmptyState
              title="Estamos preparando la cartelera para este fin de semana en Cartagena."
              subtitle="¡Vuelve pronto para conocer los eventos más esperados!"
              showAction={false}
            />
          );
        })()}
      </section>

      {/* 3. Próximos Eventos: Título centrado y Grilla de Boletos Verticales */}
      <section id="proximos" className="w-full px-4 sm:px-6 md:px-8 lg:px-12 py-14 sm:py-18 bg-white border-y border-slate-200">
        <div className="max-w-[1850px] mx-auto">
          <div className="flex flex-col items-center justify-center mb-10 text-center relative">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-950 tracking-tight uppercase">
              Próximos Eventos
            </h2>

            <div className="mt-3">
              <Link
                to="/buscar"
                className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-600 hover:text-amber-600 transition-colors duration-200 group"
              >
                <span>Ver cartelera completa</span>
                <FiArrowRight size={14} className="transition-transform duration-200 group-hover:translate-x-1" />
              </Link>
            </div>
          </div>

          {isLoadingEvents ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((n) => (
                <EventCardSkeleton key={n} notchBg="bg-white" />
              ))}
            </div>
          ) : upcomingEvents.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {upcomingEvents.slice(0, 4).map((event) => (
                <EventListCard key={event.id} event={event} notchBg="bg-white" />
              ))}
            </div>
          ) : (
            <HiveEmptyState
              title="Pronto verás más eventos programados para los próximos días."
              subtitle="Las organizaciones están afinando fechas y detalles."
              showAction={false}
            />
          )}
        </div>
      </section>

      {/* 5. Mapa de Eventos en Cartagena */}
      <section id="mapa" className="w-full bg-[#0A1325] border-y border-slate-800 px-6 sm:px-12 lg:px-20 py-16 sm:py-20 relative z-0 isolate overflow-hidden">
        <div className="max-w-7xl mx-auto relative z-0 isolate">
          <div className="mb-8 flex flex-col items-center justify-center text-center">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight uppercase mb-6">
              Mapa de Eventos
            </h2>

            <div className="flex flex-wrap items-center justify-center gap-3">
              {/* Botón Geolocalización */}
              <button
                type="button"
                onClick={() => requestLocation(selectedDistance !== 'all' ? selectedDistance : null)}
                disabled={isLocating}
                className={`flex items-center gap-2 rounded-xl border px-3.5 py-2.5 text-xs sm:text-sm font-bold transition-all duration-200 active:scale-95 shadow-sm cursor-pointer ${
                  userLocation
                    ? 'border-emerald-500 bg-emerald-600 text-white hover:bg-emerald-700'
                    : 'border-amber-500 bg-amber-500 hover:bg-amber-400 text-slate-950'
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

              {/* Selector Categoría con CustomSelect */}
              <div className="w-48 sm:w-56">
                <CustomSelect
                  value={selectedCategory}
                  onChange={(event) => setSelectedCategory(event.target.value)}
                  options={categoryOptions}
                  placeholder="Todas las categorías"
                  variant="dark"
                />
              </div>

              {/* Selector Distancia con CustomSelect */}
              <div className="w-44 sm:w-52">
                <CustomSelect
                  value={selectedDistance}
                  onChange={(event) => handleDistanceChange(event.target.value)}
                  options={DISTANCE_OPTIONS}
                  placeholder="Distancia"
                  variant="dark"
                />
              </div>
            </div>
          </div>

          {/* Contenedor del Mapa */}
          <div className="relative z-0 isolate overflow-hidden rounded-3xl border border-slate-800 shadow-2xl h-[440px] sm:h-[500px] bg-slate-900">
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

      {/* 5. Carrusel de Categorías: Después del Mapa */}
      <section className="w-full py-12 sm:py-16 bg-[#F8FAFC] border-b border-slate-200">
        <div className="text-center mb-6">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-950 tracking-tight uppercase">
            Categorías
          </h2>
        </div>
        <CategoryTickerCarousel />
      </section>

      {/* 6. Bloque Asimétrico de Banners (/api/banners-home) */}
      <HomeBannersSection />

      {/* Pie de Página idéntico */}
      <Footer />
    </div>
  );
}