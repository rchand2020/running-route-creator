import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react()],
    server: {
      proxy: {
        '/api/directions': {
          target: 'https://api.openrouteservice.org',
          changeOrigin: true,
          rewrite: () => '/v2/directions/foot-walking/geojson',
          headers: { Authorization: env.ORS_API_KEY || '' },
        },
        '/api/geocode': {
          target: 'https://api.openrouteservice.org',
          changeOrigin: true,
          rewrite: (path) => path.replace('/api/geocode', '/geocode/search'),
          headers: { Authorization: env.ORS_API_KEY || '' },
        },
      },
    },
  };
})
