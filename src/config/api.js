/**
 * Configuración y resolución de la URL base del backend para EventHive.
 *
 * URLs por defecto:
 * - Render (Nube): https://eventhive-backend-p903.onrender.com/api
 * - Localhost (Desarrollo local): http://localhost:8080/api
 *
 * Comportamiento:
 * 1. Intenta conectarse al backend de Render (o la variable VITE_API_URL).
 * 2. Si el backend de Render no responde, falla la conexión o da error de servidor (502/503),
 *    conmuta automáticamente a http://localhost:8080/api y notifica a la interfaz.
 * 3. Permite alternar manualmente entre ambos en cualquier momento desde la interfaz.
 */

export const DEFAULT_RENDER_URL = 'https://eventhive-backend-p903.onrender.com/api';
export const DEFAULT_LOCAL_URL = 'http://localhost:8080';

export const formatApiUrl = (url, fallback = DEFAULT_RENDER_URL) => {
  if (!url) return fallback;
  const clean = String(url).trim().replace(/\/+$/, '');
  return clean.endsWith('/api') ? clean : `${clean}/api`;
};

export const RENDER_API_URL = formatApiUrl(
  import.meta.env.VITE_API_URL,
  DEFAULT_RENDER_URL
);

export const LOCAL_API_URL = formatApiUrl(
  import.meta.env.VITE_LOCAL_API_URL,
  DEFAULT_LOCAL_URL
);

const STORAGE_KEY = 'eventhive_backend_target';
const listeners = new Set();

// Inicializa el target a partir de localStorage o 'render' por defecto
let currentTarget = (() => {
  if (typeof window !== 'undefined') {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === 'local' || saved === 'render') {
        return saved;
      }
    } catch {
      // Ignora errores de localStorage
    }
  }
  return 'render';
})();

let fallbackState = {
  isFallback: false,
  reason: null,
  timestamp: null,
};

export function getActiveBackend() {
  return currentTarget;
}

export function getApiBaseUrl() {
  return currentTarget === 'local' ? LOCAL_API_URL : RENDER_API_URL;
}

export function getFallbackState() {
  return { ...fallbackState };
}

function notifySubscribers() {
  const state = {
    target: currentTarget,
    url: getApiBaseUrl(),
    isFallback: fallbackState.isFallback,
    reason: fallbackState.reason,
    renderUrl: RENDER_API_URL,
    localUrl: LOCAL_API_URL,
  };

  listeners.forEach((listener) => {
    try {
      listener(state);
    } catch (e) {
      console.error('[EventHive Config] Error en listener de backend:', e);
    }
  });

  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('eventhive:backend-changed', { detail: state })
    );
  }
}

export function setBackendTarget(target, { isFallback = false, reason = null } = {}) {
  if (target !== 'local' && target !== 'render') return;

  currentTarget = target;
  fallbackState = {
    isFallback,
    reason,
    timestamp: isFallback ? Date.now() : null,
  };

  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEY, target);
    } catch {
      // Ignora errores de localStorage
    }
  }

  // Actualizar la variable exportada para compatibilidad
  API_BASE_URL = getApiBaseUrl();
  notifySubscribers();
}

/**
 * Conmuta automáticamente al backend local tras una falla de Render.
 */
export function switchToLocalFallback(reason = 'El servidor de Render no está disponible') {
  setBackendTarget('local', { isFallback: true, reason });
}

/**
 * Restaura el backend principal (Render).
 */
export function resetToRender() {
  setBackendTarget('render', { isFallback: false, reason: null });
}

/**
 * Suscripción reactiva para componentes que deseen escuchar cambios de backend en vivo.
 */
export function subscribeBackendChanges(listener) {
  listeners.add(listener);
  // Notificación inicial inmediata
  try {
    listener({
      target: currentTarget,
      url: getApiBaseUrl(),
      isFallback: fallbackState.isFallback,
      reason: fallbackState.reason,
      renderUrl: RENDER_API_URL,
      localUrl: LOCAL_API_URL,
    });
  } catch (e) {
    console.error(e);
  }

  return () => {
    listeners.delete(listener);
  };
}

/**
 * Prueba la disponibilidad de una URL de backend mediante un ping rápido.
 */
export async function testBackendConnection(url, timeoutMs = 4000) {
  const cleanUrl = formatApiUrl(url);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(`${cleanUrl}/eventos/destacados`, {
      method: 'GET',
      signal: controller.signal,
    }).catch(async () => {
      // Si la ruta específica falla por 404, prueba petición a la raíz
      return fetch(cleanUrl, { method: 'HEAD', signal: controller.signal });
    });

    clearTimeout(timer);
    return { ok: true, status: response?.status };
  } catch (err) {
    clearTimeout(timer);
    return { ok: false, error: err.name === 'AbortError' ? 'Tiempo de espera agotado' : 'Conexión rechazada o sin red' };
  }
}

// Exportación mutable con enlace en vivo para compatibilidad con imports directos
export let API_BASE_URL = getApiBaseUrl();
