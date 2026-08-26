import { useState } from 'react'
import { LogOut, Send, MapPin, User as UserIcon } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { apiRequest, ApiError } from '../api/client'

const ROLE_LABELS = {
  coach: 'Тренер',
  parent: 'Родитель',
  arena_admin: 'Администратор арены',
  admin: 'Администратор платформы',
}

export default function Profile() {
  const { user, logout } = useAuth()
  const [linking, setLinking] = useState(false)
  const [linkError, setLinkError] = useState(null)

  async function handleTelegramLink() {
    setLinking(true)
    setLinkError(null)
    try {
      const data = await apiRequest('/telegram/link')
      window.open(data.deep_link, '_blank')
    } catch (err) {
      setLinkError(err instanceof ApiError ? err.detail : 'Не получилось получить ссылку')
    } finally {
      setLinking(false)
    }
  }

  if (!user) return null

  return (
    <div className="px-5 py-6 space-y-5">
      <div className="card flex items-center gap-4">
        <div className="jersey-stat w-14 h-14 text-xl shrink-0">
          {user.name?.[0]?.toUpperCase() || '?'}
        </div>
        <div className="min-w-0">
          <h1 className="text-lg font-semibold truncate">{user.name}</h1>
          <p className="text-sm text-neutral-500">{ROLE_LABELS[user.role] || user.role}</p>
        </div>
      </div>

      {user.city && (
        <div className="card flex items-center gap-3 text-sm">
          <MapPin className="w-4 h-4 text-neutral-400 shrink-0" />
          <span>{user.city}</span>
        </div>
      )}

      <div className="card">
        <button
          onClick={handleTelegramLink}
          disabled={linking}
          className="flex items-center gap-3 w-full text-left"
        >
          <div className="w-9 h-9 rounded-full bg-[#229ED9]/10 flex items-center justify-center shrink-0">
            <Send className="w-4 h-4 text-[#229ED9]" />
          </div>
          <div>
            <p className="font-medium text-sm">Привязать Telegram</p>
            <p className="text-xs text-neutral-500">Уведомления о записях и оценках</p>
          </div>
        </button>
        {linkError && <p className="text-action text-sm mt-2">{linkError}</p>}
      </div>

      <button
        onClick={logout}
        className="flex items-center justify-center gap-2 w-full py-3 text-action font-medium"
      >
        <LogOut className="w-4 h-4" />
        Выйти
      </button>
    </div>
  )
}
