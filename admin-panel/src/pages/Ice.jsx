import { useEffect, useState } from 'react'
import { apiRequest, ApiError } from '../api/client'
import PageHeader from '../components/PageHeader'
import Table from '../components/Table'
import Badge, {
  SLOT_STATUS_LABELS,
  SLOT_STATUS_COLORS,
  SLOT_REQUEST_STATUS_LABELS,
  SLOT_REQUEST_STATUS_COLORS,
} from '../components/Badge'

export default function Ice() {
  const [tab, setTab] = useState('slots')
  const [slots, setSlots] = useState(null)
  const [requests, setRequests] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (tab === 'slots' && slots === null) {
      apiRequest('/admin/ice-slots')
        .then(setSlots)
        .catch((err) => setError(err instanceof ApiError ? err.detail : 'Не удалось загрузить слоты'))
    }
    if (tab === 'requests' && requests === null) {
      apiRequest('/admin/slot-requests')
        .then(setRequests)
        .catch((err) => setError(err instanceof ApiError ? err.detail : 'Не удалось загрузить заявки'))
    }
  }, [tab, slots, requests])

  const slotColumns = [
    { key: 'arena_name', header: 'Арена' },
    { key: 'date', header: 'Дата', render: (r) => new Date(r.date).toLocaleDateString('ru-RU') },
    { key: 'time', header: 'Время', render: (r) => `${r.time_start} – ${r.time_end}` },
    { key: 'ice_type', header: 'Тип льда' },
    {
      key: 'status',
      header: 'Статус',
      render: (r) => <Badge color={SLOT_STATUS_COLORS[r.status]}>{SLOT_STATUS_LABELS[r.status] || r.status}</Badge>,
    },
    { key: 'price', header: 'Цена', render: (r) => (r.price != null ? `${r.price} ₽` : '—') },
    { key: 'coach', header: 'Забронировал', render: (r) => r.requested_by_coach_name || '—' },
  ]

  const requestColumns = [
    { key: 'arena_name', header: 'Арена' },
    { key: 'date', header: 'Дата', render: (r) => new Date(r.date).toLocaleDateString('ru-RU') },
    { key: 'time', header: 'Время', render: (r) => `${r.time_start} – ${r.time_end}` },
    { key: 'coach_name', header: 'Тренер' },
    { key: 'coach_phone', header: 'Телефон' },
    {
      key: 'status',
      header: 'Статус',
      render: (r) => <Badge color={SLOT_REQUEST_STATUS_COLORS[r.status]}>{SLOT_REQUEST_STATUS_LABELS[r.status] || r.status}</Badge>,
    },
    { key: 'created_at', header: 'Создана', render: (r) => new Date(r.created_at).toLocaleDateString('ru-RU') },
  ]

  return (
    <div>
      <PageHeader title="Лёд" subtitle="Слоты льда и заявки тренеров на аренду" />

      <div className="flex gap-2 mb-4">
        <button className={tab === 'slots' ? 'btn-primary' : 'btn-secondary'} onClick={() => setTab('slots')}>
          Слоты
        </button>
        <button className={tab === 'requests' ? 'btn-primary' : 'btn-secondary'} onClick={() => setTab('requests')}>
          Заявки тренеров
        </button>
      </div>

      {error && <p className="text-action mb-3">{error}</p>}

      <div className="card">
        {tab === 'slots' ? (
          <Table columns={slotColumns} rows={slots || []} empty={slots === null ? 'Загрузка…' : 'Слотов нет'} />
        ) : (
          <Table columns={requestColumns} rows={requests || []} empty={requests === null ? 'Загрузка…' : 'Заявок нет'} />
        )}
      </div>
    </div>
  )
}
