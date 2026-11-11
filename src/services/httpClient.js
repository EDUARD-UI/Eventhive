import { getApiBaseUrl } from '../config/api.js';
import { session, isTokenExpired } from './session.js';

/**
 * Cliente HTTP Centralizado de EventHive
 *
 * Características:
 * - Determinación dinámica de la URL base según entorno (Vercel -> Azure | Localhost -> localhost:8080).
 * - Tiempos límite (timeouts) diferenciados según el tipo de solicitud.
 * - Clasificación limpia de errores (red, timeout, 5xx, 401, 403, 400).
 * - Renovación atómica de JWT (evita tormentas de refresh concurrentes).
 * - Sin banners ni mensajes invasivos en pantalla.
 */

export const buildUrl = (path, params) => {
  if (typeof path !== 'string' || path.includes('[object Object]')) {
    throw new TypeError('La ruta de la solicitud debe contener identificadores válidos.');
  }

  const origin = typeof window !== 'undefined' && window.location?.origin ? window.location.origin : 'http://localhost:5173';
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  const baseUrl = getApiBaseUrl();
  const cleanBase = (baseUrl || '/api').replace(/\/+$/, '');
  const fullPath = `${cleanBase}${cleanPath}`;

  const url = fullPath.startsWith('http')
    ? new URL(fullPath)
    : new URL(fullPath, origin);

  const appendParam = (key, value) => {
    if (value === undefined || value === null || value === '') return;
    if (Array.isArray(value)) {
      value.forEach((item) => appendParam(key, item));
      return;
    }

    const serializableValue =
      typeof value === 'object'
        ? value.id
        : value;
    if (
      serializableValue === undefined ||
      serializableValue === null ||
      !['string', 'number', 'boolean'].includes(typeof serializableValue)
    ) {
      throw new TypeError(`El parámetro "${key}" debe ser un valor simple o un objeto con id.`);
    }
    url.searchParams.append(key, String(serializableValue));
  };

  Object.entries(params || {}).forEach(([key, value]) => appendParam(key, value));

  return url;
};

// Evita que peticiones concurrentes intenten refrescar el token en paralelo.
let refreshInFlight = null;
const rutasAuthPublicas = new Set([
  '/auth/login',
  '/auth/registrar-cliente',
  '/auth/registro-organizador',
  '/auth/olvide-password',
  '/auth/restablecer-password',
]);

export async function intentarRefrescarToken() {
  if (refreshInFlight) return refreshInFlight;

  const rawRefreshToken = session.getRefreshToken();
  if (!rawRefreshToken || rawRefreshToken === 'dev-session-token') {
    return null;
  }

  const cleanRefreshToken = String(rawRefreshToken)
    .replace(/^Bearer\s+/i, '')
    .replace(/^["']|["']$/g, '')
    .trim();

  if (!cleanRefreshToken) return null;

  refreshInFlight = (async () => {
    let timeoutId;
    try {
      const controller = new AbortController();
      timeoutId = setTimeout(() => controller.abort(), 15000);

      const response = await fetch(buildUrl('/auth/refresh'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: cleanRefreshToken }),
        signal: controller.signal,
      });

      if (!response.ok) return null;

      const payload = await response.json().catch(() => null);
      if (!payload?.data) return null;

      const newAccessToken =
        payload.data.accessToken ||
        payload.data.token ||
        payload.data.jwt ||
        payload.data.tokenAcceso;

      if (!newAccessToken) return null;

      session.save(payload.data);
      return payload.data;
    } catch {
      return null;
    } finally {
      if (timeoutId) clearTimeout(timeoutId);
      refreshInFlight = null;
    }
  })();

  return refreshInFlight;
}

function cerrarSesionYRedirigir() {
  session.clear();
  if (typeof window !== 'undefined') {
    const pathname = window.location.pathname;
    const isPublicAuthPage =
      pathname.startsWith('/iniciosesion') ||
      pathname.startsWith('/registro') ||
      pathname === '/';

    if (!isPublicAuthPage) {
      window.location.href = '/iniciosesion?session_expired=true';
    }
  }
}

/**
 * Determina el timeout apropiado en milisegundos según el método y cuerpo
 */
function resolveTimeout(method, isFormData, customTimeout) {
  if (typeof customTimeout === 'number' && customTimeout > 0) {
    return customTimeout;
  }
  if (isFormData) {
    return 60000; // 60 segundos para subida de archivos / imágenes
  }
  if (method === 'GET' || method === 'HEAD') {
    return 15000; // 15 segundos para consultas normales
  }
  return 25000; // 25 segundos para operaciones de mutación (POST/PUT/PATCH/DELETE)
}

