import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { analyzer } from 'vite-bundle-analyzer';
import EnvironmentPlugin from 'vite-plugin-environment';

const isProd = process.env.NODE_ENV === 'production';
const plugins = [react(), EnvironmentPlugin(['API_ENDPOINT', 'FONT_API_KEY'])];
if (isProd) {
  plugins.push(
    analyzer({
      analyzerMode: 'static',
      openAnalyzer: false,
    }),
  );
}

export default defineConfig({
  plugins,
  server: {
    port: 4200,
  },
  build: {
    sourcemap: true, // Generate source maps for debugging
    rollupOptions: {
      treeshake: true,
    },
  },
});
