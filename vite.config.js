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
    start: {
    ssr: true,
    server: {
      baseURL: process.env.BASE_PATH,
      preset: "static"
    }
  },
});
