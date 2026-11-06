import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

// HashRouter を使うため base は相対パスにし、GitHub Pages のサブパスでも動くようにする
export default defineConfig({
  plugins: [react()],
  base: './',
  test: {
    environment: 'node',
    globals: true,
  },
});
