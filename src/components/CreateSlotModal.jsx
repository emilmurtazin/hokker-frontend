import { useState } from 'react'
import { X } from 'lucide-react'
import { apiRequest } from '../api/client'
import { ICE_TYPE_LABELS } from '../utils/labels'

export default function CreateSlotModal({ onClose, onCreated }) {
  const [date, setDate] = useState('')
  const [timeStart, setTimeStart] = useState('')
  const [timeEnd, setTimeEnd] = useState('')
  const [iceType, setIceType] = useState('full')
  const [price, setPrice] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)

  // Минуты всегда 00 — какой бы час ни выбрали (пикером или вручную),
  // отбрасываем минуты, чтобы слоты всегда начинались ровно в час.
  function toWholeHour(value) {
    if (!value) return value
    const [hours] = value.split(':')
    return `${hours}:00`
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setBusy(true)
    setError(null)
    try {
      const slot = await apiRequest('/arenas/me/slots', {
        method: 'POST',
        body: {
          date,
          time_start: `${timeStart}:00`,
          time_end: `${timeEnd}:00`,
          ice_type: iceType,
          price: price === '' ? null : Number(price),
        },
      })
      onCreated(slot)
    } catch (err) {
      setError(err.detail || 'Не получилось опубликовать слот')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-rink-900/40 z-30 flex items-end sm:items-center justify-center">
      <div className="bg-white rounded-t-2xl sm:rounded-card w-full sm:max-w-sm p-5 pb-8 sm:pb-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-lg">Новый слот льда</h2>
          <button onClick={onClose} className="p-1 text-neutral-400">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block">
            <span className="block text-sm font-medium mb-1.5">Дата</span>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="input-field"
            />
          </label>

          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="block text-sm font-medium mb-1.5">Начало</span>
              <input
                type="time"
                step="3600"
                required
                value={timeStart}
                onChange={(e) => setTimeStart(toWholeHour(e.target.value))}
                className="input-field"
              />
            </label>
            <label className="block">
              <span className="block text-sm font-medium mb-1.5">Конец</span>
              <input
                type="time"
                step="3600"
                required
                value={timeEnd}
                onChange={(e) => setTimeEnd(toWholeHour(e.target.value))}
                className="input-field"
              />
            </label>
          </div>

          <label className="block">
            <span className="block text-sm font-medium mb-1.5">Тип льда</span>
            <select value={iceType} onChange={(e) => setIceType(e.target.value)} className="input-field">
              {Object.entries(ICE_TYPE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="block text-sm font-medium mb-1.5">Цена, ₽ (справочно, необязательно)</span>
            <input
              type="number"
              min="0"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="input-field"
              placeholder="5000"
            />
          </label>

          {error && <p className="text-action text-sm">{error}</p>}
          <button
            type="submit"
            disabled={busy || !date || !timeStart || !timeEnd}
            className="btn-primary w-full"
          >
            {busy ? 'Публикуем…' : 'Опубликовать'}
          </button>
        </form>
      </div>
    </div>
  )
}
