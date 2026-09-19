import { useEffect, useState } from 'react'
import { Check, X as XIcon } from 'lucide-react'
import { apiRequest } from '../../api/client'
import { ICE_TYPE_LABELS, SPECIALIZATION_LABELS } from '../../utils/labels'
import { formatSlotDate, formatSlotTime } from '../../utils/date'

export default function ArenaRequests() {
  const [requests, setRequests] = useState(null)
  const [busyId, setBusyId] = useState(null)
  const [error, setError] = useState(null)
  const [coachProfile, setCoachProfile] = useState(null)

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

  async function showCoachProfile(coachId) {
    try {
      setCoachProfile(await apiRequest(`/coaches/${coachId}`))
    } catch (err) {
      setError(err.detail || 'Не получилось загрузить профиль тренера')
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
            <button
              onClick={() => showCoachProfile(r.coach_id)}
              className="font-medium text-left underline underline-offset-2"
            >
              {r.coach_name}
            </button>
            {r.coach_phone && <p className="text-xs text-rink-700 mt-0.5">📞 {r.coach_phone}</p>}
            <p className="text-sm text-neutral-500 capitalize">
              {formatSlotDate(r.slot.date)}, {formatSlotTime(r.slot.time_start)}–
              {formatSlotTime(r.slot.time_end)}
            </p>
            <p className="text-xs text-neutral-400 mt-0.5">{ICE_TYPE_LABELS[r.slot.ice_type]}</p>
            {r.slot.price != null && (
              <p className="text-sm text-rink-700 font-medium mt-1">
                Аренда: {r.slot.price.toLocaleString('ru-RU')} ₽
              </p>
            )}

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

      {coachProfile && (
        <div className="fixed inset-0 bg-rink-900/40 z-30 flex items-end sm:items-center justify-center">
          <div className="bg-white rounded-t-2xl sm:rounded-card w-full sm:max-w-sm p-5 pb-8 sm:pb-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="font-semibold text-lg">{coachProfile.name}</h2>
                <p className="text-sm text-neutral-500 mt-0.5">
                  {coachProfile.specializations
                    ?.map((item) => SPECIALIZATION_LABELS[item] || item)
                    .join(', ')}
                </p>
              </div>
              <button onClick={() => setCoachProfile(null)} className="text-neutral-500 p-1" aria-label="Закрыть">
                <XIcon className="w-5 h-5" />
              </button>
            </div>
            {coachProfile.experience_years != null && (
              <p className="text-sm text-neutral-500 mt-3">Опыт: {coachProfile.experience_years} лет</p>
            )}
            {coachProfile.age_groups?.length > 0 && (
              <p className="text-sm text-neutral-500 mt-1">Возрастные группы: {coachProfile.age_groups.join(', ')}</p>
            )}
            {coachProfile.about && <p className="text-sm text-neutral-600 mt-3">{coachProfile.about}</p>}
          </div>
        </div>
      )}
    </div>
  )
}
