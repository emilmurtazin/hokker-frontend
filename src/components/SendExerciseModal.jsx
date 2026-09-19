import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import { apiRequest } from '../api/client'

export default function SendExerciseModal({ exerciseId, onClose }) {
  const [players, setPlayers] = useState(null)
  const [playerId, setPlayerId] = useState(null)
  const [note, setNote] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)
  const [sent, setSent] = useState(false)

  useEffect(() => {
    apiRequest('/coaches/me/players')
      .then(setPlayers)
      .catch(() => setPlayers([]))
  }, [])

  async function handleSend(e) {
    e.preventDefault()
    setBusy(true)
    setError(null)
    try {
      await apiRequest(`/exercises/${exerciseId}/send`, {
        method: 'POST',
        body: { child_id: playerId, note: note || undefined },
      })
      setSent(true)
    } catch (err) {
      setError(err.detail || 'Не получилось отправить')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-rink-900/40 z-30 flex items-end sm:items-center justify-center">
      <div className="bg-white rounded-t-2xl sm:rounded-card w-full sm:max-w-sm p-5 pb-8 sm:pb-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-lg">Отправить родителю</h2>
          <button onClick={onClose} className="p-1 text-neutral-400">
            <X className="w-5 h-5" />
          </button>
        </div>

        {sent ? (
          <div className="text-center py-4">
            <p className="font-medium text-green-700">Отправлено в Telegram</p>
            <button onClick={onClose} className="btn-primary w-full mt-5">
              Готово
            </button>
          </div>
        ) : (
          <form onSubmit={handleSend} className="space-y-4">
            {players === null && <p className="text-sm text-neutral-400">Загрузка…</p>}
            {players?.length === 0 && (
              <p className="text-sm text-neutral-500">
                В базе учеников пока нет активных детей.
              </p>
            )}

            <div className="space-y-2">
              {players?.map((p) => (
                <label
                  key={p.id}
                  className={`flex items-center gap-3 p-3 rounded-card border cursor-pointer ${
                    playerId === p.player_id ? 'border-rink-900 bg-rink-900/[0.03]' : 'border-ice-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="player"
                    checked={playerId === p.player_id}
                    onChange={() => setPlayerId(p.player_id)}
                  />
                  <span className="font-medium text-sm">{p.player_name}</span>
                </label>
              ))}
            </div>

            <label className="block">
              <span className="block text-sm font-medium mb-1.5">
                Комментарий <span className="text-neutral-400 font-normal">(необязательно)</span>
              </span>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="input-field min-h-[70px] resize-none"
                placeholder="Например: отработай перед следующей тренировкой"
              />
            </label>

            {error && <p className="text-action text-sm">{error}</p>}
            <button type="submit" disabled={!playerId || busy} className="btn-primary w-full">
              {busy ? 'Отправляем…' : 'Отправить'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
