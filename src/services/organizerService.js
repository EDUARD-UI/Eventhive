import { httpClient } from './httpClient.js';

const normalizeOrganization = (organization) => ({
  ...organization,
  id: String(organization.id),
  name: organization.nombre,
  category: organization.categoria?.nombre || organization.categoria || 'Organización',
  description: organization.descripcion || 'Organización de eventos en EventHive.',
  avatar: organization.logo || organization.imagen,
  verified: organization.estado === 'VERIFICADA',
  rating: organization.valoracion ?? organization.rating ?? null,
  eventsCount: organization.eventosCount ?? organization.cantidadEventos ?? 0,
  followers: organization.seguidoresCount ?? organization.seguidores ?? 0,
  targetCategory: organization.categoria?.nombre || organization.categoria || '',
});

const getPageContent = (data) => (data?.content || []).map(normalizeOrganization);

const getOrganizerEvents = async ({ page = 0, size = 50 } = {}) => {
  const data = await httpClient.get('/eventos/organizador', { page, size });
  return data?.content || [];
};

const createOrganizerEvent = (formData) =>
  httpClient.post('/eventos', formData, { isFormData: true });

export const organizationService = {
  async listOrganizations({ page = 0, size = 12 } = {}) {
    const data = await httpClient.get('/organizaciones', { page, size });
    return { organizations: getPageContent(data), total: data?.totalElements ?? 0 };
  },

  async listTopOrganizations({ page = 0, size = 4 } = {}) {
    const data = await httpClient.get('/organizaciones/top', { page, size });
    return { organizations: getPageContent(data), total: data?.totalElements ?? 0 };
  },

  async getOrganizationById(organizationId) {
    const data = await httpClient.get(`/organizaciones/${organizationId}`);
    return data ? normalizeOrganization(data) : null;
  },
};

export const organizerService = {
  async getDashboardSummary() {
    try {
      const data = await httpClient.get('/eventos/organizador', { page: 0, size: 100 });
      const events = data?.content || [];
      const activos = events.filter((e) => e.estado === 'PUBLICADO').length;
      return {
        eventsActive: activos,
        ticketsSold: 0,
        income: '$0',
        attendees: 0,
      };
    } catch {
      return { eventsActive: 0, ticketsSold: 0, income: '$0', attendees: 0 };
    }
  },

  /** GET /api/organizaciones/mi-organizacion */
  getMiOrganizacion() {
    return httpClient.get('/organizaciones/mi-organizacion');
  },

  /** GET /api/eventos/organizador — paginated list of organizer events */
  async getEventosOrganizador({ page = 0, size = 50 } = {}) {
    return getOrganizerEvents({ page, size });
  },

  /** Alias en inglés para mantener compatibilidad con consumidores existentes. */
  async listEvents({ page = 0, size = 50 } = {}) {
    return getOrganizerEvents({ page, size });
  },

  /** GET /api/eventos/organizador/buscar */
  buscarEventosOrganizador({ titulo, page = 0, size = 10 } = {}) {
    return httpClient.get('/eventos/organizador/buscar', { titulo, page, size });
  },

  /** POST /api/eventos — multipart/form-data */
  crearEvento(formData) {
    return createOrganizerEvent(formData);
  },

  /** Alias en inglés para mantener compatibilidad con consumidores existentes. */
  createEvent(formData) {
    return createOrganizerEvent(formData);
  },

  /** PUT /api/eventos/{id} — multipart/form-data */
  editarEvento(id, formData) {
    return httpClient.put(`/eventos/${id}`, formData, { isFormData: true });
  },

  /** PATCH /api/eventos/{id}/cancelar */
  cancelarEvento(id) {
    return httpClient.patch(`/eventos/${id}/cancelar`);
  },

  /** DELETE /api/eventos/{id} */
  eliminarEvento(id) {
    return httpClient.delete(`/eventos/${id}`);
  },

  /** GET /api/eventos/organizador/{id} */
  getEventoDetalle(id) {
    return httpClient.get(`/eventos/organizador/${id}`);
  },

  /** GET /api/compras — mis compras paginadas */
  getMisCompras({ page = 0, size = 10 } = {}) {
    return httpClient.get('/compras', { page, size });
  },

  /** GET /api/boletos/{compraId} */
  getBoletos(compraId) {
    return httpClient.get(`/boletos/${compraId}`);
  },

  /** GET /api/deseos — lista de deseos paginada */
  getDeseos({ page = 0, size = 10 } = {}) {
    return httpClient.get('/deseos', { page, size });
  },

  /** POST /api/deseos/{eventoId} */
  agregarDeseo(eventoId) {
    return httpClient.post(`/deseos/${eventoId}`);
  },

  /** DELETE /api/deseos/{eventoId} */
  eliminarDeseo(eventoId) {
    return httpClient.delete(`/deseos/${eventoId}`);
  },
};

export default organizationService;

