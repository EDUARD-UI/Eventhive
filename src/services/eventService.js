import { httpClient } from './httpClient.js';

const formatDisplayDate = (dateString, timeString) => {
  if (!dateString) return '';

  const date = new Date(timeString ? `${dateString}T${timeString}` : dateString);
  if (Number.isNaN(date.getTime())) return dateString;

  const weekday = date.toLocaleDateString('es-ES', { weekday: 'short' }).replace('.', '');
  const day = date.getDate();
  const month = date.toLocaleDateString('es-ES', { month: 'short' }).replace('.', '');
  const capitalizedWeekday = `${weekday.charAt(0).toUpperCase()}${weekday.slice(1)}`;

  if (!timeString) return `${capitalizedWeekday} ${day} ${month}`;

  const hour = date.toLocaleTimeString('es-ES', { hour: 'numeric', minute: '2-digit', hour12: true });
  return `${capitalizedWeekday} ${day} ${month} · ${hour}`;
};

const normalizeEvent = (event) => ({
  ...event,
  id: String(event.id),
  title: event.titulo,
  description: event.descripcion,
  category: typeof event.categoria === 'string' ? event.categoria : event.categoria?.nombre || 'Evento',
  location: event.ubicacion || event.lugar || '',
  date: formatDisplayDate(event.fecha, event.hora),
  startsAt: event.fecha ? `${event.fecha}T${event.hora || '00:00:00'}` : null,
  lat: event.latitud,
  lng: event.longitud,
  price: event.precio ?? event.localidades?.[0]?.precio ?? 0,
  gradient: 'from-brand to-sky-300',
  favorite: false,
  photo: event.foto,
  organization: event.organizacion || event.organizador,
  localidades: event.localidades || [],
});

const sortByNearestDate = (events) => {
  const now = Date.now();

  return [...events].sort((a, b) => {
    const aTime = a.startsAt ? new Date(a.startsAt).getTime() : Number.POSITIVE_INFINITY;
    const bTime = b.startsAt ? new Date(b.startsAt).getTime() : Number.POSITIVE_INFINITY;

    return Math.abs(aTime - now) - Math.abs(bTime - now);
  });
};

/** Eventos destacados: los 2 más próximos a la fecha actual (GET /eventos). */
export async function getFeaturedEvents() {
  const data = await httpClient.get('/eventos', { page: 0, size: 8, sort: 'fecha,asc' });
  const events = (data?.content || []).map(normalizeEvent);
  return sortByNearestDate(events).slice(0, 2);
}

/** Más eventos para la sección "Más eventos" (GET /eventos). */
export async function getUpcomingEvents() {
  const data = await httpClient.get('/eventos', { page: 0, size: 12, sort: 'fecha,asc' });
  const events = (data?.content || []).map(normalizeEvent);
  return sortByNearestDate(events).slice(0, 4);
}

/** Eventos filtrados por categoría, paginados (GET /eventos?categoriaId=...). */
export async function getEventsByCategory({ categoriaId, page = 0, size = 12 } = {}) {
  const data = await httpClient.get('/eventos', { categoriaId, page, size });

  return {
    events: (data?.content || []).map(normalizeEvent),
    total: data?.totalElements ?? 0,
  };
}

/** Eventos para el mapa, con filtro opcional por categoría/ubicación (GET /eventos/mapa). */
export async function getMapEvents({ categoriaId, lat, lng, radioKm } = {}) {
  const data = await httpClient.get('/eventos/mapa', { categoriaId, lat, lng, radioKm });
  const events = Array.isArray(data) ? data : data?.content || [];
  return events.map(normalizeEvent);
}

/** Detalle de un evento (GET /eventos/{id}). */
export async function getEventById(eventId) {
  const data = await httpClient.get(`/eventos/${eventId}`);
  return data ? normalizeEvent(data) : null;
}

/** Búsqueda de eventos por título o fecha (GET /eventos/buscar). */
export async function searchEvents({ titulo, fecha, page = 0, size = 12 } = {}) {
  const data = await httpClient.get('/eventos/buscar', { titulo, fecha, page, size });

  return {
    events: (data?.content || []).map(normalizeEvent),
    total: data?.totalElements ?? 0,
  };
}
