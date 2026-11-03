import { httpClient } from './httpClient.js';
import { normalizeEvent } from './eventService.js';

const getPathId = (value, label = 'Identificador') => {
  const id = value && typeof value === 'object' ? value.id : value;
  if ((typeof id !== 'string' && typeof id !== 'number') || String(id).trim() === '') {
    throw new TypeError(`${label} inválido.`);
  }
  return encodeURIComponent(String(id));
};

const normalizeOrganization = (organization) => ({
  ...organization,
  id: String(organization.id),
  name: organization.razonSocial || organization.nombre || 'Organización',
  razonSocial: organization.razonSocial || organization.nombre || 'Organización',
  category: organization.categoria?.nombre || organization.categoria || '',
  description: organization.descripcion || '',
  avatar:
    organization.urlLogo ||
    organization.imagenPerfil ||
    organization.logo ||
    organization.imagen ||
    organization.foto ||
    null,
  representante: organization.representante || organization.nombreRepresentante || '',
  verified: organization.estado === 'VERIFICADA' || organization.estado === 'APROBADA',
  rating: organization.promedioRating ?? organization.valoracion ?? organization.rating ?? null,
  eventsCount: organization.totalEventosCreados ?? organization.eventosCount ?? organization.cantidadEventos ?? 0,
  followers: organization.totalSeguidores ?? organization.seguidoresCount ?? organization.seguidores ?? 0,
  targetCategory: organization.categoria?.nombre || organization.categoria || '',
});

const getPageContent = (data) => {
  const content = data?.data?.content || data?.content || (Array.isArray(data) ? data : []);
  return content.map(normalizeOrganization);
};

const getTotalElements = (data) =>
  data?.data?.totalElements ?? data?.totalElements ?? (Array.isArray(data) ? data.length : 0);

const getOrganizerEvents = async ({ page = 0, size = 50 } = {}) => {
  const data = await httpClient.get('/eventos/organizador', { page, size });
  return data?.content || [];
};

const createOrganizerEvent = (formData) =>
  httpClient.post('/eventos', formData, { isFormData: true });

