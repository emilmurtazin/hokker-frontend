import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'
import { apiRequest } from '../../api/client'
import { SESSION_TYPE_LABELS } from '../../utils/labels'
import { formatDateTime } from '../../utils/date'

const STATUS_LABELS = {
  present: { label: 'Был', icon: '✅', color: 'text-green-700 bg-green-50' },
  absent: { label: 'Не был', icon: '❌', color: 'text-action bg-action-light' },
  sick: { label: 'Болел', icon: '🤒', color: 'text-goal bg-goal-light' },
  no_reason: { label: 'Без причины', icon: '❓', color: 'text-neutral-500 bg-ice-200' },
}

export default function PlayerAttendanceHistory() {
  const { coachPlayerId } = useParams()
  const navigate = useNavigate()
  const [player, setPlayer] = useState(null)
  const [history, setHistory] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    apiRequest(`/coaches/me/players/${coachPlayerId}`)
      .then(setPlayer)
      .catch((err) => setError(err.detail || 'Не получилось загрузить данные'))
    apiRequest(`/coaches/me/players/${coachPlayerId}/attendance`)
      .then(setHistory)
      .catch((err) => setError(err.detail || 'Не получилось загрузить историю'))
  }, [coachPlayerId])

  if (error) {
    return (
      <div className="px-5 py-6">
        <p className="text-action text-sm">{error}</p>
      </div>
    )
  }

  if (!player || !history) {
    return <div className="px-5 py-6 text-sm text-neutral-400">Загрузка…</div>
  }

  return (
    <div>
      <div className="px-5 py-4 flex items-center gap-3 border-b border-ice-200">
        <button onClick={() => navigate(-1)} className="p-1 -ml-1 text-neutral-500">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h1 className="font-semibold">{player.player_name} — история посещений</h1>
      </div>

      <div className="px-5 py-5">
        {history.length === 0 && (
          <p className="text-sm text-neutral-500 text-center py-8">
            Пока не было ни одной тренировки с этим ребёнком.
          </p>
        )}

        <div className="space-y-2">
          {history.map((entry) => {
            const statusInfo = entry.status ? STATUS_LABELS[entry.status] : null
            return (
              <div
                key={entry.session_id}
                className="flex items-center justify-between py-2.5 border-b border-ice-100 last:border-0"
              >
                <div>
                  <p className="text-sm font-medium">
                    {SESSION_TYPE_LABELS[entry.session_type] || entry.session_type}
                  </p>
                  <p className="text-xs text-neutral-500">{formatDateTime(entry.session_datetime)}</p>
                </div>
                {statusInfo ? (
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusInfo.color}`}>
                    {statusInfo.icon} {statusInfo.label}
                  </span>
                ) : (
                  <span className="text-xs px-2 py-1 rounded-full font-medium text-neutral-400 bg-ice-100">
                    Не отмечено
                  </span>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
