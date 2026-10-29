/**
 * Configuración de la URL base del backend para EventHive.
 * Conecta directamente al backend desplegado en Render (o a la URL definida en VITE_API_URL).
 * El backend de Spring Boot ya cuenta con soporte CORS completo para http://localhost:5173.
 */

const RENDER_API_URL = 'https://eventhive-backend-p903.onrender.com/api';

const customUrl = import.meta.env.VITE_API_URL?.trim();

export const formatApiUrl = (url) => {
  if (!url) return RENDER_API_URL;
  const clean = String(url).trim().replace(/\/+$/, '');
  return clean.endsWith('/api') ? clean : `${clean}/api`;
};

export const API_BASE_URL = customUrl
  ? formatApiUrl(customUrl)
  : RENDER_API_URL;

export const getApiBaseUrl = () => API_BASE_URL;

export default API_BASE_URL;
