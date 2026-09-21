import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useGoBack } from '../../utils/navigation'
import { ChevronLeft } from 'lucide-react'
import { apiRequest } from '../../api/client'
import { SKILL_LABELS, POSITION_LABELS } from '../../utils/labels'
import { formatDate } from '../../utils/date'

export default function ChildProgress() {
  const { childId } = useParams()
  const goBack = useGoBack()
  const [passport, setPassport] = useState(null)
  const [history, setHistory] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    apiRequest(`/children/${childId}/passport`)
      .then(setPassport)
      .catch((err) => setError(err.detail || 'Не получилось загрузить данные'))
    apiRequest(`/children/${childId}/ratings`)
      .then(setHistory)
      .catch(() => setHistory([]))
  }, [childId])

  if (error) {
    return (
      <div className="px-5 py-6">
        <p className="text-action text-sm">{error}</p>
      </div>
    )
  }

  if (!passport) {
    return <div className="px-5 py-6 text-sm text-neutral-400">Загрузка…</div>
  }

  const radarBySkill = Object.fromEntries(passport.radar.map((r) => [r.skill, r]))
  const attendancePct =
    passport.attendance_total > 0
      ? Math.round((passport.attendance_present / passport.attendance_total) * 100)
      : null

  return (
    <div>
      <div className="px-5 py-4 flex items-center gap-3 border-b border-ice-200">
        <button onClick={goBack} className="p-1 -ml-1 text-neutral-500">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="font-semibold">{passport.name}</h1>
          <p className="text-sm text-neutral-500">
            {passport.age} лет · {POSITION_LABELS[passport.position]}
          </p>
        </div>
      </div>

      <div className="px-5 py-5 space-y-5">
        <div className="card">
          <h2 className="font-semibold mb-3">Паспорт хоккеиста</h2>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div>
              <div className="jersey-stat w-full h-12 text-lg">
                {passport.overall_average ?? '—'}
              </div>
              <p className="text-xs text-neutral-500 mt-1">Средний балл</p>
            </div>
            <div>
              <div className="jersey-stat w-full h-12 text-lg">{passport.total_sessions}</div>
              <p className="text-xs text-neutral-500 mt-1">Тренировок</p>
            </div>
            <div>
              <div className="jersey-stat w-full h-12 text-lg">
                {attendancePct != null ? `${attendancePct}%` : '—'}
              </div>
              <p className="text-xs text-neutral-500 mt-1">Посещаемость</p>
            </div>
          </div>
        </div>

        <div className="card">
          <h2 className="font-semibold mb-3">Навыки</h2>
          {passport.radar.length === 0 && (
            <p className="text-sm text-neutral-500">Пока нет ни одной оценки.</p>
          )}
          <div className="space-y-3">
            {Object.entries(SKILL_LABELS).map(([skill, label]) => {
              const data = radarBySkill[skill]
              const value = data?.average || 0
              return (
                <div key={skill}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span>{label}</span>
                    <span className="font-medium text-neutral-500">
                      {data ? data.average.toFixed(1) : '—'}
                    </span>
                  </div>
                  <div className="h-2 bg-ice-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-action rounded-full transition-all"
                      style={{ width: `${(value / 5) * 100}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {history?.length > 0 && (
          <div>
            <h2 className="text-sm font-semibold text-neutral-500 mb-2">История оценок</h2>
            <div className="space-y-2">
              {history.map((r, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-ice-100 last:border-0">
                  <div>
                    <span className="text-sm">{SKILL_LABELS[r.skill]}</span>
                    {r.comment && <p className="text-xs text-neutral-400">{r.comment}</p>}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs text-neutral-400">{formatDate(r.updated_at)}</span>
                    <span className="jersey-stat w-7 h-7 text-sm">{r.score}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
