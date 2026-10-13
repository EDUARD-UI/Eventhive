export function formatPrice(value) {
  if (!value) return 'Gratis';
  return `$${value.toLocaleString('es-CO')}`;
}

/**
 * Formatea cualquier dato de hora en formato estricto de 23 horas (00:00 a 23:59).
 * Si el backend u origen lo envía en formato "24:00" o "24:xx" (hora 24 fuera de rango),
 * lo corrige automáticamente a "00:00" o "00:xx".
 * También soporta strings ISO, formato 12h (AM/PM) convirtiéndolo a 24h, y recorta segundos.
 *
 * @param {string|Date|number} timeValue
 * @returns {string} Hora formateada como "HH:mm" (00:00 a 23:59).
 */
export function formatHora23(timeValue) {
  if (!timeValue && timeValue !== 0) return '';

  if (timeValue instanceof Date) {
    let hours = timeValue.getHours();
    if (hours >= 24) hours = hours % 24;
    const minutes = timeValue.getMinutes();
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
  }

  const str = String(timeValue).trim();
  if (!str) return '';

  // 1. Si contiene fecha ISO o timestamp (ej: "2026-10-13T20:30:00" o "2026-10-13 20:30:00")
  if (str.includes('T') || (str.includes('-') && str.includes(' '))) {
    const timePart = str.includes('T') ? str.split('T')[1] : str.split(' ')[1];
    return formatHora23(timePart);
  }

  // 2. Si viene con formato 12 horas AM/PM (ej: "07:30 PM", "7:00 pm", "12:00 AM")
  const match12h = str.match(/^(\d{1,2}):(\d{2})(?::\d{2})?\s*(AM|PM)$/i);
  if (match12h) {
    let hours = parseInt(match12h[1], 10);
    const minutes = match12h[2];
    const modifier = match12h[3].toUpperCase();

    if (modifier === 'PM' && hours < 12) {
      hours += 12;
    } else if (modifier === 'AM' && hours === 12) {
      hours = 0;
    }

    if (hours >= 24) {
      hours = hours % 24;
    }

    return `${String(hours).padStart(2, '0')}:${minutes}`;
  }

  // 3. Si viene en formato HH:mm o HH:mm:ss o 24:00
  const match24h = str.match(/^(\d{1,2}):(\d{2})(?::\d{2})?/);
  if (match24h) {
    let hours = parseInt(match24h[1], 10);
    const minutes = match24h[2];

    // Corrección si en backend lo manda en formato 24h (ej: 24:00 -> 00:00)
    if (hours >= 24) {
      hours = hours % 24;
    }

    return `${String(hours).padStart(2, '0')}:${minutes}`;
  }

  return str;
}

export function getCategoryGradient(category = '') {
  const cat = (category || '').toLowerCase();
  if (cat.includes('músic') || cat.includes('conciert')) {
    return 'bg-gradient-to-br from-indigo-700 via-purple-700 to-slate-950';
  }
  if (cat.includes('arte') || cat.includes('cultur') || cat.includes('teatr')) {
    return 'bg-gradient-to-br from-purple-800 via-pink-700 to-rose-950';
  }
  if (cat.includes('deport') || cat.includes('fit') || cat.includes('marat')) {
    return 'bg-gradient-to-br from-emerald-700 via-teal-700 to-slate-950';
  }
  if (cat.includes('gastro') || cat.includes('comida') || cat.includes('beb') || cat.includes('rest')) {
    return 'bg-gradient-to-br from-amber-600 via-orange-600 to-amber-950';
  }
  if (cat.includes('negocio') || cat.includes('emprend') || cat.includes('tecnol')) {
    return 'bg-gradient-to-br from-blue-700 via-cyan-700 to-slate-950';
  }
  if (cat.includes('educa') || cat.includes('tall') || cat.includes('acad')) {
    return 'bg-gradient-to-br from-rose-700 via-red-700 to-slate-950';
  }
  if (cat.includes('festiv') || cat.includes('social') || cat.includes('comunid')) {
    return 'bg-gradient-to-br from-violet-700 via-fuchsia-700 to-indigo-950';
  }
  return 'bg-gradient-to-br from-[#0a1838] via-[#152e69] to-[#007bff]';
}

