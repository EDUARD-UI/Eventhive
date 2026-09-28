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

async function request(path, { method = 'GET', params, body, isFormData = false } = {}) {
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

  // Token vencido o inválido: limpiar sesión y redirigir a inicio de sesión
  if (response.status === 401 && path !== '/auth/login') {
    session.clear();
    if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/iniciosesion')) {
      window.location.href = '/iniciosesion';
    }
  }

  const payload = await response.json().catch(() => null);

  if (!response.ok || payload?.success === false) {
    throw new Error(payload?.mensaje || 'Ocurrió un error al procesar la solicitud.');
  }

  if (payload && typeof payload === 'object' && payload.data !== undefined) {
    return payload.data;
  }
  return payload;
}

export const httpClient = {
  get: (path, params) => request(path, { method: 'GET', params }),
  post: (path, body, options = {}) => request(path, { method: 'POST', body, ...options }),
  put: (path, body, options = {}) => request(path, { method: 'PUT', body, ...options }),
  patch: (path, body, options = {}) => request(path, { method: 'PATCH', body, ...options }),
  delete: (path, options = {}) => request(path, { method: 'DELETE', ...options }),
};
