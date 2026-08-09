import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // El backend de Spring Boot sirve archivos estaticos desde
    // src/main/resources/static, asi que el build de produccion
    // se genera directamente ahi. En desarrollo esto no se usa
    // (se usa el dev server de Vite con proxy, ver abajo).
    outDir: '../src/main/resources/static',
    emptyOutDir: true,
  },
  server: {
    // Durante "npm run dev", cualquier request a /api/* se redirige
    // al backend real en localhost:8080. Asi el frontend puede pedir
    // rutas relativas ("/api/v1/gastos") sin preocuparse por CORS,
    // tanto en desarrollo como en produccion (donde Spring sirve todo
    // desde el mismo origen).
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
})
