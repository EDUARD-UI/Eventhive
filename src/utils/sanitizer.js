/**
 * Utilidades de sanitización y validación estricta para EventHive
 * Previene inyecciones maliciosas (XSS, scripts, etiquetas HTML no deseadas)
 * y normaliza formatos como teléfonos y correos.
 */

/**
 * Sanitiza una cadena de texto eliminando etiquetas HTML, scripts y caracteres potencialmente maliciosos.
 * @param {string} input 
 * @returns {string} Cadena sanitizada y segura
 */
export function sanitizeText(input) {
  if (typeof input !== 'string') return '';
  return input
    // Eliminar etiquetas <script> y su contenido
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    // Eliminar etiquetas HTML genéricas
    .replace(/<\/?[a-z][a-z0-9]*\b[^>]*>/gi, '')
    // Eliminar protocolos potencialmente peligrosos como javascript: o data:
    .replace(/javascript:/gi, '')
    .replace(/data:/gi, '')
    // Eliminar atributos inline peligrosos como onerror, onclick, etc.
    .replace(/\bon\w+\s*=/gi, '')
    .trim();
}

/**
 * Sanitiza y restringe un número telefónico:
 * - Elimina cualquier carácter que no sea un dígito numérico (0-9)
 * - Restringe la longitud estricta a máximo 10 caracteres
 * @param {string} phone 
 * @returns {string} Teléfono normalizado de máximo 10 dígitos
 */
export function sanitizePhone(phone) {
  if (!phone) return '';
  const digitsOnly = String(phone).replace(/\D/g, '');
  return digitsOnly.slice(0, 10);
}

/**
 * Sanitiza una dirección de correo electrónico
 * @param {string} email 
 * @returns {string}
 */
export function sanitizeEmail(email) {
  if (typeof email !== 'string') return '';
  return email.trim().toLowerCase().replace(/["'<>]/g, '');
}

/**
 * Sanitiza un objeto completo de campos de formulario recursivamente
 * @param {Record<string, any>} obj 
 * @returns {Record<string, any>}
 */
export function sanitizeFormObject(obj) {
  if (!obj || typeof obj !== 'object') return obj;
  const sanitized = {};
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      if (key.toLowerCase().includes('telefono') || key.toLowerCase().includes('phone')) {
        sanitized[key] = sanitizePhone(value);
      } else if (key.toLowerCase().includes('correo') || key.toLowerCase().includes('email')) {
        sanitized[key] = sanitizeEmail(value);
      } else {
        sanitized[key] = sanitizeText(value);
      }
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
}
