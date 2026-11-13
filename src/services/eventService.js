import { httpClient } from './httpClient.js';
import { formatHora12 } from '../utils/formatters.js';
import session from './session.js';

const getEventPathId = (value) => {
  const id = value && typeof value === 'object' ? value.id : value;
  if ((typeof id !== 'string' && typeof id !== 'number') || String(id).trim() === '') {
    throw new TypeError('Identificador de evento inválido.');
  }
  return encodeURIComponent(String(id));
};

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
  return formatHora12(timeString || dateString);
};

export const normalizeEvent = (event) => {
  const shortDate = formatDisplayDate(event.fecha, event.hora);
  const cleanHora = formatHora12(event.hora);
  const formattedTime = cleanHora;

  return {
    ...event,
    id: String(event.id),
    hora: cleanHora,
    time: cleanHora || formatHora12(event.time),
    title: event.titulo || event.title || 'Evento sin título',
    description: event.descripcion || event.description || '',
    category:
      typeof event.categoria === 'string'
        ? event.categoria
        : event.categoria?.nombre || event.nombreCategoria || event.category || 'Evento',
    categoriaId: event.categoria?.id || event.categoriaId || null,
    location: event.lugar || event.ubicacion || event.location || '',
    shortDate,
    formattedTime,
    date: formattedTime ? `${shortDate} · ${formattedTime}` : shortDate,
    startsAt: event.fecha ? `${event.fecha}T${cleanHora ? `${cleanHora}:00` : '00:00:00'}` : null,
    lat: event.latitud,
    lng: event.longitud,
    promocionado: Boolean(event.promocionado || event.destacado || event.urlImagenDestacado || event.imagenPromocional),
    imagenPromocional: event.imagenPromocional || event.urlImagenDestacado || null,
    price:
      event.precio != null
        ? Number(event.precio)
        : event.price != null
          ? Number(event.price)
          : Array.isArray(event.localidades) && event.localidades.length > 0
            ? Number(event.localidades[0]?.precio ?? event.localidades[0]?.price ?? 0)
            : null,
    minPrice:
      Array.isArray(event.localidades) && event.localidades.length > 0
        ? Math.min(
          ...event.localidades
            .map((l) => Number(l.precio ?? l.price))
            .filter((n) => !isNaN(n) && n >= 0)
        )
        : event.precio != null
          ? Number(event.precio)
          : event.price != null
            ? Number(event.price)
            : null,
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
            ? formatHora12(item.hora)
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
    if (err?.isNetworkError || (err?.status && err.status >= 500)) throw err;
    console.warn('No se pudo consultar /eventos/carrusel:', err?.message);
    return [];
  }
}


/**
 * Eventos destacados para cartelera (GET /api/eventos/destacados).
 * Devuelve eventos PUBLICADO con promoción pagada y confirmada (promocionado=true).
 */

/**
 * Primer evento destacado para el banner temporizador (GET /api/eventos/primer-destacado).
 * Devuelve el primer evento destacado (promocionado: true y en estado PUBLICADO),
 * priorizando el más próximo temporalmente (fecha ASC, hora ASC, id ASC).
 * Estructura: id, nombre (alias titulo), urlImagen (alias foto), fechaCreacion, fecha, hora.
 */
export async function getPrimerEventoDestacado() {
  try {
    const res = await httpClient.get('/eventos/primer-destacado');
    const data = res?.data || res;
    if (!data || (!data.id && !data.nombre && !data.titulo)) return null;

    const rawId = data.id || data.eventoId || null;
    const title = data.titulo || data.nombre || '';
    const imgUrl = data.urlImagen || data.foto || data.imagen || '';

    return {
      ...data,
      id: rawId ? String(rawId) : null,
      eventoId: rawId,
      nombre: title,
      titulo: title,
      title,
      urlImagen: imgUrl,
      foto: imgUrl,
      photo: imgUrl,
      fechaCreacion: data.fechaCreacion || null,
      createdAt: data.fechaCreacion || null,
      fecha: data.fecha || '',
      hora: data.hora || '',
    };
  } catch (err) {
    if (err?.isNetworkError || (err?.status && err.status >= 500)) throw err;
    console.warn('Error consultando /eventos/primer-destacado:', err?.message);
    return null;
  }
}

