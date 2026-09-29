import { httpClient } from './httpClient.js';

export const moderationService = {
  /** GET /api/moderaciones/estadisticas - Estadísticas reales del moderador */
  getEstadisticas() {
    return httpClient.get('/moderaciones/estadisticas');
  },

  /** GET /api/moderaciones/eventos/pendientes - Eventos pendientes de revisión */
  getEventosPendientes({ page = 0, size = 10 } = {}) {
    return httpClient.get('/moderaciones/eventos/pendientes', { page, size });
  },

  /** GET /api/moderaciones/eventos/{eventoId}/moderaciones - Historial de moderación */
  getHistorialModeracion(eventoId, { page = 0, size = 10 } = {}) {
    return httpClient.get(`/moderaciones/eventos/${eventoId}/moderaciones`, { page, size });
  },

  /** PATCH /api/moderaciones/eventos/{eventoId}/aprobar - Aprobar y publicar evento */
  aprobarEvento(eventoId) {
    return httpClient.patch(`/moderaciones/eventos/${eventoId}/aprobar`);
  },

  /** PATCH /api/moderaciones/eventos/{eventoId}/rechazar - Rechazar evento */
  rechazarEvento(eventoId, observacion, motivo) {
    return httpClient.patch(`/moderaciones/eventos/${eventoId}/rechazar`, {
      observacion,
      motivo,
    });
  },

  /** PATCH /api/moderaciones/eventos/{eventoId}/solicitar-correccion - Solicitar corrección */
  solicitarCorreccion(eventoId, observacion, motivo) {
    return httpClient.patch(
      `/moderaciones/eventos/${eventoId}/solicitar-correccion`,
      { observacion, motivo }
    );
  },

  /** PATCH /api/moderaciones/eventos/{eventoId}/suspender - Suspender evento (Admin) */
  suspenderEvento(eventoId, observacion, motivo) {
    return httpClient.patch(`/moderaciones/eventos/${eventoId}/suspender`, {
      observacion,
      motivo,
    });
  },

  /** PATCH /api/moderaciones/eventos/{eventoId}/reactivar - Reactivar evento (Admin) */
  reactivarEvento(eventoId) {
    return httpClient.patch(`/moderaciones/eventos/${eventoId}/reactivar`);
  },

  /** GET /api/moderaciones/moderadores - Lista de moderadores (Admin) */
  getModerators({ page = 0, size = 10 } = {}) {
    return httpClient.get('/moderaciones/moderadores', { page, size });
  },

  /** PUT /api/moderaciones/moderadores/{moderadorId}/asignar - Asignar moderador (Admin) */
  asignarModerador(moderadorId) {
    return httpClient.put(`/moderaciones/moderadores/${moderadorId}/asignar`);
  },

  /** PUT /api/moderaciones/moderadores/{moderadorId}/revocar - Revocar moderador (Admin) */
  revocarModerador(moderadorId) {
    return httpClient.put(`/moderaciones/moderadores/${moderadorId}/revocar`);
  },

  /** GET /api/enums/motivos-rechazos - Motivos de rechazo/corrección del sistema */
  getMotivosRechazo() {
    return httpClient.get('/enums/motivos-rechazos');
  },

  /** GET /api/eventos/admin/buscar - Búsqueda avanzada de eventos (Moderador/Admin) */
  buscarEventosModeracion({ titulo, categoriaId, estado, page = 0, size = 10 } = {}) {
    const params = { page, size };
    if (titulo && String(titulo).trim()) params.titulo = String(titulo).trim();
    if (categoriaId) params.categoriaId = categoriaId;
    if (estado && estado !== 'TODOS') params.estado = estado;
    return httpClient.get('/eventos/admin/buscar', params);
  },

  /** GET /api/eventos/admin/{id} o /api/eventos/{id} - Detalle completo de evento */
  async getEventoDetalle(eventoId) {
    try {
      return await httpClient.get(`/eventos/admin/${eventoId}`);
    } catch {
      return await httpClient.get(`/eventos/${eventoId}`);
    }
  },

  /** GET /api/eventos/{eventoId}/localidades - Localidades y aforo real del evento */
  getLocalidades(eventoId) {
    return httpClient.get(`/eventos/${eventoId}/localidades`);
  },

  /** GET /api/verificacion/pendientes - Solicitudes de verificación de organizaciones */
  getSolicitudesOrganizaciones({ page = 0, size = 10 } = {}) {
    return httpClient.get('/verificacion/pendientes', { page, size });
  },

  /** PUT /api/verificacion/{solicitudId}/aprobar - Aprobar verificación */
  aprobarOrganizacion(solicitudId) {
    return httpClient.put(`/verificacion/${solicitudId}/aprobar`);
  },

  /** PUT /api/verificacion/{solicitudId}/rechazar - Rechazar verificación */
  rechazarOrganizacion(solicitudId, motivo) {
    return httpClient.put(`/verificacion/${solicitudId}/rechazar`, null, {
      params: { motivo },
    });
  },

  /** PATCH /api/verificacion/{solicitudId}/solicitar-correccion - Solicitar corrección */
  solicitarCorreccionOrganizacion(solicitudId, motivo) {
    return httpClient.patch(
      `/verificacion/${solicitudId}/solicitar-correccion`,
      null,
      { params: { motivo } }
    );
  },
};

export default moderationService;
