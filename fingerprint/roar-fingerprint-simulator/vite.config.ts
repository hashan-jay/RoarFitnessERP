import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const useDirectApi = Boolean(env.VITE_API_URL?.startsWith('http'));

  return {
    plugins: [react()],
    server: {
      port: 5190,
      strictPort: true,
      // Proxy only when VITE_API_URL is not set (fallback). Direct API URL avoids proxy noise.
      proxy: useDirectApi
        ? undefined
        : {
            '/api': {
              target: 'http://localhost:5188',
              changeOrigin: true,
            },
          },
    },
  };
});
