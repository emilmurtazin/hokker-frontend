import { useState } from 'react'
import { X, Search } from 'lucide-react'
import { apiRequest } from '../api/client'
import { POSITION_LABELS } from '../utils/labels'
import { age } from '../utils/date'

function digitsOnly(value) {
  return value.replace(/\D/g, '')
}

export default function AddClientModal({ onClose, onAdded }) {
  const [phoneDigits, setPhoneDigits] = useState('')
  const [searching, setSearching] = useState(false)
  const [searchError, setSearchError] = useState(null)
  const [found, setFound] = useState(null) // { parent_name, children: [...] }
  const [addingId, setAddingId] = useState(null)

  async function handleSearch(e) {
    e.preventDefault()
    if (phoneDigits.length !== 10) {
      setSearchError('Введите корректный номер телефона — 10 цифр после +7')
      return
    }
    setSearching(true)
    setSearchError(null)
    setFound(null)
    try {
      const data = await apiRequest(`/coaches/lookup-parent?phone=${encodeURIComponent(`+7${phoneDigits}`)}`)
      setFound(data)
    } catch (err) {
      setSearchError(err.detail || 'Родитель с таким телефоном не найден')
    } finally {
      setSearching(false)
    }
  }

  async function handleAdd(childId) {
    setAddingId(childId)
    try {
      await onAdded(childId)
      onClose()
    } catch (err) {
      setSearchError(err.detail || 'Не получилось добавить')
    } finally {
      setAddingId(null)
    }
  }

  return (
    <div className="fixed inset-0 bg-rink-900/40 z-30 flex items-end sm:items-center justify-center">
      <div className="bg-white rounded-t-2xl sm:rounded-card w-full sm:max-w-sm p-5 pb-8 sm:pb-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-lg">Добавить клиента</h2>
          <button onClick={onClose} className="p-1 text-neutral-400">
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-sm text-neutral-500 mb-3">
          Найдите родителя по номеру телефона — он должен быть уже зарегистрирован в приложении.
        </p>

        <form onSubmit={handleSearch} className="flex gap-2 mb-4">
          <div className="flex items-center input-field flex-1 gap-1">
            <span className="text-neutral-500 select-none">+7</span>
            <input
              type="tel"
              required
              autoFocus
              inputMode="numeric"
              value={phoneDigits}
              onChange={(e) => setPhoneDigits(digitsOnly(e.target.value).slice(0, 10))}
              placeholder="9991234567"
              className="flex-1 bg-transparent outline-none min-w-0"
            />
          </div>
          <button type="submit" disabled={searching || phoneDigits.length !== 10} className="btn-primary px-4">
            <Search className="w-4 h-4" />
          </button>
        </form>

        {searchError && <p className="text-action text-sm mb-3">{searchError}</p>}

        {found && (
          <div className="space-y-2">
            <p className="text-sm font-medium">{found.parent_name}</p>
            {found.children.length === 0 && (
              <p className="text-sm text-neutral-500">У этого родителя пока нет детей в профиле.</p>
            )}
            {found.children.map((child) => (
              <div
                key={child.id}
                className="flex items-center justify-between p-3 rounded-card border border-ice-300"
              >
                <div>
                  <p className="font-medium text-sm">{child.name}</p>
                  <p className="text-xs text-neutral-500">
                    {age(child.birth_date)} лет · {POSITION_LABELS[child.position]}
                  </p>
                </div>
                <button
                  onClick={() => handleAdd(child.id)}
                  disabled={addingId === child.id}
                  className="btn-secondary py-1.5 px-3 text-sm"
                >
                  Добавить
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
