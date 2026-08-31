import { createContext, useContext, useEffect, useState } from 'react'
import { apiRequest, getTokens, setTokens } from '../api/client'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const tokens = getTokens()
    if (!tokens?.access_token) {
      setLoading(false)
      return
    }
    apiRequest('/users/me')
      .then(setUser)
      .catch(() => setTokens(null))
      .finally(() => setLoading(false))
  }, [])

  async function requestCode(phone) {
    return apiRequest('/auth/request-code', { method: 'POST', body: { phone }, auth: false })
  }

  async function verifyCode(requestId, code) {
    const data = await apiRequest('/auth/verify-code', {
      method: 'POST',
      body: { request_id: requestId, code },
      auth: false,
    })
    if (data.status === 'logged_in') {
      setTokens({ access_token: data.access_token, refresh_token: data.refresh_token })
      setUser(data.user)
    }
    // если status === 'registration_required' — вызывающий экран сам
    // поведёт пользователя на регистрацию с data.registration_token
    return data
  }

  async function register(registrationToken, role, name, city) {
    const data = await apiRequest('/auth/register', {
      method: 'POST',
      body: { registration_token: registrationToken, role, name, city },
      auth: false,
    })
    setTokens({ access_token: data.access_token, refresh_token: data.refresh_token })
    setUser(data.user)
    return data
  }

  async function logout() {
    const tokens = getTokens()
    try {
      if (tokens?.refresh_token) {
        await apiRequest('/auth/logout', {
          method: 'POST',
          body: { refresh_token: tokens.refresh_token },
        })
      }
    } catch {
      // даже если запрос не прошёл — всё равно чистим локально
    }
    setTokens(null)
    setUser(null)
  }

  async function updateProfile(patch) {
    const updated = await apiRequest('/users/me', { method: 'PATCH', body: patch })
    setUser(updated)
    return updated
  }

  return (
    <AuthContext.Provider
      value={{ user, loading, requestCode, verifyCode, register, logout, updateProfile }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth должен использоваться внутри AuthProvider')
  return ctx
}
