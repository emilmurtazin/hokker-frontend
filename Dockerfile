# --- Ступень 1: сборка основного приложения ---
FROM node:20-slim AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# --- Ступень 2: сборка панели администратора (второй SPA, путь /admin) ---
# Отдельный проект (свой package.json/vite.config.js с base: '/admin/'), но
# собирается в одном и том же образе — чтобы не заводить второй сервис
# Timeweb App Platform под админку.
FROM node:20-slim AS build-admin
WORKDIR /app-admin
COPY admin-panel/package*.json ./
RUN npm ci
COPY admin-panel/ .
RUN npm run build

# --- Ступень 3: раздача обоих SPA через один nginx ---
FROM nginx:1.27-alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY --from=build-admin /app-admin/dist /usr/share/nginx/html/admin
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 8080
ENTRYPOINT ["/entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]
