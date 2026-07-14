import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const BACKEND = 'http://127.0.0.1:8001'

function proxyTarget() {
  return {
    target: BACKEND,
    configure: (proxy) => {
      proxy.on('error', (err, req, res) => {
        if (err.code === 'ECONNREFUSED') {
          res.writeHead(502, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({ error: 'Backend not ready yet' }))
        }
      })
    },
  }
}

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/chat': proxyTarget(),
      '/auth': proxyTarget(),
      '/history': proxyTarget(),
    },
  },
})
