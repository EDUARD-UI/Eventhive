/**
 * Configuración de la URL base del backend para EventHive.
 * Conecta directamente al backend desplegado en Azure (o a la URL definida en VITE_API_URL).
 * El backend de Spring Boot ya cuenta con soporte CORS completo para http://localhost:5173.
 */

const AZURE_API_URL = 'https://eventhive-bggyerbvhwa6akbq.brazilsouth-01.azurewebsites.net/api';

const customUrl = import.meta.env.VITE_API_URL?.trim();

export const formatApiUrl = (url) => {
  if (!url) return AZURE_API_URL;
  const clean = String(url).trim().replace(/\/+$/, '');
  return clean.endsWith('/api') ? clean : `${clean}/api`;
};

export const API_BASE_URL = customUrl
  ? formatApiUrl(customUrl)
  : AZURE_API_URL;

export const getApiBaseUrl = () => API_BASE_URL;

export default API_BASE_URL;
