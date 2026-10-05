import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';

import react from '@vitejs/plugin-react';
import { defineConfig, type Plugin } from 'vite';

const require = createRequire(import.meta.url);

/**
 * MapLibre resolves its worker next to the built JS file. Vite does not emit
 * that file, so the live site receives the homepage instead and place labels
 * never render. Dev keeps using the package copy beside node_modules.
 */
function copyMaplibreWorkers(): Plugin {
  return {
    name: 'copy-maplibre-workers',
    apply: 'build',
    generateBundle() {
      for (const fileName of ['maplibre-gl-worker.mjs', 'maplibre-gl-shared.mjs']) {
        this.emitFile({
          type: 'asset',
          fileName: `assets/${fileName}`,
          source: readFileSync(require.resolve(`maplibre-gl/dist/${fileName}`)),
        });
      }
    },
  };
}

export default defineConfig({
  plugins: [react(), copyMaplibreWorkers()],
  optimizeDeps: {
    exclude: ['maplibre-gl'],
  },
});
