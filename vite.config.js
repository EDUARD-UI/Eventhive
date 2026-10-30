import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const backendTarget =
    env.VITE_BACKEND_TARGET ||
    (env.VITE_LOCAL_API_URL ? env.VITE_LOCAL_API_URL.replace(/\/api\/?$/, '') : '') ||
    'https://eventhive-bggyerbvhwa6akbq.brazilsouth-01.azurewebsites.net';

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
          timeout: 120000,
          proxyTimeout: 120000,
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
                      'El backend está despertando del modo reposo o tardó en responder. Reintenta en unos instantes.',
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
