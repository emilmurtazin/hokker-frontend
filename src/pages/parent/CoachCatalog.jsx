import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MapPin, ChevronRight, SlidersHorizontal } from 'lucide-react'
import { apiRequest } from '../../api/client'
import { useAuth } from '../../context/AuthContext'
import { SPECIALIZATION_LABELS, SESSION_TYPE_LABELS } from '../../utils/labels'
import { formatDateTime } from '../../utils/date'
import BookSessionModal from '../../components/BookSessionModal'

function CoachesList({ city, specialization, ageGroup }) {
  const navigate = useNavigate()
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
    if (ageGroup) params.set('age_group', ageGroup)

    apiRequest(`/coaches?${params.toString()}`)
      .then((data) => setCoaches(data.items))
      .catch((err) => setError(err.detail || 'Не получилось загрузить тренеров'))
      .finally(() => setLoading(false))
  }, [city, specialization, ageGroup])

  if (!city) {
    return (
      <p className="text-sm text-neutral-500 text-center py-8">
        Введите город, чтобы найти тренеров рядом с вами.
      </p>
    )
  }

  return (
    <>
      {error && <p className="text-action text-sm">{error}</p>}
      {loading && <p className="text-sm text-neutral-400 text-center py-6">Ищем тренеров…</p>}
      {coaches && !loading && coaches.length === 0 && (
        <p className="text-sm text-neutral-500 text-center py-8">
          В городе «{city}» пока нет тренеров
          {specialization || ageGroup ? ' с такими фильтрами' : ''}.
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
                  {coach.next_open_sessions[0].price != null &&
                    ` · ${coach.next_open_sessions[0].price.toLocaleString('ru-RU')} ₽`}
                </p>
              ) : (
                <p className="text-xs text-neutral-400 mt-1.5">Нет открытых тренировок</p>
              )}
            </div>
            <ChevronRight className="w-4 h-4 text-neutral-300 shrink-0 mt-1" />
          </button>
        ))}
      </div>
    </>
  )
}

function TrainingsFeed({ city }) {
  const [sessions, setSessions] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [bookingSession, setBookingSession] = useState(null)

  function load() {
    if (!city) {
      setSessions([])
      return
    }
    setLoading(true)
    setError(null)
    apiRequest(`/sessions?${new URLSearchParams({ city }).toString()}`)
      .then((data) => setSessions(data.items))
      .catch((err) => setError(err.detail || 'Не получилось загрузить тренировки'))
      .finally(() => setLoading(false))
  }

  useEffect(load, [city])

  async function handleBook(childId) {
    const booking = await apiRequest(`/sessions/${bookingSession.id}/bookings`, {
      method: 'POST',
      body: { child_id: childId },
    })
    load()
    return booking
  }

  if (!city) {
    return (
      <p className="text-sm text-neutral-500 text-center py-8">
        Введите город, чтобы увидеть ближайшие тренировки.
      </p>
    )
  }

  return (
    <>
      {error && <p className="text-action text-sm">{error}</p>}
      {loading && <p className="text-sm text-neutral-400 text-center py-6">Ищем тренировки…</p>}
      {sessions && !loading && sessions.length === 0 && (
        <p className="text-sm text-neutral-500 text-center py-8">
          В городе «{city}» пока нет открытых тренировок.
        </p>
      )}

      <div className="space-y-3">
        {sessions?.map((s) => {
          const full = s.booked_count >= s.max_players
          return (
            <div key={s.id} className="card">
              <p className="font-medium">{SESSION_TYPE_LABELS[s.type] || s.type}</p>
              <p className="text-sm text-neutral-500">{formatDateTime(s.datetime)}</p>
              <p className="text-xs text-neutral-400 mt-0.5">
                Тренер: {s.coach_name}
                {s.arena_name && ` · ${s.arena_name}`}
              </p>
              {s.price != null && (
                <p className="text-xs text-rink-700 font-medium mt-0.5">
                  {s.price.toLocaleString('ru-RU')} ₽ с человека
                </p>
              )}
              <div className="flex items-center justify-between mt-3">
                <span className="text-xs text-neutral-500">
                  {s.booked_count} / {s.max_players} мест
                </span>
                <button
                  onClick={() => setBookingSession(s)}
                  className={`py-2 px-4 text-sm rounded-card font-medium transition-colors ${
                    full
                      ? 'bg-ice-200 text-neutral-600 active:bg-ice-300'
                      : 'bg-action text-white active:bg-action-hover'
                  }`}
                >
                  {full ? 'В лист ожидания' : 'Записаться'}
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {bookingSession && (
        <BookSessionModal
          session={bookingSession}
          onClose={() => setBookingSession(null)}
          onBook={handleBook}
        />
      )}
    </>
  )
}

const AGE_GROUPS = ['6-9', '10-12', '13+']

export default function CoachCatalog() {
  const { user } = useAuth()
  const [city, setCity] = useState(user?.city || '')
  const [specialization, setSpecialization] = useState('')
  const [ageGroup, setAgeGroup] = useState('')
  const [tab, setTab] = useState('sessions')

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

        <div className="flex gap-2 mb-3">
          <button
            onClick={() => setTab('sessions')}
            className={`px-3.5 py-1.5 rounded-full text-sm font-medium ${
              tab === 'sessions' ? 'bg-rink-900 text-white' : 'bg-white border border-ice-300'
            }`}
          >
            Тренировки
          </button>
          <button
            onClick={() => setTab('coaches')}
            className={`px-3.5 py-1.5 rounded-full text-sm font-medium ${
              tab === 'coaches' ? 'bg-rink-900 text-white' : 'bg-white border border-ice-300'
            }`}
          >
            Тренеры
          </button>
        </div>

        {tab === 'coaches' && (
          <>
            <div className="flex items-center gap-2 overflow-x-auto pb-1 -mx-1 px-1 mb-2">
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

            <div className="flex items-center gap-2 overflow-x-auto pb-1 -mx-1 px-1">
              <span className="text-xs text-neutral-400 shrink-0 w-5 text-center">🎂</span>
              <button
                onClick={() => setAgeGroup('')}
                className={`shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  ageGroup === '' ? 'bg-rink-900 text-white' : 'bg-white border border-ice-300'
                }`}
              >
                Любой возраст
              </button>
              {AGE_GROUPS.map((value) => (
                <button
                  key={value}
                  onClick={() => setAgeGroup(value)}
                  className={`shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    ageGroup === value ? 'bg-rink-900 text-white' : 'bg-white border border-ice-300'
                  }`}
                >
                  {value}
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {tab === 'coaches' ? (
        <CoachesList city={city} specialization={specialization} ageGroup={ageGroup} />
      ) : (
        <TrainingsFeed city={city} />
      )}
    </div>
  )
}
