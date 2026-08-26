import { useEffect, useState, useCallback } from 'react'
import { CalendarX, Check } from 'lucide-react'
import { apiRequest } from '../../api/client'
import { useChildren } from '../../hooks/useChildren'
import { SESSION_TYPE_LABELS, BOOKING_STATUS_LABELS, BOOKING_STATUS_COLORS } from '../../utils/labels'
import { formatDateTime } from '../../utils/date'

export default function Schedule() {
  const { children } = useChildren()
  const [items, setItems] = useState(null)
  const [busyId, setBusyId] = useState(null)
  const [error, setError] = useState(null)

  const load = useCallback(async () => {
    if (children.length === 0) {
      setItems([])
      return
    }
    try {
      const bookingLists = await Promise.all(
        children.map((child) =>
          apiRequest(`/children/${child.id}/bookings`).then((bookings) =>
            bookings.map((b) => ({ ...b, childName: child.name }))
          )
        )
      )
      const allBookings = bookingLists.flat()

      const sessionIds = [...new Set(allBookings.map((b) => b.session_id))]
      const sessions = await Promise.all(
        sessionIds.map((id) => apiRequest(`/sessions/${id}`).catch(() => null))
      )
      const sessionById = Object.fromEntries(
        sessions.filter(Boolean).map((s) => [s.id, s])
      )

      const merged = allBookings
        .map((b) => ({ booking: b, session: sessionById[b.session_id] }))
        .filter((item) => item.session)
        .sort((a, b) => new Date(a.session.datetime) - new Date(b.session.datetime))

      setItems(merged)
    } catch (err) {
      setError(err.detail || 'Не получилось загрузить расписание')
    }
  }, [children])

  useEffect(() => {
    load()
  }, [load])

  async function handleCancel(bookingId) {
    setBusyId(bookingId)
    try {
      await apiRequest(`/bookings/${bookingId}/cancel`, { method: 'POST' })
      await load()
    } catch (err) {
      setError(err.detail || 'Не получилось отменить запись')
    } finally {
      setBusyId(null)
    }
  }

  async function handleConfirmInvite(bookingId) {
    setBusyId(bookingId)
    try {
      await apiRequest(`/bookings/${bookingId}/confirm-invite`, { method: 'POST' })
      await load()
    } catch (err) {
      setError(err.detail || 'Не получилось подтвердить место')
    } finally {
      setBusyId(null)
    }
  }

  if (items === null) {
    return <div className="px-5 py-6 text-sm text-neutral-400">Загрузка…</div>
  }

  const activeStatuses = ['pending', 'confirmed', 'waiting', 'invited']
  const active = items.filter((i) => activeStatuses.includes(i.booking.status))
  const past = items.filter((i) => !activeStatuses.includes(i.booking.status))

  return (
    <div className="px-5 py-5 space-y-5">
      {error && <p className="text-action text-sm">{error}</p>}

      {items.length === 0 && (
        <p className="text-sm text-neutral-500 text-center py-8">
          Пока нет ни одной записи — найдите тренера на вкладке «Тренеры».
        </p>
      )}

      {active.length > 0 && (
        <div className="space-y-3">
          {active.map(({ booking, session }) => (
            <div key={booking.id} className="card">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="font-medium">{SESSION_TYPE_LABELS[session.type] || session.type}</p>
                  <p className="text-sm text-neutral-500">{formatDateTime(session.datetime)}</p>
                  <p className="text-xs text-neutral-400 mt-0.5">{booking.childName}</p>
                </div>
                <span
                  className={`text-xs px-2 py-1 rounded-full font-medium shrink-0 ${
                    BOOKING_STATUS_COLORS[booking.status]
                  }`}
                >
                  {BOOKING_STATUS_LABELS[booking.status]}
                </span>
              </div>

              <div className="flex gap-2 mt-3">
                {booking.status === 'invited' && (
                  <button
                    onClick={() => handleConfirmInvite(booking.id)}
                    disabled={busyId === booking.id}
                    className="flex items-center gap-1.5 btn-primary py-2 px-3 text-sm flex-1 justify-center"
                  >
                    <Check className="w-4 h-4" /> Подтвердить место
                  </button>
                )}
                <button
                  onClick={() => handleCancel(booking.id)}
                  disabled={busyId === booking.id}
                  className="flex items-center gap-1.5 btn-secondary py-2 px-3 text-sm flex-1 justify-center"
                >
                  <CalendarX className="w-4 h-4" /> Отменить
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {past.length > 0 && (
        <div>
          <h2 className="text-sm font-medium text-neutral-500 mb-2">История</h2>
          <div className="space-y-2">
            {past.map(({ booking, session }) => (
              <div key={booking.id} className="flex items-center justify-between py-2 text-sm">
                <div>
                  <span className="text-neutral-600">
                    {SESSION_TYPE_LABELS[session.type] || session.type}, {formatDateTime(session.datetime)}
                  </span>
                  <span className="text-neutral-400"> · {booking.childName}</span>
                </div>
                <span className="text-xs text-neutral-400">{BOOKING_STATUS_LABELS[booking.status]}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
