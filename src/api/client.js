// В продакшене (Docker/Timeweb) значение подставляется в public/config.js
// при старте контейнера. При локальной разработке (npm run dev) config.js
// не подставлен ("__API_BASE_URL__" как есть) — тогда используем Vite env.
const RUNTIME_URL = window.__HOKKER_CONFIG__?.API_BASE_URL
const API_BASE_URL =
  RUNTIME_URL && RUNTIME_URL !== '__API_BASE_URL__'
    ? RUNTIME_URL
    : import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

const TOKENS_KEY = 'hokker_tokens' // { access_token, refresh_token }

export function getTokens() {
  const raw = localStorage.getItem(TOKENS_KEY)
  return raw ? JSON.parse(raw) : null
}

export function setTokens(tokens) {
  if (tokens) {
    localStorage.setItem(TOKENS_KEY, JSON.stringify(tokens))
  } else {
    localStorage.removeItem(TOKENS_KEY)
  }
}

class ApiError extends Error {
  constructor(status, detail) {
    super(detail || `Ошибка запроса (${status})`)
    this.status = status
    this.detail = detail
  }
}

async function refreshAccessToken() {
  const tokens = getTokens()
  if (!tokens?.refresh_token) throw new ApiError(401, 'Нет refresh-токена')

  const res = await fetch(`${API_BASE_URL}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh_token: tokens.refresh_token }),
  })
  if (!res.ok) {
    setTokens(null)
    throw new ApiError(401, 'Сессия истекла, войдите заново')
  }
  const data = await res.json()
  setTokens({ ...tokens, access_token: data.access_token })
  return data.access_token
}

/**
 * Универсальный запрос к API. Автоматически подставляет Bearer-токен
 * и один раз пытается обновить access_token при 401 (истёкший токен),
 * прежде чем сдаться и выбросить ошибку (тогда AuthContext разлогинит).
 */
export async function apiRequest(path, { method = 'GET', body, auth = true, retry = true } = {}) {
  const headers = { 'Content-Type': 'application/json' }
  if (auth) {
    const tokens = getTokens()
    if (tokens?.access_token) headers['Authorization'] = `Bearer ${tokens.access_token}`
  }

  let res
  try {
    res = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    })
  } catch (networkError) {
    // fetch «падает» без ответа, когда нет сети, сервер недоступен или браузер
    // заблокировал запрос из-за CORS (адрес сайта не разрешён на сервере — CORS_ORIGINS).
    // Пользователю — понятный текст, разработчику — подсказка в консоли.
    console.error(
      `[API] Нет ответа на ${method} ${API_BASE_URL}${path}. Проверьте сеть и что адрес сайта ` +
        `(${window.location.origin}) разрешён на сервере в CORS_ORIGINS / APP_PUBLIC_URL.`,
      networkError
    )
    throw new ApiError(0, 'Нет связи с сервером. Проверьте интернет и попробуйте ещё раз.')
  }

  if (res.status === 401 && auth && retry) {
    try {
      await refreshAccessToken()
      return apiRequest(path, { method, body, auth, retry: false })
    } catch {
      throw new ApiError(401, 'Сессия истекла, войдите заново')
    }
  }

  if (res.status === 204) return null

  let data = null
  try {
    data = await res.json()
  } catch {
    // тело может отсутствовать
  }

  if (!res.ok) {
    // При ошибке валидации (422) FastAPI отдаёт detail массивом объектов, а не
    // строкой. Экраны показывают detail прямо в JSX — объект там роняет всё
    // приложение, поэтому приводим к строке.
    const detail = Array.isArray(data?.detail) ? 'Проверьте введённые данные' : data?.detail
    throw new ApiError(res.status, detail || 'Что-то пошло не так')
  }
  return data
}

export { ApiError, API_BASE_URL }
