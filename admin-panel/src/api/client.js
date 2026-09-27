// В продакшене (Docker/Timeweb) значение подставляется в public/config.js при
// старте контейнера (тот же entrypoint.sh, что и у основного фронтенда).
// При локальной разработке (npm run dev) используем Vite env.
const RUNTIME_URL = window.__HOKKER_ADMIN_CONFIG__?.API_BASE_URL
const API_BASE_URL =
  RUNTIME_URL && RUNTIME_URL !== '__API_BASE_URL__'
    ? RUNTIME_URL
    : import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

// Отдельный ключ localStorage — приложение и панель админа делят один домен
// (24hokker.ru/ и 24hokker.ru/admin/), общий localStorage на origin. Свой ключ
// нужен, чтобы вход в панель не путался с сессией обычного приложения в том
// же браузере (например, если администратор одновременно родитель).
const TOKENS_KEY = 'hokker_admin_tokens'

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

export class ApiError extends Error {
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
    console.error(`[Admin API] Нет ответа на ${method} ${API_BASE_URL}${path}.`, networkError)
    throw new ApiError(0, 'Нет связи с сервером. Проверьте адрес API и CORS_ORIGINS.')
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
    const detail = Array.isArray(data?.detail)
      ? data.detail.map((d) => d.msg).join('; ')
      : data?.detail
    throw new ApiError(res.status, detail || 'Что-то пошло не так')
  }
  return data
}

export { API_BASE_URL }