export async function getFeaturedEvents({ page = 0, size = 10, sort } = {}) {
  try {
    const params = { page, size };
    if (sort) params.sort = sort;
    const data = await httpClient.get('/eventos/destacados', params);
    const content = Array.isArray(data)
      ? data
      : Array.isArray(data?.data?.content)
        ? data.data.content
        : Array.isArray(data?.data)
          ? data.data
          : Array.isArray(data?.content)
            ? data.content
            : [];
    return content.map(normalizeEvent);
  } catch (err) {
    if (err?.isNetworkError || (err?.status && err.status >= 500)) throw err;
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
  const proximosData = await httpClient.get('/eventos/proximos', { page, size });
  const content = Array.isArray(proximosData)
    ? proximosData
    : Array.isArray(proximosData?.data?.content)
      ? proximosData.data.content
      : Array.isArray(proximosData?.data)
        ? proximosData.data
        : Array.isArray(proximosData?.content)
          ? proximosData.content
          : [];
  return content.map(normalizeEvent);
}

/**
 * Recomendaciones personalizadas para el usuario (GET /api/eventos/recomendaciones-para-ti).
 * Endpoint público que personaliza según sesión opcional (Spring Boot + FastAPI).
 * Devuelve hasta 12 eventos de recomendaciones. Si hay usuario autenticado,
 * se envía su identificador para que el backend calcule la afinidad.
 */
export async function getRecomendacionesParaTi({ usuarioId, id, size = 12 } = {}) {
  try {
    const user = typeof session !== 'undefined' && session?.getUser ? session.getUser() : null;
    const resolvedUserId = usuarioId ?? id ?? user?.id ?? user?.usuarioId ?? null;

    const params = { size };
    if (resolvedUserId) {
      params.usuarioId = resolvedUserId;
      params.usuario_id = resolvedUserId;
      params.id = resolvedUserId;
    }

    const res = await httpClient.get('/eventos/recomendaciones-para-ti', params);
    const content = Array.isArray(res)
      ? res
      : Array.isArray(res?.content)
      ? res.content
      : Array.isArray(res?.data?.content)
      ? res.data.content
      : Array.isArray(res?.data)
      ? res.data
      : [];

    return content.map(normalizeEvent);
  } catch (err) {
    console.warn('Error consultando /eventos/recomendaciones-para-ti:', err?.message);
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
 * Enriquecido en paralelo con los detalles completos del evento (localidades, precios, foto y lugar).
 */
export async function getMapEvents({ categoriaId, lat, lng, limite = 10 } = {}) {
  try {
    const params = { categoriaId, limite };
    const latitude = Number(lat);
    const longitude = Number(lng);
    if (
      lat !== null &&
      lat !== undefined &&
      lng !== null &&
      lng !== undefined &&
      Number.isFinite(latitude) &&
      Number.isFinite(longitude)
    ) {
      params.lat = latitude;
      params.lng = longitude;
    }

    const data = await httpClient.get('/eventos/mapa', params);
    const rawEvents = Array.isArray(data) ? data : data?.content || [];
    if (!rawEvents.length) return [];

    // Enriquecer cada evento del mapa con sus detalles completos (localidades y tarifas de entradas)
    const enrichedEvents = await Promise.allSettled(
      rawEvents.map(async (ev) => {
        try {
          if (!ev?.id) return ev;
          const detail = await httpClient.get(`/eventos/${getEventPathId(ev.id)}`);
          if (detail && typeof detail === 'object') {
            return {
              ...ev,
              ...detail,
              // Preservar coordenadas geográficas del endpoint de mapa
              latitud: ev.latitud ?? detail.latitud,
              longitud: ev.longitud ?? detail.longitud,
            };
          }
          return ev;
        } catch {
          return ev;
        }
      })
    );

    const merged = enrichedEvents.map((res, idx) =>
      res.status === 'fulfilled' && res.value ? res.value : rawEvents[idx]
    );

    return merged.map(normalizeEvent);
  } catch (err) {
    if (err?.isNetworkError || (err?.status && err.status >= 500)) throw err;
    console.warn('Error consultando /eventos/mapa:', err?.message);
    return [];
  }
}

/**
 * Detalle público de un evento (GET /api/eventos/{id}).
 */
export async function getEventById(eventId) {
  const data = await httpClient.get(`/eventos/${getEventPathId(eventId)}`);
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
  getPrimerEventoDestacado,
  getFeaturedEvents,
  getUpcomingEvents,
  getRecomendacionesParaTi,
  getEvents,
  getEventsByCategory,
  getMapEvents,
  getEventById,
  searchEvents,
  normalizeEvent,
};
