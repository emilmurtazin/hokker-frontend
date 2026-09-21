import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { LogOut, Send, MapPin, Trash2, Plus, Check, X as XIcon, ChevronRight, Pencil, Copy } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { apiRequest } from '../api/client'
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

// https://t.me/HokkerSchool_bot?start=XYZ  →  tg://resolve?domain=HokkerSchool_bot&start=XYZ
// Прямая схема приложения: браузер не участвует, iOS/Android открывают
// Telegram сами — как нативная навигация по custom-схеме.
function toTgScheme(httpsLink) {
  if (!httpsLink) return null
  try {
    const url = new URL(httpsLink)
    if (url.hostname !== 't.me') return null
    const domain = url.pathname.replace(/^\//, '')
    const start = url.searchParams.get('start')
    if (!domain) return null
    let tg = `tg://resolve?domain=${domain}`
    if (start) tg += `&start=${start}`
    return tg
  } catch {
    return null
  }
}

// Имя бота из ссылки https://t.me/HokkerSchool_bot?start=XYZ  →  HokkerSchool_bot
function botFromLink(httpsLink) {
  try {
    const url = new URL(httpsLink)
    return url.hostname === 't.me' ? url.pathname.replace(/^\//, '') || null : null
  } catch {
    return null
  }
}

// Токен привязки из ссылки: …?start=XYZ  →  XYZ
function startTokenFrom(httpsLink) {
  try {
    return new URL(httpsLink).searchParams.get('start')
  } catch {
    return null
  }
}

// tg://-ссылка надёжно открывает приложение Telegram на телефоне, но на компьютере
// и в браузерной версии Telegram (web.telegram.org) она ничего не делает, если
// приложения нет. Поэтому на компьютере ведём по обычной ссылке t.me — она
// открывается в новой вкладке и предлагает открыть бота в вебе или в приложении.
function isMobileDevice() {
  return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)
}

function TelegramCard({ user }) {
  const { refreshUser } = useAuth()
  const [copied, setCopied] = useState(false)
  const lastRefresh = useRef(0)
  const linked = Boolean(user.telegram_chat_id)

  // Профиль мог быть загружен до появления ссылки привязки, а привязка происходит
  // в другом приложении (Telegram). Поэтому перечитываем профиль при открытии экрана
  // и каждый раз, когда человек возвращается в приложение, пока Telegram не привязан.
  useEffect(() => {
    if (linked) return undefined
    const refresh = () => {
      if (document.visibilityState !== 'visible') return
      if (Date.now() - lastRefresh.current < 1500) return // focus + visibilitychange приходят парой
      lastRefresh.current = Date.now()
      refreshUser()
    }
    refresh()
    window.addEventListener('focus', refresh)
    document.addEventListener('visibilitychange', refresh)
    return () => {
      window.removeEventListener('focus', refresh)
      document.removeEventListener('visibilitychange', refresh)
    }
  }, [linked, refreshUser])

  const botName = user.telegram_bot_username || botFromLink(user.telegram_deep_link)
  const handle = botName ? `@${botName}` : null
  const token = startTokenFrom(user.telegram_deep_link)
  const command = token ? `/start ${token}` : null
  const mobile = isMobileDevice()
  const href = mobile
    ? toTgScheme(user.telegram_deep_link) || user.telegram_deep_link
    : user.telegram_deep_link

  async function copyCommand() {
    try {
      await navigator.clipboard.writeText(command)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Буфер обмена недоступен — поле с командой выделяется по нажатию, скопируйте вручную.
    }
  }

  const icon = (
    <div className="w-9 h-9 rounded-full bg-[#229ED9]/10 flex items-center justify-center shrink-0">
      <Send className="w-4 h-4 text-[#229ED9]" />
    </div>
  )

  if (linked) {
    return (
      <div className="card flex items-center gap-3 w-full text-left">
        {icon}
        <div>
          <p className="font-medium text-sm">Telegram привязан</p>
          <p className="text-xs text-neutral-500">
            Уведомления приходят {handle ? `от ${handle}` : 'в Telegram'}
          </p>
        </div>
      </div>
    )
  }

  if (!href) {
    return (
      <div className="card flex items-center gap-3 w-full text-left opacity-60">
        {icon}
        <div>
          <p className="font-medium text-sm">Привязать Telegram</p>
          <p className="text-xs text-neutral-500">Скоро</p>
        </div>
      </div>
    )
  }

  return (
    <div className="card space-y-3">
      <a
        href={href}
        {...(mobile ? {} : { target: '_blank', rel: 'noopener noreferrer' })}
        className="flex items-center gap-3 w-full text-left"
      >
        {icon}
        <div>
          <p className="font-medium text-sm">Привязать Telegram</p>
          <p className="text-xs text-neutral-500">
            Нажмите — откроется бот{handle && <> <span className="font-semibold text-[#229ED9]">{handle}</span></>}
          </p>
        </div>
      </a>

      {command && (
        <details className="text-xs text-neutral-500">
          <summary className="cursor-pointer select-none">Не открывается? Привязать вручную</summary>
          <div className="mt-2 space-y-2">
            <p>
              1. Найдите в Telegram бота{' '}
              {handle ? <span className="font-semibold text-neutral-700 select-all">{handle}</span> : 'нашего бота'}{' '}
              (через поиск) и откройте чат с ним.
            </p>
            <p>2. Отправьте ему эту команду:</p>
            <div className="flex gap-2">
              <input
                readOnly
                value={command}
                onFocus={(e) => e.target.select()}
                aria-label="Команда для привязки Telegram"
                className="input-field flex-1 min-w-0 text-xs font-mono"
              />
              <button
                type="button"
                onClick={copyCommand}
                className="shrink-0 px-3 border border-ice-300 rounded-card text-neutral-600 flex items-center gap-1"
              >
                <Copy className="w-3.5 h-3.5" />
                {copied ? 'Готово' : 'Копировать'}
              </button>
            </div>
          </div>
        </details>
      )}
    </div>
  )
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
  const [editingProfile, setEditingProfile] = useState(false)

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

      <TelegramCard user={user} />

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
