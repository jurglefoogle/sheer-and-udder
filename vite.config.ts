import { defineConfig } from 'vite';

// GitHub Pages serves the project at /sheer-and-udder/.
export default defineConfig({
  base: process.env.BASE_PATH ?? '/sheer-and-udder/',
  build: { target: 'es2022', assetsInlineLimit: 0 },
});
