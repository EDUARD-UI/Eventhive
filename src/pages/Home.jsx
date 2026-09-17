import { useEffect, useMemo, useState } from 'react';
import L from 'leaflet';
import { Link } from 'react-router-dom';
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';
import Navbar from '../components/usersComponets/Navbar.jsx';
import Hero from '../components/Hero.jsx';
import FeaturedEventCard from '../components/FeaturedEventCard.jsx';
import EventCard from '../components/EventCard.jsx';
import Footer from '../components/usersComponets/Footer.jsx';
import { getFeaturedEvents, getMapEvents, getUpcomingEvents } from '../services/eventService.js';

const CARTAGENA_CENTER = { lat: 10.3951, lng: -75.4834 };
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
      <div class="custom-map-pin">
        <span class="custom-map-pin__dot"></span>
      </div>
    `,
    iconSize: [18, 22],
    iconAnchor: [9, 22],
    popupAnchor: [0, -18],
  });

export default function Home() {
  const [featuredEvents, setFeaturedEvents] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [mapEvents, setMapEvents] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDistance, setSelectedDistance] = useState('all');

  useEffect(() => {
    getFeaturedEvents().then(setFeaturedEvents);
    getUpcomingEvents().then(setUpcomingEvents);
    getMapEvents().then(setMapEvents);
  }, []);

  const categories = useMemo(
    () => (['all', ...new Set(mapEvents.map((event) => event.category))]),
    [mapEvents],
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
          event.lng,
        ) <= Number(selectedDistance);

      return matchesCategory && matchesDistance;
    });
  }, [mapEvents, selectedCategory, selectedDistance]);

  return (
    <div className="w-full min-h-screen bg-white text-slate-900">
      <Navbar />
      <Hero />

      <section className="w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-10 lg:py-12 bg-white">
        <div className="flex items-baseline justify-between mb-5">
          <div>
            <h2 className="text-xl sm:text-2xl font-display">Próximos eventos</h2>
            <p className="text-[13.5px] text-muted mt-1">Eventos cercanos a la fecha actual</p>
          </div>
          <a href="#" className="text-[13.5px] font-semibold text-brand">Ver todos →</a>
        </div>
        <div className="flex flex-col sm:flex-row gap-5">
          {featuredEvents.slice(0, 2).map((event) => (
            <FeaturedEventCard key={event.id} event={event} />
          ))}
        </div>
      </section>

      <section className="w-full bg-slate-50 px-4 sm:px-6 lg:px-8 py-8 sm:py-10 lg:py-12">
        <div className="flex items-baseline justify-between mb-5">
          <div>
            <h2 className="text-xl sm:text-2xl font-display">Más eventos</h2>
            <p className="text-[13.5px] text-muted mt-1">Aún tienes opciones para esta semana</p>
          </div>
          <a href="#" className="text-[13.5px] font-semibold text-brand">Ver todos →</a>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
          {upcomingEvents.slice(0, 4).map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      </section>

      <section className="w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-10 lg:py-12">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-display">Mapa de eventos</h2>
            <p className="text-[13.5px] text-muted mt-1">Puntos de ubicación en Cartagena</p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <label className="flex items-center gap-2 rounded-xl border border-white/10 bg-[#007bff] px-3 py-2 text-sm text-slate-200">
              <span className="text-white">Categoría</span>
              <select
                value={selectedCategory}
                onChange={(event) => setSelectedCategory(event.target.value)}
                className="bg-transparent text-white outline-none"
              >
                {categories.map((category) => (
                  <option key={category} value={category} className="bg-[#007bff] text-white">
                    {category === 'all' ? 'Todas' : category}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex items-center gap-2 rounded-xl border border-white/10 bg-[#007bff] px-3 py-2 text-sm text-slate-200">
              <span className="text-white">Distancia</span>
              <select
                value={selectedDistance}
                onChange={(event) => setSelectedDistance(event.target.value)}
                className="bg-transparent text-white outline-none"
              >
                {DISTANCE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value} className="bg-[#111827] text-white">
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-white/10 shadow-[0_20px_40px_rgba(15,23,42,0.18)] h-[60vh] min-h-[380px] max-h-[760px]">
          <MapContainer
            center={[10.4035, -75.5252]}
            zoom={11.5}
            minZoom={10}
            maxZoom={15}
            scrollWheelZoom={false}
            dragging={true}
            doubleClickZoom={false}
            boxZoom={false}
            keyboard={false}
            zoomControl={true}
            className="h-full w-full leaflet-map-dark"
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
                  <div className="map-popup-card">
                    <div className="map-popup-card__badge">{event.category}</div>
                    <h3 className="map-popup-card__title">{event.title}</h3>
                    <p className="map-popup-card__description">{event.description}</p>
                    <div className="map-popup-card__meta">
                      <span>{event.date}</span>
                    </div>
                    <Link
                      to={`/eventos/${event.id}`}
                      className="map-popup-card__button"
                    >
                      Ver evento
                    </Link>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      </section>

      <Footer />
    </div>
  );
}