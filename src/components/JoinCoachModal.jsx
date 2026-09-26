import { useState } from 'react'
import { Check } from 'lucide-react'
import { apiRequest } from '../api/client'
import { useChildren } from '../hooks/useChildren'
import { SPECIALIZATION_LABELS } from '../utils/labels'
import ModalShell from './ModalShell'

// Родитель сам добавляет ребёнка в базу тренера по коду, который тренер дал
// лично (POST /coaches/join). Два шага в одном окне: ввели код и нашли
// тренера — выбрали ребёнка и подтвердили.
export default function JoinCoachModal({ onClose, onJoined }) {
  const { children, loading: childrenLoading } = useChildren()
  const [code, setCode] = useState('')
  const [coach, setCoach] = useState(null) // предпросмотр после успешного поиска
  const [childId, setChildId] = useState(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)
  const [done, setDone] = useState(null) // { player_name }

  async function findCoach(e) {
    e.preventDefault()
    setError(null)
    setBusy(true)
    try {
      const found = await apiRequest(`/coaches/lookup-by-code?code=${code}`)
      setCoach(found)
      setChildId(children.length === 1 ? children[0].id : null)
    } catch (err) {
      setError(err.detail || 'Не получилось найти тренера по коду')
    } finally {
      setBusy(false)
    }
  }

  async function confirmJoin() {
    setError(null)
    setBusy(true)
    try {
      const result = await apiRequest('/coaches/join', { method: 'POST', body: { code, child_id: childId } })
      setDone({ playerName: result.player_name })
      onJoined?.()
    } catch (err) {
      setError(err.detail || 'Не получилось добавиться к тренеру')
    } finally {
      setBusy(false)
    }
  }

  function handleCodeChange(value) {
    setCode(value.replace(/\D/g, '').slice(0, 6))
    setCoach(null)
    setError(null)
  }

  if (done) {
    return (
      <ModalShell title="Готово" onClose={onClose} footer={<button onClick={onClose} className="btn-primary w-full">Готово</button>}>
        <div className="flex flex-col items-center text-center gap-3 py-4">
          <div className="w-12 h-12 rounded-full bg-goal-light flex items-center justify-center">
            <Check className="w-6 h-6 text-goal" />
          </div>
          <p className="font-medium">
            {done.playerName} добавлен(а) в базу тренера {coach.name}
          </p>
          <p className="text-sm text-neutral-500">
            Тренировки этого тренера появятся в каталоге и в вашем расписании.
          </p>
        </div>
      </ModalShell>
    )
  }

  if (coach) {
    return (
      <ModalShell
        title="Подтвердите добавление"
        onClose={onClose}
        footer={
          <>
            {error && <p className="text-action text-sm mb-3">{error}</p>}
            <button onClick={confirmJoin} disabled={busy || !childId} className="btn-primary w-full">
              {busy ? 'Добавляем…' : 'Добавить'}
            </button>
          </>
        }
      >
        <div className="card">
          <p className="font-medium">{coach.name}</p>
          {coach.city && <p className="text-sm text-neutral-500">{coach.city}</p>}
          {coach.specializations?.length > 0 && (
            <p className="text-xs text-neutral-400 mt-1">
              {coach.specializations.map((s) => SPECIALIZATION_LABELS[s] || s).join(', ')}
            </p>
          )}
        </div>

        <div>
          <span className="block text-sm font-medium mb-1.5">Ребёнок</span>
          {childrenLoading ? (
            <p className="text-sm text-neutral-400">Загрузка…</p>
          ) : children.length === 0 ? (
            <p className="text-sm text-neutral-500">
              Сначала добавьте ребёнка на этом экране в разделе «Мои дети».
            </p>
          ) : (
            <div className="space-y-1.5">
              {children.map((child) => (
                <label
                  key={child.id}
                  className={`flex items-center gap-3 p-3 rounded-card border ${
                    childId === child.id ? 'border-rink-900 bg-rink-900/[0.03]' : 'border-ice-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="join-coach-child"
                    checked={childId === child.id}
                    onChange={() => setChildId(child.id)}
                    className="w-4 h-4"
                  />
                  <span className="text-sm font-medium">{child.name}</span>
                </label>
              ))}
            </div>
          )}
        </div>
      </ModalShell>
    )
  }

  return (
    <ModalShell
      title="Код тренера"
      onClose={onClose}
      onSubmit={findCoach}
      footer={
        <>
          {error && <p className="text-action text-sm mb-3">{error}</p>}
          <button type="submit" disabled={busy || code.length !== 6} className="btn-primary w-full">
            {busy ? 'Ищем…' : 'Найти тренера'}
          </button>
        </>
      }
    >
      <p className="text-sm text-neutral-500">
        Тренер должен продиктовать или прислать вам этот код лично — обычно на первой встрече
        или в переписке.
      </p>
      <input
        type="text"
        inputMode="numeric"
        autoFocus
        value={code}
        onChange={(e) => handleCodeChange(e.target.value)}
        placeholder="000000"
        aria-label="Код тренера"
        className="input-field text-center text-2xl font-display font-bold tracking-widest"
      />
    </ModalShell>
  )
}
