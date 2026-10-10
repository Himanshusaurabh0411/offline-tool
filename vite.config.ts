import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'icons/*.png'],
      manifest: {
        name: 'OfflineForge - Private Client-Side File Toolkit',
        short_name: 'OfflineForge',
        description: '100% Client-side, offline-first all-in-one file toolkit. Zero uploads, zero tracking.',
        theme_color: '#0f172a',
        background_color: '#0f172a',
        display: 'standalone',
        orientation: 'any',
        icons: [
          {
            src: '/icons/icon-192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,wasm}'],
        maximumFileSizeToCacheInBytes: 30 * 1024 * 1024, // 30 MB for WASM & local bundles
        runtimeCaching: [
          {
            urlPattern: ({ request }) => request.destination === 'document' || request.destination === 'script' || request.destination === 'style',
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'offlineforge-core-cache',
            }
          }
        ]
      }
    })
  ],
  build: {
    chunkSizeWarningLimit: 2500, // suppress warnings for known large WASM-linked chunks
    rollupOptions: {
      output: {
        manualChunks(id) {
          // React ecosystem — always tiny & fast to load
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom')) {
            return 'vendor-react';
          }
          // PDF manipulation — pdf-lib only; pdfjs has its own worker file
          if (id.includes('node_modules/pdf-lib')) {
            return 'chunk-pdf-lib';
          }
          // pdfjs-dist (renderer, NOT the worker mjs which is already split by Vite)
          if (id.includes('node_modules/pdfjs-dist')) {
            return 'chunk-pdfjs';
          }
          // Office document handling
          if (id.includes('node_modules/mammoth') || id.includes('node_modules/xlsx')) {
            return 'chunk-office';
          }
          // Archive & data conversion
          if (id.includes('node_modules/jszip')) {
            return 'chunk-jszip';
          }
          // Markdown / diff / YAML / XML
          if (
            id.includes('node_modules/marked') ||
            id.includes('node_modules/turndown') ||
            id.includes('node_modules/js-yaml') ||
            id.includes('node_modules/fast-xml-parser') ||
            id.includes('node_modules/diff')
          ) {
            return 'chunk-text-tools';
          }
          // QR code generation
          if (id.includes('node_modules/qrcode')) {
            return 'chunk-qrcode';
          }
          // EXIF reading
          if (id.includes('node_modules/exifr')) {
            return 'chunk-exifr';
          }
          // Lucide icons (large icon set)
          if (id.includes('node_modules/lucide-react')) {
            return 'chunk-icons';
          }
        }
      }
    }
  },
  server: {
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'require-corp'
    }
  },
  optimizeDeps: {
    exclude: ['@ffmpeg/ffmpeg', '@ffmpeg/util']
  }
});

