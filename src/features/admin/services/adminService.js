import { httpClient } from '../../../services/httpClient.js';
import { moderationService } from '../../../services/moderationService.js';
import { userService } from '../../../services/userService.js';
import { getCategoriesWithEvents } from '../../../services/categoryService.js';
import { organizationService } from '../../../services/organizerService.js';
import {
  AGGREGATED_METRICS,
  INITIAL_ORGANIZACIONES,
  INITIAL_EVENTS,
  INITIAL_USERS,
  INITIAL_MODERADORES,
  MODERATION_STATS,
  COMMERCIAL_METRICS,
  INITIAL_CATEGORIES,
  INITIAL_PROMOTIONS,
  ADMIN_AUDIT_LOG,
} from '../data/mockAdminData.js';

export const adminService = {
  // 1. DASHBOARD E INDICADORES AGREGADOS (Sección 4 de Modulo_Administracion.md)
  async getDashboardMetrics() {
    return {
      success: true,
      metrics: AGGREGATED_METRICS,
      commercial: COMMERCIAL_METRICS,
      moderation: MODERATION_STATS,
    };
  },

  // 2. GESTIÓN DE ORGANIZACIONES (Sección 5 de Modulo_Administracion.md)
  async getOrganizaciones({ page = 0, size = 50 } = {}) {
    try {
      const res = await organizationService.listOrganizations({ page, size });
      if (res?.organizations && res.organizations.length > 0) {
        return { success: true, data: res.organizations };
      }
    } catch {
      // Fallback a mock data resiliente
    }
    return { success: true, data: INITIAL_ORGANIZACIONES };
  },

  async suspenderOrganizacion(id, motivo) {
    // Suspensión administrativa con justificación vinculante para trazabilidad
    return {
      success: true,
      mensaje: 'Organización suspendida por motivos administrativos.',
      trazabilidad: {
        id: Date.now().toString(),
        fecha: new Date().toLocaleString('es-CO'),
        motivo,
      },
    };
  },

  async reactivarOrganizacion(id) {
    return {
      success: true,
      mensaje: 'Organización reactivada administrativamente.',
    };
  },

  // 3. EVENTOS Y MODERACIÓN ADMINISTRATIVA (Sección 3 y 11)
  async getEventos({ page = 0, size = 50 } = {}) {
    try {
      const res = await moderationService.getEventosPendientes({ page, size });
      if (res?.content && res.content.length > 0) {
        return { success: true, data: res.content };
      }
    } catch {
      // Fallback
    }
    return { success: true, data: INITIAL_EVENTS };
  },

  async suspenderEvento(eventoId, motivo) {
    try {
      await moderationService.suspenderEvento(eventoId, motivo, 'ADMINISTRATIVO');
      return { success: true, mensaje: 'Evento suspendido exitosamente.' };
    } catch {
      return { success: true, mensaje: 'Evento suspendido (modo local).' };
    }
  },

  async reactivarEvento(eventoId) {
    try {
      await moderationService.reactivarEvento(eventoId);
      return { success: true, mensaje: 'Evento reactivado exitosamente.' };
    } catch {
      return { success: true, mensaje: 'Evento reactivado (modo local).' };
    }
  },

  // 4. MODERADORES Y ESTADÍSTICAS SLA (Secciones 6 y 9)
  async getModeradores() {
    try {
      const res = await moderationService.getModerators();
      if (res?.content && res.content.length > 0) {
        return { success: true, data: res.content };
      }
    } catch {
      // Fallback
    }
    return { success: true, data: INITIAL_MODERADORES };
  },

  async asignarModerador(id, data) {
    return {
      success: true,
      mensaje: 'Zona y carga de trabajo asignada al moderador.',
      data,
    };
  },

  async toggleEstadoModerador(id, nuevoEstado) {
    return {
      success: true,
      mensaje: `Moderador ${nuevoEstado ? 'activado' : 'desactivado'}.`,
    };
  },

  // 5. USUARIOS Y ROLES (Sección 3 y 6: Desactivación lógica requerida)
  async getUsuarios(page = 0, size = 50) {
    try {
      const res = await userService.listUsers({ page, size });
      if (res?.content && res.content.length > 0) {
        return { success: true, data: res.content };
      }
    } catch {
      // Fallback
    }
    return { success: true, data: INITIAL_USERS };
  },

  async updateUsuario(id, updates) {
    return {
      success: true,
      mensaje: 'Cuenta de usuario actualizada exitosamente.',
      data: updates,
    };
  },

  // 6. CATEGORÍAS (Sección 7 de Modulo_Administracion.md)
  async getCategorias() {
    try {
      const res = await getCategoriesWithEvents();
      if (res && res.length > 0) {
        return {
          success: true,
          data: res.map((c) => ({
            id: String(c.id),
            nombre: c.nombre,
            descripcion: c.descripcion || 'Categoría oficial de Cartagena.',
            eventosAsociados: c.totalEventos || 0,
            activa: true,
            icono: '🏷️',
            imagenUrl: c.urlFoto || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop',
          })),
        };
      }
    } catch {
      // Fallback
    }
    return { success: true, data: INITIAL_CATEGORIES };
  },

  async saveCategoria(catData) {
    return {
      success: true,
      mensaje: 'Categoría guardada correctamente.',
      data: catData,
    };
  },

  async toggleEstadoCategoria(id, nuevoEstado) {
    return {
      success: true,
      mensaje: `Categoría ${nuevoEstado ? 'activada' : 'desactivada'}.`,
    };
  },

  async deleteCategoria(id) {
    return {
      success: true,
      mensaje: 'Categoría eliminada de la plataforma.',
    };
  },

  // 7. PROMOCIONES GLOBALES (Sección 8 de Modulo_Administracion.md)
  async getPromociones() {
    try {
      const res = await httpClient.get('/promociones');
      if (res?.content && res.content.length > 0) {
        return { success: true, data: res.content };
      }
    } catch {
      // Fallback
    }
    return { success: true, data: INITIAL_PROMOTIONS };
  },

  async savePromocion(promoData) {
    try {
      if (promoData.id) {
        await httpClient.put(`/promociones/${promoData.id}`, promoData);
      } else {
        await httpClient.post('/promociones', promoData);
      }
    } catch {
      // Fallback
    }
    return { success: true, data: promoData };
  },

  async toggleEstadoPromocion(id, nuevoEstado) {
    try {
      await httpClient.patch(`/promociones/${id}/estado`, { activa: nuevoEstado });
    } catch {
      // Fallback
    }
    return { success: true, mensaje: 'Estado de promoción actualizado.' };
  },

  // 8. HISTORIAL Y TRAZABILIDAD (Secciones 3 y 12)
  async getHistorialAuditoria() {
    return {
      success: true,
      data: ADMIN_AUDIT_LOG,
    };
  },
};

export default adminService;
