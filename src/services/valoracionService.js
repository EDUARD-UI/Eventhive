import { httpClient } from './httpClient.js';

export const valoracionService = {
  /**
   * Obtiene la lista paginada de valoraciones de una organización (GET /api/valoraciones/organizacion/{organizacionId}).
   */
  async getValoracionesOrganizacion(organizacionId, { page = 0, size = 10, sort = 'id,desc' } = {}) {
    try {
      const res = await httpClient.get(`/valoraciones/organizacion/${organizacionId}`, {
        page,
        size,
        sort,
      });
      const data = res?.data || res;
      const content = Array.isArray(data?.content) ? data.content : Array.isArray(data) ? data : [];
      return {
        content,
        totalElements: data?.totalElements ?? content.length,
        totalPages: data?.totalPages ?? 1,
        averageRating: data?.promedioRating ?? null,
      };
    } catch (err) {
      console.warn('Error al obtener valoraciones de la organización:', err);
      return { content: [], totalElements: 0, totalPages: 1, averageRating: null };
    }
  },

  /**
   * Crea una nueva valoración para una organización (POST /api/valoraciones).
   * @param {{ organizacionId: number|string, calificacion: number, comentario: string }} payload
   */
  async crearValoracion({ organizacionId, calificacion, comentario }) {
    return httpClient.post('/valoraciones', {
      organizacionId: Number(organizacionId),
      calificacion: Number(calificacion),
      comentario: (comentario || '').trim(),
    });
  },

  /**
   * Obtiene las valoraciones realizadas por el usuario cliente autenticado (GET /api/valoraciones/usuario).
   */
  async getMisValoraciones({ page = 0, size = 20 } = {}) {
    try {
      const res = await httpClient.get('/valoraciones/usuario', { page, size });
      const data = res?.data || res;
      return Array.isArray(data?.content) ? data.content : Array.isArray(data) ? data : [];
    } catch (err) {
      console.warn('Error al obtener valoraciones del usuario:', err);
      return [];
    }
  },
};

export default valoracionService;
