import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, ChevronRight, AlertCircle, Settings } from 'lucide-react'
import { apiRequest } from '../../api/client'
import { SESSION_TYPE_LABELS } from '../../utils/labels'
import { formatDateTime, formatDurationMinutes } from '../../utils/date'
import CoachProfileForm from './CoachProfileForm'
import CreateSessionModal from '../../components/CreateSessionModal'

export default function CoachHome() {
  const navigate = useNavigate()
  const [profile, setProfile] = useState(undefined) // undefined = загрузка, null = нет профиля
  const [sessions, setSessions] = useState(null)
  const [pendingBySession, setPendingBySession] = useState({})
  const [showCreate, setShowCreate] = useState(false)
  const [editingProfile, setEditingProfile] = useState(false)
  const [showPast, setShowPast] = useState(false)

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

  function loadPending() {
    // status='' снимает фильтр по умолчанию (pending) не нужен — наоборот,
    // явно просим pending, это и есть дефолт эндпоинта.
    apiRequest('/coaches/me/bookings?status=pending')
      .then((rows) => {
        const counts = {}
        for (const b of rows) counts[b.session_id] = (counts[b.session_id] || 0) + 1
        setPendingBySession(counts)
      })
      .catch(() => setPendingBySession({}))
  }

  useEffect(() => {
    loadProfile()
  }, [])

  useEffect(() => {
    if (profile) {
      loadSessions()
      loadPending()
    }
  }, [profile])

  if (profile === undefined) {
    return <div className="px-5 py-6 text-sm text-neutral-400">Загрузка…</div>
  }

  if (profile === null) {
    return <CoachProfileForm onSaved={setProfile} />
  }

  if (editingProfile) {
    return (
      <CoachProfileForm
        initial={profile}
        onSaved={(p) => {
          setProfile(p)
          setEditingProfile(false)
        }}
        onCancel={() => setEditingProfile(false)}
      />
    )
  }

  const totalPending = Object.values(pendingBySession).reduce((a, b) => a + b, 0)

  return (
    <div className="px-5 py-5 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Мои тренировки</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setEditingProfile(true)}
            className="p-2 text-neutral-500 border border-ice-300 rounded-card"
            title="Редактировать профиль"
          >
            <Settings className="w-4 h-4" />
          </button>
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-1.5 btn-primary py-2 px-3.5 text-sm"
          >
            <Plus className="w-4 h-4" /> Создать
          </button>
        </div>
      </div>

      {totalPending > 0 && (
        <div className="flex items-center gap-2 bg-goal-light text-rink-900 rounded-card px-3.5 py-2.5 text-sm font-medium">
          <AlertCircle className="w-4 h-4 text-goal shrink-0" />
          {totalPending} {totalPending === 1 ? 'заявка ждёт' : 'заявок ждут'} подтверждения — отмечены жёлтым ниже
        </div>
      )}

      {sessions === null && <p className="text-sm text-neutral-400">Загрузка…</p>}
      {sessions?.length === 0 && (
        <p className="text-sm text-neutral-500 text-center py-8">
          Пока нет тренировок — создайте первую.
        </p>
      )}

      <div className="space-y-3">
        {sessions
          ?.filter((s) => showPast || new Date(s.datetime) >= new Date())
          .map((s) => {
          const pendingCount = pendingBySession[s.id] || 0
          return (
            <button
              key={s.id}
              onClick={() => navigate(`/sessions/${s.id}`)}
              className={`card w-full text-left flex items-center justify-between relative ${
                pendingCount > 0 ? 'border-goal border-2' : ''
              }`}
            >
              {pendingCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-goal text-rink-900 text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center shadow-sm">
                  {pendingCount}
                </span>
              )}
              <div>
                <p className="font-medium">{SESSION_TYPE_LABELS[s.type] || s.type}</p>
                <p className="text-sm text-neutral-500">
                  {formatDateTime(s.datetime)} · {formatDurationMinutes(s.duration_minutes)}
                </p>
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
                  {s.visibility === 'closed' && (
                    <span className="text-xs text-neutral-400 truncate">
                      {s.groups?.length ? `для: ${s.groups.map((g) => g.name).join(', ')}` : 'для всех учеников'}
                    </span>
                  )}
                  {s.price != null && (
                    <span className="text-xs text-rink-700 font-medium">
                      {s.price.toLocaleString('ru-RU')} ₽
                    </span>
                  )}
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-neutral-300 shrink-0" />
            </button>
          )
        })}
      </div>

      <button
        onClick={() => setShowPast((v) => !v)}
        className="text-sm text-neutral-500 font-medium underline underline-offset-2"
      >
        {showPast ? 'Скрыть прошедшие' : 'Показать прошедшие'}
      </button>

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
