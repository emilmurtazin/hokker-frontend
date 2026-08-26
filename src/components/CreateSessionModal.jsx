import { useState } from 'react'
import { X } from 'lucide-react'
import { apiRequest } from '../api/client'
import { SESSION_TYPE_LABELS } from '../utils/labels'

export default function CreateSessionModal({ onClose, onCreated }) {
  const [type, setType] = useState('ice')
  const [visibility, setVisibility] = useState('open')
  const [datetimeLocal, setDatetimeLocal] = useState('')
  const [arenaName, setArenaName] = useState('')
  const [maxPlayers, setMaxPlayers] = useState(10)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)

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
          arena_name: arenaName || null,
          max_players: Number(maxPlayers),
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
                : 'Видна только вашей текущей базе клиентов'}
            </p>
          </label>

          <label className="block">
            <span className="block text-sm font-medium mb-1.5">Дата и время</span>
            <input
              type="datetime-local"
              required
              value={datetimeLocal}
              onChange={(e) => setDatetimeLocal(e.target.value)}
              className="input-field"
            />
          </label>

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

          {error && <p className="text-action text-sm">{error}</p>}
          <button type="submit" disabled={busy || !datetimeLocal} className="btn-primary w-full">
            {busy ? 'Создаём…' : 'Создать'}
          </button>
        </form>
      </div>
    </div>
  )
}
