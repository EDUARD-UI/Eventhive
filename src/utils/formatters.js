export function formatPrice(value) {
  if (value === undefined || value === null || value === '') return '$0';
  const num = Number(value);
  if (isNaN(num) || num === 0) return '$0';
  return `$${num.toLocaleString('es-CO')}`;
}

/**
 * Formatea una fecha estrictamente en formato {dia/mes/año} (DD/MM/YYYY).
 * Soporta cadenas ISO ("2026-10-14T19:30:00"), formato fecha ("2026-10-14"),
 * Date objects y timestamps.
 */
export function formatFecha(dateVal) {
  if (!dateVal && dateVal !== 0) return '';
  if (typeof dateVal === 'string') {
    const clean = dateVal.trim();
    const datePart = clean.includes('T') ? clean.split('T')[0] : clean.split(' ')[0];
    const parts = datePart.split('-');
    if (parts.length === 3 && parts[0].length === 4) {
      const [year, month, day] = parts;
      return `${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}/${year}`;
    }
    const slashParts = datePart.split('/');
    if (slashParts.length === 3 && slashParts[2].length === 4) {
      return datePart;
    }
  }
  const d = dateVal instanceof Date ? dateVal : new Date(dateVal);
  if (isNaN(d.getTime())) return String(dateVal);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

/**
 * Formatea una hora en formato de 24 horas {hora/minutos} (HH:mm).
 */
export function formatHora24(timeVal) {
  if (!timeVal && timeVal !== 0) return '';
  if (timeVal instanceof Date) {
    return `${String(timeVal.getHours()).padStart(2, '0')}:${String(timeVal.getMinutes()).padStart(2, '0')}`;
  }
  const str = String(timeVal).trim();
  if (str.includes('T') || (str.includes('-') && str.includes(' '))) {
    const timePart = str.includes('T') ? str.split('T')[1] : str.split(' ')[1];
    return formatHora24(timePart);
  }
  const match12h = str.match(/^(\d{1,2}):(\d{2})(?::\d{2})?\s*(AM|PM)$/i);
  if (match12h) {
    let hours = parseInt(match12h[1], 10);
    const minutes = match12h[2];
    const modifier = match12h[3].toUpperCase();
    if (modifier === 'PM' && hours < 12) hours += 12;
    else if (modifier === 'AM' && hours === 12) hours = 0;
    return `${String(hours).padStart(2, '0')}:${minutes}`;
  }
  const match24h = str.match(/^(\d{1,2}):(\d{2})/);
  if (match24h) {
    return `${match24h[1].padStart(2, '0')}:${match24h[2].padStart(2, '0')}`;
  }
  return str;
}

/**
 * Formatea fecha y hora estrictamente según la regla:
 * {dia/mes/año} y si tiene hora acompañando es {hora/minutos} (ej: "14/10/2026 19:30").
 */
export function formatFechaHora(dateVal, timeVal = null) {
  if (!dateVal && dateVal !== 0) return '';
  const dateFormatted = formatFecha(dateVal);
  let timeStr = '';
  if (timeVal) {
    timeStr = formatHora24(timeVal);
  } else if (typeof dateVal === 'string' && (dateVal.includes('T') || dateVal.includes(' '))) {
    const rawTime = dateVal.includes('T') ? dateVal.split('T')[1] : dateVal.split(' ')[1];
    timeStr = formatHora24(rawTime);
  } else if (dateVal instanceof Date) {
    timeStr = `${String(dateVal.getHours()).padStart(2, '0')}:${String(dateVal.getMinutes()).padStart(2, '0')}`;
  }
  return timeStr ? `${dateFormatted} ${timeStr}` : dateFormatted;
}

/**
 * Formatea cualquier valor de hora o fecha/hora en formato estricto de 12 horas (hh:mm AM/PM).
 * Ejemplos: "08:30 AM", "12:00 PM", "07:45 PM".
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

    if (str.includes('T') || (str.includes('-') && str.includes(' '))) {
      const timePart = str.includes('T') ? str.split('T')[1] : str.split(' ')[1];
      return formatHora12(timePart);
    }

    const match12h = str.match(/^(\d{1,2}):(\d{2})(?::\d{2})?\s*(AM|PM)$/i);
    if (match12h) {
      hours = parseInt(match12h[1], 10);
      minutes = match12h[2];
      const modifier = match12h[3].toUpperCase();
      if (modifier === 'PM' && hours < 12) hours += 12;
      else if (modifier === 'AM' && hours === 12) hours = 0;
    } else {
      const match24h = str.match(/^(\d{1,2}):(\d{2})(?::\d{2})?/);
      if (match24h) {
        hours = parseInt(match24h[1], 10);
        minutes = match24h[2];
      } else {
        return str;
      }
    }
  }

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
