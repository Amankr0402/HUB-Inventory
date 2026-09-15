import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/metabase': {
        target: 'https://metabase-bkp.theelefant.ai',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/metabase/, ''),
        secure: false,
      },
    },
  },
  // @ts-ignore
  test: {
    globals: true,
    environment: 'node',
  },
});
