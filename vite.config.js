import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.png', 'logo-icon.png'],
      // Панель администратора (/admin) — отдельный SPA на том же домене.
      // Без этого service worker основного приложения перехватывает любую
      // навигацию в пределах origin (scope по умолчанию — "/") и вместо
      // обращения к серверу отдаёт закэшированную оболочку ЭТОГО приложения,
      // так что /admin/* никогда не доходит до nginx/своего index.html.
      workbox: {
        navigateFallbackDenylist: [/^\/admin/],
      },
      manifest: {
        name: '24hokker.ru — Школа хоккея',
        short_name: '24hokker.ru',
        description: 'Платформа для тренеров, родителей и арен',
        theme_color: '#0B2545',
        background_color: '#F0F4F8',
        display: 'standalone',
        start_url: '/',
        icons: [
          { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
        ],
      },
    }),
  ],
  server: {
    host: true,
    port: 5173,
  },
})
