import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// The preview entry point is host port 3000, so the dev server listens there
// directly. `host: true` binds 0.0.0.0 so the sandbox proxy can reach it.
// The proxy's hostname is allowed through the platform-supplied
// __VITE_ADDITIONAL_SERVER_ALLOWED_HOSTS env var (see docker-compose.base44.yml).
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 3000,
    strictPort: true,
  },
  preview: {
    host: true,
    port: 3000,
    strictPort: true,
  },
});
