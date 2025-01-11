import { TanStackRouterVite } from '@tanstack/router-plugin/vite';
import react from '@vitejs/plugin-react-swc';
import { visualizer } from 'rollup-plugin-visualizer';
import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    sourcemap: true,
    target: 'esnext',
  },
  css: {
    devSourcemap: true,
  },
  plugins: [TanStackRouterVite(), react(), visualizer({ emitFile: true })],
});
