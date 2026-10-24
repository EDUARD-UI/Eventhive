export function formatPrice(value) {
  if (value === undefined || value === null || value === '') return '$0';
  const num = Number(value);
  if (isNaN(num) || num === 0) return '$0';
  return `$${num.toLocaleString('es-CO')}`;
}

/**
 * Formatea cualquier valor de hora o fecha/hora en formato estricto de 12 horas (hh:mm AM/PM).
 * Ejemplos: "08:30 AM", "12:00 PM", "07:45 PM".
 * Soporta instancias de Date, cadenas ISO ("2026-10-13T20:30:00"), strings 24h ("20:30", "08:15:00")
 * y cadenas existentes AM/PM normalizándolas.
 *
 * @param {string|Date|number} timeValue
 * @returns {string} Hora formateada como "hh:mm AM" o "hh:mm PM".
 */
export function formatHora12(timeValue) {
  if (!timeValue && timeValue !== 0) return '';

  let hours = 0;
  let minutes = '00';

  if (timeValue instanceof Date) {
    hours = timeValue.getHours();
    minutes = String(timeValue.getMinutes()).padStart(2, '0');
  } else {
    const str = String(timeValue).trim();
    if (!str) return '';

    // 1. Si contiene fecha ISO o timestamp ("2026-10-13T20:30:00" o "2026-10-13 20:30:00")
    if (str.includes('T') || (str.includes('-') && str.includes(' '))) {
      const timePart = str.includes('T') ? str.split('T')[1] : str.split(' ')[1];
      return formatHora12(timePart);
    }

    // 2. Si viene con formato 12 horas AM/PM (ej: "7:30 PM", "07:30 pm", "12:00 AM")
    const match12h = str.match(/^(\d{1,2}):(\d{2})(?::\d{2})?\s*(AM|PM)$/i);
    if (match12h) {
      hours = parseInt(match12h[1], 10);
      minutes = match12h[2];
      const modifier = match12h[3].toUpperCase();
      if (modifier === 'PM' && hours < 12) hours += 12;
      else if (modifier === 'AM' && hours === 12) hours = 0;
    } else {
      // 3. Si viene en formato 24h: HH:mm o HH:mm:ss o 24:00
      const match24h = str.match(/^(\d{1,2}):(\d{2})(?::\d{2})?/);
      if (match24h) {
        hours = parseInt(match24h[1], 10);
        minutes = match24h[2];
      } else {
        return str;
      }
    }
  }

  // Corregir horas >= 24 (ej: 24:00 -> 00:00)
  if (hours >= 24) hours = hours % 24;

  const modifier = hours >= 12 ? 'PM' : 'AM';
  let hours12 = hours % 12;
  if (hours12 === 0) hours12 = 12;

  const formattedHours = String(hours12).padStart(2, '0');
  return `${formattedHours}:${minutes} ${modifier}`;
}

/**
 * Formato 24h para campos de entrada técnicos (ej. input type="time").
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

  if (str.includes('T') || (str.includes('-') && str.includes(' '))) {
    const timePart = str.includes('T') ? str.split('T')[1] : str.split(' ')[1];
    return formatHora23(timePart);
  }

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

    if (hours >= 24) hours = hours % 24;
    return `${String(hours).padStart(2, '0')}:${minutes}`;
  }

  const match24h = str.match(/^(\d{1,2}):(\d{2})(?::\d{2})?/);
  if (match24h) {
    let hours = parseInt(match24h[1], 10);
    const minutes = match24h[2];
    if (hours >= 24) hours = hours % 24;
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

