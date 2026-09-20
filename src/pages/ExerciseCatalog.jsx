import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { apiRequest } from '../api/client'
import { AGE_GROUPS, LOCATION_LABELS } from '../utils/labels'

export default function ExerciseCatalog() {
  const [location, setLocation] = useState('on_ice')
  const [ageGroup, setAgeGroup] = useState('')
  const [exercises, setExercises] = useState(null)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    // URLSearchParams сам экранирует «+» в '13+' (иначе сервер получит «13 »).
    const params = new URLSearchParams({ location })
    if (ageGroup) params.set('age_group', ageGroup)

    // Защита от «гонки»: при быстром переключении фильтров ответ на старый
    // запрос не должен перезаписать результат нового.
    let cancelled = false
    apiRequest(`/exercises?${params}`)
      .then((data) => {
        if (cancelled) return
        setExercises(data.items)
        setError(null)
      })
      .catch((err) => {
        if (!cancelled) setError(err.detail || 'Не получилось загрузить упражнения')
      })
    return () => {
      cancelled = true
    }
  }, [location, ageGroup])

  return (
    <div className="px-5 py-5 space-y-4">
      <h1 className="text-xl font-semibold">Каталог упражнений</h1>

      <div className="flex gap-2">
        {Object.entries(LOCATION_LABELS).map(([value, { label, icon }]) => (
          <button
            key={value}
            onClick={() => setLocation(value)}
            className={`flex-1 flex flex-col items-center gap-1 py-2.5 rounded-card text-sm font-medium transition-colors ${
              location === value ? 'bg-rink-900 text-white' : 'bg-white border border-ice-300'
            }`}
          >
            <span className="text-lg leading-none">{icon}</span>
            {label}
          </button>
        ))}
      </div>

      {/* Возрастная категория — те же значения и вид, что в каталоге тренеров */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 -mx-1 px-1">
        <span className="text-xs text-neutral-400 shrink-0 w-5 text-center">🎂</span>
        {['', ...AGE_GROUPS].map((value) => (
          <button
            key={value || 'any'}
            onClick={() => setAgeGroup(value)}
            className={`shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              ageGroup === value ? 'bg-rink-900 text-white' : 'bg-white border border-ice-300'
            }`}
          >
            {value || 'Любой возраст'}
          </button>
        ))}
      </div>

      {error && <p className="text-action text-sm">{error}</p>}
      {exercises === null && !error && <p className="text-sm text-neutral-400">Загрузка…</p>}
      {exercises?.length === 0 && (
        <p className="text-sm text-neutral-500 text-center py-8">
          {ageGroup
            ? `Для возрастной категории ${ageGroup} здесь пока нет упражнений.`
            : 'Здесь пока нет упражнений.'}
        </p>
      )}

      <div className="space-y-2">
        {exercises?.map((ex) => (
          <button
            key={ex.id}
            onClick={() => navigate(`/exercises/${ex.id}`)}
            className="card w-full text-left flex items-center justify-between"
          >
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                {ex.code && (
                  <span className="text-xs font-mono text-neutral-400 shrink-0">{ex.code}</span>
                )}
                <p className="font-medium truncate">{ex.title}</p>
                {ex.image_url && (
                  <span className="text-[11px] px-1.5 py-0.5 rounded-full bg-action-light text-action shrink-0">
                    Карточка
                  </span>
                )}
              </div>
              {ex.description && (
                <p className="text-sm text-neutral-500 mt-1 line-clamp-2">{ex.description}</p>
              )}
              {ex.content_status === 'draft' && (
                <p className="text-xs text-goal mt-1">Подробная инструкция скоро появится</p>
              )}
            </div>
            <ChevronRight className="w-4 h-4 text-neutral-300 shrink-0 ml-2" />
          </button>
        ))}
      </div>
    </div>
  )
}
