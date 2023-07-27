import { defineConfig } from 'vite'
import { resolve } from 'path'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: ['@portaldefi/sdk']
  },
  build: {
    commonjsOptions: {
      include: [/sdk/, /node_modules/]
    },
    minifiy: false
  },
  server: {
    proxy: {
      '/api': {
        target: 'ws://localhost:1337',
        changeOrigin: true,
        secure: false,
        ws: true,
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('proxy error', err)
          })
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            console.log('Sending Request to the Target:', req.method, req.url)
          })
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            console.log('Received Response from the Target:', proxyRes.statusCode, req.url)
          })
        }
      }
    }
  }
})

/**
 * Start the Portal peer
 * @type {Peer}
 */
import Server from '@portaldefi/peer'
const server = new Server({ hostname: 'localhost', port: 1337 })
  .on('log', console.error)
  .start()

process.on('exit', () => server.stop())
