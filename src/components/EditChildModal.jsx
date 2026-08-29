import { useState } from 'react'
import { X } from 'lucide-react'
import { apiRequest } from '../api/client'
import { POSITION_LABELS } from '../utils/labels'

export default function EditChildModal({ child, onClose, onSaved }) {
  const [name, setName] = useState(child.name)
  const [birthDate, setBirthDate] = useState(child.birth_date)
  const [position, setPosition] = useState(child.position)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)

  async function handleSubmit(e) {
    e.preventDefault()
    setBusy(true)
    setError(null)
    try {
      const updated = await apiRequest(`/children/${child.id}`, {
        method: 'PATCH',
        body: { name, birth_date: birthDate, position },
      })
      onSaved(updated)
      onClose()
    } catch (err) {
      setError(err.detail || 'Не получилось сохранить изменения')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-rink-900/40 z-30 flex items-end sm:items-center justify-center">
      <div className="bg-white rounded-t-2xl sm:rounded-card w-full sm:max-w-sm p-5 pb-8 sm:pb-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-lg">Изменить данные</h2>
          <button onClick={onClose} className="p-1 text-neutral-400">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block">
            <span className="block text-sm font-medium mb-1.5">Имя</span>
            <input
              type="text"
              required
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input-field"
            />
          </label>

          <label className="block">
            <span className="block text-sm font-medium mb-1.5">Дата рождения</span>
            <input
              type="date"
              required
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              className="input-field"
              max={new Date().toISOString().split('T')[0]}
            />
          </label>

          <label className="block">
            <span className="block text-sm font-medium mb-1.5">Амплуа</span>
            <select
              value={position}
              onChange={(e) => setPosition(e.target.value)}
              className="input-field"
            >
              {Object.entries(POSITION_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>

          {error && <p className="text-action text-sm">{error}</p>}
          <button type="submit" disabled={busy || !name || !birthDate} className="btn-primary w-full">
            {busy ? 'Сохраняем…' : 'Сохранить'}
          </button>
        </form>
      </div>
    </div>
  )
}
