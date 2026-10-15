import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // Esta línea es CRUCIAL para que funcione en GitHub Pages
  base: '/261014_HonorariosInteriorismo/',
  server: {
    host: true,
    port: 5173,
  },
})
