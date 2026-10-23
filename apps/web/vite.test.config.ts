import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  envDir: false,
  publicDir: false,
  plugins: [react()],
  define: {
    'import.meta.env.VITE_USE_MOCKS': JSON.stringify('false'),
    'import.meta.env.VITE_API_BASE_URL': JSON.stringify('/api'),
  },
});
