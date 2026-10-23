import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  envDir: false,
  plugins: [react()],
  define: { 'import.meta.env.VITE_API_URL': JSON.stringify('http://angry-dad.test/api') },
  test: {
    environment: 'jsdom',
    environmentOptions: { jsdom: { url: 'http://angry-dad.test/' } },
    include: ['test/{unit,integration}/**/*.test.{ts,tsx}'],
    setupFiles: ['test/helpers/setup.ts'],
    restoreMocks: true,
  },
});
