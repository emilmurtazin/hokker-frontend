import { useState } from 'react'
import { Phone } from 'lucide-react'
import { apiRequest } from '../../api/client'
import { useAuth } from '../../context/AuthContext'

export default function ArenaProfileForm({ initial, onSaved, onCancel }) {
  const { user, updateProfile } = useAuth()
  const [personalName, setPersonalName] = useState(user?.name || '')
  const [name, setName] = useState(initial?.name || '')
  const [address, setAddress] = useState(initial?.address || '')
  const [city, setCity] = useState(initial?.city || '')
  const [iceSize, setIceSize] = useState(initial?.ice_size || '')
  const [lockerRooms, setLockerRooms] = useState(initial?.locker_rooms ?? '')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)

  async function handleSubmit(e) {
    e.preventDefault()
    setBusy(true)
    setError(null)
    try {
      if (personalName !== user?.name) {
        await updateProfile({ name: personalName })
      }
      const arena = await apiRequest('/arenas/me/profile', {
        method: 'POST',
        body: {
          name,
          address: address || null,
          city: city || null,
          ice_size: iceSize || null,
          locker_rooms: lockerRooms === '' ? null : Number(lockerRooms),
        },
      })
      onSaved(arena)
    } catch (err) {
      setError(err.detail || 'Не получилось сохранить профиль арены')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="px-5 py-6">
      {!initial && (
        <div className="mb-5">
          <h1 className="text-xl font-semibold mb-1">Заполните профиль арены</h1>
          <p className="text-sm text-neutral-500">
            Тренеры найдут ваши слоты в каталоге только после этого шага.
          </p>
        </div>
      )}

      {user?.phone && (
        <div className="flex items-center gap-2 text-sm text-neutral-500 mb-4">
          <Phone className="w-4 h-4" />
          <span>Привязан номер: {user.phone}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="block">
          <span className="block text-sm font-medium mb-1.5">Ваше имя</span>
          <input
            type="text"
            required
            value={personalName}
            onChange={(e) => setPersonalName(e.target.value)}
            className="input-field"
            placeholder="Как к вам обращаться"
          />
        </label>

        <label className="block">
          <span className="block text-sm font-medium mb-1.5">Название арены</span>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="input-field"
            placeholder="Ледовый Дом"
          />
        </label>

        <label className="block">
          <span className="block text-sm font-medium mb-1.5">Город</span>
          <input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="input-field"
            placeholder="Москва"
          />
        </label>

        <label className="block">
          <span className="block text-sm font-medium mb-1.5">Адрес</span>
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="input-field"
            placeholder="ул. Спортивная, 5"
          />
        </label>

        <label className="block">
          <span className="block text-sm font-medium mb-1.5">Размер льда</span>
          <input
            type="text"
            value={iceSize}
            onChange={(e) => setIceSize(e.target.value)}
            className="input-field"
            placeholder="60x30 м"
          />
        </label>

        <label className="block">
          <span className="block text-sm font-medium mb-1.5">Раздевалки</span>
          <input
            type="number"
            min="0"
            value={lockerRooms}
            onChange={(e) => setLockerRooms(e.target.value)}
            className="input-field"
            placeholder="4"
          />
        </label>

        {error && <p className="text-action text-sm">{error}</p>}
        <div className="flex gap-2">
          {onCancel && (
            <button type="button" onClick={onCancel} className="btn-secondary flex-1">
              Отмена
            </button>
          )}
          <button type="submit" disabled={busy || !name || !personalName} className="btn-primary flex-1">
            {busy ? 'Сохраняем…' : 'Сохранить'}
          </button>
        </div>
      </form>
    </div>
  )
}
