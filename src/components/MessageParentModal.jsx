import { useState } from 'react'
import { X } from 'lucide-react'
import { apiRequest } from '../api/client'

export default function MessageParentModal({ coachPlayerId, parentName, onClose }) {
  const [text, setText] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)
  const [sent, setSent] = useState(false)

  async function handleSend(e) {
    e.preventDefault()
    setBusy(true)
    setError(null)
    try {
      await apiRequest(`/coaches/me/players/${coachPlayerId}/message`, {
        method: 'POST',
        body: { text },
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
          <h2 className="font-semibold text-lg">Сообщение {parentName}</h2>
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
            <textarea
              required
              autoFocus
              maxLength={2000}
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="input-field min-h-[100px] resize-none"
              placeholder="Например: перенесли тренировку на 18:00"
            />
            {error && <p className="text-action text-sm">{error}</p>}
            <button type="submit" disabled={busy || !text} className="btn-primary w-full">
              {busy ? 'Отправляем…' : 'Отправить'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
