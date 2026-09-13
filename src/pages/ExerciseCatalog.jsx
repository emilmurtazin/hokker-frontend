import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { apiRequest } from '../api/client'
import { LOCATION_LABELS } from '../utils/labels'

export default function ExerciseCatalog() {
  const [location, setLocation] = useState('on_ice')
  const [exercises, setExercises] = useState(null)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    apiRequest(`/exercises?location=${location}`)
      .then((data) => setExercises(data.items))
      .catch((err) => setError(err.detail || 'Не получилось загрузить упражнения'))
  }, [location])

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

      {error && <p className="text-action text-sm">{error}</p>}
      {exercises === null && <p className="text-sm text-neutral-400">Загрузка…</p>}
      {exercises?.length === 0 && (
        <p className="text-sm text-neutral-500 text-center py-8">Здесь пока нет упражнений.</p>
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
              </div>
              {ex.qualities && (
                <p className="text-xs text-neutral-500 mt-1 truncate">{ex.qualities.join(', ')}</p>
              )}
              {ex.content_status === 'draft' && (
                <p className="text-xs text-goal mt-1">Описание скоро появится</p>
              )}
            </div>
            <ChevronRight className="w-4 h-4 text-neutral-300 shrink-0 ml-2" />
          </button>
        ))}
      </div>
    </div>
  )
}
