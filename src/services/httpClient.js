import { API_BASE_URL } from '../config/api.js';
import { session, isTokenExpired } from './session.js';

const buildUrl = (path, params) => {
  const url = new URL(`${API_BASE_URL}${path}`);

  Object.entries(params || {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.append(key, value);
    }
  });

  return url;
};

// Evita que peticiones concurrentes intenten refrescar el token en paralelo.
// Todas comparten la misma promesa de renovación en curso.
let refreshInFlight = null;

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
    try {
      const response = await fetch(buildUrl('/auth/refresh'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: cleanRefreshToken }),
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

      // Guarda el nuevo accessToken (y renueva refreshToken si vino uno nuevo)
      session.save(payload.data);
      return payload.data;
    } catch {
      return null;
    } finally {
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

async function request(path, { method = 'GET', params, body, isFormData = false, _retried = false } = {}) {
  // Rutas de autenticación pública que no deben pasar por refresh de token ni enviar Authorization
  const esRutaAuthPublica =
    path === '/auth/login' ||
    path === '/auth/refresh' ||
    path === '/auth/registro' ||
    path.startsWith('/auth/verificar-codigo') ||
    path.startsWith('/auth/reenviar-codigo');

  let token = session.getToken();

  // 1. REFRESH PREVENTIVO: Si el token existe pero está expirado o vence en < 15s,
  // refrescarlo silenciosamente ANTES de disparar la petición para evitar errores 401 en consola.
  if (!esRutaAuthPublica && token && isTokenExpired(token)) {
    const sesionRenovada = await intentarRefrescarToken();
    if (sesionRenovada) {
      token = session.getToken();
    } else {
      // Si el refresh token falló, limpiamos la sesión
      session.clear();
      token = null;
      // Solo lanzamos error bloqueante si es una petición privada que modifica datos
      if (method !== 'GET') {
        cerrarSesionYRedirigir();
        throw new Error('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
      }
    }
  }

  const headers = {};
  if (!isFormData) headers['Content-Type'] = 'application/json';
  if (token && token !== 'dev-session-token') {
    headers.Authorization = `Bearer ${token}`;
  }

  let response;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 45000);

    response = await fetch(buildUrl(path, params), {
      method,
      headers,
      body: isFormData ? body : body !== undefined ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
  } catch (err) {
    if (err.name === 'AbortError') {
      throw new Error('La solicitud tardó demasiado tiempo en responder. Verifica la conexión con el servidor.');
    }
    throw new Error('No fue posible conectar con el servidor. Verifica que el backend esté disponible.');
  }

  // 2. MANEJO REACTIVO DE 401 UNAUTHORIZED:
  // Si el servidor rechaza por token expirado/inválido en vuelo:
  if (response.status === 401 && !esRutaAuthPublica) {
    if (!_retried) {
      const sesionRenovada = await intentarRefrescarToken();
      if (sesionRenovada) {
        return request(path, { method, params, body, isFormData, _retried: true });
      }
    }

    // Si el refresh falló o ya fue reintentado: el token no es válido ni renovable
    cerrarSesionYRedirigir();
    throw new Error('Tu sesión ha expirado o no es válida. Por favor, inicia sesión nuevamente.');
  }

  const payload = await response.json().catch(() => null);

  if (!response.ok || payload?.success === false) {
    const error = new Error(payload?.mensaje || 'Ocurrió un error al procesar la solicitud.');
    error.status = response.status;
    error.payload = payload;
    throw error;
  }

  // Si data es un objeto, adjuntamos el mensaje original del backend
  if (payload?.data && typeof payload.data === 'object' && !Array.isArray(payload.data) && payload.mensaje) {
    if (!payload.data.mensaje) {
      payload.data._mensaje = payload.mensaje;
    }
  }

  return payload?.data;
}

export const httpClient = {
  get: (path, params) => request(path, { method: 'GET', params }),
  post: (path, body, options = {}) => request(path, { method: 'POST', body, ...options }),
  put: (path, body, options = {}) => request(path, { method: 'PUT', body, ...options }),
  patch: (path, body, options = {}) => request(path, { method: 'PATCH', body, ...options }),
  delete: (path, options = {}) => request(path, { method: 'DELETE', ...options }),
};

export default httpClient;
