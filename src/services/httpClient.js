import { API_BASE_URL } from '../config/api.js';
import { session } from './session.js';

const buildUrl = (path, params) => {
  const url = new URL(`${API_BASE_URL}${path}`);

  Object.entries(params || {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.append(key, value);
    }
  });

  return url;
};

// Evita que N peticiones en paralelo (ej. el dashboard de Admin que dispara
// varias llamadas con Promise.all) intenten refrescar el token N veces o
// disparen N redirecciones. Todas comparten la misma promesa en curso.
let refreshInFlight = null;

async function intentarRefrescarToken() {
  if (refreshInFlight) return refreshInFlight;

  const refreshToken = session.getRefreshToken();
  if (!refreshToken) return null;

  refreshInFlight = (async () => {
    try {
      const response = await fetch(buildUrl('/auth/refresh'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });

      if (!response.ok) return null;

      const payload = await response.json().catch(() => null);
      if (!payload?.data) return null;

      // Guarda el nuevo accessToken (y conserva/actualiza el refreshToken)
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
  if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/iniciosesion')) {
    window.location.href = '/iniciosesion';
  }
}

async function request(path, { method = 'GET', params, body, isFormData = false, _retried = false } = {}) {
  const token = session.getToken();

  const headers = {};
  if (!isFormData) headers['Content-Type'] = 'application/json';
  if (token) headers.Authorization = `Bearer ${token}`;

  let response;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

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

  // Rutas públicas de auth: nunca dispares el flujo de refresh/logout por un 401 aquí
  // (por ejemplo login con credenciales incorrectas).
  const esRutaAuthPublica = path === '/auth/login' || path === '/auth/refresh';

  if (response.status === 401 && !esRutaAuthPublica) {
    // Antes de asumir que la sesión murió, intenta un refresh silencioso UNA sola vez.
    if (!_retried) {
      const nuevaSesion = await intentarRefrescarToken();
      if (nuevaSesion?.accessToken) {
        return request(path, { method, params, body, isFormData, _retried: true });
      }
    }

    // El refresh también falló (o no había refreshToken): ahí sí, sesión inválida de verdad.
    cerrarSesionYRedirigir();
  }

  const payload = await response.json().catch(() => null);

  if (!response.ok || payload?.success === false) {
    throw new Error(payload?.mensaje || 'Ocurrió un error al procesar la solicitud.');
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
