import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { apiRequest, ApiError } from '../api/client'
import PageHeader from '../components/PageHeader'
import Badge from '../components/Badge'

export default function ArenaDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [arena, setArena] = useState(null)
  const [form, setForm] = useState(null)
  const [error, setError] = useState(null)
  const [saving, setSaving] = useState(false)

  function load() {
    apiRequest(`/admin/arenas/${id}`)
      .then((a) => {
        setArena(a)
        setForm({
          name: a.name,
          address: a.address || '',
          city: a.city || '',
          ice_size: a.ice_size || '',
          locker_rooms: a.locker_rooms ?? '',
          contact_phone: a.contact_phone || '',
        })
      })
      .catch((err) => setError(err instanceof ApiError ? err.detail : 'Не удалось загрузить арену'))
  }

  useEffect(load, [id])

  async function save(e) {
    e.preventDefault()
    setSaving(true)
    try {
      const body = { ...form, locker_rooms: form.locker_rooms === '' ? null : Number(form.locker_rooms) }
      const updated = await apiRequest(`/admin/arenas/${id}`, { method: 'PATCH', body })
      setArena(updated)
    } catch (err) {
      setError(err instanceof ApiError ? err.detail : 'Не удалось сохранить')
    } finally {
      setSaving(false)
    }
  }

  if (error && !arena) return <p className="text-action">{error}</p>
  if (!arena || !form) return <p className="text-neutral-500">Загрузка…</p>

  return (
    <div className="max-w-2xl">
      <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-sm text-neutral-500 hover:text-rink-900 mb-3">
        <ArrowLeft size={16} /> Назад
      </button>

      <PageHeader
        title={arena.name}
        subtitle={
          <div className="flex items-center gap-2">
            {arena.is_blocked ? <Badge color="red">Аккаунт заблокирован</Badge> : <Badge color="green">Активна</Badge>}
          </div>
        }
      >
        <Link to={`/users/${id}`} className="btn-secondary">
          Карточка администратора
        </Link>
      </PageHeader>

      {error && <p className="text-action mb-3">{error}</p>}

      <div className="card p-4 mb-5 text-sm">
        <div className="text-xs text-neutral-500">Администратор арены</div>
        <div>
          {arena.admin_name} · {arena.admin_phone}
        </div>
      </div>

      <form onSubmit={save} className="card p-5 space-y-3">
        <h3 className="font-semibold mb-2">Данные арены</h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2">
            <label className="block text-xs font-medium text-neutral-500 mb-1">Название</label>
            <input className="input-field" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div className="col-span-2">
            <label className="block text-xs font-medium text-neutral-500 mb-1">Адрес</label>
            <input className="input-field" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
          </div>
          <div>
            <label className="block text-xs font-medium text-neutral-500 mb-1">Город</label>
            <input className="input-field" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
          </div>
          <div>
            <label className="block text-xs font-medium text-neutral-500 mb-1">Контактный телефон</label>
            <input className="input-field" value={form.contact_phone} onChange={(e) => setForm({ ...form, contact_phone: e.target.value })} />
          </div>
          <div>
            <label className="block text-xs font-medium text-neutral-500 mb-1">Размер льда</label>
            <input className="input-field" value={form.ice_size} onChange={(e) => setForm({ ...form, ice_size: e.target.value })} placeholder="напр. 60x30 м" />
          </div>
          <div>
            <label className="block text-xs font-medium text-neutral-500 mb-1">Раздевалок</label>
            <input
              className="input-field"
              type="number"
              value={form.locker_rooms}
              onChange={(e) => setForm({ ...form, locker_rooms: e.target.value })}
            />
          </div>
        </div>
        <button className="btn-primary" disabled={saving}>
          {saving ? 'Сохраняем…' : 'Сохранить'}
        </button>
      </form>
    </div>
  )
}
