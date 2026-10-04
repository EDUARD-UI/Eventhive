import { httpClient } from './httpClient.js';

const parseDateSafe = (dateString, timeString) => {
  if (!dateString) return null;
  // Si dateString es YYYY-MM-DD
  const parts = String(dateString).split('-');
  if (parts.length === 3) {
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    let hours = 0;
    let minutes = 0;
    if (timeString) {
      const timeParts = String(timeString).split(':');
      hours = parseInt(timeParts[0] || '0', 10);
      minutes = parseInt(timeParts[1] || '0', 10);
    }
    return new Date(year, month, day, hours, minutes);
  }
  const date = new Date(timeString ? `${dateString}T${timeString}` : dateString);
  return Number.isNaN(date.getTime()) ? null : date;
};

export const formatDisplayDate = (dateString, timeString) => {
  const date = parseDateSafe(dateString, timeString);
  if (!date) return dateString || '';

  const weekday = date.toLocaleDateString('es-ES', { weekday: 'short' }).replace('.', '');
  const day = date.getDate();
  const month = date.toLocaleDateString('es-ES', { month: 'short' }).replace('.', '');
  const capitalizedWeekday = `${weekday.charAt(0).toUpperCase()}${weekday.slice(1)}`;
  const capitalizedMonth = `${month.charAt(0).toUpperCase()}${month.slice(1)}`;

  return `${capitalizedWeekday} · ${capitalizedMonth} ${day}`;
};

export const formatDisplayTime = (timeString, dateString) => {
  if (!timeString && !dateString) return '';
  const date = parseDateSafe(dateString || '2026-01-01', timeString);
  if (!date && timeString) return timeString.slice(0, 5);
  if (!date) return '';

  return date
    .toLocaleTimeString('es-ES', { hour: 'numeric', minute: '2-digit', hour12: true })
    .toLowerCase();
};

export const normalizeEvent = (event) => {
  const shortDate = formatDisplayDate(event.fecha, event.hora);
  const formattedTime = formatDisplayTime(event.hora, event.fecha);

  return {
    ...event,
    id: String(event.id),
    title: event.titulo || event.title || 'Evento sin título',
    description: event.descripcion || event.description || '',
    category:
      typeof event.categoria === 'string'
        ? event.categoria
        : event.categoria?.nombre || event.nombreCategoria || event.category || 'Evento',
    categoriaId: event.categoria?.id || event.categoriaId || null,
    location: event.lugar || event.ubicacion || event.location || 'Cartagena de Indias',
    shortDate,
    formattedTime,
    date: formattedTime ? `${shortDate} · ${formattedTime}` : shortDate,
    startsAt: event.fecha ? `${event.fecha}T${event.hora || '00:00:00'}` : null,
    lat: event.latitud,
    lng: event.longitud,
    promocionado: Boolean(event.promocionado),
    price: event.precio ?? event.localidades?.[0]?.precio ?? null,
    minPrice:
      Array.isArray(event.localidades) && event.localidades.length > 0
        ? Math.min(...event.localidades.map((l) => Number(l.precio || 0)))
        : event.precio ?? null,
    favorite: false,
    photo: event.foto || event.fotoUrl || event.imagen || event.imagenUrl || event.banner || null,
    organization: event.organizacion || event.organizador,
    localidades: event.localidades || [],
  };
};

/**
 * Eventos destacados para el carrusel (GET /api/eventos/destacados).
 * Devuelve eventos PUBLICADO con promocionado=true ordenados por fecha, hora e ID.
 * Si la lista está vacía, recurre a los eventos próximos como fallback elegante.
 */
export async function getFeaturedEvents({ page = 0, size = 10, sort } = {}) {
  try {
    const params = { page, size };
    if (sort) params.sort = sort;
    const data = await httpClient.get('/eventos/destacados', params);
    const content = Array.isArray(data) ? data : data?.content || [];
    if (content.length > 0) {
      return content.map(normalizeEvent);
    }
  } catch (err) {
    console.warn('Fallback: no se pudo consultar /eventos/destacados:', err?.message);
  }

  // Fallback seguro a /eventos si aún no hay destacados configurados
  try {
    const fallbackData = await httpClient.get('/eventos', { page: 0, size: 8, sort: 'fecha,asc' });
    const fallbackList = Array.isArray(fallbackData) ? fallbackData : fallbackData?.content || [];
    return fallbackList.map(normalizeEvent);
  } catch {
    return [];
  }
}

/**
 * Próximos eventos para la cartelera semanal (GET /api/eventos/proximos o fallback a GET /api/eventos).
 */
export async function getUpcomingEvents({ page = 0, size = 8 } = {}) {
  try {
    const proximosData = await httpClient.get('/eventos/proximos', { page, size });
    const content = Array.isArray(proximosData) ? proximosData : proximosData?.content || [];
    if (content.length > 0) {
      return content.map(normalizeEvent);
    }
  } catch {
    // Continuar a fallback
  }

  try {
    const data = await httpClient.get('/eventos', { page, size, sort: 'fecha,asc' });
    const content = Array.isArray(data) ? data : data?.content || [];
    return content.map(normalizeEvent);
  } catch {
    return [];
  }
}

/**
 * Listado general de eventos públicos paginados (GET /api/eventos).
 * Soporta filtros opcionales de categoriaId y fecha (yyyy-MM-dd exacto).
 */
export async function getEvents({ categoriaId, fecha, page = 0, size = 12, sort = 'fecha,asc' } = {}) {
  const params = { page, size, sort };
  if (categoriaId) params.categoriaId = categoriaId;
  if (fecha && String(fecha).trim()) params.fecha = String(fecha).trim();

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

/**
 * Eventos filtrados por categoría (GET /api/eventos?categoriaId=...).
 */
export async function getEventsByCategory({ categoriaId, page = 0, size = 12, sort } = {}) {
  return getEvents({ categoriaId, page, size, sort });
}

/**
 * Eventos para renderizar en mapa (GET /api/eventos/mapa).
 */
export async function getMapEvents({ categoriaId, lat, lng, radioKm } = {}) {
  const data = await httpClient.get('/eventos/mapa', { categoriaId, lat, lng, radioKm });
  const events = Array.isArray(data) ? data : data?.content || [];
  return events.map(normalizeEvent);
}

/**
 * Detalle público de un evento (GET /api/eventos/{id}).
 */
export async function getEventById(eventId) {
  const data = await httpClient.get(`/eventos/${eventId}`);
  return data ? normalizeEvent(data) : null;
}

/**
 * Búsqueda de eventos por título o coincidencia parcial (GET /api/eventos/buscar).
 * Si no se proporciona título pero sí categoría o fecha, delega a getEvents.
 */
export async function searchEvents({ titulo, nombre, categoriaId, fecha, page = 0, size = 12, sort } = {}) {
  const queryTerm = (titulo || nombre || '').trim();

  // Si no hay término textual de búsqueda, usamos GET /api/eventos con sus filtros nativos
  if (!queryTerm) {
    return getEvents({ categoriaId, fecha, page, size, sort });
  }

  const params = { titulo: queryTerm, page, size };
  if (sort) params.sort = sort;

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

export default {
  getFeaturedEvents,
  getUpcomingEvents,
  getEvents,
  getEventsByCategory,
  getMapEvents,
  getEventById,
  searchEvents,
  normalizeEvent,
};
