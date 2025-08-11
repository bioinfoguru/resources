import { defineConfig } from 'vite';
import solidPlugin from 'vite-plugin-solid';

export default defineConfig({
  plugins: [solidPlugin()],
  server: {
    port: 3000,
  },
  build: {
    target: 'esnext',
  },
  // Add this 'base' property and remove the 'start' block
  base: '/resources', // IMPORTANT: Replace 'resources' with your actual repo name
});
