import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, ChevronRight } from 'lucide-react'
import { apiRequest } from '../../api/client'
import { SESSION_TYPE_LABELS } from '../../utils/labels'
import { formatDateTime } from '../../utils/date'
import CoachProfileForm from './CoachProfileForm'
import CreateSessionModal from '../../components/CreateSessionModal'

export default function CoachHome() {
  const navigate = useNavigate()
  const [profile, setProfile] = useState(undefined) // undefined = загрузка, null = нет профиля
  const [sessions, setSessions] = useState(null)
  const [showCreate, setShowCreate] = useState(false)

  function loadProfile() {
    apiRequest('/coaches/me/profile')
      .then(setProfile)
      .catch(() => setProfile(null))
  }

  function loadSessions() {
    apiRequest('/coaches/me/sessions')
      .then((data) => setSessions(data.items))
      .catch(() => setSessions([]))
  }

  useEffect(() => {
    loadProfile()
  }, [])

  useEffect(() => {
    if (profile) loadSessions()
  }, [profile])

  if (profile === undefined) {
    return <div className="px-5 py-6 text-sm text-neutral-400">Загрузка…</div>
  }

  if (profile === null) {
    return <CoachProfileForm onSaved={setProfile} />
  }

  return (
    <div className="px-5 py-5 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Мои тренировки</h1>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-1.5 btn-primary py-2 px-3.5 text-sm"
        >
          <Plus className="w-4 h-4" /> Создать
        </button>
      </div>

      {sessions === null && <p className="text-sm text-neutral-400">Загрузка…</p>}
      {sessions?.length === 0 && (
        <p className="text-sm text-neutral-500 text-center py-8">
          Пока нет тренировок — создайте первую.
        </p>
      )}

      <div className="space-y-3">
        {sessions?.map((s) => (
          <button
            key={s.id}
            onClick={() => navigate(`/sessions/${s.id}`)}
            className="card w-full text-left flex items-center justify-between"
          >
            <div>
              <p className="font-medium">{SESSION_TYPE_LABELS[s.type] || s.type}</p>
              <p className="text-sm text-neutral-500">{formatDateTime(s.datetime)}</p>
              <div className="flex items-center gap-2 mt-1.5">
                <span
                  className={`text-xs px-2 py-0.5 rounded-full ${
                    s.visibility === 'open'
                      ? 'bg-green-50 text-green-700'
                      : 'bg-ice-200 text-neutral-500'
                  }`}
                >
                  {s.visibility === 'open' ? 'Открытая' : 'Закрытая'}
                </span>
                <span className="text-xs text-neutral-400">
                  {s.booked_count} / {s.max_players}
                </span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-neutral-300 shrink-0" />
          </button>
        ))}
      </div>

      {showCreate && (
        <CreateSessionModal
          onClose={() => setShowCreate(false)}
          onCreated={() => {
            setShowCreate(false)
            loadSessions()
          }}
        />
      )}
    </div>
  )
}
