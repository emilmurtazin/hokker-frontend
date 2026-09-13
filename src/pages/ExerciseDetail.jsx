import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ChevronLeft, Users, Clock, MapPin, Package, Send } from 'lucide-react'
import { apiRequest } from '../api/client'
import { useAuth } from '../context/AuthContext'
import { LOCATION_LABELS } from '../utils/labels'
import SendExerciseModal from '../components/SendExerciseModal'

function MetaRow({ icon: Icon, label, value }) {
  if (value == null) return null
  return (
    <div className="flex items-center gap-3 py-2 border-b border-ice-100 last:border-0">
      <Icon className="w-4 h-4 text-neutral-400 shrink-0" />
      <span className="text-sm text-neutral-500 w-24 shrink-0">{label}</span>
      <span className="text-sm font-medium">{value}</span>
    </div>
  )
}

function TipsBlock({ title, tips, tone }) {
  if (!tips || tips.length === 0) return null
  const toneClasses = {
    green: 'bg-green-50 text-green-700',
    orange: 'bg-goal-light text-rink-900',
    blue: 'bg-action-light text-rink-900',
  }
  return (
    <div className={`rounded-card p-4 ${toneClasses[tone]}`}>
      <p className="font-semibold mb-2">{title}</p>
      <ul className="space-y-1.5">
        {tips.map((t, i) => (
          <li key={i} className="text-sm flex gap-2">
            <span>✓</span>
            <span>{t}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default function ExerciseDetail() {
  const { exerciseId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [exercise, setExercise] = useState(null)
  const [error, setError] = useState(null)
  const [showSend, setShowSend] = useState(false)

  useEffect(() => {
    apiRequest(`/exercises/${exerciseId}`)
      .then(setExercise)
      .catch((err) => setError(err.detail || 'Не получилось загрузить упражнение'))
  }, [exerciseId])

  if (error) {
    return (
      <div className="px-5 py-6">
        <p className="text-action text-sm">{error}</p>
      </div>
    )
  }

  if (!exercise) {
    return <div className="px-5 py-6 text-sm text-neutral-400">Загрузка…</div>
  }

  const locationInfo = LOCATION_LABELS[exercise.location]

  return (
    <div>
      <div className="px-5 py-4 flex items-center gap-3 border-b border-ice-200">
        <button onClick={() => navigate(-1)} className="p-1 -ml-1 text-neutral-500">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            {exercise.code && (
              <span className="text-xs font-mono text-neutral-400">{exercise.code}</span>
            )}
            <span className="text-xs px-2 py-0.5 rounded-full bg-ice-200 text-neutral-600">
              {locationInfo?.icon} {locationInfo?.label}
            </span>
          </div>
          <h1 className="font-semibold truncate">{exercise.title}</h1>
        </div>
      </div>

      <div className="px-5 py-5 space-y-5">
        {exercise.description && <p className="text-neutral-600">{exercise.description}</p>}

        <div className="card">
          <MetaRow icon={Users} label="Возраст" value={exercise.age_group + ' лет'} />
          {exercise.players_text && (
            <MetaRow icon={Users} label="Игроков" value={exercise.players_text} />
          )}
          {exercise.duration_text && (
            <MetaRow icon={Clock} label="Время" value={exercise.duration_text} />
          )}
          <MetaRow icon={MapPin} label="Место" value={locationInfo?.label} />
          {exercise.equipment_text && (
            <MetaRow icon={Package} label="Инвентарь" value={exercise.equipment_text} />
          )}
          {exercise.needs_puck != null && (
            <MetaRow icon={Package} label="Шайба" value={exercise.needs_puck ? 'Используется' : 'Не используется'} />
          )}
        </div>

        {exercise.content_status === 'draft' && (
          <div className="bg-goal-light text-rink-900 rounded-card p-4 text-sm">
            Полное описание этого упражнения ещё готовится — пока доступны только
            название и развиваемые качества.
          </div>
        )}

        {exercise.steps && exercise.steps.length > 0 && (
          <div>
            <h2 className="font-semibold mb-2">Как выполнять</h2>
            <ol className="space-y-2">
              {exercise.steps.map((step, i) => (
                <li key={i} className="flex gap-3 text-sm">
                  <span className="jersey-stat w-6 h-6 text-xs shrink-0">{i + 1}</span>
                  <span className="pt-0.5">{step}</span>
                </li>
              ))}
            </ol>
          </div>
        )}

        <TipsBlock title="Подсказки тренера" tips={exercise.coach_tips} tone="blue" />

        <div className="grid grid-cols-1 gap-3">
          <TipsBlock title="Упростить" tips={exercise.simplify_tips} tone="green" />
          <TipsBlock title="Усложнить" tips={exercise.complicate_tips} tone="orange" />
        </div>

        {exercise.hockey_connection && (
          <div>
            <h2 className="font-semibold mb-2">Связь с хоккеем</h2>
            <p className="text-sm text-neutral-600">{exercise.hockey_connection}</p>
          </div>
        )}

        {exercise.qualities && exercise.qualities.length > 0 && (
          <div>
            <h2 className="font-semibold mb-2">Развиваемые качества</h2>
            <div className="flex flex-wrap gap-2">
              {exercise.qualities.map((q) => (
                <span
                  key={q}
                  className="text-xs px-3 py-1.5 rounded-full bg-rink-900/[0.06] text-rink-900 font-medium"
                >
                  {q}
                </span>
              ))}
            </div>
          </div>
        )}

        {user?.role === 'coach' && (
          <button
            onClick={() => setShowSend(true)}
            className="flex items-center justify-center gap-2 btn-primary w-full"
          >
            <Send className="w-4 h-4" /> Отправить родителю
          </button>
        )}
      </div>

      {showSend && (
        <SendExerciseModal exerciseId={exercise.id} onClose={() => setShowSend(false)} />
      )}
    </div>
  )
}
