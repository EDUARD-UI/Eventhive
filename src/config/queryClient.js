import { QueryClient } from '@tanstack/react-query';

/**
 * Cliente global de TanStack Query para EventHive.
 * Configuración optimizada con Stale-While-Revalidate:
 * - Carga instantánea desde caché en memoria al navegar entre pantallas.
 * - Revalidación en segundo plano para sincronizar nuevos registros.
 * - 2 minutos de tiempo 'fresh' (staleTime) y 15 minutos de persistencia en memoria (gcTime).
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 2,
      gcTime: 1000 * 60 * 15,
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      retry: 1,
    },
  },
});

