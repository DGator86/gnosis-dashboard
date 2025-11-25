import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // Listen on all addresses
    port: 5173,
    strictPort: false,
    hmr: {
      clientPort: 443,
      protocol: 'wss'
    },
    // Allow access from any host
    allowedHosts: [
      '.sandbox.novita.ai',
      'localhost',
      '127.0.0.1'
    ]
  }
})
