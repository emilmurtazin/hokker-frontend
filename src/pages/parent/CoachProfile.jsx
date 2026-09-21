import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useGoBack } from '../../utils/navigation'
import { ChevronLeft, Users } from 'lucide-react'
import { apiRequest } from '../../api/client'
import { SPECIALIZATION_LABELS, SESSION_TYPE_LABELS } from '../../utils/labels'
import { formatDateTime, formatDurationMinutes } from '../../utils/date'
import BookSessionModal from '../../components/BookSessionModal'

export default function CoachProfile() {
  const { coachId } = useParams()
  const goBack = useGoBack()
  const [profile, setProfile] = useState(null)
  const [sessions, setSessions] = useState(null)
  const [error, setError] = useState(null)
  const [bookingSession, setBookingSession] = useState(null)

  const [sessionsError, setSessionsError] = useState(null)

  function loadSessions() {
    apiRequest(`/coaches/${coachId}/sessions/for-me`)
      .then((data) => setSessions(data.items))
      .catch((err) => {
        setSessions([])
        setSessionsError(err.detail || 'Не получилось загрузить тренировки')
      })
  }

  useEffect(() => {
    apiRequest(`/coaches/${coachId}`)
      .then(setProfile)
      .catch((err) => setError(err.detail || 'Тренер не найден'))
    loadSessions()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [coachId])

  async function handleBook(childId) {
    const booking = await apiRequest(`/sessions/${bookingSession.id}/bookings`, {
      method: 'POST',
      body: { child_id: childId },
    })
    loadSessions() // обновляем занятость мест
    return booking
  }

  if (error) {
    return (
      <div className="px-5 py-6">
        <p className="text-action text-sm">{error}</p>
      </div>
    )
  }

  if (!profile) {
    return <div className="px-5 py-6 text-neutral-400 text-sm">Загрузка…</div>
  }

  return (
    <div>
      <div className="px-5 py-4 flex items-center gap-3 border-b border-ice-200">
        <button onClick={goBack} className="p-1 -ml-1 text-neutral-500">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="jersey-stat w-11 h-11 text-base">{profile.name?.[0]?.toUpperCase()}</div>
        <div>
          <h1 className="font-semibold">{profile.name}</h1>
          <p className="text-sm text-neutral-500">
            {profile.specializations?.map((s) => SPECIALIZATION_LABELS[s] || s).join(', ')}
            {profile.experience_years != null && ` · ${profile.experience_years} лет опыта`}
          </p>
        </div>
      </div>

      <div className="px-5 py-5 space-y-4">
        {profile.about && <p className="text-sm text-neutral-600">{profile.about}</p>}
        {profile.age_groups && (
          <div className="flex items-center gap-2 text-sm text-neutral-500">
            <Users className="w-4 h-4" />
            Возрастные группы: {profile.age_groups}
          </div>
        )}

        <h2 className="font-semibold pt-2">Ближайшие тренировки</h2>

        {sessions === null && <p className="text-sm text-neutral-400">Загрузка…</p>}
        {sessionsError && <p className="text-action text-sm">{sessionsError}</p>}
        {sessions?.length === 0 && !sessionsError && (
          <p className="text-sm text-neutral-500">Пока нет запланированных тренировок.</p>
        )}

        <div className="space-y-3">
          {sessions?.map((s) => {
            const full = s.booked_count >= s.max_players
            return (
              <div key={s.id} className="card">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium">{SESSION_TYPE_LABELS[s.type] || s.type}</p>
                    <p className="text-sm text-neutral-500">{formatDateTime(s.datetime)} · {formatDurationMinutes(s.duration_minutes)}</p>
                    {s.arena_name && <p className="text-xs text-neutral-400 mt-0.5">{s.arena_name}</p>}
                    {s.price != null && (
                      <p className="text-xs text-rink-700 font-medium mt-0.5">
                        {s.price.toLocaleString('ru-RU')} ₽ с человека
                      </p>
                    )}
                  </div>
                  {s.visibility === 'closed' && (
                    <span className="text-xs bg-ice-200 text-neutral-500 px-2 py-1 rounded-full">
                      Закрытая
                    </span>
                  )}
                </div>
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
      </div>

      {bookingSession && (
        <BookSessionModal
          session={bookingSession}
          onClose={() => setBookingSession(null)}
          onBook={handleBook}
        />
      )}
    </div>
  )
}
