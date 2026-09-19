import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import { apiRequest } from '../api/client'
import { SESSION_TYPE_LABELS } from '../utils/labels'

function localDatetimeNow() {
  const now = new Date()
  const offset = now.getTimezoneOffset()
  const local = new Date(now.getTime() - offset * 60000)
  return local.toISOString().slice(0, 16)
}

const STANDARD_DURATIONS = [30, 45, 60, 90, 120]

export default function CreateSessionModal({ onClose, onCreated }) {
  const [type, setType] = useState('ice')
  const [visibility, setVisibility] = useState('open')
  const [datetimeLocal, setDatetimeLocal] = useState('')
  const [durationMinutes, setDurationMinutes] = useState(60)
  const [arenaName, setArenaName] = useState('')
  const [maxPlayers, setMaxPlayers] = useState(10)
  const [price, setPrice] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)
  const [bookedSlots, setBookedSlots] = useState([])

  useEffect(() => {
    // Заявки на лёд, которые арена уже подтвердила — тренер может выбрать
    // один из таких слотов, чтобы не вбивать каток/время вручную.
    apiRequest('/coaches/me/ice-requests')
      .then((rows) => {
        const now = new Date()
        const approved = rows.filter((r) => {
          if (r.status !== 'approved') return false
          const slotStart = new Date(`${r.slot.date}T${r.slot.time_start}`)
          return slotStart >= now
        })
        setBookedSlots(approved)
      })
      .catch(() => setBookedSlots([]))
  }, [])

  function handlePickSlot(requestId) {
    if (!requestId) return
    const req = bookedSlots.find((r) => String(r.id) === requestId)
    if (!req) return

    setArenaName(req.slot.arena_name)

    const start = new Date(`${req.slot.date}T${req.slot.time_start}`)
    const offset = start.getTimezoneOffset()
    const local = new Date(start.getTime() - offset * 60000)
    setDatetimeLocal(local.toISOString().slice(0, 16))

    const [sh, sm] = req.slot.time_start.split(':').map(Number)
    const [eh, em] = req.slot.time_end.split(':').map(Number)
    const computedDuration = eh * 60 + em - (sh * 60 + sm)
    if (STANDARD_DURATIONS.includes(computedDuration)) {
      setDurationMinutes(computedDuration)
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setBusy(true)
    setError(null)
    try {
      // datetime-local не содержит часовой пояс — new Date() интерпретирует
      // его как локальное время браузера, toISOString() даёт корректный UTC.
      const isoDatetime = new Date(datetimeLocal).toISOString()

      const session = await apiRequest('/sessions', {
        method: 'POST',
        body: {
          type,
          visibility,
          datetime: isoDatetime,
          duration_minutes: Number(durationMinutes),
          arena_name: arenaName || null,
          max_players: Number(maxPlayers),
          price: price === '' ? null : Number(price),
        },
      })
      onCreated(session)
    } catch (err) {
      setError(err.detail || 'Не получилось создать тренировку')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-rink-900/40 z-30 flex items-end sm:items-center justify-center">
      <div className="bg-white rounded-t-2xl sm:rounded-card w-full sm:max-w-sm p-5 pb-8 sm:pb-5 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-lg">Новая тренировка</h2>
          <button onClick={onClose} className="p-1 text-neutral-400">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block">
            <span className="block text-sm font-medium mb-1.5">Тип</span>
            <select value={type} onChange={(e) => setType(e.target.value)} className="input-field">
              {Object.entries(SESSION_TYPE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="block text-sm font-medium mb-1.5">Видимость</span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setVisibility('open')}
                className={`py-2.5 rounded-card text-sm font-medium border ${
                  visibility === 'open' ? 'border-rink-900 bg-rink-900/[0.03]' : 'border-ice-300'
                }`}
              >
                Открытая
              </button>
              <button
                type="button"
                onClick={() => setVisibility('closed')}
                className={`py-2.5 rounded-card text-sm font-medium border ${
                  visibility === 'closed' ? 'border-rink-900 bg-rink-900/[0.03]' : 'border-ice-300'
                }`}
              >
                Закрытая
              </button>
            </div>
            <p className="text-xs text-neutral-400 mt-1">
              {visibility === 'open'
                ? 'Видна всем родителям в каталоге города'
                : 'Видна только вашим текущим ученикам'}
            </p>
          </label>

          <label className="block">
            <span className="block text-sm font-medium mb-1.5">Дата и время начала</span>
            <input
              type="datetime-local"
              required
              min={localDatetimeNow()}
              value={datetimeLocal}
              onChange={(e) => setDatetimeLocal(e.target.value)}
              className="input-field"
            />
          </label>

          <label className="block">
            <span className="block text-sm font-medium mb-1.5">Продолжительность</span>
            <select
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(e.target.value)}
              className="input-field"
            >
              <option value="30">30 минут</option>
              <option value="45">45 минут</option>
              <option value="60">1 час</option>
              <option value="90">1,5 часа</option>
              <option value="120">2 часа</option>
            </select>
          </label>

          {bookedSlots.length > 0 && (
            <label className="block">
              <span className="block text-sm font-medium mb-1.5">
                Выбрать из забронированного льда
              </span>
              <select
                defaultValue=""
                onChange={(e) => handlePickSlot(e.target.value)}
                className="input-field"
              >
                <option value="">Не выбрано — заполнить вручную</option>
                {bookedSlots.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.slot.arena_name} — {r.slot.date}, {r.slot.time_start.slice(0, 5)}–
                    {r.slot.time_end.slice(0, 5)}
                  </option>
                ))}
              </select>
            </label>
          )}

          <label className="block">
            <span className="block text-sm font-medium mb-1.5">Каток (необязательно)</span>
            <input
              type="text"
              value={arenaName}
              onChange={(e) => setArenaName(e.target.value)}
              className="input-field"
              placeholder="Название арены"
            />
          </label>

          <label className="block">
            <span className="block text-sm font-medium mb-1.5">Максимум игроков</span>
            <input
              type="number"
              min="1"
              max="100"
              required
              value={maxPlayers}
              onChange={(e) => setMaxPlayers(e.target.value)}
              className="input-field"
            />
          </label>

          <label className="block">
            <span className="block text-sm font-medium mb-1.5">Цена с человека, ₽ (необязательно)</span>
            <input
              type="number"
              min="0"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="input-field"
              placeholder="1500"
            />
          </label>

          {error && <p className="text-action text-sm">{error}</p>}
          <button type="submit" disabled={busy || !datetimeLocal} className="btn-primary w-full">
            {busy ? 'Создаём…' : 'Создать'}
          </button>
        </form>
      </div>
    </div>
  )
}
