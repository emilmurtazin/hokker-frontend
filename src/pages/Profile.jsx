import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { LogOut, Send, MapPin, Trash2, Plus, Check, X as XIcon, ChevronRight, Pencil } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { apiRequest, ApiError } from '../api/client'
import { useChildren } from '../hooks/useChildren'
import { POSITION_LABELS } from '../utils/labels'
import { age } from '../utils/date'
import AddChildModal from '../components/AddChildModal'
import EditChildModal from '../components/EditChildModal'
import EditNameCityModal from '../components/EditNameCityModal'
import ConfirmModal from '../components/ConfirmModal'

const ROLE_LABELS = {
  coach: 'Тренер',
  parent: 'Родитель',
  arena_admin: 'Администратор арены',
  admin: 'Администратор платформы',
}

// https://t.me/Hokker_bot?start=XYZ  →  tg://resolve?domain=Hokker_bot&start=XYZ
// Прямая схема приложения: браузер не участвует, блокировки РФ ни при чём.
function toTgScheme(httpsLink) {
  try {
    const url = new URL(httpsLink)
    if (url.hostname !== 't.me') return null
    const domain = url.pathname.replace(/^\//, '')
    const start = url.searchParams.get('start')
    let tg = `tg://resolve?domain=${domain}`
    if (start) tg += `&start=${start}`
    return tg
  } catch {
    return null
  }
}

function InvitesSection() {
  const [invites, setInvites] = useState(null)
  const [busyId, setBusyId] = useState(null)
  const [error, setError] = useState(null)

  function load() {
    apiRequest('/parents/me/invites')
      .then(setInvites)
      .catch((err) => setError(err.detail || 'Не получилось загрузить приглашения'))
  }

  useEffect(load, [])

  async function respond(id, action) {
    setBusyId(id)
    try {
      await apiRequest(`/parents/me/invites/${id}/${action}`, { method: 'POST' })
      load()
    } catch (err) {
      setError(err.detail || 'Не получилось ответить на приглашение')
    } finally {
      setBusyId(null)
    }
  }

  if (invites === null || invites.length === 0) return null

  return (
    <div className="card border-goal/40 bg-goal-light/40">
      <h2 className="font-semibold mb-3">Приглашения от тренеров</h2>
      {error && <p className="text-action text-sm mb-2">{error}</p>}
      <div className="space-y-2">
        {invites.map((inv) => (
          <div key={inv.id} className="flex items-center justify-between bg-white rounded-card p-3">
            <div>
              <p className="font-medium text-sm">{inv.player_name}</p>
              <p className="text-xs text-neutral-500">Приглашает тренер {inv.coach_name}</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => respond(inv.id, 'accept')}
                disabled={busyId === inv.id}
                className="p-2 bg-green-50 text-green-700 rounded-full"
              >
                <Check className="w-4 h-4" />
              </button>
              <button
                onClick={() => respond(inv.id, 'decline')}
                disabled={busyId === inv.id}
                className="p-2 bg-action-light text-action rounded-full"
              >
                <XIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function ChildrenSection() {
  const { children, loading, addChild, removeChild, updateChildInList } = useChildren()
  const [showAdd, setShowAdd] = useState(false)
  const [editingChild, setEditingChild] = useState(null)
  const [deletingChild, setDeletingChild] = useState(null)
  const [deleteBusy, setDeleteBusy] = useState(false)
  const navigate = useNavigate()

  async function handleConfirmDelete() {
    setDeleteBusy(true)
    try {
      await removeChild(deletingChild.id)
      setDeletingChild(null)
    } finally {
      setDeleteBusy(false)
    }
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-semibold">Мои дети</h2>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-1 text-sm text-action font-medium"
        >
          <Plus className="w-4 h-4" /> Добавить
        </button>
      </div>

      {loading && <p className="text-sm text-neutral-400">Загрузка…</p>}
      {!loading && children.length === 0 && (
        <p className="text-sm text-neutral-500">
          Пока никого не добавили — без этого не получится записаться на тренировку.
        </p>
      )}

      <ul className="space-y-2">
        {children.map((child) => (
          <li
            key={child.id}
            onClick={() => navigate(`/children/${child.id}/progress`)}
            className="flex items-center justify-between py-2 border-b border-ice-100 last:border-0 cursor-pointer"
          >
            <div>
              <p className="font-medium text-sm">{child.name}</p>
              <p className="text-xs text-neutral-500">
                {age(child.birth_date)} лет · {POSITION_LABELS[child.position]}
              </p>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setEditingChild(child)
                }}
                className="p-2 text-neutral-400"
              >
                <Pencil className="w-4 h-4" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setDeletingChild(child)
                }}
                className="p-2 text-neutral-400"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <ChevronRight className="w-4 h-4 text-neutral-300" />
            </div>
          </li>
        ))}
      </ul>

      {showAdd && <AddChildModal onClose={() => setShowAdd(false)} onAdd={addChild} />}
      {editingChild && (
        <EditChildModal
          child={editingChild}
          onClose={() => setEditingChild(null)}
          onSaved={updateChildInList}
        />
      )}
      {deletingChild && (
        <ConfirmModal
          title="Удалить ребёнка?"
          message={`«${deletingChild.name}» будет удалён из профиля. Это действие нельзя отменить.`}
          onConfirm={handleConfirmDelete}
          onCancel={() => setDeletingChild(null)}
          busy={deleteBusy}
        />
      )}
    </div>
  )
}

export default function Profile() {
  const { user, logout } = useAuth()
  const [deepLink, setDeepLink] = useState(null)
  const [linkError, setLinkError] = useState(null)
  const [editingProfile, setEditingProfile] = useState(false)

  // Ссылку получаем заранее — при заходе на профиль. К моменту клика
  // она уже готова: значит переход сработает мгновенно, без «висит запрос».
  useEffect(() => {
    let cancelled = false
    apiRequest('/telegram/link')
      .then((data) => {
        if (!cancelled) setDeepLink(data.deep_link)
      })
      .catch((err) => {
        if (!cancelled) {
          setLinkError(
            err instanceof ApiError ? err.detail : 'Не получилось получить ссылку',
          )
        }
      })
    return () => {
      cancelled = true
    }
  }, [])

  // Клик по кнопке. Никаких window.open и пустых вкладок:
  // 1. Пробуем tg:// — прямая схема приложения, минует браузер.
  // 2. Если через 1.5 c всё ещё на странице — откатываемся на https://t.me.
  function handleTelegramClick() {
    if (!deepLink) return
    const tgLink = toTgScheme(deepLink)

    let navigated = false
    const onVisibility = () => {
      if (document.visibilityState === 'hidden') navigated = true
    }
    document.addEventListener('visibilitychange', onVisibility)

    if (tgLink) {
      window.location.href = tgLink
    } else {
      // Ссылка не распарсилась — сразу https://t.me
      navigated = true
      window.location.href = deepLink
      return
    }

    setTimeout(() => {
      document.removeEventListener('visibilitychange', onVisibility)
      if (!navigated) {
        // Telegram не открылся (не установлен / WebView заблокировал tg://).
        // Открываем страницу-приглашение t.me.
        window.location.href = deepLink
      }
    }, 1500)
  }

  if (!user) return null

  return (
    <div className="px-5 py-6 space-y-5">
      <div className="card flex items-center gap-4">
        <div className="jersey-stat w-14 h-14 text-xl shrink-0">
          {user.name?.[0]?.toUpperCase() || '?'}
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="text-lg font-semibold truncate">{user.name}</h1>
          <p className="text-sm text-neutral-500">{ROLE_LABELS[user.role] || user.role}</p>
        </div>
        <button
          onClick={() => setEditingProfile(true)}
          className="p-2 text-neutral-400 border border-ice-300 rounded-card shrink-0"
        >
          <Pencil className="w-4 h-4" />
        </button>
      </div>

      {user.city && (
        <div className="card flex items-center gap-3 text-sm">
          <MapPin className="w-4 h-4 text-neutral-400 shrink-0" />
          <span>{user.city}</span>
        </div>
      )}

      {user.role === 'parent' && <InvitesSection />}
      {user.role === 'parent' && <ChildrenSection />}

      <div className="card">
        {deepLink ? (
          // Обычная <a href>: не открывает пустых вкладок, работает как
          // нативная навигация. onClick добавляет fallback на tg://.
          <a
            href={deepLink}
            rel="noopener noreferrer"
            onClick={handleTelegramClick}
            className="flex items-center gap-3 w-full text-left"
          >
            <div className="w-9 h-9 rounded-full bg-[#229ED9]/10 flex items-center justify-center shrink-0">
              <Send className="w-4 h-4 text-[#229ED9]" />
            </div>
            <div>
              <p className="font-medium text-sm">Привязать Telegram</p>
              <p className="text-xs text-neutral-500">Уведомления о записях и оценках</p>
            </div>
          </a>
        ) : (
          <div className="flex items-center gap-3 w-full text-left opacity-60">
            <div className="w-9 h-9 rounded-full bg-[#229ED9]/10 flex items-center justify-center shrink-0">
              <Send className="w-4 h-4 text-[#229ED9]" />
            </div>
            <div>
              <p className="font-medium text-sm">Привязать Telegram</p>
              <p className="text-xs text-neutral-500">
                {linkError ? linkError : 'Загружаем ссылку…'}
              </p>
            </div>
          </div>
        )}
      </div>

      <button
        onClick={logout}
        className="flex items-center justify-center gap-2 w-full py-3 text-action font-medium"
      >
        <LogOut className="w-4 h-4" />
        Выйти
      </button>

      {editingProfile && <EditNameCityModal onClose={() => setEditingProfile(false)} />}
    </div>
  )
}