export const organizationService = {
  async listOrganizations({ page = 0, size = 5, estado, skipAuth = false } = {}) {
    const params = { page, size };
    if (estado && estado !== 'TODOS') {
      params.estado = estado;
    }
    const data = await httpClient.get('/organizaciones', params, { skipAuth });
    return { organizations: getPageContent(data), total: getTotalElements(data) };
  },

  async listTopOrganizations({ page = 0, size = 4 } = {}) {
    const data = await httpClient.get('/organizaciones/top', { page, size });
    return { organizations: getPageContent(data), total: data?.totalElements ?? 0 };
  },

  async searchOrganizations(razonSocial, { page = 0, size = 5 } = {}) {
    try {
      const data = await httpClient.post('/organizaciones/buscar', { razonSocial }, {
        params: { page, size },
        skipAuth: true,
      });
      return { organizations: getPageContent(data), total: getTotalElements(data) };
    } catch {
      const all = await this.listOrganizations({ page: 0, size: 50, skipAuth: true });
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
      const data = await httpClient.get(
        `/organizaciones/${getPathId(organizationId, 'Organización')}`
      );
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

  async followOrganization(organizationId) {
    const id = getPathId(organizationId, 'Organización');
    try {
      return await httpClient.post(`/seguidores/${id}/seguir`);
    } catch (error) {
      if (error.status === 400) {
        const ownOrgError = new Error('No puedes seguir a tu propia organización.');
        ownOrgError.status = error.status;
        throw ownOrgError;
      }
      throw error;
    }
  },

  async unfollowOrganization(organizationId) {
    const id = getPathId(organizationId, 'Organización');
    try {
      return await httpClient.delete(`/seguidores/${id}/seguir`);
    } catch (error) {
      if (error.status === 404) return null;
      throw error;
    }
  },

  async isFollowingOrganization(organizationId) {
    const id = getPathId(organizationId, 'Organización');
    try {
      const data = await httpClient.get(`/seguidores/${id}/siguiendo`);
      if (typeof data === 'boolean') return data;
      return Boolean(data?.siguiendo ?? data?.isFollowing ?? data?.estaSiguiendo);
    } catch (error) {
      if (error.status === 404) return false;
      throw error;
    }
  },

  async getOrganizacionesSeguidas({ page = 0, size = 50 } = {}) {
    try {
      const data = await httpClient.get('/seguidores/mis-seguidos', { page, size });
      const items = Array.isArray(data) ? data : data?.content || data?.data?.content || data?.data || [];
      if (items.length > 0) return items.map(normalizeOrganization);
    } catch {}

    try {
      const data = await httpClient.get('/seguidores/siguiendo', { page, size });
      const items = Array.isArray(data) ? data : data?.content || data?.data?.content || data?.data || [];
      if (items.length > 0) return items.map(normalizeOrganization);
    } catch {}

    try {
      const data = await httpClient.get('/organizaciones/seguidas', { page, size });
      const items = Array.isArray(data) ? data : data?.content || data?.data?.content || data?.data || [];
      if (items.length > 0) return items.map(normalizeOrganization);
    } catch {}

    return [];
  },

  async getOrganizationEvents(organizationId, { page = 0, size = 50 } = {}) {
    // 1. Intentar endpoint directo GET /api/organizaciones/{id}/eventos
    try {
      const data = await httpClient.get(
        `/organizaciones/${getPathId(organizationId, 'Organización')}/eventos`,
        { page, size }
      );
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
    return httpClient.put(`/eventos/${getPathId(id, 'Evento')}`, formData, { isFormData: true });
  },

  /** PATCH /api/eventos/{id}/cancelar */
  cancelarEvento(id) {
    return httpClient.patch(`/eventos/${getPathId(id, 'Evento')}/cancelar`);
  },

  /** PATCH /api/eventos/{id}/enviar-revision */
  enviarRevision(id) {
    return httpClient.patch(`/eventos/${getPathId(id, 'Evento')}/enviar-revision`);
  },

  /** PATCH /api/eventos/{id}/retirar */
  retirarEvento(id) {
    return httpClient.patch(`/eventos/${getPathId(id, 'Evento')}/retirar`);
  },

  /** PATCH /api/eventos/{id}/reabrir */
  reabrirEvento(id) {
    return httpClient.patch(`/eventos/${getPathId(id, 'Evento')}/reabrir`);
  },

  /** DELETE /api/eventos/{id} */
  eliminarEvento(id) {
    return httpClient.delete(`/eventos/${getPathId(id, 'Evento')}`);
  },

  /** GET /api/eventos/organizador/{id} */
  getEventoDetalle(id) {
    return httpClient.get(`/eventos/organizador/${getPathId(id, 'Evento')}`);
  },

  /** POST /api/eventos/{eventoId}/localidades */
  agregarLocalidad(eventoId, localidadData) {
    return httpClient.post(
      `/eventos/${getPathId(eventoId, 'Evento')}/localidades`,
      localidadData
    );
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

  /** POST /api/organizaciones/invitar */
  invitarOperador(correo) {
    const correoTrimmed = (correo || '').trim();
    return httpClient.post(
      '/organizaciones/invitar',
      { correo: correoTrimmed, rol: 'OPERADOR' },
      { params: { correo: correoTrimmed } }
    );
  },

  /** DELETE /api/organizaciones/expulsar-operador/{operadorId} */
  expulsarOperador(operadorId) {
    return httpClient.delete(
      `/organizaciones/expulsar-operador/${getPathId(operadorId, 'Operador')}`
    );
  },

  /** PATCH /api/organizaciones/operadores/{operadorId}/actualizar-permisos */
  actualizarPermisosOperador(operadorId, permisos) {
    return httpClient.patch(
      `/organizaciones/operadores/${getPathId(operadorId, 'Operador')}/actualizar-permisos`,
      { permisos: Array.isArray(permisos) ? permisos : Array.from(permisos || []) }
    );
  },

  /** POST /api/compras/eventos/{eventoId}/posicionamiento/pagos */
  iniciarPagoPosicionamiento(eventoId) {
    return httpClient.post(
      `/compras/eventos/${getPathId(eventoId, 'Evento')}/posicionamiento/pagos`
    );
  },

  /** GET /api/compras/posicionamiento/pagos/{pagoId} */
  getPagoPosicionamiento(pagoId) {
    return httpClient.get(`/compras/posicionamiento/pagos/${getPathId(pagoId, 'Pago')}`);
  },

  /** PATCH /api/compras/posicionamiento/pagos/{pagoId}/confirmar-simulado */
  confirmarPagoSimulado(pagoId) {
    return httpClient.patch(
      `/compras/posicionamiento/pagos/${getPathId(pagoId, 'Pago')}/confirmar-simulado`
    );
  },

  /** POST /api/promociones/eventos/{eventoId}/posicionar */
  posicionarEvento(eventoId, urlImagenDestacado) {
    return httpClient.post(
      `/promociones/eventos/${getPathId(eventoId, 'Evento')}/posicionar`,
      { urlImagenDestacado }
    );
  },

  /** DELETE /api/promociones/eventos/{eventoId}/posicionar */
  quitarPosicionamiento(eventoId) {
    return httpClient.delete(
      `/promociones/eventos/${getPathId(eventoId, 'Evento')}/posicionar`
    );
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
    return httpClient.get(`/boletos/${getPathId(compraId, 'Compra')}`);
  },

  /** GET /api/deseos — lista de deseos paginada */
  getDeseos({ page = 0, size = 10 } = {}) {
    return httpClient.get('/deseos', { page, size });
  },

  /** POST /api/deseos/{eventoId} */
  agregarDeseo(eventoId) {
    return httpClient.post(`/deseos/${getPathId(eventoId, 'Evento')}`);
  },

  /** DELETE /api/deseos/{eventoId} */
  eliminarDeseo(eventoId) {
    return httpClient.delete(`/deseos/${getPathId(eventoId, 'Evento')}`);
  },

  /** GET /api/verificacion/mis-solicitudes */
  async getMiSolicitudVerificacion() {
    const res = await httpClient.get('/verificacion/mis-solicitudes');
    return Array.isArray(res) ? (res[0] || null) : (res || null);
  },

  /** PATCH /api/verificacion/{solicitudId}/reenviar (multipart con 'datos' JSON y 'rut' opcional) */
  reenviarSolicitudVerificacion(solicitudId, formData) {
    return httpClient.patch(`/verificacion/${getPathId(solicitudId, 'Solicitud')}/reenviar`, formData, { isFormData: true });
  },

  /** Subir RUT asociándolo a la solicitud activa del organizador */
  async solicitarVerificacion(formData) {
    const solicitud = await this.getMiSolicitudVerificacion();
    const solId = solicitud?.id || (Array.isArray(solicitud) ? solicitud[0]?.id : null);
    if (solId) {
      return this.subirRut(solId, formData);
    }
    throw new Error('No se encontró una solicitud de verificación activa para asociar el RUT.');
  },

  /** PATCH /api/verificacion/{solicitudId}/subir-rut (multipart con archivo 'rut') */
  subirRut(solicitudId, formData) {
    return httpClient.patch(`/verificacion/${getPathId(solicitudId, 'Solicitud')}/subir-rut`, formData, {
      isFormData: true,
    });
  },

  /** GET /api/organizaciones/{orgId}/rut-url - Consulta segura de URL temporal del RUT */
  getRutUrl(orgId) {
    return httpClient.get(`/organizaciones/${getPathId(orgId, 'Organización')}/rut-url`);
  },

  /** GET /api/verificacion/{solicitudId}/rut-url - Consulta segura de URL temporal del RUT */
  getSolicitudRut(solicitudId) {
    return httpClient.get(
      `/verificacion/${getPathId(solicitudId, 'Solicitud')}/rut-url`
    );
  },
};

export default organizationService;
