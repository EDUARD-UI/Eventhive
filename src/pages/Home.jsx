import { useEffect, useMemo, useState } from 'react';
import L from 'leaflet';
import { Link, useNavigate } from 'react-router-dom';
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';
import {
  FiArrowRight,
  FiMapPin,
  FiCheckCircle,
  FiAward,
  FiPlusCircle,
  FiSliders,
} from 'react-icons/fi';
import Navbar from '../components/usersComponets/Navbar.jsx';
import Hero from '../components/Hero.jsx';
import FeaturedEventCard from '../components/FeaturedEventCard.jsx';
import EventCard from '../components/EventCard.jsx';
import Footer from '../components/usersComponets/Footer.jsx';
import { getFeaturedEvents, getMapEvents, getUpcomingEvents } from '../services/eventService.js';
import { MOCK_EVENTS } from '../constants/mockEvents.js';
import { CORE_CATEGORIES } from './CategoriasPage.jsx';

const CARTAGENA_CENTER = { lat: 10.3951, lng: -75.4834 };
const DISTANCE_OPTIONS = [
  { value: 'all', label: 'Todas las distancias' },
  { value: '5', label: 'Hasta 5 km' },
  { value: '10', label: 'Hasta 10 km' },
  { value: '15', label: 'Hasta 15 km' },
];

