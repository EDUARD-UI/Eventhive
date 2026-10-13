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
        comisionPorcentaje: Number(p.comisionPorcentaje || 0),
        premium: Boolean(p.premium),
        pautaRedes: Boolean(p.pautaRedes || p.llevaPautaRedes),
        duracion: p.duracion || '30 días',
        dias: p.dias || 30,
        popular: Boolean(p.premium),
        beneficios: [
          p.premium ? 'Banner rotativo en el Carrusel Principal del Home' : 'Destacado en cartelera y catálogo',
          p.pautaRedes ? 'Pauta y difusión publicitaria en redes sociales' : 'Visibilidad orgánica prioritara',
          `Comisión comercial de ${p.comisionPorcentaje || 0}%`,
          p.detallePublicidad || 'Posicionamiento oficial garantizado',
        ],
      }));
    } catch (err) {
      console.warn('Error al consultar /promociones/planes:', err);
      return [];
    }
  },

  /**
   * Lista todos los planes configurados para el panel de marketing:
   * GET /api/marketing/planes (con fallback a /promociones/planes)
   */
  async getPlanesMarketing() {
    try {
      let data;
      try {
        data = await httpClient.get('/marketing/planes');
      } catch {
        data = await httpClient.get('/promociones/planes');
      }
      const list = Array.isArray(data) ? data : data?.data || data?.content || [];
      return list.map((p) => ({
        id: p.id,
        codigo: p.codigo,
        nombre: p.nombre,
        precio: Number(p.precio || 0),
        precioFormateado: `$${Number(p.precio || 0).toLocaleString('es-CO')} COP`,
        detallePublicidad: p.detallePublicidad || '',
        comisionPorcentaje: Number(p.comisionPorcentaje || 0),
        premium: Boolean(p.premium),
        pautaRedes: Boolean(p.pautaRedes || p.llevaPautaRedes),
      }));
    } catch (err) {
      console.warn('Error al consultar planes en marketing:', err);
      return [];
    }
  },

  /**
   * Crea un nuevo plan publicitario:
   * POST /api/marketing/planes
   */
  async crearPlan(planData) {
    const payload = {
      nombre: planData.nombre?.trim(),
      codigo: planData.codigo?.trim().toUpperCase(),
      precio: Number(planData.precio),
      detallePublicidad: planData.detallePublicidad?.trim() || '',
      premium: Boolean(planData.premium),
      pautaRedes: Boolean(planData.pautaRedes),
      comisionPorcentaje: Number(planData.comisionPorcentaje || 0),
    };
    return httpClient.post('/marketing/planes', payload);
  },

  /**
   * Actualiza un plan publicitario existente:
   * PUT /api/marketing/planes/{id}
   */
  async actualizarPlan(id, planData) {
    const payload = {
      nombre: planData.nombre?.trim(),
      codigo: planData.codigo?.trim().toUpperCase(),
      precio: Number(planData.precio),
      detallePublicidad: planData.detallePublicidad?.trim() || '',
      premium: Boolean(planData.premium),
      pautaRedes: Boolean(planData.pautaRedes),
      comisionPorcentaje: Number(planData.comisionPorcentaje || 0),
    };
    return httpClient.put(`/marketing/planes/${id}`, payload);
  },

  /**
   * Consulta eventos con pago de promoción confirmado:
   * GET /api/marketing/eventos-promocionados (o /promociones)
   */
  async getEventosPromocionados() {
    try {
      let data;
      try {
        data = await httpClient.get('/marketing/eventos-promocionados');
      } catch {
        data = await httpClient.get('/promociones', { page: 0, size: 100 });
      }
      return Array.isArray(data) ? data : data?.content || data?.data || [];
    } catch (err) {
      console.warn('Error al obtener eventos promocionados:', err);
      return [];
    }
  },

  /**
   * Asigna la imagen destacada para el carrusel (solo planes premium):
   * PUT /api/promociones/eventos/{eventoId}/posicionar
   * Body: { urlImagenDestacado: string }
   */
  async asignarImagenPromocional(eventoId, urlImagenDestacado) {
    return httpClient.put(`/promociones/eventos/${eventoId}/posicionar`, {
      urlImagenDestacado: urlImagenDestacado?.trim(),
    });
  },

  /**
   * Inicia el registro de pago para posicionar un evento:
   * POST /api/compras/eventos/{eventoId}/posicionamiento/pagos?planId={planId}
   */
  async iniciarPagoPosicionamiento(eventoId, planId) {
    return httpClient.post(
      `/compras/eventos/${eventoId}/posicionamiento/pagos`,
      null,
      { params: { planId } }
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
   * Consulta el estado real de la transacción:
   * GET /api/compras/posicionamiento/pagos/{pagoId}
   */
  async consultarEstadoPago(pagoId) {
    return httpClient.get(`/compras/posicionamiento/pagos/${pagoId}`);
  },
};

export default promotionPlanService;
