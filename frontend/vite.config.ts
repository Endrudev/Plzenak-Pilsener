import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // dist/.vite/manifest.json: která stránka je ve kterém souboru. Serverový renderer z něj
  // přidá <link rel="modulepreload"> pro kód stránky (backend/src/lib/seo/assets.js), aby
  // se při přímém příchodu stahoval souběžně s hlavním balíkem, ne až po něm.
  build: {
    manifest: true,
  },
  server: {
    port: 5173
  }
});
