// Значение подставляется entrypoint-скриптом контейнера при старте
// (см. корневой Dockerfile/entrypoint.sh проекта) — реальный API_BASE_URL
// берётся из переменной окружения контейнера, а не «зашивается» при сборке образа.
window.__HOKKER_ADMIN_CONFIG__ = {
  API_BASE_URL: "__API_BASE_URL__",
};
