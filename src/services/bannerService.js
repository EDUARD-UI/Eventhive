import { httpClient } from './httpClient.js';
import { apiCache } from './cacheService.js';

export const normalizeBanner = (banner) => {
  let enlace = banner.enlaceUrl || '';

  const isImageFile = /\.(jpe?g|png|webp|gif|svg)(\?.*)?$/i.test(enlace);
  if (isImageFile || enlace === '#') enlace = '';

  // Si el backend devuelve una URL absoluta hacia un evento,
  // convertirlo a ruta interna de React Router para navegación SPA sin recargar
  const eventMatch = enlace.match(/\/eventos?\/(\d+)/i);
  if (eventMatch) {
    enlace = `/eventos/${eventMatch[1]}`;
  }

  return {
    id: banner.id,
    titulo: banner.titulo || '',
    imagenUrl: banner.imagenUrl || banner.imagen || banner.foto || null,
    textoBoton: banner.textoBoton || '',
    enlaceUrl: enlace,
    posicion: banner.posicion ?? 1,
  };
};

/**
 * Obtener banners activos del home (GET /api/banners-home).
 * Endpoint público que devuelve los banners configurados para las posiciones 1 y 2.
 */
export async function getHomeBanners() {
  return apiCache.fetchWithCache('home_banners_public', async () => {
    const res = await httpClient.get('/banners-home');
    const list = Array.isArray(res) ? res : res?.data || res?.content || [];
    return list.map(normalizeBanner).sort((a, b) => a.posicion - b.posicion);
  }, { ttlMs: 90000, staleWhileRevalidate: true });
}

/**
 * Obtener banners del home para administración (GET /api/banners-home/admin).
 * Devuelve exactamente los dos espacios administrativos (posiciones 1 y 2).
 */
export async function getAdminBanners() {
  try {
    const res = await httpClient.get('/banners-home/admin');
    const list = Array.isArray(res) ? res : res?.data || res?.content || [];
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
    if (err?.status !== 404) throw err;
  }

  // Fallback de compatibilidad para backends sin el endpoint administrativo.
  const publicBanners = await getHomeBanners();
  const slot1 = publicBanners.find((b) => Number(b.posicion) === 1) || {
    id: null,
    posicion: 1,
    titulo: '',
    imagenUrl: '',
    textoBoton: '',
    enlaceUrl: '',
  };
  const slot2 = publicBanners.find((b) => Number(b.posicion) === 2) || {
    id: null,
    posicion: 2,
    titulo: '',
    imagenUrl: '',
    textoBoton: '',
    enlaceUrl: '',
  };
  return [slot1, slot2];
}

/**
 * Guardar o actualizar banner por posición (POST o PUT /api/banners-home/{posicion})
 * Requiere multipart/form-data según especificación oficial del backend.
 */
export async function saveBanner(posicion, bannerData) {
  let body;
  if (bannerData instanceof FormData) {
    body = bannerData;
  } else {
    body = new FormData();
    body.append('posicion', Number(posicion));
    if (bannerData.titulo !== undefined && bannerData.titulo !== null) {
      body.append('titulo', bannerData.titulo);
    }
    if (bannerData.textoBoton !== undefined && bannerData.textoBoton !== null) {
      body.append('textoBoton', bannerData.textoBoton);
    }
    body.append('enlaceUrl', bannerData.enlaceUrl || '');
    if (bannerData.imagenFile instanceof File) {
      body.append('imagen', bannerData.imagenFile);
    } else if (bannerData.imagen instanceof File) {
      body.append('imagen', bannerData.imagen);
    }
  }

  const isExisting = Boolean(bannerData.id || bannerData.ocupado);

  if (isExisting) {
    try {
      return await httpClient.put(`/banners-home/${posicion}`, body, { isFormData: true });
    } catch (err) {
      if (err.status === 404) {
        return await httpClient.post(`/banners-home/${posicion}`, body, { isFormData: true });
      }
      throw err;
    }
  } else {
    try {
      return await httpClient.post(`/banners-home/${posicion}`, body, { isFormData: true });
    } catch (err) {
      if (err.status === 400 || err.status === 409) {
        return await httpClient.put(`/banners-home/${posicion}`, body, { isFormData: true });
      }
      throw err;
    }
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
