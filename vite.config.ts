import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath, URL } from 'node:url'

// https://vite.dev/config/
//
// There is no API proxy here. The app calls /bff and /api on its own origin, and that origin is Portio (the BFF):
// in development open https://localhost:7287 - Portio serves these files from this dev server and handles the rest.
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
