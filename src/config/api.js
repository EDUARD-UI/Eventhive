/**
 * Resolución de la URL base del backend.
 *
 * Prioridad:
 * 1. VITE_API_URL (definida en .env / .env.production) -> URL del backend desplegado.
 * 2. Backend desplegado de EventHive en Render.
 */

const DEFAULT_API_URL = 'https://eventhive-backend-p903.onrender.com/api';

const deployedUrl = import.meta.env.VITE_API_URL?.trim();

const formatApiUrl = (url) => {
  if (!url) return DEFAULT_API_URL;
  const clean = url.replace(/\/+$/, '');
  return clean.endsWith('/api') ? clean : `${clean}/api`;
};

export const API_BASE_URL = deployedUrl ? formatApiUrl(deployedUrl) : DEFAULT_API_URL;
