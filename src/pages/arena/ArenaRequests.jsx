import { useEffect, useState } from 'react'
import { Check, X as XIcon } from 'lucide-react'
import { apiRequest } from '../../api/client'
import { ICE_TYPE_LABELS } from '../../utils/labels'
import { formatSlotDate, formatSlotTime } from '../../utils/date'

export default function ArenaRequests() {
  const [requests, setRequests] = useState(null)
  const [busyId, setBusyId] = useState(null)
  const [error, setError] = useState(null)

  function load() {
    apiRequest('/arenas/me/requests?status=pending')
      .then(setRequests)
      .catch((err) => setError(err.detail || 'Не получилось загрузить заявки'))
  }

  useEffect(load, [])

  async function respond(id, action) {
    setBusyId(id)
    try {
      await apiRequest(`/arena-requests/${id}/${action}`, { method: 'POST' })
      load()
    } catch (err) {
      setError(err.detail || 'Не получилось обработать заявку')
    } finally {
      setBusyId(null)
    }
  }

  if (requests === null) {
    return <div className="px-5 py-6 text-sm text-neutral-400">Загрузка…</div>
  }

  return (
    <div className="px-5 py-5 space-y-4">
      <h1 className="text-xl font-semibold">Заявки на лёд</h1>
      {error && <p className="text-action text-sm">{error}</p>}

      {requests.length === 0 && (
        <p className="text-sm text-neutral-500 text-center py-8">Нет заявок, ожидающих решения.</p>
      )}

      <div className="space-y-3">
        {requests.map((r) => (
          <div key={r.id} className="card">
            <p className="font-medium">{r.coach_name}</p>
            <p className="text-sm text-neutral-500 capitalize">
              {formatSlotDate(r.slot.date)}, {formatSlotTime(r.slot.time_start)}–
              {formatSlotTime(r.slot.time_end)}
            </p>
            <p className="text-xs text-neutral-400 mt-0.5">{ICE_TYPE_LABELS[r.slot.ice_type]}</p>

            <div className="flex gap-2 mt-3">
              <button
                onClick={() => respond(r.id, 'approve')}
                disabled={busyId === r.id}
                className="flex items-center gap-1.5 py-2 px-3 text-sm flex-1 justify-center bg-green-50 text-green-700 rounded-card font-medium"
              >
                <Check className="w-4 h-4" /> Подтвердить
              </button>
              <button
                onClick={() => respond(r.id, 'reject')}
                disabled={busyId === r.id}
                className="flex items-center gap-1.5 py-2 px-3 text-sm flex-1 justify-center bg-action-light text-action rounded-card font-medium"
              >
                <XIcon className="w-4 h-4" /> Отклонить
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