// Featured Organizers in Cartagena
const FEATURED_ORGANIZERS = [
  {
    id: 'org-1',
    name: 'Fundación Cultural Caribe',
    category: 'Festivales & Tradición',
    verified: true,
    rating: '4.9',
    eventsCount: 14,
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    description: 'Gestores de festivales de danza, poesía y tambores en el Centro Histórico y Murallas.',
    targetCategory: 'Cultural',
  },
  {
    id: 'org-2',
    name: 'Muralla Sounds & Beats',
    category: 'Conciertos & Festivales',
    verified: true,
    rating: '4.8',
    eventsCount: 9,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    description: 'Producción de grandes conciertos de jazz, salsa y música electrónica frente al mar Caribe.',
    targetCategory: 'Música',
  },
  {
    id: 'org-3',
    name: 'Sabores de la Heroica',
    category: 'Rutas Gastronómicas',
    verified: true,
    rating: '5.0',
    eventsCount: 8,
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80',
    description: 'Colectivo de chefs y artesanos culinarios promoviendo la gastronomía caribeña y catas de café.',
    targetCategory: 'Gastronómico',
  },
  {
    id: 'org-4',
    name: 'Getsemaní Arte Urbano',
    category: 'Cultura & Comunidad',
    verified: true,
    rating: '4.9',
    eventsCount: 6,
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
    description: 'Rutas de murales, exposiciones fotográficas al aire libre y talleres artísticos en el barrio.',
    targetCategory: 'Cultural',
  },
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

export default function Home() {
  const navigate = useNavigate();
  const [featuredEvents, setFeaturedEvents] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [mapEvents, setMapEvents] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDistance, setSelectedDistance] = useState('all');

  useEffect(() => {
    getFeaturedEvents()
      .then((data) => {
        if (data && data.length > 0) setFeaturedEvents(data);
        else setFeaturedEvents(MOCK_EVENTS.slice(0, 2));
      })
      .catch(() => setFeaturedEvents(MOCK_EVENTS.slice(0, 2)));

    getUpcomingEvents()
      .then((data) => {
        if (data && data.length > 0) setUpcomingEvents(data);
        else setUpcomingEvents(MOCK_EVENTS.slice(2, 6));
      })
      .catch(() => setUpcomingEvents(MOCK_EVENTS.slice(2, 6)));

    getMapEvents()
      .then((data) => {
        if (data && data.length > 0) setMapEvents(data);
        else {
          // Map pins fallback coordinates in Cartagena
          const pins = [
            {
              id: 'm1',
              title: 'Festival Cartagena Jazz 2026',
              category: 'Música',
              description: 'Plaza de la Aduana, Centro Histórico',
              date: 'Sáb 23 ago · 7:00 PM',
              lat: 10.4225,
              lng: -75.5516,
            },
            {
              id: 'm2',
              title: 'Noche de Boleros en la Muralla',
              category: 'Música',
              description: 'Baluarte de Santo Domingo',
              date: 'Vie 29 ago · 8:00 PM',
              lat: 10.4237,
              lng: -75.5543,
            },
            {
              id: 'm3',
              title: 'Expo Arte Urbano Getsemaní',
              category: 'Cultural',
              description: 'Callejón Angosto, Getsemaní',
              date: 'Jue 2 oct · 4:00 PM',
              lat: 10.4198,
              lng: -75.5459,
            },
            {
              id: 'm4',
              title: 'Torneo de Vóley Playa Bocagrande',
              category: 'Deportivo',
              description: 'Playa de Bocagrande',
              date: 'Jue 7 sep · 8:00 AM',
              lat: 10.4042,
              lng: -75.5574,
            },
            {
              id: 'm5',
              title: 'Feria del Sabor Costeño',
              category: 'Gastronómico',
              description: 'Bóveda de San Francisco, Muralla',
              date: 'Dom 30 ago · 12:00 PM',
              lat: 10.4278,
              lng: -75.5492,
            },
          ];
          setMapEvents(pins);
        }
      })
      .catch(() => {});
  }, []);

  const categories = useMemo(
    () => ['all', ...new Set(mapEvents.map((event) => event.category))],
    [mapEvents]
  );

  const filteredMapEvents = useMemo(() => {
    return mapEvents.filter((event) => {
      const matchesCategory =
        selectedCategory === 'all' || event.category === selectedCategory;

      const matchesDistance =
        selectedDistance === 'all' ||
        getDistanceKm(
          CARTAGENA_CENTER.lat,
          CARTAGENA_CENTER.lng,
          event.lat,
          event.lng
        ) <= Number(selectedDistance);

      return matchesCategory && matchesDistance;
    });
  }, [mapEvents, selectedCategory, selectedDistance]);

  const handleCategoryRedirect = (cat) => {
    navigate(`/buscar?categoria=${encodeURIComponent(cat.query)}`);
  };

  return (
    <div className="w-full min-h-screen bg-white text-slate-900">
      <Navbar />
      <Hero />

      {/* 1. EVENTOS DESTACADOS (Mockup 1) */}
      <section className="w-full px-6 sm:px-12 lg:px-20 pt-32 sm:pt-40 pb-12 sm:pb-16 bg-white max-w-7xl mx-auto">
        <div className="flex items-baseline justify-between mb-6">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0a1838]">
              Eventos destacados
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Las experiencias más esperadas de la temporada en Cartagena
            </p>
          </div>
          <Link
            to="/buscar"
            className="text-xs sm:text-sm font-bold text-brand hover:underline inline-flex items-center gap-1"
          >
            Ver más →
          </Link>
        </div>

        {featuredEvents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {featuredEvents.slice(0, 2).map((event) => (
              <FeaturedEventCard key={event.id} event={event} />
            ))}
          </div>
        ) : (
          <div className="border border-dashed border-slate-300 rounded-xl p-10 text-center text-slate-400 text-sm">
            No hay eventos disponibles
          </div>
        )}
      </section>

      {/* 2. PRÓXIMOS EVENTOS (Mockup 1) */}
      <section id="proximos" className="w-full bg-[#f8fafc] px-6 sm:px-12 lg:px-20 py-12 sm:py-16">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-baseline justify-between mb-6">
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0a1838]">
                Próximos Eventos
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Descubre lo que sucede esta semana
              </p>
            </div>
            <Link
              to="/buscar"
              className="text-xs sm:text-sm font-bold text-brand hover:underline inline-flex items-center gap-1"
            >
              Ver todos →
            </Link>
          </div>

          {upcomingEvents.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {upcomingEvents.slice(0, 4).map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          ) : (
            <div className="border border-dashed border-slate-300 rounded-xl p-10 text-center text-slate-400 text-sm">
              No hay eventos disponibles
            </div>
          )}
        </div>
      </section>

      {/* 3. MAPA DE EVENTOS (Mockup 1) */}
      <section className="w-full px-6 sm:px-12 lg:px-20 py-12 sm:py-16 max-w-7xl mx-auto">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0a1838]">
              Mapa de Eventos
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Descubre eventos cercanos a tu ubicación en Cartagena de Indias
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs sm:text-sm shadow-sm">
              <span className="text-slate-500 font-medium">Categoría:</span>
              <select
                value={selectedCategory}
                onChange={(event) => setSelectedCategory(event.target.value)}
                className="bg-transparent text-[#0a1838] font-semibold outline-none cursor-pointer"
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category === 'all' ? 'Todas las categorías' : category}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs sm:text-sm shadow-sm">
              <span className="text-slate-500 font-medium">Distancia:</span>
              <select
                value={selectedDistance}
                onChange={(event) => setSelectedDistance(event.target.value)}
                className="bg-transparent text-[#0a1838] font-semibold outline-none cursor-pointer"
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

        <div className="overflow-hidden rounded-2xl border border-slate-200 shadow-md h-[420px] sm:h-[480px]">
          <MapContainer
            center={[10.4150, -75.5400]}
            zoom={13}
            minZoom={10}
            maxZoom={16}
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

            {filteredMapEvents.map((event) => (
              <Marker
                key={event.id}
                position={[event.lat, event.lng]}
                icon={locationPinIcon()}
              >
                <Popup>
                  <div className="p-1 min-w-[180px]">
                    <span className="text-[10px] font-bold text-brand uppercase block mb-1">
                      {event.category}
                    </span>
                    <h4 className="text-xs font-bold text-slate-900 mb-1">
                      {event.title}
                    </h4>
                    <p className="text-[11px] text-slate-600 mb-2">
                      {event.description}
                    </p>
                    <Link
                      to={`/buscar?categoria=${encodeURIComponent(event.category)}`}
                      className="text-[11px] font-bold text-brand hover:underline inline-block"
                    >
                      Ver eventos →
                    </Link>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      </section>

      {/* 4. CATEGORÍAS DESTACADAS (Dark Navy section from Mockup 2) */}
      <section className="w-full bg-[#0b1a3d] text-white py-14 sm:py-18 px-6 sm:px-12 lg:px-20 border-t border-b border-[#ffc107]/30">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-end justify-between mb-8">
            <div>
              <span className="text-[#ffc107] font-bold text-xs sm:text-sm tracking-widest uppercase block mb-2">
                EXPLORA POR INTERÉS
              </span>
              <h2 className="text-2xl sm:text-4xl font-extrabold uppercase tracking-tight">
                CATEGORÍAS DESTACADAS
              </h2>
            </div>
            <Link
              to="/categorias"
              className="text-[#ffc107] hover:text-amber-300 text-xs sm:text-sm font-bold tracking-wide flex items-center gap-1 transition-colors"
            >
              Ver todas ↗
            </Link>
          </div>

          {/* Grid of the 6 colorful category cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {CORE_CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => handleCategoryRedirect(cat)}
                  className={`group relative rounded-2xl p-6 sm:p-7 text-white ${cat.bgColor} shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between min-h-[170px] text-left cursor-pointer active:scale-[0.99]`}
                >
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-white text-lg">
                      <Icon size={20} />
                    </div>
                  </div>

                  <div className="flex items-end justify-between mt-6">
                    <div>
                      <h3 className="text-lg sm:text-xl font-black uppercase tracking-wide leading-snug">
                        {cat.title}
                      </h3>
                      <p className="text-white/85 text-xs mt-0.5 font-medium">
                        {cat.subtitle}
                      </p>
                    </div>

                    <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center group-hover:translate-x-1 transition-transform">
                      <FiArrowRight size={16} />
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* 5. DIRECTORIO DE ORGANIZADORES (Requirement 3: Vista de Organizadores en Home) */}
      <section id="organizadores" className="w-full bg-slate-50 py-14 sm:py-20 px-6 sm:px-12 lg:px-20 border-b border-slate-200">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
            <div>
              <span className="text-brand font-bold text-xs sm:text-sm tracking-widest uppercase block mb-2">
                COMUNIDAD & PRODUCTORES
              </span>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-[#0a1838] tracking-tight">
                Organizadores Destacados
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-2 max-w-xl">
                Las mentes y colectivos detrás de los festivales, conciertos y experiencias culturales más vibrantes de Cartagena.
              </p>
            </div>

            <Link
              to="/organizador"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0a1838] hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider transition-colors shadow-sm active:scale-95 shrink-0 self-start md:self-end"
            >
              <FiPlusCircle size={15} className="text-[#ffc107]" />
              Publicar mi evento
            </Link>
          </div>

          {/* Cards of Organizers */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURED_ORGANIZERS.map((org) => (
              <div
                key={org.id}
                className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-lg transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-start justify-between mb-4">
                    <div className="relative">
                      <img
                        src={org.avatar}
                        alt={org.name}
                        className="w-14 h-14 rounded-2xl object-cover border-2 border-slate-100 shadow-sm"
                      />
                      {org.verified && (
                        <span
                          title="Organizador Verificado"
                          className="absolute -bottom-1 -right-1 bg-brand text-white p-1 rounded-full shadow-sm"
                        >
                          <FiCheckCircle size={11} />
                        </span>
                      )}
                    </div>

                    <span className="text-[11px] font-bold text-amber-950 bg-amber-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                      ★ {org.rating}
                    </span>
                  </div>

                  <span className="text-[10px] font-bold uppercase tracking-wider text-brand block mb-1">
                    {org.category}
                  </span>
                  <h3 className="font-display text-base font-extrabold text-slate-900 group-hover:text-brand transition-colors mb-2">
                    {org.name}
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed line-clamp-3 mb-4">
                    {org.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-600">
                    <strong className="text-slate-900 font-bold">{org.eventsCount}</strong> eventos
                  </span>

                  <button
                    type="button"
                    onClick={() => navigate(`/buscar?categoria=${encodeURIComponent(org.targetCategory)}`)}
                    className="text-xs font-bold text-brand hover:text-brand-dark flex items-center gap-1 group-hover:underline"
                  >
                    Ver eventos →
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Banner for Cartagena Organizers Call to Action */}
          <div className="mt-12 rounded-2xl bg-gradient-to-r from-[#0a1838] via-[#0d2352] to-[#007bff] p-8 sm:p-10 text-white flex flex-col lg:flex-row items-center justify-between gap-6 shadow-xl relative overflow-hidden">
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
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#ffc107] hover:bg-[#e0a800] text-[#0a1838] font-bold text-xs uppercase tracking-wider shadow-md transition-all active:scale-95"
              >
                Únete como Organizador
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