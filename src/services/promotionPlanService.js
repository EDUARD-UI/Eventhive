import { httpClient } from './httpClient.js';

export const promotionPlanService = {
  /**
   * Obtiene los planes activos desde el backend:
   * GET /api/promociones/planes
   */
  async getPlanesPublicos() {
    try {
      const data = await httpClient.get('/promociones/planes');
      const list = Array.isArray(data) ? data : data?.data || data?.content || [];
      return list.map((p) => ({
        id: p.id,
        codigo: p.codigo,
        nombre: p.nombre,
        precio: Number(p.precio || 0),
        precioFormateado: `$${Number(p.precio || 0).toLocaleString('es-CO')} COP`,
        detallePublicidad: p.detallePublicidad || '',
        comisionPorcentaje: Number(p.comisionPorcentaje ?? p.porcentajeComision ?? 0),
        porcentajeComision: Number(p.porcentajeComision ?? p.comisionPorcentaje ?? 0),
        premium: Boolean(p.premium),
        pautaRedes: Boolean(p.pautaRedes || p.llevaPautaRedes),
        popular: Boolean(p.premium),
        beneficios: [
          p.premium ? 'Banner rotativo en el Carrusel Principal del Home' : 'Destacado en cartelera y catálogo',
          `Comisión comercial de ${p.comisionPorcentaje ?? p.porcentajeComision ?? 0}%`,
          p.detallePublicidad || 'Posicionamiento oficial garantizado',
        ],
      }));
    } catch (err) {
      if (err?.isNetworkError || (err?.status && err.status >= 500)) throw err;
      console.warn('Error al consultar /promociones/planes:', err);
      return [];
    }
  },

  /**
   * Lista todos los planes configurados para el panel de marketing:
   * GET /api/marketing/planes
   */
  async getPlanesMarketing() {
    try {
      const data = await httpClient.get('/marketing/planes');
      const list = Array.isArray(data) ? data : data?.data || data?.content || [];
      return list.map((p) => ({
        id: p.id,
        codigo: p.codigo,
        nombre: p.nombre,
        precio: Number(p.precio || 0),
        precioFormateado: `$${Number(p.precio || 0).toLocaleString('es-CO')} COP`,
        detallePublicidad: p.detallePublicidad || '',
        comisionPorcentaje: Number(p.comisionPorcentaje ?? p.porcentajeComision ?? 0),
        porcentajeComision: Number(p.porcentajeComision ?? p.comisionPorcentaje ?? 0),
        premium: Boolean(p.premium),
        pautaRedes: Boolean(p.pautaRedes || p.llevaPautaRedes),
      }));
    } catch (err) {
      if (err.status === 401 || err.status === 403 || err?.isNetworkError || (err?.status && err.status >= 500)) {
        throw err;
      }
      console.warn('Error al consultar planes en marketing:', err);
      // Fallback a planes públicos solo si no es un error de autorización
      return this.getPlanesPublicos();
    }
  },

  /**
   * Carga una imagen publicitaria al servidor/Supabase:
   * POST /api/marketing/imagenes
   * Recibe FormData con campo 'imagen'.
   * Devuelve { url: string }
   */
  async subirImagenMarketing(file) {
    if (!file) throw new Error('No se ha proporcionado ningún archivo para subir.');
    const formData = new FormData();
    formData.append('imagen', file);
    const res = await httpClient.post('/marketing/imagenes', formData, { isFormData: true });
    const url = res?.url || (typeof res === 'string' ? res : null);
    if (!url) {
      throw new Error('El servidor no retornó una URL válida para la imagen.');
    }
    return url;
  },

  /**
   * Crea un nuevo plan publicitario:
   * POST /api/marketing/planes
   */
  async crearPlan(planData) {
    const comision = Number(planData.comisionPorcentaje ?? planData.porcentajeComision ?? 0);
    const payload = {
      nombre: planData.nombre?.trim(),
      codigo: planData.codigo?.trim().toUpperCase(),
      precio: Number(planData.precio),
      detallePublicidad: planData.detallePublicidad?.trim() || '',
      premium: Boolean(planData.premium),
      pautaRedes: Boolean(planData.pautaRedes),
      comisionPorcentaje: comision,
      porcentajeComision: comision,
    };
    return httpClient.post('/marketing/planes', payload);
  },

  /**
   * Actualiza un plan publicitario existente:
   * PUT /api/marketing/planes/{id}
   */
  async actualizarPlan(id, planData) {
    const comision = Number(planData.comisionPorcentaje ?? planData.porcentajeComision ?? 0);
    const payload = {
      nombre: planData.nombre?.trim(),
      codigo: planData.codigo?.trim().toUpperCase(),
      precio: Number(planData.precio),
      detallePublicidad: planData.detallePublicidad?.trim() || '',
      premium: Boolean(planData.premium),
      pautaRedes: Boolean(planData.pautaRedes),
      comisionPorcentaje: comision,
      porcentajeComision: comision,
    };
    return httpClient.put(`/marketing/planes/${id}`, payload);
  },

  /**
   * Consulta eventos con pago de promoción confirmado:
   * GET /api/marketing/eventos-promocionados
   */
  async getEventosPromocionados() {
    try {
      const data = await httpClient.get('/marketing/eventos-promocionados');
      return Array.isArray(data) ? data : data?.content || data?.data || [];
    } catch (err) {
      if (err.status === 401 || err.status === 403) {
        throw err;
      }
      console.warn('Error al obtener eventos promocionados:', err);
      return [];
    }
  },

  /**
   * Obtiene estadísticas de marketing:
   * GET /api/marketing/estadisticas
   */
  async getEstadisticasMarketing() {
    try {
      const data = await httpClient.get('/marketing/estadisticas');
      return data || { eventosActivosPromocionados: 0, eventosPorPlan: [] };
    } catch (err) {
      if (err.status === 401 || err.status === 403) {
        throw err;
      }
      console.warn('Error al obtener estadísticas de marketing:', err);
      return { eventosActivosPromocionados: 0, eventosPorPlan: [] };
    }
  },

  /**
   * Asigna la imagen destacada para el carrusel (solo planes premium):
   * POST /api/promociones/eventos/{eventoId}/posicionar
   * Body: { urlImagenDestacado: string }
   */
  async asignarImagenPromocional(eventoId, urlImagenDestacado) {
    return httpClient.post(`/promociones/eventos/${eventoId}/posicionar`, {
      urlImagenDestacado: urlImagenDestacado?.trim(),
    });
  },

  /**
   * Inicia el registro de pago para posicionar un evento:
   * POST /api/compras/eventos/{eventoId}/posicionamiento/pagos
   * Body: { planId }
   */
  async iniciarPagoPosicionamiento(eventoId, planId) {
    const numPlanId = Number(planId);
    return httpClient.post(
      `/compras/eventos/${eventoId}/posicionamiento/pagos`,
      { planId: numPlanId },
      { params: { planId: numPlanId } }
    );
  },

  /**
   * Confirma la transacción de posicionamiento:
   * PATCH /api/compras/posicionamiento/pagos/{pagoId}/confirmar-simulado
   */
  async confirmarPagoPosicionamiento(pagoId) {
    return httpClient.patch(`/compras/posicionamiento/pagos/${pagoId}/confirmar-simulado`);
  },

  /**
   * Consulta el estado real de la transacción de posicionamiento:
   * GET /api/compras/posicionamiento/pagos/{pagoId}
   */
  async consultarPagoPosicionamiento(pagoId) {
    return httpClient.get(`/compras/posicionamiento/pagos/${pagoId}`);
  },

  /**
   * Alias de compatibilidad:
   */
  async consultarEstadoPago(pagoId) {
    return this.consultarPagoPosicionamiento(pagoId);
  },
};

export default promotionPlanService;
