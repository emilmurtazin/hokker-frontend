#!/bin/sh
set -e

if [ -z "$API_BASE_URL" ]; then
  echo "ПРЕДУПРЕЖДЕНИЕ: переменная окружения API_BASE_URL не задана."
  echo "Фронтенд не сможет обратиться к бэкенду. Задайте API_BASE_URL"
  echo "в настройках приложения на Timeweb App Platform."
else
  # Оба SPA (основной сайт и панель администратора в /admin) ходят
  # в один и тот же бэкенд, поэтому подставляем один и тот же адрес
  # в оба config.js.
  sed -i "s|__API_BASE_URL__|${API_BASE_URL}|g" /usr/share/nginx/html/config.js
  sed -i "s|__API_BASE_URL__|${API_BASE_URL}|g" /usr/share/nginx/html/admin/config.js
  echo "API_BASE_URL подставлен: ${API_BASE_URL}"
fi

exec "$@"
