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

export const normalizeEvent = (event) => ({
  ...event,
  id: String(event.id),
  title: event.titulo || event.title || 'Evento sin título',
  description: event.descripcion || event.description || '',
  category:
    typeof event.categoria === 'string'
      ? event.categoria
      : event.categoria?.nombre || event.nombreCategoria || event.category || 'Evento',
  categoriaId: event.categoria?.id || event.categoriaId || null,
  location: event.ubicacion || event.lugar || event.location || '',
  date: formatDisplayDate(event.fecha, event.hora),
  startsAt: event.fecha ? `${event.fecha}T${event.hora || '00:00:00'}` : null,
  lat: event.latitud,
  lng: event.longitud,
  price: event.precio ?? event.localidades?.[0]?.precio ?? 0,
  gradient: 'from-brand to-sky-300',
  favorite: false,
  photo: event.foto || event.fotoUrl || event.imagen || event.imagenUrl || event.banner || null,
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

/** Eventos destacados: hasta 8 eventos más próximos a la fecha actual para el carrusel (GET /eventos). */
export async function getFeaturedEvents() {
  try {
    const data = await httpClient.get('/eventos', { page: 0, size: 12, sort: 'fecha,asc' });
    const content = Array.isArray(data) ? data : data?.content || [];
    const events = content.map(normalizeEvent);
    return sortByNearestDate(events).slice(0, 8);
  } catch (err) {
    console.error('Error fetching featured events:', err);
    return [];
  }
}

/** Más eventos para la sección "Más eventos" (GET /eventos/proximos o GET /eventos). */
export async function getUpcomingEvents() {
  try {
    const proximosData = await httpClient.get('/eventos/proximos', { page: 0, size: 8 });
    const content = Array.isArray(proximosData) ? proximosData : proximosData?.content || [];
    if (content.length > 0) {
      return content.map(normalizeEvent).slice(0, 4);
    }
  } catch {
    // fallback a /eventos si /eventos/proximos no tiene datos
  }
  try {
    const data = await httpClient.get('/eventos', { page: 0, size: 12, sort: 'fecha,asc' });
    const content = Array.isArray(data) ? data : data?.content || [];
    const events = content.map(normalizeEvent);
    return sortByNearestDate(events).slice(0, 4);
  } catch {
    return [];
  }
}

/** Eventos paginados, con categoriaId opcional (GET /eventos). */
export async function getEvents({ categoriaId, page = 0, size = 12, sort = 'fecha,asc' } = {}) {
  const params = { page, size, sort };
  if (categoriaId) params.categoriaId = categoriaId;
  const data = await httpClient.get('/eventos', params);
  const events = (data?.content || []).map(normalizeEvent);
  const total = data?.totalElements ?? events.length;
  const totalPages = data?.totalPages ?? Math.max(1, Math.ceil(total / size));

  return {
    events,
    total,
    totalPages,
    currentPage: data?.number ?? page,
  };
}

/** Eventos filtrados por categoría, paginados (GET /eventos?categoriaId=...). */
export async function getEventsByCategory({ categoriaId, page = 0, size = 12 } = {}) {
  return getEvents({ categoriaId, page, size });
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
  const params = { page, size };
  if (titulo && String(titulo).trim()) params.titulo = String(titulo).trim();
  if (fecha && String(fecha).trim()) params.fecha = String(fecha).trim();
  const data = await httpClient.get('/eventos/buscar', params);
  const events = (data?.content || []).map(normalizeEvent);
  const total = data?.totalElements ?? events.length;
  const totalPages = data?.totalPages ?? Math.max(1, Math.ceil(total / size));

  return {
    events,
    total,
    totalPages,
    currentPage: data?.number ?? page,
  };
}
