import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';

// Keep the /api prefix used by Nest; requests stay on the Vite origin.
const proxy = {
  '/api': {
    target: process.env.API_TARGET || 'http://127.0.0.1:3000',
    changeOrigin: true,
  },
};

export default defineConfig(({ mode }) => {
  const environment = loadEnv(mode, process.cwd(), 'VITE_');
  const mocks = (process.env.VITE_USE_MOCKS ?? environment.VITE_USE_MOCKS) === 'true';
  return {
    plugins: [react()],
    // public currently contains only the MSW worker, which must stay out of real builds.
    publicDir: mocks ? 'public' : false,
    server: { proxy },
    preview: { proxy },
  };
});
