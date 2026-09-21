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
    return {
      eventsActive: 8,
      ticketsSold: 3412,
      income: '$187M',
      attendees: 5098,
    };
  },

  async listEvents() {
    return [];
  },

  async createEvent(payload) {
    return {
      id: Date.now(),
      ...payload,
      createdAt: new Date().toISOString(),
    };
  },
};

export default organizationService;

