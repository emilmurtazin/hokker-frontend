import { useCallback, useEffect, useState } from 'react'
import { apiRequest } from '../api/client'

export function useChildren() {
  const [children, setChildren] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const refetch = useCallback(() => {
    setLoading(true)
    return apiRequest('/parents/me/children')
      .then(setChildren)
      .catch((err) => setError(err.detail || 'Не получилось загрузить детей'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    refetch()
  }, [refetch])

  async function addChild(data) {
    const child = await apiRequest('/parents/me/children', { method: 'POST', body: data })
    setChildren((prev) => [...prev, child])
    return child
  }

  async function removeChild(childId) {
    await apiRequest(`/children/${childId}`, { method: 'DELETE' })
    setChildren((prev) => prev.filter((c) => c.id !== childId))
  }

  return { children, loading, error, refetch, addChild, removeChild }
}
