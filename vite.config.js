// Configurazione di Vite: attiviamo il plugin di React e quello di Tailwind CSS (v4)
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    // Proxy: quando il sito chiede /api/... Vite gira la richiesta al nostro server
    // delle notizie sulla porta 3001. Così per il browser è tutto "stesso sito" e niente CORS.
    proxy: {
      '/api': 'http://localhost:3001',
    },
  },
})
