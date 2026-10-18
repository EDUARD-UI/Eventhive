import { useEffect, useMemo, useRef, useState } from 'react';
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
import Hero from '../components/Hero.jsx';
import FeaturedEventsCarousel from '../components/home/FeaturedEventsCarousel.jsx';
import CrossedRibbonsBanner from '../components/home/CrossedRibbonsBanner.jsx';
import CategoryTickerCarousel from '../components/home/CategoryTickerCarousel.jsx';
import CategoryRibbonBanner from '../components/home/CategoryRibbonBanner.jsx';
import HiveEmptyState from '../components/home/HiveEmptyState.jsx';
import HomeBannersSection from '../components/home/HomeBannersSection.jsx';
import CityRhythmPreFooter from '../components/home/CityRhythmPreFooter.jsx';
import Footer from '../components/usersComponets/Footer.jsx';
import Navbar from '../components/usersComponets/Navbar.jsx';
import CustomSelect from '../components/common/CustomSelect.jsx';
import EventListCard from '../components/common/EventListCard.jsx';
import EventCardSkeleton from '../components/common/EventCardSkeleton.jsx';
import { getCarouselEvents, getFeaturedEvents, getMapEvents, getUpcomingEvents } from '../services/eventService.js';
import { getCategoryNames } from '../services/categoryService.js';
import { useTheme } from '../context/ThemeContext.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';

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
      <div style="position: relative; display: flex; align-items: center; justify-content: center; width: 30px; height: 30px;">
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
  const { t } = useLanguage();
  const [carouselEvents, setCarouselEvents] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [isLoadingEvents, setIsLoadingEvents] = useState(true);
  const [mapEvents, setMapEvents] = useState([]);
  const [categoryList, setCategoryList] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDistance, setSelectedDistance] = useState('all');
  const [userLocation, setUserLocation] = useState(null);
  const [isLocating, setIsLocating] = useState(false);
  const [mapRevealed, setMapRevealed] = useState(false);
  const [footerGroupRevealed, setFooterGroupRevealed] = useState(false);
  const [carouselRevealed, setCarouselRevealed] = useState(false);
  const mapSectionRef = useRef(null);
  const footerGroupRef = useRef(null);
  const carouselSectionRef = useRef(null);

  const distanceOptions = useMemo(
    () => [
      { value: 'all', label: t('home.allDistances') },
      { value: '5', label: t('home.upTo5km') },
      { value: '10', label: t('home.upTo10km') },
      { value: '15', label: t('home.upTo15km') },
    ],
    [t]
  );

  useEffect(() => {
    setIsLoadingEvents(true);

    Promise.allSettled([
      getCarouselEvents(),
      getUpcomingEvents(),
      getMapEvents(),
      getCategoryNames(),
    ]).then(([carouselRes, upcomingRes, mapRes, catNamesRes]) => {
      if (carouselRes.status === 'fulfilled' && Array.isArray(carouselRes.value)) {
        setCarouselEvents(carouselRes.value);
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
        title: t('home.geoNotSupportedTitle'),
        text: t('home.geoNotSupportedText'),
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
          title: t('home.geoActivatedTitle'),
          text: t('home.geoActivatedText'),
          timer: 2000,
          showConfirmButton: false,
          confirmButtonColor: '#0B132B',
        });
      },
      (error) => {
        setIsLocating(false);
        let message = t('home.geoErrorDefault');
        if (error.code === error.PERMISSION_DENIED) {
          message = t('home.geoErrorDenied');
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          message = t('home.geoErrorUnavailable');
        } else if (error.code === error.TIMEOUT) {
          message = t('home.geoErrorTimeout');
        }

        Swal.fire({
          icon: 'warning',
          title: t('home.geoRequiredTitle'),
          text: message,
          confirmButtonColor: '#0B132B',
          confirmButtonText: t('home.understood'),
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
        distanceOptions.find((o) => o.value === distanceValue)?.label.toLowerCase() ||
        'esta distancia';
      const result = await showLocationPromptAlert({
        title: t('home.activateLocationPromptTitle'),
        text: t('home.activateLocationPromptText', { distance: distanceLabel }),
        confirmButtonText: t('home.activateLocationBtn'),
        cancelButtonText: t('home.cancelBtn'),
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
    { value: 'all', label: t('home.allCategories') },
    ...categoryList.map((category) => ({
      value: category.nombre,
      label: category.nombre,
    })),
  ], [categoryList, t]);

  const { isDark } = useTheme();

  // Animaciones de aparición suave y desplazamiento fluido nativo
  useEffect(() => {
    const smoothScrollTo = (selector, offset = 0) => {
      const el = document.querySelector(selector);
      if (!el) return;
      const top = el.getBoundingClientRect().top + window.scrollY + offset;
      window.scrollTo({ top, behavior: 'smooth' });
    };

    const checkReveals = () => {
      const triggerThreshold = window.innerHeight * 0.90;
      const mapTriggerThreshold = window.innerHeight * 0.78;

      if (carouselSectionRef.current) {
        const rect = carouselSectionRef.current.getBoundingClientRect();
        if (rect.top <= triggerThreshold) {
          setCarouselRevealed(true);
        }
      }

      if (mapSectionRef.current) {
        const rect = mapSectionRef.current.getBoundingClientRect();
        if (rect.top <= mapTriggerThreshold) {
          setMapRevealed(true);
        }
      }

      if (footerGroupRef.current) {
        const rect = footerGroupRef.current.getBoundingClientRect();
        if (rect.top <= triggerThreshold) {
          setFooterGroupRevealed(true);
        }
      }
    };

    window.addEventListener('scroll', checkReveals, { passive: true });
    requestAnimationFrame(checkReveals);

    // Desplazamiento cinemático suave (Hero -> Carrusel y Próximos -> Mapa)
    let isTransitioningHero = false;
    let heroTimer = null;
    let isTransitioningMap = false;
    let mapTimer = null;

    const handleWheel = (e) => {
      if (!isTransitioningHero && window.scrollY < 80 && e.deltaY > 15) {
        isTransitioningHero = true;
        setCarouselRevealed(true);
        smoothScrollTo('#carousel-section', -65);
        heroTimer = setTimeout(() => {
          isTransitioningHero = false;
        }, 1350);
        return;
      }

      if (!isTransitioningMap && mapSectionRef.current && e.deltaY > 15) {
        const mapRect = mapSectionRef.current.getBoundingClientRect();
        if (mapRect.top > 80 && mapRect.top < window.innerHeight * 0.72) {
          isTransitioningMap = true;
          setMapRevealed(true);
          smoothScrollTo('#mapa', -35);
          mapTimer = setTimeout(() => {
            isTransitioningMap = false;
          }, 1500);
        }
      }
    };

    let touchStartY = 0;
    const handleTouchStart = (e) => {
      if (e.touches && e.touches.length > 0) {
        touchStartY = e.touches[0].clientY;
      }
    };

    const handleTouchMove = (e) => {
      if (e.touches && e.touches.length > 0) {
        const diffY = touchStartY - e.touches[0].clientY;

        if (!isTransitioningHero && window.scrollY < 80 && diffY > 20) {
          isTransitioningHero = true;
          setCarouselRevealed(true);
          smoothScrollTo('#carousel-section', -65);
          heroTimer = setTimeout(() => {
            isTransitioningHero = false;
          }, 1350);
          return;
        }

        if (!isTransitioningMap && mapSectionRef.current && diffY > 20) {
          const mapRect = mapSectionRef.current.getBoundingClientRect();
          if (mapRect.top > 80 && mapRect.top < window.innerHeight * 0.72) {
            isTransitioningMap = true;
            setMapRevealed(true);
            smoothScrollTo('#mapa', -35);
            mapTimer = setTimeout(() => {
              isTransitioningMap = false;
            }, 1500);
          }
        }
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: true });
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            if (entry.target === carouselSectionRef.current) setCarouselRevealed(true);
            if (entry.target === mapSectionRef.current) setMapRevealed(true);
            if (entry.target === footerGroupRef.current) setFooterGroupRevealed(true);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -50px 0px' }
    );

    if (carouselSectionRef.current) observer.observe(carouselSectionRef.current);
    if (mapSectionRef.current) observer.observe(mapSectionRef.current);
    if (footerGroupRef.current) observer.observe(footerGroupRef.current);

    return () => {
      window.removeEventListener('scroll', checkReveals);
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      if (heroTimer) clearTimeout(heroTimer);
      if (mapTimer) clearTimeout(mapTimer);
      observer.disconnect();
    };
  }, []);

  return (
    <div className="w-full min-h-screen bg-slate-50 dark:bg-[#070D1B] text-slate-900 dark:text-slate-100 selection:bg-amber-400 selection:text-slate-950 font-body overflow-x-clip transition-colors duration-200">

      {/* Navbar Superior Fijo / Sticky */}
      <Navbar />

      {/* Hero Principal con Buscador Integrado */}
      <Hero />

      {/* 2. Carrusel Principal de Eventos Premium con Ancla de Desplazamiento Suave y Animación de Entrada */}
      <section
        id="carousel-section"
        ref={carouselSectionRef}
        className={`w-full px-4 sm:px-6 md:px-8 lg:px-12 pt-6 pb-8 sm:pt-10 sm:pb-12 max-w-[1850px] mx-auto relative z-10 scroll-mt-20 transition-all duration-1000 ease-out transform ${
          carouselRevealed
            ? 'opacity-100 translate-y-0 filter blur-0 scale-100'
            : 'opacity-0 translate-y-12 filter blur-[2px] scale-[0.98]'
        }`}
      >
        {isLoadingEvents ? (
          <div className="w-full rounded-3xl aspect-[16/9] sm:aspect-[21/9] min-h-[200px] sm:min-h-[280px] lg:min-h-[360px] max-h-[480px] bg-slate-200 dark:bg-slate-800/80 border border-slate-300/40 dark:border-slate-700/60 animate-pulse relative overflow-hidden flex flex-col justify-end p-5 sm:p-10 shadow-sm">
            <div className="w-24 sm:w-28 h-5 sm:h-6 bg-slate-300 dark:bg-slate-700 rounded-md mb-3" />
            <div className="w-3/4 sm:w-2/3 h-6 sm:h-9 bg-slate-300 dark:bg-slate-700 rounded-lg mb-2.5" />
            <div className="w-1/2 h-4 bg-slate-300 dark:bg-slate-700/80 rounded mb-4 hidden sm:block" />
            <div className="w-28 sm:w-36 h-8 sm:h-10 bg-slate-300 dark:bg-slate-700 rounded-xl" />
          </div>
        ) : (
          <FeaturedEventsCarousel events={carouselEvents} />
        )}
      </section>

      {/* Cintas Cruzadas entre el Carrusel Principal y los Eventos Próximos */}
      <CrossedRibbonsBanner badgeText={t('home.ribbonText')} />

      {/* 3. Próximos Eventos: Título centrado y Grilla de Boletos */}
      <section id="proximos" className="w-full px-4 sm:px-6 md:px-8 lg:px-12 py-10 sm:py-14 bg-white/60 dark:bg-slate-900/40 transition-colors duration-200">
        <div className="max-w-[1850px] mx-auto">
          <div className="flex flex-col items-center justify-center mb-10 text-center relative">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-950 dark:text-white tracking-tight uppercase">
              {t('home.upcomingEvents')}
            </h2>

            <div className="mt-3">
              <Link
                to="/buscar"
                className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 transition-colors duration-200 group"
              >
                <span>{t('home.viewFullLineup')}</span>
                <FiArrowRight size={14} className="transition-transform duration-200 group-hover:translate-x-1" />
              </Link>
            </div>
          </div>

          {isLoadingEvents ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-start">
              {[1, 2, 3, 4].map((n) => (
                <div key={n}>
                  <EventCardSkeleton
                    aspectVariant="standard"
                  />
                </div>
              ))}
            </div>
          ) : upcomingEvents.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-start">
              {upcomingEvents.slice(0, 4).map((event) => (
                <div key={event.id}>
                  <EventListCard
                    event={event}
                    aspectVariant="standard"
                  />
                </div>
              ))}
            </div>
          ) : (
            <HiveEmptyState
              title={t('home.emptyUpcomingTitle')}
              subtitle={t('home.emptyUpcomingSubtitle')}
              showAction={false}
            />
          )}
        </div>
      </section>

      {/* 4. Mapa de Eventos en Cartagena con Animación de Aparición Suave */}
      <section
        id="mapa"
        ref={mapSectionRef}
        className={`w-full bg-slate-100 dark:bg-[#0B0F19] text-slate-900 dark:text-white px-6 sm:px-12 lg:px-20 py-16 sm:py-20 relative z-0 isolate overflow-hidden border-y border-slate-200 dark:border-white/[0.08] transition-all duration-1000 ease-out transform ${
          mapRevealed
            ? 'opacity-100 translate-y-0 filter blur-0 scale-100'
            : 'opacity-0 translate-y-16 filter blur-[3px] scale-[0.98]'
        }`}
      >

        <div className="max-w-7xl mx-auto relative z-10 isolate">
          <div className={`mb-8 flex flex-col items-center justify-center text-center transition-all duration-700 ease-out transform ${
            mapRevealed ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-950 dark:text-white tracking-tight uppercase mb-6">
              {t('home.eventMap')}
            </h2>

            <div className="flex flex-wrap items-center justify-center gap-3">
              {/* Botón Geolocalización */}
              <button
                type="button"
                onClick={() => requestLocation(selectedDistance !== 'all' ? selectedDistance : null)}
                disabled={isLocating}
                className={`flex items-center gap-2 rounded-xl border px-3.5 py-2.5 text-xs sm:text-sm font-bold transition-all duration-200 active:scale-95 shadow-sm cursor-pointer ${userLocation
                  ? 'border-emerald-500 bg-emerald-600 text-white hover:bg-emerald-700'
                  : 'border-amber-500 bg-amber-500 hover:bg-amber-400 text-slate-950'
                  }`}
                title={userLocation ? t('home.locationActiveTitle') : t('home.activateMyLocation')}
              >
                {isLocating ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                    <span>{t('home.gettingLocation')}</span>
                  </>
                ) : userLocation ? (
                  <>
                    <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                    <span>{t('home.myLocationActive')}</span>
                  </>
                ) : (
                  <>
                    <FiNavigation className="text-slate-950 shrink-0" size={14} />
                    <span>{t('home.activateMyLocation')}</span>
                  </>
                )}
              </button>

              {/* Selector Categoría con CustomSelect sincronizado con el tema */}
              <div className="w-48 sm:w-56">
                <CustomSelect
                  value={selectedCategory}
                  onChange={(event) => setSelectedCategory(event.target.value)}
                  options={categoryOptions}
                  placeholder={t('home.allCategories')}
                  variant={isDark ? 'dark' : 'light'}
                />
              </div>

              {/* Selector Distancia con CustomSelect sincronizado con el tema */}
              <div className="w-44 sm:w-52">
                <CustomSelect
                  value={selectedDistance}
                  onChange={(event) => handleDistanceChange(event.target.value)}
                  options={distanceOptions}
                  placeholder={t('home.distance')}
                  variant={isDark ? 'dark' : 'light'}
                />
              </div>
            </div>
          </div>

          {/* Contenedor del Mapa con elevación y retraso escalonado fluido */}
          <div className={`relative z-0 isolate overflow-hidden rounded-3xl border border-slate-300 dark:border-white/10 shadow-2xl h-[440px] sm:h-[500px] bg-slate-100 transition-all duration-1000 delay-150 ease-out transform ${
            mapRevealed
              ? 'opacity-100 translate-y-0 scale-100'
              : 'opacity-40 translate-y-12 scale-[0.97]'
          }`}>
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
                    <div className="p-2 text-center min-w-[150px]">
                      <span className="font-bold text-xs text-amber-600 block mb-0.5">
                        {t('home.yourCurrentLocation')}
                      </span>
                      <span className="text-[11px] text-slate-600 block">
                        {selectedDistance === 'all'
                          ? t('home.referenceLocation')
                          : t('home.searchingInRadius', { km: selectedDistance })}
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
                      <div className="p-2 min-w-[200px]">
                        <div className="flex items-center justify-between gap-1 mb-1">
                          <span className="text-[10px] font-bold text-amber-700 uppercase block">
                            {event.category}
                          </span>
                          {distanceToUser != null && (
                            <span className="text-[10px] font-bold text-slate-950 bg-amber-400 px-1.5 py-0.5 rounded">
                              {distanceToUser.toFixed(1)} km
                            </span>
                          )}
                        </div>
                        <h4 className="text-xs font-bold text-slate-900 mb-1 leading-snug">
                          {event.title}
                        </h4>
                        <p className="text-[11px] text-slate-600 mb-2 line-clamp-2">
                          {event.description}
                        </p>
                        <Link
                          to={`/eventos/${event.id}`}
                          className="text-[11px] font-bold text-amber-600 hover:text-amber-700 inline-flex items-center gap-1 transition-colors"
                        >
                          <span>{t('home.viewEvent')}</span>
                          <FiArrowRight size={11} />
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
      {/* 5. Carrusel de Categorías con Barra Inclinada y Ticker sin recuadros */}
      <section className="w-full py-8 sm:py-12 bg-transparent transition-colors duration-200">
        <CategoryRibbonBanner />
        <CategoryTickerCarousel />
      </section>

      {/* 6. Banners Asimétricos con Ancla para Desplazamiento Suave */}
      <section id="banners-section" className="relative scroll-mt-20 my-10 sm:my-14">
        <HomeBannersSection />
      </section>

      {/* 7. Bloque Unificado: Pre-Footer y Footer con Animación de Aparición Suave Conjunta */}
      <div
        id="footer-unified-group"
        ref={footerGroupRef}
        className={`w-full transition-all duration-1000 ease-out transform ${
          footerGroupRevealed
            ? 'opacity-100 translate-y-0 filter blur-0 scale-100'
            : 'opacity-0 translate-y-14 filter blur-[2px] scale-[0.98]'
        }`}
      >
        <section id="prefooter-section" className="relative scroll-mt-16">
          <CityRhythmPreFooter />
        </section>

        <footer id="footer-section">
          <Footer />
        </footer>
      </div>
    </div>
  );
}
