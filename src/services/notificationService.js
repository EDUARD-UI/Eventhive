import { httpClient } from './httpClient.js';

export const notificationService = {
  /**
   * Obtiene la lista de notificaciones del usuario autenticado (GET /api/notificaciones).
   */
  async getNotificaciones() {
    try {
      const data = await httpClient.get('/notificaciones');
      return Array.isArray(data) ? data : data?.content || [];
    } catch (err) {
      console.warn('Error al obtener notificaciones:', err);
      return [];
    }
  },

  /**
   * Obtiene el conteo de notificaciones no leídas (GET /api/notificaciones/no-leidas).
   */
  async getNoLeidasCount() {
    try {
      const data = await httpClient.get('/notificaciones/no-leidas');
      return typeof data === 'number' ? data : Number(data) || 0;
    } catch {
      return 0;
    }
  },

  /**
   * Marca una notificación como leída (PUT /api/notificaciones/{id}/leer).
   */
  async marcarComoLeida(id) {
    try {
      await httpClient.put(`/notificaciones/${id}/leer`);
      return true;
    } catch (err) {
      console.warn(`Error al marcar notificación ${id} como leída:`, err);
      return false;
    }
  },

  /**
   * Elimina todas las notificaciones leídas (DELETE /api/notificaciones/limpiar).
   */
  async limpiarLeidas() {
    try {
      await httpClient.delete('/notificaciones/limpiar');
      return true;
    } catch (err) {
      console.warn('Error al limpiar notificaciones leídas:', err);
      return false;
    }
  },
};

export default notificationService;