async function request(
  path,
  { method = 'GET', params, body, isFormData = false, skipAuth = false, timeout, _retried = false } = {}
) {
  const omitirAutenticacion = skipAuth || rutasAuthPublicas.has(path);

  let token = session.getToken();

  // 1. REFRESH PREVENTIVO: Solo para rutas privadas que requieren token
  if (!omitirAutenticacion && token && isTokenExpired(token)) {
    const sesionRenovada = await intentarRefrescarToken();
    if (sesionRenovada) {
      token = session.getToken();
    } else {
      cerrarSesionYRedirigir();
      throw new Error('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
    }
  }

  const headers = {};
  try {
    const activeLang = typeof localStorage !== 'undefined' ? localStorage.getItem('eventhive_lang') : null;
    headers['Accept-Language'] = activeLang === 'en' ? 'en' : 'es';
  } catch {
    headers['Accept-Language'] = 'es';
  }

  const isBodyAllowed = method !== 'GET' && method !== 'HEAD';
  if (!isFormData && isBodyAllowed && body !== undefined) {
    headers['Content-Type'] = 'application/json';
  }

  if (!omitirAutenticacion && token && token !== 'dev-session-token' && !isTokenExpired(token)) {
    headers.Authorization = `Bearer ${token}`;
  }

  let response;
  let timeoutId;
  const timeoutMs = resolveTimeout(method, isFormData, timeout);

  try {
    const controller = new AbortController();
    timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    response = await fetch(buildUrl(path, params), {
      method,
      headers,
      body: isFormData ? body : isBodyAllowed && body !== undefined ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });
  } catch (err) {
    if (err.name === 'AbortError') {
      const error = new Error('El servidor tardó demasiado en responder. Por favor, reintenta más tarde.');
      error.status = 504;
      error.isTimeout = true;
      error.isNetworkError = true;
      throw error;
    }

    // Errores de red o rechazo de conexión (Failed to fetch)
    const error = new Error('No fue posible conectar con el servidor de EventHive. Por favor, intenta de nuevo más tarde.');
    error.status = 503;
    error.isNetworkError = true;
    error.originalError = err;
    throw error;
  } finally {
    if (timeoutId) clearTimeout(timeoutId);
  }

  // 2. MANEJO DE INDISPONIBILIDAD DEL SERVIDOR (502, 503, 504)
  if (response.status === 502 || response.status === 503 || response.status === 504) {
    const error = new Error('El servicio no está disponible en este momento. Por favor, intenta de nuevo más tarde.');
    error.status = response.status;
    error.isNetworkError = true;
    throw error;
  }

  // 3. MANEJO REACTIVO DE 401 UNAUTHORIZED
  if (
    response.status === 401 &&
    !omitirAutenticacion &&
    token &&
    token !== 'dev-session-token'
  ) {
    if (!_retried) {
      const sesionRenovada = await intentarRefrescarToken();
      if (sesionRenovada) {
        return request(path, { method, params, body, isFormData, skipAuth, timeout, _retried: true });
      }
    }

    cerrarSesionYRedirigir();
    throw new Error('Tu sesión ha expirado o no es válida. Por favor, inicia sesión nuevamente.');
  }

  const payload = await response.json().catch(() => null);

  // 4. ERRORES DE CLIENTE / NEGOCIO / 500
  if (!response.ok || payload?.success === false || payload?.exito === false) {
    const responseMessage =
      payload?.mensaje ||
      payload?.message ||
      payload?.error ||
      (typeof payload?.data === 'string' ? payload.data : null);

    let errorMsg;
    if (response.status === 403) {
      errorMsg = typeof responseMessage === 'string' ? responseMessage : 'No tienes permisos para realizar esta acción.';
    } else if (response.status === 400) {
      errorMsg = typeof responseMessage === 'string' ? responseMessage : 'Datos inválidos en la solicitud.';
    } else if (response.status === 404) {
      errorMsg = typeof responseMessage === 'string' ? responseMessage : 'El recurso solicitado no fue encontrado.';
    } else if (response.status >= 500) {
      errorMsg = 'Error interno del servidor. Por favor, intenta de nuevo más tarde.';
    } else {
      errorMsg = typeof responseMessage === 'string'
        ? responseMessage.replace(/\bbackend\b/gi, 'servidor')
        : 'Ocurrió un error al procesar la solicitud.';
    }

    const error = new Error(errorMsg);
    error.status = response.status;
    error.payload = payload;
    throw error;
  }

  if (payload?.data && typeof payload.data === 'object' && !Array.isArray(payload.data) && payload.mensaje) {
    if (!payload.data.mensaje) {
      payload.data._mensaje = payload.mensaje;
    }
  }

  if (payload && Object.prototype.hasOwnProperty.call(payload, 'data')) {
    return payload.data;
  }
  if (payload && Object.prototype.hasOwnProperty.call(payload, 'datos')) {
    return payload.datos;
  }
  return payload;
}

export const httpClient = {
  get: (path, params, options = {}) => request(path, { method: 'GET', params, ...options }),
  post: (path, body, options = {}) => request(path, { method: 'POST', body, ...options }),
  put: (path, body, options = {}) => request(path, { method: 'PUT', body, ...options }),
  patch: (path, body, options = {}) => request(path, { method: 'PATCH', body, ...options }),
  delete: (path, options = {}) => request(path, { method: 'DELETE', ...options }),
};

export default httpClient;
