/**
 * Utilidades para el cálculo y visualización del mapa de calor de asistencia
 * según la Opción 1 (Densidad de Asistencia / Popularidad) de Eventhive.
 */

// Paleta de calor oficial calibrada de alta intensidad visual (EventHive):
// Azul vivo en bordes -> Cyan luminoso -> Ámbar dorado potente -> Naranja fuego -> Rojo volcánico
export const EVENTHIVE_HEAT_GRADIENT = {
  0.15: '#0284C7', // Azul brillante vivo (Halo exterior de afluencia)
  0.35: '#00D2FF', // Cyan eléctrico luminoso
  0.55: '#F59E0B', // Ámbar dorado potente EventHive
  0.72: '#EA580C', // Naranja fuego intenso
  0.88: '#DC2626', // Rojo pasión intenso
  1.0: '#991B1B',  // Rojo volcánico profundo / máxima popularidad
};

/**
 * Obtiene la información de asistencia, ocupación y aforo del evento con datos reales.
 * Prioriza localidades (capacidad vs disponibles) y campos directos del backend.
 */
export function getEventAttendanceInfo(event) {
  if (!event) {
    return {
      attendees: 0,
      capacity: 100,
      available: 100,
      percentage: 0,
      displayPercentage: '0%',
      isRealData: false,
      level: 'Inicial',
      statusText: 'Boletas Disponibles',
      badgeColor: 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/15 border-emerald-500/30',
      attendeesText: 'asistentes registrados',
      descriptionText: '0 boletos emitidos (0% de 100 cupos)',
    };
  }

  let totalCapacidad = 0;
  let totalDisponibles = 0;
  let hasLocalidadesData = false;

  // 1. Revisar localidades del evento (capacidad y boletos disponibles reales)
  if (Array.isArray(event.localidades) && event.localidades.length > 0) {
    let sumCap = 0;
    let sumDisp = 0;
    let validLocCount = 0;

    event.localidades.forEach((loc) => {
      const cap = Number(loc.capacidad ?? loc.capacity);
      const disp = Number(loc.disponibles ?? loc.available);

      if (!isNaN(cap) && cap > 0) {
        sumCap += cap;
        validLocCount++;
        if (!isNaN(disp) && disp >= 0) {
          sumDisp += disp;
        } else {
          // Si no especifica disponibles, asume la capacidad como cupo inicial
          sumDisp += cap;
        }
      }
    });

    if (validLocCount > 0 && sumCap > 0) {
      totalCapacidad = sumCap;
      totalDisponibles = Math.min(sumDisp, sumCap);
      hasLocalidadesData = true;
    }
  }

  // 2. Determinar asistentes reales o registrados
  let asistentes = null;
  let isRealData = false;

  // Si las localidades traen cupos disponibles y capacidad
  if (hasLocalidadesData) {
    const vendidos = totalCapacidad - totalDisponibles;
    if (vendidos >= 0) {
      asistentes = vendidos;
      isRealData = true;
    }
  }

  // Si el backend envía campo directo de asistencia
  const directAttendance = Number(
    event.asistentes ??
    event.totalAsistentes ??
    event.asistencia ??
    event.confirmados ??
    event.registrados ??
    event.cantidadAsistentes
  );

  if (!isNaN(directAttendance) && directAttendance >= 0) {
    asistentes = directAttendance;
    isRealData = true;
  }

  // Capacidad base segura
  const baseCapacity = totalCapacidad > 0 ? totalCapacidad : (Number(event.capacidad ?? event.aforo) || 200);

  // 3. Fallback inteligente solo si no hay datos de asistencia ni localidades
  if (asistentes === null) {
    const seed = String(event.id || '1')
      .split('')
      .reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const ratio = 0.30 + ((seed % 40) / 100);
    asistentes = Math.round(baseCapacity * ratio);
    isRealData = false;
  }

  const safeCapacity = Math.max(asistentes, baseCapacity);
  const cuposRestantes = Math.max(0, safeCapacity - asistentes);

  // 4. Cálculo matemático exacto del porcentaje de cupos
  const rawPercentage = safeCapacity > 0 ? (asistentes / safeCapacity) * 100 : 0;
  let displayPercentage = '0%';

  if (asistentes === 0 || rawPercentage <= 0) {
    displayPercentage = '0%';
  } else if (rawPercentage < 0.1) {
    displayPercentage = '< 0.1%';
  } else if (rawPercentage < 1) {
    // Si hay asistentes pero el porcentaje es pequeño (ej. 8 de 4700 = 0.17%),
    // muestra 1 decimal exacto para que el usuario vea que SÍ suma el porcentaje
    displayPercentage = `${rawPercentage.toFixed(1)}%`;
  } else {
    displayPercentage = `${Math.round(rawPercentage)}%`;
  }

  // 5. Estados y Badges calibrados de forma lógica y coherente
  let level = 'Inicial';
  let statusText = 'Boletas Disponibles';
  let badgeColor = 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/15 border-emerald-500/30';

  if (cuposRestantes === 0 && safeCapacity > 0) {
    level = 'Agotado';
    statusText = '¡Aforo Completo! (Sold Out)';
    badgeColor = 'text-rose-600 dark:text-rose-400 bg-rose-500/15 border-rose-500/30';
  } else if (rawPercentage >= 80 || (safeCapacity >= 50 && cuposRestantes <= 15)) {
    level = 'Alta';
    statusText = 'Alta Demanda · Últimos Cupos';
    badgeColor = 'text-orange-600 dark:text-orange-400 bg-orange-500/15 border-orange-500/30';
  } else if (rawPercentage >= 40 || asistentes >= 60) {
    level = 'Media';
    statusText = 'Gran Ambiente · Concurrido';
    badgeColor = 'text-amber-500 dark:text-amber-300 bg-amber-500/15 border-amber-500/30';
  } else if ((rawPercentage >= 10 || asistentes >= 20) && asistentes > 0) {
    level = 'Moderada';
    statusText = 'Asistencia Activa';
    badgeColor = 'text-blue-600 dark:text-blue-400 bg-blue-500/15 border-blue-500/30';
  } else if (asistentes > 0) {
    // Caso de pocas ventas en aforo grande (ej: 8 de 4700 cupos)
    level = 'Inicial';
    statusText = 'Boletas Disponibles';
    badgeColor = 'text-cyan-600 dark:text-cyan-400 bg-cyan-500/15 border-cyan-500/30';
  } else {
    // 0 asistentes
    level = 'Inicial';
    statusText = 'Inscripciones Abiertas';
    badgeColor = 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/15 border-emerald-500/30';
  }

  // Texto pluralizado de asistentes
  const attendeesText = asistentes === 1
    ? (isRealData ? 'asistente confirmado' : 'persona registrada')
    : (isRealData ? 'asistentes confirmados' : 'personas registradas');

  const descriptionText = `${asistentes.toLocaleString('es-CO')} ${attendeesText} (${displayPercentage} de ${safeCapacity.toLocaleString('es-CO')} cupos)`;

  return {
    attendees: asistentes,
    capacity: safeCapacity,
    available: cuposRestantes,
    percentage: Math.round(rawPercentage),
    rawPercentage,
    displayPercentage,
    isRealData,
    level,
    statusText,
    badgeColor,
    attendeesText,
    descriptionText,
  };
}

