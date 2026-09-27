import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { apiRequest, ApiError } from '../api/client'
import PageHeader from '../components/PageHeader'
import Badge, { ROLE_LABELS, ROLE_COLORS } from '../components/Badge'
import Modal from '../components/Modal'
import { ArrowLeft } from 'lucide-react'

export default function UserDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [error, setError] = useState(null)
  const [form, setForm] = useState(null)
  const [saving, setSaving] = useState(false)
  const [blockModal, setBlockModal] = useState(false)
  const [blockReason, setBlockReason] = useState('')

  function load() {
    apiRequest(`/admin/users/${id}`)
      .then((u) => {
        setUser(u)
        setForm({ name: u.name, city: u.city || '', phone: u.phone })
      })
      .catch((err) => setError(err instanceof ApiError ? err.detail : 'Не удалось загрузить пользователя'))
  }

  useEffect(load, [id])

  async function saveProfile(e) {
    e.preventDefault()
    setSaving(true)
    try {
      const updated = await apiRequest(`/admin/users/${id}`, { method: 'PATCH', body: form })
      setUser(updated)
    } catch (err) {
      setError(err instanceof ApiError ? err.detail : 'Не удалось сохранить')
    } finally {
      setSaving(false)
    }
  }

  async function toggleBlock() {
    if (user.is_blocked) {
      setSaving(true)
      try {
        const updated = await apiRequest(`/admin/users/${id}`, {
          method: 'PATCH',
          body: { is_blocked: false },
        })
        setUser(updated)
      } catch (err) {
        setError(err instanceof ApiError ? err.detail : 'Не удалось разблокировать')
      } finally {
        setSaving(false)
      }
    } else {
      setBlockModal(true)
    }
  }

  async function confirmBlock() {
    setSaving(true)
    try {
      const updated = await apiRequest(`/admin/users/${id}`, {
        method: 'PATCH',
        body: { is_blocked: true, blocked_reason: blockReason || null },
      })
      setUser(updated)
      setBlockModal(false)
      setBlockReason('')
    } catch (err) {
      setError(err instanceof ApiError ? err.detail : 'Не удалось заблокировать')
    } finally {
      setSaving(false)
    }
  }

  async function toggleVisibility() {
    setSaving(true)
    try {
      await apiRequest(`/admin/coaches/${id}`, {
        method: 'PATCH',
        body: { visible_in_search: !user.coach_profile.visible_in_search },
      })
      load()
    } catch (err) {
      setError(err instanceof ApiError ? err.detail : 'Не удалось изменить видимость')
    } finally {
      setSaving(false)
    }
  }

  if (error && !user) return <p className="text-action">{error}</p>
  if (!user) return <p className="text-neutral-500">Загрузка…</p>

  return (
    <div className="max-w-3xl">
      <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-sm text-neutral-500 hover:text-rink-900 mb-3">
        <ArrowLeft size={16} /> Назад
      </button>

      <PageHeader
        title={user.name}
        subtitle={
          <div className="flex items-center gap-2">
            <Badge color={ROLE_COLORS[user.role]}>{ROLE_LABELS[user.role] || user.role}</Badge>
            {user.is_blocked ? <Badge color="red">Заблокирован</Badge> : <Badge color="green">Активен</Badge>}
            {user.telegram_linked && <Badge color="blue">Telegram привязан</Badge>}
          </div>
        }
      >
        <button className={user.is_blocked ? 'btn-primary' : 'btn-danger'} onClick={toggleBlock} disabled={saving}>
          {user.is_blocked ? 'Разблокировать' : 'Заблокировать'}
        </button>
      </PageHeader>

      {error && <p className="text-action mb-3">{error}</p>}

      {user.is_blocked && user.blocked_reason && (
        <div className="card p-4 mb-5 border-action/30 bg-action-light/40">
          <div className="text-sm font-medium text-action">Причина блокировки</div>
          <div className="text-sm text-rink-900 mt-1">{user.blocked_reason}</div>
        </div>
      )}

      <form onSubmit={saveProfile} className="card p-5 mb-5 space-y-3">
        <h3 className="font-semibold mb-2">Профиль</h3>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-neutral-500 mb-1">Имя</label>
            <input className="input-field" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div>
            <label className="block text-xs font-medium text-neutral-500 mb-1">Телефон</label>
            <input className="input-field" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </div>
          <div>
            <label className="block text-xs font-medium text-neutral-500 mb-1">Город</label>
            <input className="input-field" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
          </div>
          <div>
            <label className="block text-xs font-medium text-neutral-500 mb-1">Дата регистрации</label>
            <input className="input-field bg-ice-100" value={new Date(user.created_at).toLocaleString('ru-RU')} disabled />
          </div>
        </div>
        <button className="btn-primary" disabled={saving}>
          {saving ? 'Сохраняем…' : 'Сохранить'}
        </button>
      </form>

      {user.role === 'parent' && (
        <div className="card p-5 mb-5">
          <h3 className="font-semibold mb-3">Дети ({user.children.length})</h3>
          {user.children.length === 0 ? (
            <p className="text-sm text-neutral-400">Детей не добавлено</p>
          ) : (
            <ul className="divide-y divide-ice-100">
              {user.children.map((c) => (
                <li key={c.id} className="py-2 text-sm flex items-center justify-between">
                  <span>{c.name}</span>
                  <span className="text-neutral-500">
                    {new Date(c.birth_date).toLocaleDateString('ru-RU')} · {c.position}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {user.role === 'coach' && user.coach_profile && (
        <div className="card p-5 mb-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Профиль тренера</h3>
            <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
              <input
                type="checkbox"
                checked={user.coach_profile.visible_in_search}
                onChange={toggleVisibility}
                disabled={saving}
              />
              Видим в поиске
            </label>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <div className="text-xs text-neutral-500">Специализации</div>
              <div>{user.coach_profile.specializations.join(', ') || '—'}</div>
            </div>
            <div>
              <div className="text-xs text-neutral-500">Опыт</div>
              <div>{user.coach_profile.experience_years ? `${user.coach_profile.experience_years} лет` : '—'}</div>
            </div>
            <div>
              <div className="text-xs text-neutral-500">Код для клиентов</div>
              <div className="font-mono">{user.coach_profile.join_code}</div>
            </div>
            <div>
              <div className="text-xs text-neutral-500">Активных учеников / тренировок</div>
              <div>
                {user.coach_profile.active_students_count} / {user.coach_profile.sessions_count}
              </div>
            </div>
          </div>
          {user.coach_profile.about && (
            <div>
              <div className="text-xs text-neutral-500">О себе</div>
              <div className="text-sm">{user.coach_profile.about}</div>
            </div>
          )}
        </div>
      )}

      {user.role === 'arena_admin' && user.arena_profile && (
        <div className="card p-5 mb-5">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold">Арена</h3>
            <Link to={`/arenas/${id}`} className="text-sm text-rink-700 hover:underline">
              Открыть карточку арены →
            </Link>
          </div>
          <div className="text-sm">
            {user.arena_profile.name}, {user.arena_profile.city || '—'}
          </div>
        </div>
      )}

      {blockModal && (
        <Modal title="Заблокировать пользователя" onClose={() => setBlockModal(false)} width="max-w-sm">
          <p className="text-sm text-neutral-500 mb-3">
            Пользователь сразу потеряет доступ — и по новому входу, и по уже открытой сессии.
          </p>
          <textarea
            className="input-field mb-3"
            rows={3}
            placeholder="Причина блокировки (необязательно)"
            value={blockReason}
            onChange={(e) => setBlockReason(e.target.value)}
          />
          <div className="flex justify-end gap-2">
            <button className="btn-secondary" onClick={() => setBlockModal(false)} disabled={saving}>
              Отмена
            </button>
            <button className="btn-danger" onClick={confirmBlock} disabled={saving}>
              {saving ? 'Блокируем…' : 'Заблокировать'}
            </button>
          </div>
        </Modal>
      )}
    </div>
  )
}
