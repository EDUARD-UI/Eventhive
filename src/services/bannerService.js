import { httpClient } from './httpClient.js';

export const normalizeBanner = (banner) => {
  let enlace = banner.enlaceUrl || '';

  // Si el enlace apunta a un archivo de imagen (error de carga en BD/panel donde se guardó la imagen en lugar de la ruta del evento):
  const isImageFile = /\.(jpe?g|png|webp|gif|svg)(\?.*)?$/i.test(enlace);

  if (isImageFile || !enlace || enlace === '#') {
    if (/coachella/i.test(banner.titulo || '')) {
      enlace = '/eventos/coachella';
    } else if (/classic/i.test(banner.titulo || '')) {
      enlace = '/eventos/22';
    } else {
      enlace = '/buscar';
    }
  }

  // Si el enlace es una URL absoluta hacia un evento (ej. https://.../eventos/22 o /evento/21),
  // convertirlo a ruta interna de React Router para navegación SPA sin recargar
  const eventMatch = enlace.match(/\/eventos?\/(\d+)/i);
  if (eventMatch) {
    enlace = `/eventos/${eventMatch[1]}`;
  }

  return {
    id: banner.id,
    titulo: banner.titulo || '',
    imagenUrl: banner.imagenUrl || banner.imagen || banner.foto || null,
    textoBoton: banner.textoBoton || 'Ver más',
    enlaceUrl: enlace,
    posicion: banner.posicion ?? 1,
  };
};

/**
 * Obtener banners activos del home (GET /api/banners-home).
 * Endpoint público que devuelve los banners configurados para las posiciones 1 y 2.
 */
export async function getHomeBanners() {
  try {
    const data = await httpClient.get('/banners-home');
    const list = Array.isArray(data) ? data : data?.content || [];
    return list.map(normalizeBanner).sort((a, b) => a.posicion - b.posicion);
  } catch (err) {
    console.warn('No se pudieron obtener los banners del home:', err?.message);
    return [];
  }
}

export default {
  getHomeBanners,
  normalizeBanner,
};
