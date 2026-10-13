import { httpClient } from './httpClient.js';
import { organizerService } from './organizerService.js';

const STORAGE_KEY = 'eventhive_promocion_planes';

export const DEFAULT_PLANES = [
  {
    id: 'DESTACADO_HOME',
    nombre: 'Destacado Home',
    precio: 50000,
    precioFormateado: '$50.000 COP',
    duracion: '30 días',
    dias: 30,
    popular: false,
    descripcion: 'Aparición destacada en carrusel y sección especial de la cartelera principal.',
    beneficios: [
      'Aparición en la sección de Eventos Destacados del Home',
      'Badge distintivo de "Evento Destacado"',
      'Mayor visibilidad en recomendaciones culturales',
      'Soporte técnico prioritario',
    ],
  },
  {
    id: 'PREMIUM_TOP',
    nombre: 'Posicionamiento Premium',
    precio: 100000,
    precioFormateado: '$100.000 COP',
    duracion: '30 días',
    dias: 30,
    popular: true,
    descripcion: 'Máxima exposición con banner principal, primer lugar en búsquedas y badge dorado VIP.',
    beneficios: [
      'Primeros puestos en el Carrusel Principal del Home',
      'Posición #1 en resultados de búsqueda y categorías',
      'Banner promocional destacado en el inicio',
      'Badge VIP dorado en todas las vistas de la plataforma',
      'Estadísticas avanzadas de visualizaciones y clics',
    ],
  },
  {
    id: 'IMPULSO_EXPRESS',
    nombre: 'Impulso Fin de Semana',
    precio: 35000,
    precioFormateado: '$35.000 COP',
    duracion: '7 días',
    dias: 7,
    popular: false,
    descripcion: 'Campaña rápida de alta conversión ideal para promocionar eventos de última hora.',
    beneficios: [
      'Destacado en el filtro de Eventos del Fin de Semana',
      'Notificación prioritaria en recomendaciones de agenda',
      'Etiqueta especial de "¡Este fin de semana!"',
    ],
  },
];

export const promotionPlanService = {
  getPlanes() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // ignore
    }
    return DEFAULT_PLANES;
  },

  savePlanes(planes) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(planes));
    } catch {
      // ignore
    }
    return planes;
  },

  savePlan(plan) {
    const planes = this.getPlanes();
    const index = planes.findIndex((p) => p.id === plan.id);
    let updated;
    if (index >= 0) {
      updated = [...planes];
      updated[index] = { ...updated[index], ...plan };
    } else {
      const newPlan = {
        ...plan,
        id: plan.id || `PLAN_${Date.now()}`,
      };
      updated = [...planes, newPlan];
    }
    return this.savePlanes(updated);
  },

  deletePlan(planId) {
    const planes = this.getPlanes();
    const updated = planes.filter((p) => p.id !== planId);
    return this.savePlanes(updated);
  },

  async asignarImagenPromocional(eventoId, urlImagenDestacado) {
    let success = false;
    try {
      await organizerService.posicionarEvento(eventoId, urlImagenDestacado);
      success = true;
    } catch (e) {
      console.warn('Fallback al intentar posicionar evento con imagen:', e);
    }

    try {
      await httpClient.put(`/eventos/${eventoId}`, {
        urlImagenDestacado,
        imagenPromocional: urlImagenDestacado,
        promocionado: true,
      });
      success = true;
    } catch (e) {
      console.warn('Fallback secundario /eventos/{id}:', e);
    }

    return success;
  },
};
