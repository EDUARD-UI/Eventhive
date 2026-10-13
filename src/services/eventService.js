import { httpClient } from './httpClient.js';
import { formatHora23 } from '../utils/formatters.js';

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
  return formatHora23(timeString || dateString);
};

export const normalizeEvent = (event) => {
  const shortDate = formatDisplayDate(event.fecha, event.hora);
  const cleanHora = formatHora23(event.hora);
  const formattedTime = cleanHora;

  return {
    ...event,
    id: String(event.id),
    hora: cleanHora,
    time: cleanHora || formatHora23(event.time),
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
    startsAt: event.fecha ? `${event.fecha}T${cleanHora ? `${cleanHora}:00` : '00:00:00'}` : null,
    lat: event.latitud,
    lng: event.longitud,
    promocionado: Boolean(event.promocionado || event.destacado || event.urlImagenDestacado || event.imagenPromocional),
    imagenPromocional: event.imagenPromocional || event.urlImagenDestacado || null,
    price: event.precio ?? event.localidades?.[0]?.precio ?? null,
    minPrice:
      Array.isArray(event.localidades) && event.localidades.length > 0
        ? Math.min(...event.localidades.map((l) => Number(l.precio || 0)))
        : event.precio ?? null,
    favorite: false,
    photo: event.imagenPromocional || event.urlImagenDestacado || event.foto || event.fotoUrl || event.imagen || event.imagenUrl || event.banner || null,
    organization: event.organizacion || event.organizador,
    localidades: event.localidades || [],
  };
};

/**
 * Eventos exclusivos para el carrusel principal (GET /api/eventos/carrusel).
 * Reglas: estado PUBLICADO, promoción con pago CONFIRMADO, plan con premium=true
 * y url_imagen_destacado válida asignada por Marketing.
 * Devuelve la imagen destacada de banner colocada por Marketing.
 */
export async function getCarouselEvents() {
  try {
    const data = await httpClient.get('/eventos/carrusel');
    const content = Array.isArray(data)
      ? data
      : Array.isArray(data?.data)
      ? data.data
      : Array.isArray(data?.content)
      ? data.content
      : [];

    return content
      .map((item, idx) => {
        const imageUrl =
          typeof item === 'string'
            ? item
            : item?.url_imagen_promocionado ||
              item?.urlImagenPromocionado ||
              item?.url_imagen_destacado ||
              item?.urlImagenDestacado ||
              item?.url_imagen ||
              item?.urlImagen ||
              item?.url ||
              item?.imagen ||
              item?.foto ||
              item?.photo ||
              '';

        if (!imageUrl) return null;

        const rawId =
          typeof item === 'object' && item !== null
            ? item.eventoId || item.evento_id || item.id || null
            : null;

        const hasRealId =
          rawId !== null &&
          rawId !== undefined &&
          !String(rawId).startsWith('carrusel-');
        const id = hasRealId ? String(rawId) : `carrusel-${idx}`;
        const eventoId = hasRealId ? rawId : null;

        const rawTitle =
          typeof item === 'object' && item !== null
            ? item.titulo || item.title || item.nombre || ''
            : '';
        const titulo = rawTitle === 'Evento Destacado' ? '' : rawTitle;

        const rawCat =
          typeof item === 'object' && item !== null
            ? item.categoria || item.category || item.categoriaNombre || ''
            : '';
        const categoria = rawCat === 'Evento Destacado' ? '' : rawCat;

        const lugar =
          typeof item === 'object' && item !== null
            ? item.lugar || item.ubicacion || item.location || ''
            : '';

        const fecha =
          typeof item === 'object' && item !== null
            ? item.fecha || item.date || ''
            : '';

        const hora =
          typeof item === 'object' && item !== null
            ? formatHora23(item.hora)
            : '';

        return {
          id,
          eventoId,
          titulo,
          title: titulo,
          description: item?.descripcion || item?.description || '',
          url_imagen_promocionado: imageUrl,
          url_imagen_destacado: imageUrl,
          photo: imageUrl,
          categoria,
          category: categoria,
          lugar,
          location: lugar,
          fecha,
          date: fecha,
          hora,
          premium: true,
        };
      })
      .filter(Boolean);
  } catch (err) {
    console.warn('No se pudo consultar /eventos/carrusel:', err?.message);
    return [];
  }
}


/**
 * Eventos destacados para cartelera (GET /api/eventos/destacados).
 * Devuelve eventos PUBLICADO con promoción pagada y confirmada (promocionado=true).
 */
export async function getFeaturedEvents({ page = 0, size = 10, sort } = {}) {
  try {
    const params = { page, size };
    if (sort) params.sort = sort;
    const data = await httpClient.get('/eventos/destacados', params);
    const content = Array.isArray(data) ? data : data?.content || [];
    return content.map(normalizeEvent);
  } catch (err) {
    console.warn('Error consultando /eventos/destacados:', err?.message);
    return [];
  }
}

/**
 * Próximos eventos para la cartelera (GET /api/eventos/proximos).
 * Ordenados estrictamente por proximidad temporal ascendente (fecha ASC, hora ASC, id ASC).
 * No se reorganizan ni priorizan eventos promocionados ni premium.
 */
export async function getUpcomingEvents({ page = 0, size = 8 } = {}) {
  try {
    const proximosData = await httpClient.get('/eventos/proximos', { page, size });
    const content = Array.isArray(proximosData) ? proximosData : proximosData?.content || [];
    return content.map(normalizeEvent);
  } catch (err) {
    console.warn('Error consultando /eventos/proximos:', err?.message);
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

export const COACHELLA_HEROICA_EVENT = {
  id: 'coachella',
  titulo: 'La Versión del Coachella en la Heroica',
  descripcion: 'El festival de música y arte más esperado del Caribe colombiano llega a Cartagena de Indias. Vive una jornada legendaria con artistas estelares en vivo, múltiples escenarios, experiencias inmersivas, gastronomía de autor y la mejor vibra festivalera frente a la Heroica.',
  lugar: 'Plaza de Toros Monumental, Cartagena de Indias',
  foto: 'https://jcigroanxweuzbkmqbib.supabase.co/storage/v1/object/public/banners-home/coachela.jpeg',
  fecha: '2026-12-18',
  hora: '17:00:00',
  estado: 'PUBLICADO',
  promocionado: true,
  latitud: 10.40701,
  longitud: -75.50567,
  categoria: {
    id: 1,
    nombre: 'Conciertos',
  },
  organizacion: {
    id: 15,
    nombre: 'Passa Passa Music Publishing & Entertainment S.A.S',
  },
  localidades: [
    {
      id: 101,
      nombre: 'General Early Bird',
      precio: 150000.0,
      capacidad: 3000,
      disponibles: 1250,
    },
    {
      id: 102,
      nombre: 'VIP Coachella Experience',
      precio: 350000.0,
      capacidad: 1000,
      disponibles: 420,
    },
    {
      id: 103,
      nombre: 'Palcos Exclusivos',
      precio: 850000.0,
      capacidad: 200,
      disponibles: 45,
    },
  ],
};

/**
 * Detalle público de un evento (GET /api/eventos/{id}).
 */
export async function getEventById(eventId) {
  if (String(eventId).toLowerCase() === 'coachella') {
    return normalizeEvent(COACHELLA_HEROICA_EVENT);
  }

  try {
    const data = await httpClient.get(`/eventos/${eventId}`);
    return data ? normalizeEvent(data) : null;
  } catch (err) {
    if (String(eventId).toLowerCase() === 'coachella') {
      return normalizeEvent(COACHELLA_HEROICA_EVENT);
    }
    throw err;
  }
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
