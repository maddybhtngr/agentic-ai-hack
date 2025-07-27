import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Serve over HTTPS to match backend
    https: false,
    // Proxy API requests to avoid CORS issues (alternative approach)
    proxy: {
      '/api': {
        target: 'https://backend-service-178028895966.us-central1.run.app',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      },
      '/workflow-api': {
        target: 'https://backend-service-2-178028895966.us-central1.run.app',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/workflow-api/, '')
      }
    }
  }
})
