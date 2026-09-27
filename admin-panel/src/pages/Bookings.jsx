import { useEffect, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { apiRequest, ApiError } from '../api/client'
import PageHeader from '../components/PageHeader'
import Table from '../components/Table'
import Pagination from '../components/Pagination'
import Badge, { BOOKING_STATUS_LABELS, BOOKING_STATUS_COLORS } from '../components/Badge'
import ConfirmDialog from '../components/ConfirmDialog'

const PAGE_SIZE = 20
const STATUS_OPTIONS = [
  { value: '', label: 'Все' },
  { value: 'pending', label: 'Ожидают' },
  { value: 'confirmed', label: 'Подтверждены' },
  { value: 'waiting', label: 'Лист ожидания' },
  { value: 'cancelled', label: 'Отменены' },
]

export default function Bookings() {
  const [params, setParams] = useSearchParams()
  const status = params.get('status') || ''
  const [search, setSearch] = useState(params.get('search') || '')
  const page = Number(params.get('page') || 1)

  const [data, setData] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)
  const [toCancel, setToCancel] = useState(null)
  const [saving, setSaving] = useState(false)

  function updateParam(key, value) {
    const next = new URLSearchParams(params)
    if (value) next.set(key, value)
    else next.delete(key)
    next.set('page', '1')
    setParams(next)
  }

  function refresh() {
    const q = new URLSearchParams()
    if (status) q.set('status', status)
    if (params.get('search')) q.set('search', params.get('search'))
    q.set('page', String(page))
    q.set('page_size', String(PAGE_SIZE))

    setLoading(true)
    apiRequest(`/admin/bookings?${q.toString()}`)
      .then(setData)
      .catch((err) => setError(err instanceof ApiError ? err.detail : 'Не удалось загрузить записи'))
      .finally(() => setLoading(false))
  }

  useEffect(refresh, [status, params, page])

  async function confirmCancel() {
    setSaving(true)
    try {
      await apiRequest(`/admin/bookings/${toCancel.id}/cancel`, { method: 'POST' })
      setToCancel(null)
      refresh()
    } catch (err) {
      setError(err instanceof ApiError ? err.detail : 'Не удалось отменить запись')
    } finally {
      setSaving(false)
    }
  }

  const CANCELLABLE = new Set(['pending', 'confirmed', 'waiting', 'invited'])

  const columns = [
    {
      key: 'session_datetime',
      header: 'Тренировка',
      render: (r) => (
        <Link to={`/sessions/${r.session_id}`} className="text-rink-700 hover:underline">
          {r.session_title}
        </Link>
      ),
    },
    {
      key: 'session_dt',
      header: 'Дата',
      render: (r) => new Date(r.session_datetime).toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }),
    },
    { key: 'player_name', header: 'Ученик' },
    { key: 'parent_name', header: 'Родитель', render: (r) => r.parent_name || '—' },
    {
      key: 'status',
      header: 'Статус',
      render: (r) => <Badge color={BOOKING_STATUS_COLORS[r.status]}>{BOOKING_STATUS_LABELS[r.status] || r.status}</Badge>,
    },
    {
      key: 'actions',
      header: '',
      render: (r) =>
        CANCELLABLE.has(r.status) && (
          <button className="btn-danger" onClick={() => setToCancel(r)}>
            Отменить
          </button>
        ),
    },
  ]

  return (
    <div>
      <PageHeader title="Записи" subtitle="Все записи на тренировки">
        <form onSubmit={(e) => { e.preventDefault(); updateParam('search', search) }} className="flex gap-2">
          <input
            className="input-field w-56"
            placeholder="Поиск по имени ученика"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button className="btn-secondary">Найти</button>
        </form>
      </PageHeader>

      <div className="flex gap-2 mb-4">
        {STATUS_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            className={status === opt.value ? 'btn-primary' : 'btn-secondary'}
            onClick={() => updateParam('status', opt.value)}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {error && <p className="text-action mb-3">{error}</p>}

      <div className="card">
        <Table columns={columns} rows={data?.items || []} empty={loading ? 'Загрузка…' : 'Записи не найдены'} />
        {data && (
          <Pagination
            page={data.page}
            pageSize={data.page_size}
            total={data.total}
            onChange={(p) => {
              const next = new URLSearchParams(params)
              next.set('page', String(p))
              setParams(next)
            }}
          />
        )}
      </div>

      {toCancel && (
        <ConfirmDialog
          title="Отменить запись?"
          message={`Запись ученика «${toCancel.player_name}» будет отменена, тренер получит уведомление.`}
          confirmLabel="Отменить запись"
          danger
          loading={saving}
          onConfirm={confirmCancel}
          onCancel={() => setToCancel(null)}
        />
      )}
    </div>
  )
}
