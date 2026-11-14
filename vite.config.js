import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  // Determinamos el destino del proxy según la configuración:
  // Si VITE_API_MODE es 'local', el proxy apunta a Spring Boot (localhost:8080).
  // Si VITE_API_MODE es 'azure' (o por defecto si se especifica VITE_API_URL), apunta a Azure.
  const isLocalMode = env.VITE_API_MODE === 'local';
  const targetUrl = isLocalMode
    ? (env.VITE_LOCAL_API_URL || env.VITE_LOCAL_BACKEND_TARGET || 'http://localhost:8080')
    : (env.VITE_API_URL || 'https://eventhive-bggyerbvhwa6akbq.brazilsouth-01.azurewebsites.net');

  const backendTarget = targetUrl.replace(/\/api\/?$/, '');

  return {
    plugins: [react()],
    server: {
      watch: {
        usePolling: true,
      },
      proxy: {
        '/api': {
          target: backendTarget,
          changeOrigin: true,
          secure: false,
          timeout: 60000,
          proxyTimeout: 60000,
          headers: {
            Connection: 'keep-alive',
          },
          configure: (proxy) => {
            proxy.on('error', (err, _req, res) => {
              console.warn('[Vite Proxy]: Error de conexión con el backend:', err?.message);
              if (res && !res.headersSent) {
                res.writeHead(503, { 'Content-Type': 'application/json' });
                res.end(
                  JSON.stringify({
                    success: false,
                    mensaje:
                      'El servicio no está disponible en este momento. Por favor, intenta de nuevo más tarde.',
                  })
                );
              }
            });
          },
        },
      },
    },
  };
});
