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
  async listOrganizations({ page = 0, size = 12, estado } = {}) {
    const params = { page, size };
    if (estado && estado !== 'TODOS') {
      params.estado = estado;
    }
    const data = await httpClient.get('/organizaciones', params);
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

  getCategorias() {
    return organizerService.getCategorias();
  },
};

export const organizerService = {
  /** GET /api/categorias */
  getCategorias() {
    return httpClient.get('/categorias');
  },

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

  /** PUT /api/organizaciones/mi-organizacion — multipart/form-data with optional image */
  updateMiOrganizacion(formData) {
    if (formData instanceof FormData) {
      return httpClient.put('/organizaciones/mi-organizacion', formData, { isFormData: true });
    }
    // Legacy: plain JSON body (wrap in FormData with 'datos' part)
    const fd = new FormData();
    fd.append('datos', new Blob([JSON.stringify(formData)], { type: 'application/json' }));
    return httpClient.put('/organizaciones/mi-organizacion', fd, { isFormData: true });
  },

  /** GET /api/eventos/organizador — returns content array only (backwards compatible) */
  async getEventosOrganizador({ page = 0, size = 50 } = {}) {
    return getOrganizerEvents({ page, size });
  },

  /** GET /api/eventos/organizador — returns full paged response object */
  async getEventosOrganizadorPaginated({ page = 0, size = 10 } = {}) {
    return httpClient.get('/eventos/organizador', { page, size });
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

  /** PATCH /api/eventos/{id}/enviar-revision */
  enviarRevision(id) {
    return httpClient.patch(`/eventos/${id}/enviar-revision`);
  },

  /** PATCH /api/eventos/{id}/retirar */
  retirarEvento(id) {
    return httpClient.patch(`/eventos/${id}/retirar`);
  },

  /** PATCH /api/eventos/{id}/reabrir */
  reabrirEvento(id) {
    return httpClient.patch(`/eventos/${id}/reabrir`);
  },

  /** DELETE /api/eventos/{id} */
  eliminarEvento(id) {
    return httpClient.delete(`/eventos/${id}`);
  },

  /** GET /api/eventos/organizador/{id} */
  getEventoDetalle(id) {
    return httpClient.get(`/eventos/organizador/${id}`);
  },

  /** POST /api/eventos/{eventoId}/localidades */
  agregarLocalidad(eventoId, localidadData) {
    return httpClient.post(`/eventos/${eventoId}/localidades`, localidadData);
  },

  /** GET /api/organizaciones/mi-organizacion/estadisticas */
  getEstadisticasMiOrganizacion({ page = 0, size = 10 } = {}) {
    return httpClient.get('/organizaciones/mi-organizacion/estadisticas', { page, size });
  },

  /** GET /api/organizaciones/mis-operadores */
  getMisOperadores({ page = 0, size = 10 } = {}) {
    return httpClient.get('/organizaciones/mis-operadores', { page, size });
  },

  /** GET /api/organizaciones/invitaciones-enviadas */
  getInvitacionesEnviadas({ page = 0, size = 10 } = {}) {
    return httpClient.get('/organizaciones/invitaciones-enviadas', { page, size });
  },

  /** POST /api/organizaciones/invitar?correo=... */
  invitarOperador(correo) {
    return httpClient.post('/organizaciones/invitar', null, { params: { correo } });
  },

  /** DELETE /api/organizaciones/expulsar-operador/{operadorId} */
  expulsarOperador(operadorId) {
    return httpClient.delete(`/organizaciones/expulsar-operador/${operadorId}`);
  },

  /** PATCH /api/organizaciones/operadores/{operadorId}/actualizar-permisos */
  actualizarPermisosOperador(operadorId, permisos) {
    return httpClient.patch(`/organizaciones/operadores/${operadorId}/actualizar-permisos`, {
      permisos: Array.isArray(permisos) ? permisos : Array.from(permisos || []),
    });
  },

  /** POST /api/compras/eventos/{eventoId}/posicionamiento/pagos */
  iniciarPagoPosicionamiento(eventoId) {
    return httpClient.post(`/compras/eventos/${eventoId}/posicionamiento/pagos`);
  },

  /** GET /api/compras/posicionamiento/pagos/{pagoId} */
  getPagoPosicionamiento(pagoId) {
    return httpClient.get(`/compras/posicionamiento/pagos/${pagoId}`);
  },

  /** PATCH /api/compras/posicionamiento/pagos/{pagoId}/confirmar-simulado */
  confirmarPagoSimulado(pagoId) {
    return httpClient.patch(`/compras/posicionamiento/pagos/${pagoId}/confirmar-simulado`);
  },

  /** POST /api/promociones/eventos/{eventoId}/posicionar */
  posicionarEvento(eventoId, urlImagenDestacado) {
    return httpClient.post(`/promociones/eventos/${eventoId}/posicionar`, { urlImagenDestacado });
  },

  /** DELETE /api/promociones/eventos/{eventoId}/posicionar */
  quitarPosicionamiento(eventoId) {
    return httpClient.delete(`/promociones/eventos/${eventoId}/posicionar`);
  },

  /** POST /api/compras — crear compra con idempotencyKey e items */
  crearCompra(compraData) {
    return httpClient.post('/compras', compraData);
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

