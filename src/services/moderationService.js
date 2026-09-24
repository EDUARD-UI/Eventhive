import { httpClient } from './httpClient.js';

export const moderationService = {
  /** GET /api/moderaciones/eventos/pendientes */
  getEventosPendientes({ page = 0, size = 10 } = {}) {
    return httpClient.get('/moderaciones/eventos/pendientes', { page, size });
  },

  /** PATCH /api/moderaciones/eventos/{eventoId}/aprobar */
  aprobarEvento(eventoId) {
    return httpClient.patch(`/moderaciones/eventos/${eventoId}/aprobar`);
  },

  /** PATCH /api/moderaciones/eventos/{eventoId}/rechazar */
  rechazarEvento(eventoId, observacion, motivo) {
    return httpClient.patch(`/moderaciones/eventos/${eventoId}/rechazar`, {
      observacion,
      motivo,
    });
  },

  /** PATCH /api/moderaciones/eventos/{eventoId}/solicitar-correccion */
  solicitarCorreccion(eventoId, observacion, motivo) {
    return httpClient.patch(
      `/moderaciones/eventos/${eventoId}/solicitar-correccion`,
      { observacion, motivo }
    );
  },

  /** PATCH /api/moderaciones/eventos/{eventoId}/suspender */
  suspenderEvento(eventoId, observacion, motivo) {
    return httpClient.patch(`/moderaciones/eventos/${eventoId}/suspender`, {
      observacion,
      motivo,
    });
  },

  /** PATCH /api/moderaciones/eventos/{eventoId}/reactivar */
  reactivarEvento(eventoId) {
    return httpClient.patch(`/moderaciones/eventos/${eventoId}/reactivar`);
  },

  /** GET /api/moderaciones/moderadores */
  getModerators({ page = 0, size = 10 } = {}) {
    return httpClient.get('/moderaciones/moderadores', { page, size });
  },

  /** PUT /api/moderaciones/moderadores/{moderadorId}/asignar */
  asignarModerador(moderadorId) {
    return httpClient.put(`/moderaciones/moderadores/${moderadorId}/asignar`);
  },

  /** PUT /api/moderaciones/moderadores/{moderadorId}/revocar */
  revocarModerador(moderadorId) {
    return httpClient.put(`/moderaciones/moderadores/${moderadorId}/revocar`);
  },

  /** GET /api/enums/motivos-rechazos */
  getMotivosRechazo() {
    return httpClient.get('/enums/motivos-rechazos');
  },
};

export default moderationService;
