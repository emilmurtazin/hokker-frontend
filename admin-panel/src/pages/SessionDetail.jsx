import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { apiRequest, ApiError } from '../api/client'
import PageHeader from '../components/PageHeader'
import Table from '../components/Table'
import Badge, { BOOKING_STATUS_LABELS, BOOKING_STATUS_COLORS, SESSION_TYPE_LABELS } from '../components/Badge'
import ConfirmDialog from '../components/ConfirmDialog'

export default function SessionDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [session, setSession] = useState(null)
  const [error, setError] = useState(null)
  const [confirmCancel, setConfirmCancel] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    apiRequest(`/admin/sessions/${id}`)
      .then(setSession)
      .catch((err) => setError(err instanceof ApiError ? err.detail : 'Не удалось загрузить тренировку'))
  }, [id])

  async function cancelSession() {
    setSaving(true)
    try {
      await apiRequest(`/admin/sessions/${id}/cancel`, { method: 'POST' })
      navigate('/sessions')
    } catch (err) {
      setError(err instanceof ApiError ? err.detail : 'Не удалось отменить тренировку')
      setSaving(false)
      setConfirmCancel(false)
    }
  }

  if (error && !session) return <p className="text-action">{error}</p>
  if (!session) return <p className="text-neutral-500">Загрузка…</p>

  const columns = [
    { key: 'player_name', header: 'Ученик' },
    { key: 'parent_name', header: 'Родитель', render: (r) => r.parent_name || '—' },
    { key: 'parent_phone', header: 'Телефон', render: (r) => r.parent_phone || '—' },
    {
      key: 'status',
      header: 'Статус',
      render: (r) => <Badge color={BOOKING_STATUS_COLORS[r.status]}>{BOOKING_STATUS_LABELS[r.status] || r.status}</Badge>,
    },
  ]

  return (
    <div className="max-w-3xl">
      <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-sm text-neutral-500 hover:text-rink-900 mb-3">
        <ArrowLeft size={16} /> Назад
      </button>

      <PageHeader
        title={`${SESSION_TYPE_LABELS[session.type] || session.type} · ${session.coach_name}`}
        subtitle={new Date(session.datetime).toLocaleString('ru-RU', {
          day: '2-digit', month: 'long', hour: '2-digit', minute: '2-digit',
        })}
      >
        <button className="btn-danger" onClick={() => setConfirmCancel(true)}>
          Отменить тренировку
        </button>
      </PageHeader>

      {error && <p className="text-action mb-3">{error}</p>}

      <div className="grid grid-cols-2 gap-4 mb-5">
        <div className="card p-4 text-sm">
          <div className="text-xs text-neutral-500">Арена</div>
          <div>{session.arena_name || '—'}</div>
        </div>
        <div className="card p-4 text-sm">
          <div className="text-xs text-neutral-500">Длительность</div>
          <div>{session.duration_minutes} мин</div>
        </div>
        <div className="card p-4 text-sm">
          <div className="text-xs text-neutral-500">Записано</div>
          <div>{session.booked_count} / {session.max_players}</div>
        </div>
        <div className="card p-4 text-sm">
          <div className="text-xs text-neutral-500">Цена</div>
          <div>{session.price != null ? `${session.price} ₽` : '—'}</div>
        </div>
      </div>

      <div className="card">
        <div className="px-5 py-4 border-b border-ice-200 font-semibold">Записи ({session.bookings.length})</div>
        <Table columns={columns} rows={session.bookings} empty="Записей пока нет" />
      </div>

      {confirmCancel && (
        <ConfirmDialog
          title="Отменить тренировку?"
          message="Все записи будут отменены, тренер и родители получат уведомление. Действие необратимо."
          confirmLabel="Отменить тренировку"
          danger
          loading={saving}
          onConfirm={cancelSession}
          onCancel={() => setConfirmCancel(false)}
        />
      )}
    </div>
  )
}
