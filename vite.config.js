import react from '@vitejs/plugin-react-swc';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  build: { sourcemap: true, target: 'esnext' },
  css: { devSourcemap: true },
  plugins: [react()],
});
