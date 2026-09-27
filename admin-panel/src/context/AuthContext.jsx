import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { apiRequest, getTokens, setTokens, ApiError } from '../api/client'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const loadMe = useCallback(async () => {
    const tokens = getTokens()
    if (!tokens?.access_token) {
      setUser(null)
      setLoading(false)
      return
    }
    try {
      const me = await apiRequest('/users/me')
      if (me.role !== 'admin') {
        // Логин по SMS общий для всей платформы — но в панель пускаем только admin.
        setTokens(null)
        setUser(null)
      } else {
        setUser(me)
      }
    } catch {
      setTokens(null)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadMe()
  }, [loadMe])

  async function requestCode(phone) {
    return apiRequest('/auth/request-code', { method: 'POST', body: { phone }, auth: false })
  }

  async function verifyCode(requestId, code) {
    const data = await apiRequest('/auth/verify-code', {
      method: 'POST',
      body: { request_id: requestId, code },
      auth: false,
    })
    if (data.registration_token) {
      throw new ApiError(403, 'Этот номер ещё не зарегистрирован в системе')
    }
    setTokens({ access_token: data.access_token, refresh_token: data.refresh_token })
    const me = await apiRequest('/users/me')
    if (me.role !== 'admin') {
      setTokens(null)
      throw new ApiError(403, 'Доступ к панели администратора есть только у роли admin')
    }
    setUser(me)
    return me
  }

  function logout() {
    setTokens(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, requestCode, verifyCode, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth должен использоваться внутри AuthProvider')
  return ctx
}
