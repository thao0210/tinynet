import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path';
import { VitePWA } from 'vite-plugin-pwa';
import { visualizer } from "rollup-plugin-visualizer";
// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    visualizer({ open: true }),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Tiny Net',
        short_name: 'Tiny Net',
        start_url: '/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#FEA858',
        orientation: 'portrait',
        icons: [
          { src: '/icons/icon-48x48.png', sizes: '48x48', type: 'image/png' },
          { src: '/icons/icon-72x72.png', sizes: '72x72', type: 'image/png' },
          { src: '/icons/icon-96x96.png', sizes: '96x96', type: 'image/png' },
          { src: '/icons/icon-144x144.png', sizes: '144x144', type: 'image/png' },
          { src: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icons/icon-256x256.png', sizes: '256x256', type: 'image/png' },
          { src: '/icons/icon-384x384.png', sizes: '384x384', type: 'image/png' },
          { src: '/icons/icon-512x512.png', sizes: '512x512', type: 'image/png' },
          { src: '/icons/icon-1024x1024.png', sizes: '1024x1024', type: 'image/png' }
        ]
      }
    })
  ],

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
