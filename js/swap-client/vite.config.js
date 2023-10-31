import { defineConfig } from 'vite'
import { resolve } from 'path'
import react from '@vitejs/plugin-react'
import wasm from "vite-plugin-wasm"
import topLevelAwait from "vite-plugin-top-level-await"

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    wasm(),
    topLevelAwait()
  ],
  optimizeDeps: {
    include: [
      '@portaldefi/core',
      '@portaldefi/sdk'
    ]
  },
  resolve: {
    alias: {
      $fonts: resolve('./public')
    }
  },
  build: {
    commonjsOptions: {
      include: [/core/, /sdk/, /node_modules/]
    },
    minifiy: false,
    rollupOptions: {
      onwarn (warning, warn) {
        if (warning.code === 'MODULE_LEVEL_DIRECTIVE' &&
        warning.message.includes('\'use client\'')) {
          return
        }
        warn(warning)
      }
    }
  }
})
