import { useState } from 'react'
import { X } from 'lucide-react'
import { useChildren } from '../hooks/useChildren'
import { POSITION_LABELS } from '../utils/labels'
import { age } from '../utils/date'

export default function BookSessionModal({ session, onClose, onBook }) {
  const { children, loading } = useChildren()
  const [childId, setChildId] = useState(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)
  const [result, setResult] = useState(null)

  async function handleBook() {
    setBusy(true)
    setError(null)
    try {
      const booking = await onBook(childId)
      setResult(booking)
    } catch (err) {
      setError(err.detail || 'Не получилось записаться')
    } finally {
      setBusy(false)
    }
  }

  const RESULT_MESSAGES = {
    confirmed: { text: 'Записаны! Место подтверждено.', color: 'text-green-700' },
    pending: {
      text: 'Заявка отправлена тренеру — он не знает вас, нужно подтверждение.',
      color: 'text-goal',
    },
    waiting: { text: 'Мест нет — вы в листе ожидания. Сообщим, если место освободится.', color: 'text-neutral-500' },
  }

  return (
    <div className="fixed inset-0 bg-rink-900/40 z-30 flex items-end sm:items-center justify-center">
      <div className="bg-white rounded-t-2xl sm:rounded-card w-full sm:max-w-sm p-5 pb-8 sm:pb-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-lg">
            {result ? 'Готово' : 'Кого записываем?'}
          </h2>
          <button onClick={onClose} className="p-1 text-neutral-400">
            <X className="w-5 h-5" />
          </button>
        </div>

        {result ? (
          <div className="text-center py-4">
            <p className={`font-medium ${RESULT_MESSAGES[result.status]?.color}`}>
              {RESULT_MESSAGES[result.status]?.text}
            </p>
            <button onClick={onClose} className="btn-primary w-full mt-5">
              Понятно
            </button>
          </div>
        ) : (
          <>
            {loading && <p className="text-sm text-neutral-400">Загрузка…</p>}
            {!loading && children.length === 0 && (
              <p className="text-sm text-neutral-500">
                Сначала добавьте ребёнка в профиле — без этого не получится записаться.
              </p>
            )}

            <div className="space-y-2 mb-4">
              {children.map((child) => (
                <label
                  key={child.id}
                  className={`flex items-center gap-3 p-3 rounded-card border cursor-pointer ${
                    childId === child.id ? 'border-rink-900 bg-rink-900/[0.03]' : 'border-ice-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="child"
                    checked={childId === child.id}
                    onChange={() => setChildId(child.id)}
                  />
                  <span>
                    <span className="block font-medium text-sm">{child.name}</span>
                    <span className="block text-xs text-neutral-500">
                      {age(child.birth_date)} лет · {POSITION_LABELS[child.position]}
                    </span>
                  </span>
                </label>
              ))}
            </div>

            {error && <p className="text-action text-sm mb-3">{error}</p>}
            <button
              onClick={handleBook}
              disabled={!childId || busy}
              className="btn-primary w-full"
            >
              {busy ? 'Записываем…' : 'Записаться'}
            </button>
          </>
        )}
      </div>
    </div>
  )
}
