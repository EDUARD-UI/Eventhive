/**
 * Resolución de la URL base del backend.
 *
 * Prioridad:
 * 1. VITE_API_URL (definida en .env / .env.production) -> URL del backend desplegado.
 * 2. Backend desplegado de EventHive.
 */

const DEFAULT_API_URL = 'https://eventhive-backend-mr93.onrender.com/api';

const deployedUrl = import.meta.env.VITE_API_URL?.trim();

export const API_BASE_URL = deployedUrl ? deployedUrl.replace(/\/$/, '') : DEFAULT_API_URL;
