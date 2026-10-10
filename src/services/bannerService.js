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

/**
 * Obtener banners del home para administración (GET /api/banners-home/admin).
 * Devuelve exactamente los dos espacios administrativos (posiciones 1 y 2).
 */
export async function getAdminBanners() {
  try {
    const data = await httpClient.get('/banners-home/admin');
    const list = Array.isArray(data) ? data : data?.content || [];
    if (list.length > 0) {
      return list.map((b) => ({
        ...normalizeBanner(b),
        id: b.id,
        posicion: b.posicion,
        titulo: b.titulo || '',
        imagenUrl: b.imagenUrl || '',
        textoBoton: b.textoBoton || '',
        enlaceUrl: b.enlaceUrl || '',
      })).sort((a, b) => a.posicion - b.posicion);
    }
  } catch (err) {
    console.warn('No se pudieron obtener los banners de admin, usando fallback:', err?.message);
  }

  // Fallback con los banners del home
  const publicBanners = await getHomeBanners();
  const slot1 = publicBanners.find((b) => Number(b.posicion) === 1) || {
    id: null,
    posicion: 1,
    titulo: '',
    imagenUrl: '',
    textoBoton: 'Ver más',
    enlaceUrl: '',
  };
  const slot2 = publicBanners.find((b) => Number(b.posicion) === 2) || {
    id: null,
    posicion: 2,
    titulo: '',
    imagenUrl: '',
    textoBoton: 'Ver más',
    enlaceUrl: '',
  };
  return [slot1, slot2];
}

/**
 * Guardar o actualizar banner por posición (POST o PUT /api/banners-home/{posicion})
 */
export async function saveBanner(posicion, bannerData) {
  const payload = {
    titulo: bannerData.titulo,
    imagenUrl: bannerData.imagenUrl,
    textoBoton: bannerData.textoBoton,
    enlaceUrl: bannerData.enlaceUrl,
    posicion: Number(posicion),
  };

  try {
    return await httpClient.put(`/banners-home/${posicion}`, payload);
  } catch (err) {
    // Si da 404 (no existe aún en esa posición), usar POST
    return await httpClient.post(`/banners-home/${posicion}`, payload);
  }
}

/**
 * Eliminar banner por posición (DELETE /api/banners-home/{posicion})
 */
export async function deleteBanner(posicion) {
  return await httpClient.delete(`/banners-home/${posicion}`);
}

export default {
  getHomeBanners,
  getAdminBanners,
  saveBanner,
  deleteBanner,
  normalizeBanner,
};

