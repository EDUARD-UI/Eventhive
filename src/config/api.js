/**
 * Configuración Centralizada de API para EventHive
 *
 * PLAN A — Producción (Vercel):
 *   Frontend desplegado en Vercel -> Backend desplegado en Azure App Service.
 *   URL: https://eventhive-bggyerbvhwa6akbq.brazilsouth-01.azurewebsites.net/api
 *
 * PLAN B — Respaldo local:
 *   Frontend en http://localhost:5173 -> Backend local en http://localhost:8080.
 *   URL: http://localhost:8080/api
 *
 * REGLAS ESTRICTAS:
 * 1. La selección depende del hostname real del navegador (window.location.hostname).
 * 2. Vercel NUNCA intenta conectarse a localhost ni utiliza fallbacks locales.
 * 3. Localhost NUNCA utiliza Azure como alternativa ni depende de variables de Azure.
 * 4. No hay fallback silencioso entre servidores.
 */

export const AZURE_API_URL = 'https://eventhive-bggyerbvhwa6akbq.brazilsouth-01.azurewebsites.net/api';
export const LOCAL_API_URL = 'http://localhost:8080/api';

/**
 * Determina si el entorno actual de ejecución es local según el hostname del navegador.
 */
export const isLocalEnvironment = () => {
  if (typeof window !== 'undefined' && window.location?.hostname) {
    const host = window.location.hostname.toLowerCase();
    return (
      host === 'localhost' ||
      host === '127.0.0.1' ||
      host === '::1' ||
      host === '[::1]' ||
      host.endsWith('.local') ||
      host.endsWith('.localhost')
    );
  }

  // Fallback para entornos sin ventana (Node.js tests / SSR)
  const env = typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env : (typeof process !== 'undefined' ? process.env : {});
  const nodeEnv = env?.NODE_ENV || (typeof process !== 'undefined' ? process.env?.NODE_ENV : '');
  return nodeEnv === 'development' || nodeEnv === 'test';
};

/**
 * Normaliza cualquier URL base garantizando que no duplique barras ni '/api'.
 */
export const formatApiUrl = (url) => {
  if (!url || typeof url !== 'string') return isLocalEnvironment() ? LOCAL_API_URL : AZURE_API_URL;
  const clean = url.trim().replace(/\/+$/, '');
  return clean.endsWith('/api') ? clean : `${clean}/api`;
};

/**
 * Obtiene la URL base de la API determinísticamente según el hostname del entorno actual.
 */
export const getApiBaseUrl = () => {
  const isLocal = isLocalEnvironment();
  const env = typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env : (typeof process !== 'undefined' ? process.env : {});

  if (isLocal) {
    // Entorno Local: localhost:5173 -> localhost:8080
    // Permitir sobrescritura local SOLO si apunta a una dirección estrictamente local
    const customLocal = env?.VITE_LOCAL_API_URL?.trim();
    if (customLocal) {
      try {
        const parsed = new URL(customLocal);
        const host = parsed.hostname.toLowerCase();
        if (
          host === 'localhost' ||
          host === '127.0.0.1' ||
          host === '::1' ||
          host.endsWith('.local') ||
          host.endsWith('.localhost')
        ) {
          return formatApiUrl(customLocal);
        }
      } catch {
        // En caso de URL inválida, usar LOCAL_API_URL por defecto
      }
    }
    return LOCAL_API_URL;
  }

  // Entorno Producción (Vercel / Dominio remoto): SIEMPRE Azure
  // REGLA CRÍTICA: Vercel NUNCA debe conectarse a localhost.
  const customProd = env?.VITE_API_URL?.trim();
  if (customProd) {
    try {
      const parsed = new URL(customProd);
      const host = parsed.hostname.toLowerCase();
      // Si por error se configuró una URL local en producción, se ignora y se fuerza Azure
      if (
        host !== 'localhost' &&
        host !== '127.0.0.1' &&
        host !== '::1' &&
        !host.endsWith('.local') &&
        !host.endsWith('.localhost')
      ) {
        return formatApiUrl(customProd);
      }
    } catch {
      // En caso de error, recurrir a la URL canónica de Azure
    }
  }

  return AZURE_API_URL;
};

export const API_BASE_URL = getApiBaseUrl();

export default API_BASE_URL;
