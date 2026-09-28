import { httpClient } from './httpClient.js';
import { normalizeEvent } from './eventService.js';

const normalizeOrganization = (organization) => ({
  ...organization,
  id: String(organization.id),
  name: organization.nombre || organization.razonSocial || 'Organización',
  category: organization.categoria?.nombre || organization.categoria || 'Organización',
  description: organization.descripcion || '',
  avatar: organization.logo || organization.imagen || organization.foto || null,
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

  async searchOrganizations(razonSocial, { page = 0, size = 12 } = {}) {
    try {
      const data = await httpClient.post('/organizaciones/buscar', { razonSocial }, { params: { page, size } });
      return { organizations: getPageContent(data), total: data?.totalElements ?? 0 };
    } catch {
      const all = await this.listOrganizations({ page: 0, size: 50 });
      const term = (razonSocial || '').toLowerCase();
      const filtered = all.organizations.filter(
        (o) =>
          o.name?.toLowerCase().includes(term) ||
          o.category?.toLowerCase().includes(term) ||
          o.description?.toLowerCase().includes(term)
      );
      return { organizations: filtered, total: filtered.length };
    }
  },

  async getOrganizationById(organizationId) {
    try {
      const data = await httpClient.get(`/organizaciones/${organizationId}`);
      if (data) return normalizeOrganization(data);
    } catch {
      // Ignorar para buscar en listas
    }

    try {
      const top = await this.listTopOrganizations({ page: 0, size: 50 });
      const foundTop = top.organizations.find((o) => String(o.id) === String(organizationId));
      if (foundTop) return foundTop;

      const all = await this.listOrganizations({ page: 0, size: 50 });
      return all.organizations.find((o) => String(o.id) === String(organizationId)) || null;
    } catch {
      return null;
    }
  },

  async getOrganizationEvents(organizationId, { page = 0, size = 50 } = {}) {
    // 1. Intentar endpoint directo GET /api/organizaciones/{id}/eventos
    try {
      const data = await httpClient.get(`/organizaciones/${organizationId}/eventos`, { page, size });
      const events = Array.isArray(data) ? data : data?.content || [];
      if (events.length > 0) return events.map(normalizeEvent);
    } catch {
      // Continuar al siguiente intento
    }

    // 2. Intentar GET /api/eventos con filtro por organizador
    try {
      const data = await httpClient.get('/eventos', { organizadorId: organizationId, page, size });
      const events = Array.isArray(data) ? data : data?.content || [];
      if (events.length > 0) return events.map(normalizeEvent);
    } catch {
      // Continuar al fallback
    }

    // 3. Fallback: traer eventos generales y filtrar los relacionados
    try {
      const data = await httpClient.get('/eventos', { page: 0, size: 100 });
      const allEvents = (data?.content || []).map(normalizeEvent);
      return allEvents.filter(
        (e) =>
          String(e.organization?.id) === String(organizationId) ||
          String(e.organizador?.id) === String(organizationId) ||
          String(e.organizadorId) === String(organizationId) ||
          String(e.organizacionId) === String(organizationId) ||
          (typeof e.organization === 'string' && e.organization.toLowerCase() === String(organizationId).toLowerCase())
      );
    } catch {
      return [];
    }
  },

  getMisCompras(params) {
    return organizerService.getMisCompras(params);
  },

  getBoletos(compraId) {
    return organizerService.getBoletos(compraId);
  },

  getDeseos(params) {
    return organizerService.getDeseos(params);
  },

  agregarDeseo(eventoId) {
    return organizerService.agregarDeseo(eventoId);
  },

  eliminarDeseo(eventoId) {
    return organizerService.eliminarDeseo(eventoId);
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

  /** PUT /api/organizaciones/mi-organizacion */
  updateMiOrganizacion(data) {
    return httpClient.put('/organizaciones/mi-organizacion', data);
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

