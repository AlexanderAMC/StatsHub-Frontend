import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.js'],
    include: ['src/**/*.test.{js,jsx}'],
    css: false,
    // jsdom es costoso de crear: se reutiliza dentro de cada worker (setup.js limpia el DOM,
    // localStorage y los mocks después de cada test) y se dan márgenes amplios a equipos lentos.
    isolate: false,
    // Hilos en vez de procesos: arrancan mucho más rápido en equipos con poca memoria.
    pool: 'threads',
    testTimeout: 30000,
    hookTimeout: 30000,
    teardownTimeout: 30000,
  },
})
