import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// The browser stays on the Vite origin; Nest receives its existing root routes.
const proxy = {
  '/api': {
    target: process.env.API_TARGET || 'http://127.0.0.1:3000',
    changeOrigin: true,
    rewrite: (path: string) => path.replace(/^\/api(?=\/|$)/, '') || '/',
  },
};

export default defineConfig({
  plugins: [react()],
  server: { proxy },
  preview: { proxy },
});
