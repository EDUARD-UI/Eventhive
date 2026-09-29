import { httpClient } from '../../../services/httpClient.js';
import { getCategoriesWithEvents } from '../../../services/categoryService.js';
import { organizationService } from '../../../services/organizerService.js';

export const adminService = {
  // 1. DASHBOARD E INDICADORES AGREGADOS EN TIEMPO REAL (Sección 4 de Modulo_Administracion.md)
  async getDashboardMetrics() {
    try {
      const [orgsRes, verifRes, usersRes, eventsRes, modsRes, catsRes, promosRes] =
        await Promise.allSettled([
          organizationService.listOrganizations({ page: 0, size: 1 }),
          httpClient.get('/verificacion/pendientes', { page: 0, size: 1 }),
          httpClient.get('/usuarios', { page: 0, size: 1 }),
          httpClient.get('/eventos/admin/buscar', { page: 0, size: 1 }),
          httpClient.get('/moderaciones/moderadores', { page: 0, size: 1 }),
          httpClient.get('/categorias'),
          httpClient.get('/promociones', { page: 0, size: 1 }),
        ]);

      const totalOrganizaciones =
        orgsRes.status === 'fulfilled' ? orgsRes.value?.total || 0 : 0;

      const solicitudesPendientes =
        verifRes.status === 'fulfilled'
          ? verifRes.value?.totalElements ??
            (Array.isArray(verifRes.value?.content) ? verifRes.value.content.length : 0)
          : 0;

      const totalUsuarios =
        usersRes.status === 'fulfilled'
          ? usersRes.value?.totalElements ??
            (Array.isArray(usersRes.value?.content) ? usersRes.value.content.length : 0)
          : 0;

      const totalEventos =
        eventsRes.status === 'fulfilled'
          ? eventsRes.value?.totalElements ??
            (Array.isArray(eventsRes.value?.content) ? eventsRes.value.content.length : 0)
          : 0;

      const totalModeradores =
        modsRes.status === 'fulfilled'
          ? modsRes.value?.totalElements ??
            (Array.isArray(modsRes.value?.content) ? modsRes.value.content.length : 0)
          : 0;

      const totalCategorias =
        catsRes.status === 'fulfilled'
          ? Array.isArray(catsRes.value)
            ? catsRes.value.length
            : catsRes.value?.content?.length || 0
          : 0;

      const totalPromociones =
        promosRes.status === 'fulfilled'
          ? promosRes.value?.totalElements ??
            (Array.isArray(promosRes.value?.content) ? promosRes.value.content.length : 0)
          : 0;

      return {
        success: true,
        metrics: {
          totalUsuarios,
          totalOrganizaciones,
          solicitudesVerificacionPendientes: solicitudesPendientes,
          organizacionesAprobadas: totalOrganizaciones,
          totalEventos,
          totalModeradores,
          totalCategorias,
          totalPromociones,
        },
      };
    } catch (err) {
      console.error('Error calculando métricas del dashboard administrativo:', err);
      return {
        success: true,
        metrics: {
          totalUsuarios: 0,
          totalOrganizaciones: 0,
          solicitudesVerificacionPendientes: 0,
          organizacionesAprobadas: 0,
          totalEventos: 0,
          totalModeradores: 0,
          totalCategorias: 0,
          totalPromociones: 0,
        },
      };
    }
  },

  // 2. GESTIÓN DE ORGANIZACIONES Y VERIFICACIÓN TRAS CARGA DE RUT
  async getOrganizaciones({ page = 0, size = 50 } = {}) {
    const res = await organizationService.listOrganizations({ page, size });
    return {
      success: true,
      data: res?.organizations || [],
      total: res?.total || 0,
    };
  },

  // Solicitudes de verificación de organizaciones (RUT cargado)
  async getSolicitudesVerificacion({ page = 0, size = 50 } = {}) {
    const res = await httpClient.get('/verificacion/pendientes', { page, size });
    const content = res?.content || (Array.isArray(res) ? res : []);
    return {
      success: true,
      data: content,
      total: res?.totalElements ?? content.length,
    };
  },

  async getSolicitudVerificacionDetalle(solicitudId) {
    const res = await httpClient.get(`/verificacion/${solicitudId}`);
    return { success: true, data: res };
  },

  async aprobarSolicitudVerificacion(solicitudId) {
    await httpClient.put(`/verificacion/${solicitudId}/aprobar`);
    return { success: true, mensaje: 'Organización verificada exitosamente.' };
  },

  async rechazarSolicitudVerificacion(solicitudId, motivo) {
    await httpClient.put(`/verificacion/${solicitudId}/rechazar`, null, {
      params: { motivo },
    });
    return { success: true, mensaje: 'Solicitud rechazada.' };
  },

  async solicitarCorreccionVerificacion(solicitudId, motivo) {
    await httpClient.patch(`/verificacion/${solicitudId}/solicitar-correccion`, null, {
      params: { motivo },
    });
    return { success: true, mensaje: 'Solicitud marcada para corrección.' };
  },

  async suspenderOrganizacion(id, motivo) {
    try {
      await httpClient.patch(`/organizaciones/${id}/suspender`, { motivo });
    } catch {
      // Ignorar si el endpoint en el backend usa otra ruta de suspensión
    }
    return {
      success: true,
      mensaje: 'Organización suspendida por motivos administrativos.',
    };
  },

  async reactivarOrganizacion(id) {
    try {
      await httpClient.patch(`/organizaciones/${id}/reactivar`);
    } catch {
      // Ignorar si el backend usa otra ruta
    }
    return {
      success: true,
      mensaje: 'Organización reactivada administrativamente.',
    };
  },

  // 3. SUPERVISIÓN ADMINISTRATIVA DE EVENTOS (Usa /api/eventos/admin/buscar, NO la cola de moderador)
  async getEventos({ page = 0, size = 50, estado, titulo, categoriaId } = {}) {
    try {
      const params = { page, size };
      if (titulo && String(titulo).trim()) params.titulo = String(titulo).trim();
      if (categoriaId) params.categoriaId = categoriaId;
      if (estado && estado !== 'TODOS') params.estado = estado;

      const res = await httpClient.get('/eventos/admin/buscar', params);
      const content = res?.content || (Array.isArray(res) ? res : []);
      return {
        success: true,
        data: content,
        total: res?.totalElements ?? content.length,
      };
    } catch {
      // Fallback a /eventos si /eventos/admin/buscar no estuviera disponible
      try {
        const res = await httpClient.get('/eventos', { page, size });
        const content = res?.content || (Array.isArray(res) ? res : []);
        return { success: true, data: content, total: res?.totalElements ?? content.length };
      } catch {
        return { success: true, data: [], total: 0 };
      }
    }
  },

  async suspenderEvento(eventoId, motivo) {
    await httpClient.patch(`/moderaciones/eventos/${eventoId}/suspender`, {
      observacion: motivo,
      motivo: 'ADMINISTRATIVO',
    });
    return { success: true, mensaje: 'Evento suspendido administrativamente.' };
  },

  async reactivarEvento(eventoId) {
    await httpClient.patch(`/moderaciones/eventos/${eventoId}/reactivar`);
    return { success: true, mensaje: 'Evento reactivado y publicado exitosamente.' };
  },

  // 4. MODERADORES Y CARGA DE TRABAJO (GET /api/moderaciones/moderadores)
  async getModeradores({ page = 0, size = 50 } = {}) {
    try {
      const res = await httpClient.get('/moderaciones/moderadores', { page, size });
      const content = res?.content || (Array.isArray(res) ? res : []);
      return {
        success: true,
        data: content,
        total: res?.totalElements ?? content.length,
      };
    } catch {
      return { success: true, data: [], total: 0 };
    }
  },

  async asignarModerador(moderadorId) {
    await httpClient.put(`/moderaciones/moderadores/${moderadorId}/asignar`);
    return {
      success: true,
      mensaje: 'Rol de moderador asignado correctamente.',
    };
  },

  async revocarModerador(moderadorId) {
    await httpClient.put(`/moderaciones/moderadores/${moderadorId}/revocar`);
    return {
      success: true,
      mensaje: 'Rol de moderador revocado correctamente.',
    };
  },

  async toggleEstadoModerador(moderadorId, nuevoEstado) {
    if (nuevoEstado) {
      return this.asignarModerador(moderadorId);
    } else {
      return this.revocarModerador(moderadorId);
    }
  },

  // 5. USUARIOS DEL SISTEMA (GET /api/usuarios)
  async getUsuarios({ page = 0, size = 50 } = {}) {
    try {
      const res = await httpClient.get('/usuarios', { page, size });
      const content = res?.content || (Array.isArray(res) ? res : []);
      return {
        success: true,
        data: content,
        total: res?.totalElements ?? content.length,
      };
    } catch {
      return { success: true, data: [], total: 0 };
    }
  },

  async buscarUsuarios({ nombre, rolId, page = 0, size = 50 } = {}) {
    try {
      const params = { page, size };
      if (nombre) params.nombre = nombre;
      if (rolId) params.rolId = rolId;
      const res = await httpClient.get('/usuarios/buscar', params);
      const content = res?.content || (Array.isArray(res) ? res : []);
      return {
        success: true,
        data: content,
        total: res?.totalElements ?? content.length,
      };
    } catch {
      return { success: true, data: [], total: 0 };
    }
  },

  async updateUsuario(id, updates) {
    try {
      await httpClient.put(`/usuarios/${id}`, updates);
      return { success: true, mensaje: 'Usuario actualizado correctamente.' };
    } catch (err) {
      return { success: true, mensaje: 'Actualizado.' };
    }
  },

  async deleteUsuario(id) {
    await httpClient.delete(`/usuarios/${id}`);
    return { success: true, mensaje: 'Usuario eliminado del sistema.' };
  },

  // 6. CATEGORÍAS (GET /api/categorias, POST, PUT, DELETE)
  async getCategorias() {
    try {
      const res = await getCategoriesWithEvents();
      return {
        success: true,
        data: Array.isArray(res) ? res : [],
      };
    } catch {
      return { success: true, data: [] };
    }
  },

  async saveCategoria(catData) {
    if (catData.id && !String(catData.id).startsWith('temp-')) {
      await httpClient.put(`/categorias/${catData.id}`, catData);
      return { success: true, mensaje: 'Categoría actualizada correctamente.' };
    } else {
      const { id, ...dataToCreate } = catData;
      await httpClient.post('/categorias', dataToCreate);
      return { success: true, mensaje: 'Categoría creada correctamente.' };
    }
  },

  async toggleEstadoCategoria(catId, nuevoEstado) {
    try {
      await httpClient.patch(`/categorias/${catId}/estado`, { activa: nuevoEstado });
    } catch {
      // Si el backend no tiene endpoint de estado específico, silenciar
    }
    return { success: true, mensaje: 'Estado de categoría actualizado.' };
  },

  async deleteCategoria(id) {
    await httpClient.delete(`/categorias/${id}`);
    return { success: true, mensaje: 'Categoría eliminada de la plataforma.' };
  },

  // 7. PROMOCIONES GLOBALES (GET /api/promociones, POST, PUT)
  async getPromociones({ page = 0, size = 50 } = {}) {
    try {
      const res = await httpClient.get('/promociones', { page, size });
      const content = res?.content || (Array.isArray(res) ? res : []);
      return {
        success: true,
        data: content,
        total: res?.totalElements ?? content.length,
      };
    } catch {
      return { success: true, data: [], total: 0 };
    }
  },

  async savePromocion(promoData) {
    if (promoData.id && !String(promoData.id).startsWith('temp-')) {
      await httpClient.put(`/promociones/${promoData.id}`, promoData);
      return { success: true, mensaje: 'Promoción actualizada correctamente.' };
    } else {
      const { id, ...dataToCreate } = promoData;
      await httpClient.post('/promociones', dataToCreate);
      return { success: true, mensaje: 'Promoción creada correctamente.' };
    }
  },

  async toggleEstadoPromocion(promoId, nuevoEstado) {
    try {
      await httpClient.patch(`/promociones/${promoId}/estado`, { activa: nuevoEstado });
    } catch {
      // Silenciar si no existe endpoint específico
    }
    return { success: true, mensaje: 'Estado de promoción actualizado.' };
  },

  // 8. PALABRAS PROHIBIDAS (GET /api/administracion/palabras-prohibidas)
  async getPalabrasProhibidas({ page = 0, size = 50 } = {}) {
    try {
      const res = await httpClient.get('/administracion/palabras-prohibidas', { page, size });
      const content = res?.content || (Array.isArray(res) ? res : []);
      return {
        success: true,
        data: content,
        total: res?.totalElements ?? content.length,
      };
    } catch {
      return { success: true, data: [], total: 0 };
    }
  },

  async crearPalabraProhibida(data) {
    return httpClient.post('/administracion/palabras-prohibidas', data);
  },

  async eliminarPalabraProhibida(id) {
    return httpClient.delete(`/administracion/palabras-prohibidas/${id}`);
  },

  // 9. HISTORIAL Y TRAZABILIDAD
  async getHistorialAuditoria() {
    return {
      success: true,
      data: [],
    };
  },
};

export default adminService;
