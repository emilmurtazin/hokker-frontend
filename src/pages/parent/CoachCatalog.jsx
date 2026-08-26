import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MapPin, ChevronRight, SlidersHorizontal } from 'lucide-react'
import { apiRequest } from '../../api/client'
import { useAuth } from '../../context/AuthContext'
import { SPECIALIZATION_LABELS, SESSION_TYPE_LABELS } from '../../utils/labels'
import { formatDateTime } from '../../utils/date'

export default function CoachCatalog() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [city, setCity] = useState(user?.city || '')
  const [specialization, setSpecialization] = useState('')
  const [coaches, setCoaches] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!city) {
      setCoaches([])
      return
    }
    setLoading(true)
    setError(null)
    const params = new URLSearchParams({ city })
    if (specialization) params.set('specialization', specialization)

    apiRequest(`/coaches?${params.toString()}`)
      .then((data) => setCoaches(data.items))
      .catch((err) => setError(err.detail || 'Не получилось загрузить тренеров'))
      .finally(() => setLoading(false))
  }, [city, specialization])

  return (
    <div className="px-5 py-5 space-y-4">
      <div>
        <label className="block relative mb-2">
          <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="Ваш город"
            className="input-field pl-11"
          />
        </label>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 -mx-1 px-1">
          <SlidersHorizontal className="w-4 h-4 text-neutral-400 shrink-0" />
          <button
            onClick={() => setSpecialization('')}
            className={`shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              specialization === '' ? 'bg-rink-900 text-white' : 'bg-white border border-ice-300'
            }`}
          >
            Все
          </button>
          {Object.entries(SPECIALIZATION_LABELS).map(([value, label]) => (
            <button
              key={value}
              onClick={() => setSpecialization(value)}
              className={`shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                specialization === value ? 'bg-rink-900 text-white' : 'bg-white border border-ice-300'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {!city && (
        <p className="text-sm text-neutral-500 text-center py-8">
          Введите город, чтобы найти тренеров рядом с вами.
        </p>
      )}

      {error && <p className="text-action text-sm">{error}</p>}
      {loading && <p className="text-sm text-neutral-400 text-center py-6">Ищем тренеров…</p>}

      {coaches && !loading && city && coaches.length === 0 && (
        <p className="text-sm text-neutral-500 text-center py-8">
          В городе «{city}» пока нет тренеров{specialization ? ' с этой специализацией' : ''}.
        </p>
      )}

      <div className="space-y-3">
        {coaches?.map((coach) => (
          <button
            key={coach.id}
            onClick={() => navigate(`/coaches/${coach.id}`)}
            className="card w-full text-left flex items-start gap-3"
          >
            <div className="jersey-stat w-11 h-11 text-base shrink-0">
              {coach.name?.[0]?.toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-semibold truncate">{coach.name}</p>
              <p className="text-sm text-neutral-500">
                {SPECIALIZATION_LABELS[coach.specialization] || coach.specialization}
                {coach.experience_years != null && ` · ${coach.experience_years} лет опыта`}
              </p>
              {coach.next_open_sessions?.length > 0 ? (
                <p className="text-xs text-rink-700 mt-1.5">
                  Ближайшая: {SESSION_TYPE_LABELS[coach.next_open_sessions[0].type]},{' '}
                  {formatDateTime(coach.next_open_sessions[0].datetime)}
                </p>
              ) : (
                <p className="text-xs text-neutral-400 mt-1.5">Нет открытых тренировок</p>
              )}
            </div>
            <ChevronRight className="w-4 h-4 text-neutral-300 shrink-0 mt-1" />
          </button>
        ))}
      </div>
    </div>
  )
}
