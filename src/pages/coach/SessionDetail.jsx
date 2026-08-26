import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ChevronLeft, Check, X as XIcon, Trash2 } from 'lucide-react'
import { apiRequest } from '../../api/client'
import { SESSION_TYPE_LABELS, BOOKING_STATUS_LABELS, BOOKING_STATUS_COLORS } from '../../utils/labels'
import { formatDateTime } from '../../utils/date'

export default function SessionDetail() {
  const { sessionId } = useParams()
  const navigate = useNavigate()
  const [session, setSession] = useState(null)
  const [bookings, setBookings] = useState(null)
  const [busyId, setBusyId] = useState(null)
  const [error, setError] = useState(null)

  function load() {
    apiRequest(`/sessions/${sessionId}`).then(setSession).catch(() => {})
    apiRequest(`/sessions/${sessionId}/bookings`)
      .then(setBookings)
      .catch((err) => setError(err.detail || 'Не получилось загрузить записи'))
  }

  useEffect(load, [sessionId])

  async function handleApprove(id) {
    setBusyId(id)
    try {
      await apiRequest(`/bookings/${id}/approve`, { method: 'POST' })
      load()
    } catch (err) {
      setError(err.detail || 'Не получилось подтвердить')
    } finally {
      setBusyId(null)
    }
  }

  async function handleReject(id) {
    setBusyId(id)
    try {
      await apiRequest(`/bookings/${id}/reject`, { method: 'POST' })
      load()
    } catch (err) {
      setError(err.detail || 'Не получилось отклонить')
    } finally {
      setBusyId(null)
    }
  }

  async function handleCancelSession() {
    if (!confirm('Отменить тренировку? Все записанные получат уведомление.')) return
    try {
      await apiRequest(`/sessions/${sessionId}`, { method: 'DELETE' })
      navigate('/', { replace: true })
    } catch (err) {
      setError(err.detail || 'Не получилось отменить тренировку')
    }
  }

  if (!session || !bookings) {
    return <div className="px-5 py-6 text-sm text-neutral-400">Загрузка…</div>
  }

  const pending = bookings.filter((b) => b.status === 'pending')
  const others = bookings.filter((b) => b.status !== 'pending')

  return (
    <div>
      <div className="px-5 py-4 flex items-center gap-3 border-b border-ice-200">
        <button onClick={() => navigate(-1)} className="p-1 -ml-1 text-neutral-500">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="font-semibold">{SESSION_TYPE_LABELS[session.type] || session.type}</h1>
          <p className="text-sm text-neutral-500">{formatDateTime(session.datetime)}</p>
        </div>
      </div>

      <div className="px-5 py-5 space-y-5">
        {error && <p className="text-action text-sm">{error}</p>}

        {pending.length > 0 && (
          <div>
            <h2 className="text-sm font-semibold text-goal mb-2">
              Ждут подтверждения ({pending.length})
            </h2>
            <div className="space-y-2">
              {pending.map((b) => (
                <div key={b.id} className="card flex items-center justify-between">
                  <span className="font-medium text-sm">{b.player_name}</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleApprove(b.id)}
                      disabled={busyId === b.id}
                      className="p-2 bg-green-50 text-green-700 rounded-full"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleReject(b.id)}
                      disabled={busyId === b.id}
                      className="p-2 bg-action-light text-action rounded-full"
                    >
                      <XIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div>
          <h2 className="text-sm font-semibold text-neutral-500 mb-2">
            Все записи ({bookings.length})
          </h2>
          {others.length === 0 && pending.length === 0 && (
            <p className="text-sm text-neutral-400">Пока никто не записался.</p>
          )}
          <div className="space-y-2">
            {others.map((b) => (
              <div key={b.id} className="flex items-center justify-between py-2 border-b border-ice-100 last:border-0">
                <span className="text-sm">{b.player_name}</span>
                <span
                  className={`text-xs px-2 py-1 rounded-full font-medium ${BOOKING_STATUS_COLORS[b.status]}`}
                >
                  {BOOKING_STATUS_LABELS[b.status]}
                </span>
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={handleCancelSession}
          className="flex items-center gap-2 text-sm text-action font-medium pt-4"
        >
          <Trash2 className="w-4 h-4" /> Отменить тренировку
        </button>
      </div>
    </div>
  )
}
