import { httpClient } from './httpClient.js';

export const normalizeBanner = (banner) => ({
  id: banner.id,
  titulo: banner.titulo || '',
  imagenUrl: banner.imagenUrl || banner.imagen || banner.foto || null,
  textoBoton: banner.textoBoton || 'Ver más',
  enlaceUrl: banner.enlaceUrl || '#',
  posicion: banner.posicion ?? 1,
});

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
