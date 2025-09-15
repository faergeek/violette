import * as path from 'node:path';
import { fileURLToPath } from 'node:url';

import { nodeResolve } from '@rollup/plugin-node-resolve';
import react from '@vitejs/plugin-react-swc';
import { defineConfig } from 'vitest/config';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function relative(name) {
  return path.resolve(__dirname, name);
}

export default defineConfig({
  build: {
    sourcemap: true,
    target: 'esnext',
  },
  css: {
    devSourcemap: true,
  },
  plugins: [react(), nodeResolve()],
  server: {
    watch: {
      ignored: [relative('_opam'), relative('src')],
    },
  },
  test: {
    include: ['js/**/*_spec.jsx'],
  },
});
