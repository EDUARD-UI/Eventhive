/**
 * Utilidades para el cálculo y presentación de disponibilidad de boletería en EventHive.
 * Sigue la regla estricta:
 * - Si todas las localidades tienen disponibles = 0, el evento está SOLD OUT.
 * - Si al menos una localidad tiene disponibles > 0, NO está completamente agotado.
 * - Escasez: si disponibles < 25 && disponibles > 0, mostrar indicador de últimas entradas.
 */

export function getLocalidadDisponibles(loc) {
  if (!loc || typeof loc !== 'object') return 0;
  const candidate =
    loc.disponibles ??
    loc.cupoDisponible ??
    loc.cantidadDisponible ??
    loc.cuposDisponibles ??
    loc.entradasDisponibles ??
    loc.cupo;

  if (candidate !== undefined && candidate !== null && candidate !== '') {
    const num = Number(candidate);
    if (!isNaN(num) && num >= 0) return num;
  }

  // Si no se informa disponibles pero existe capacidad positiva, asumimos cupo abierto
  // para evitar falsos positivos de "Agotado" en listados donde solo viaja la capacidad
  if (loc.capacidad !== undefined && loc.capacidad !== null && loc.capacidad !== '') {
    const capNum = Number(loc.capacidad);
    if (!isNaN(capNum) && capNum > 0) return capNum;
  }

  return 0;
}

export function isEventSoldOut(event) {
  if (!event || typeof event !== 'object') return false;

  // 1. Si el backend indica directamente disponibilidad (EventoDTO)
  // tieneBoletasDisponibles / disponible es TRUE si al menos una localidad tiene disponibles > 0
  if (typeof event.tieneBoletasDisponibles === 'boolean') {
    return !event.tieneBoletasDisponibles;
  }
  if (typeof event.disponible === 'boolean') {
    return !event.disponible;
  }
  if (typeof event.agotado === 'boolean') {
    return event.agotado;
  }

  // 2. Si vienen las localidades cargadas (p. ej. en la vista de detalle)
  const locs = event.localidades;
  if (Array.isArray(locs) && locs.length > 0) {
    return !locs.some((loc) => {
      if (typeof loc.disponible === 'boolean') return loc.disponible;
      if (typeof loc.agotado === 'boolean') return !loc.agotado;
      if (typeof loc.tieneBoletasDisponibles === 'boolean') return loc.tieneBoletasDisponibles;
      return getLocalidadDisponibles(loc) > 0;
    });
  }

  // 3. Campo numérico explícito si no hay localidades cargadas
  if (event.boletasDisponibles !== undefined && Number(event.boletasDisponibles) === 0) {
    return true;
  }

  return false;
}

export function getLocalidadStatus(loc) {
  if (!loc || typeof loc !== 'object') {
    return {
      disponibles: 0,
      isSoldOut: true,
      isScarcity: false,
      badgeText: 'Agotado',
    };
  }

  const disponibles = getLocalidadDisponibles(loc);
  const isSoldOut =
    typeof loc.agotado === 'boolean'
      ? loc.agotado
      : typeof loc.disponible === 'boolean'
      ? !loc.disponible
      : typeof loc.tieneBoletasDisponibles === 'boolean'
      ? !loc.tieneBoletasDisponibles
      : disponibles <= 0;

  const isScarcity = !isSoldOut && disponibles > 0 && disponibles < 25;

  return {
    disponibles,
    isSoldOut,
    isScarcity,
    badgeText: isSoldOut
      ? 'Agotado'
      : isScarcity
      ? `¡Últimas entradas! (${disponibles} restantes)`
      : `${disponibles} disponibles`,
  };
}

export function isScarcityLocalidad(loc) {
  // Solo mostrar aviso de escasez si el campo de disponibles viene explícito
  if (!loc || typeof loc !== 'object') return false;
  const rawDisponibles =
    loc.disponibles ??
    loc.cupoDisponible ??
    loc.cantidadDisponible ??
    loc.cuposDisponibles ??
    loc.entradasDisponibles;

  if (rawDisponibles === undefined || rawDisponibles === null || rawDisponibles === '') {
    return false;
  }

  const disponibles = Number(rawDisponibles);
  return !isNaN(disponibles) && disponibles > 0 && disponibles < 25;
}
