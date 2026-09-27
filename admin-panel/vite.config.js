import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// base: '/admin/' — панель раздаётся тем же nginx, что и основной сайт,
// по пути /admin/ (см. корневой Dockerfile/nginx.conf проекта hokker-frontend).
export default defineConfig({
  base: '/admin/',
  plugins: [react()],
  server: {
    host: true,
    port: 5174,
  },
})
