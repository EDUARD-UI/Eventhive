import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  // Para desarrollo local con Vite (npm run dev), el target por defecto es Spring Boot en localhost:8080
  const backendTarget =
    env.VITE_LOCAL_BACKEND_TARGET ||
    (env.VITE_LOCAL_API_URL ? env.VITE_LOCAL_API_URL.replace(/\/api\/?$/, '') : '') ||
    'http://localhost:8080';

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
              console.warn('[Vite Proxy]: Error de conexión con el backend local:', err?.message);
              if (res && !res.headersSent) {
                res.writeHead(503, { 'Content-Type': 'application/json' });
                res.end(
                  JSON.stringify({
                    success: false,
                    mensaje:
                      'El backend local no está disponible. Verifica que Spring Boot esté ejecutándose en localhost:8080.',
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
