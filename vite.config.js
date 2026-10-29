import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'https://eventhive-backend-p903.onrender.com',
        changeOrigin: true,
        secure: true,
        timeout: 120000,
        proxyTimeout: 120000,
        headers: {
          Connection: 'keep-alive',
        },
        configure: (proxy) => {
          proxy.on('error', (err, _req, res) => {
            console.warn('[Vite Proxy]: Error de conexión con el backend en Render:', err?.message);
            if (res && !res.headersSent) {
              res.writeHead(503, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({
                success: false,
                mensaje: 'El backend en Render está despertando del modo reposo o tardó en responder. Reintenta en unos instantes.',
              }));
            }
          });
        },
      },
    },
  },
});