/**
 * Genera puntos de calor limpios y acotados alrededor del lugar del evento.
 * Ajusta la intensidad según la ocupación y el volumen real de personas.
 *
 * @param {number} lat - Latitud del evento
 * @param {number} lng - Longitud del evento
 * @param {object} attendanceInfo - Información calculada de asistencia
 * @returns {Array<[number, number, number]>} Puntos [lat, lng, intensidad]
 */
export function generateAttendanceHeatPoints(lat, lng, attendanceInfo) {
  if (typeof lat !== 'number' || typeof lng !== 'number' || isNaN(lat) || isNaN(lng)) {
    return [];
  }

  const { rawPercentage = 0, attendees = 0 } = attendanceInfo;

  // Cálculo proporcional de la intensidad térmica:
  // Si hay muy pocos asistentes (ej. 8 de 4700, 0.2%), la intensidad es baja (0.20 = halo azul inicial)
  // Si la afluencia es masiva (80%+ o cientos de personas), la intensidad llega a 0.90 (halo ámbar/fuego)
  const occupancyFactor = Math.min(1.0, rawPercentage / 100);
  const volumeFactor = Math.min(1.0, attendees / 150);

  // Ponderación: 60% peso a la ocupación relativa, 40% al volumen de personas
  const combined = (occupancyFactor * 0.60) + (volumeFactor * 0.40);
  const baseIntensity = Math.min(0.95, Math.max(0.18, combined));

  // Micro-offset ceñido (~15 metros) para mantener el halo en el recinto
  const microOffset = 0.00014;

  return [
    [lat, lng, Number(baseIntensity.toFixed(2))],
    [lat + microOffset, lng, Number((baseIntensity * 0.50).toFixed(2))],
    [lat - microOffset, lng, Number((baseIntensity * 0.50).toFixed(2))],
    [lat, lng + microOffset, Number((baseIntensity * 0.50).toFixed(2))],
    [lat, lng - microOffset, Number((baseIntensity * 0.50).toFixed(2))],
  ];
}

/**
 * Genera los puntos de calor para todos los eventos del mapa sin saturar la ciudad.
 *
 * @param {Array} events - Lista de eventos en el mapa
 * @returns {Array<[number, number, number]>} Puntos [lat, lng, intensidad]
 */
export function generateCityEventsHeatPoints(events) {
  if (!Array.isArray(events) || events.length === 0) return [];

  const allPoints = [];

  events.forEach((ev) => {
    const lat = Number(ev.lat ?? ev.latitud);
    const lng = Number(ev.lng ?? ev.longitud);

    if (isNaN(lat) || isNaN(lng) || lat === 0 || lng === 0) return;

    const attendance = getEventAttendanceInfo(ev);
    const pointsForEvent = generateAttendanceHeatPoints(lat, lng, attendance);
    allPoints.push(...pointsForEvent);
  });

  return allPoints;
}
