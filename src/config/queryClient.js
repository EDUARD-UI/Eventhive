import { QueryClient } from '@tanstack/react-query';

/**
 * Cliente global de TanStack Query para EventHive.
 * Configuración optimizada con Stale-While-Revalidate:
 * - Carga instantánea desde caché en memoria al navegar entre pantallas.
 * - Revalidación en segundo plano para sincronizar nuevos registros.
 * - 2 minutos de tiempo 'fresh' (staleTime) y 15 minutos de persistencia en memoria (gcTime).
 * - Manejo inteligente de reintentos: no reintentar errores de cliente (4xx), máximo 1 reintento para errores de conexión o 5xx.
 * - Mutaciones estrictamente sin reintentos automáticos para evitar transacciones duplicadas.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 2,
      gcTime: 1000 * 60 * 15,
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      retry: (failureCount, error) => {
        // No reintentar errores 4xx (400, 401, 403, 404, etc.)
        if (error?.status && error.status >= 400 && error.status < 500) {
          return false;
        }
        // Máximo 1 reintento para errores de red o servidor para evitar bucles infinitos
        return failureCount < 1;
      },
    },
    mutations: {
      // REGLA CRÍTICA: Nunca reintentar mutaciones automáticamente (compras, pagos, creación de eventos)
      retry: false,
    },
  },
});

export default queryClient;
