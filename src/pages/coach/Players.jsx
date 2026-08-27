import { useEffect, useState } from 'react'
import { Plus, MessageCircle, Trash2 } from 'lucide-react'
import { apiRequest } from '../../api/client'
import { POSITION_LABELS } from '../../utils/labels'
import AddClientModal from '../../components/AddClientModal'
import MessageParentModal from '../../components/MessageParentModal'

export default function Players() {
  const [players, setPlayers] = useState(null)
  const [error, setError] = useState(null)
  const [showAdd, setShowAdd] = useState(false)
  const [messageTarget, setMessageTarget] = useState(null) // { id, parent_name }

  function load() {
    apiRequest('/coaches/me/players')
      .then(setPlayers)
      .catch((err) => setError(err.detail || 'Не получилось загрузить клиентов'))
  }

  useEffect(load, [])

  async function handleAddChild(childId) {
    await apiRequest('/coaches/me/players', { method: 'POST', body: { child_id: childId } })
    load()
  }

  async function handleRemove(id) {
    if (!confirm('Убрать клиента из базы?')) return
    try {
      await apiRequest(`/coaches/me/players/${id}`, { method: 'DELETE' })
      load()
    } catch (err) {
      setError(err.detail || 'Не получилось удалить')
    }
  }

  if (players === null) {
    return <div className="px-5 py-6 text-sm text-neutral-400">Загрузка…</div>
  }

  return (
    <div className="px-5 py-5 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Клиенты</h1>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-1.5 btn-primary py-2 px-3.5 text-sm"
        >
          <Plus className="w-4 h-4" /> Добавить
        </button>
      </div>

      {error && <p className="text-action text-sm">{error}</p>}

      {players.length === 0 && (
        <p className="text-sm text-neutral-500 text-center py-8">
          Пока нет клиентов. Они появятся сами после первой записи на тренировку,
          либо добавьте вручную по номеру телефона.
        </p>
      )}

      <div className="space-y-3">
        {players.map((p) => (
          <div key={p.id} className="card">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-semibold">{p.player_name}</p>
                <p className="text-sm text-neutral-500">
                  {p.age} лет · {POSITION_LABELS[p.position]}
                </p>
                <p className="text-xs text-neutral-400 mt-0.5">
                  {p.parent_name} · {p.parent_phone}
                </p>
              </div>
              <div className="jersey-stat w-10 h-10 text-sm shrink-0">{p.sessions_count}</div>
            </div>

            <div className="flex items-center gap-3 mt-3 text-xs text-neutral-500">
              <span>✅ {p.attendance.present}</span>
              <span>❌ {p.attendance.absent}</span>
              <span>🤒 {p.attendance.sick}</span>
              <span>❓ {p.attendance.no_reason}</span>
            </div>

            <div className="flex gap-2 mt-3 pt-3 border-t border-ice-100">
              <button
                onClick={() => setMessageTarget({ id: p.id, parent_name: p.parent_name })}
                className="flex items-center gap-1.5 btn-secondary py-2 px-3 text-sm flex-1 justify-center"
              >
                <MessageCircle className="w-4 h-4" /> Написать
              </button>
              <button
                onClick={() => handleRemove(p.id)}
                className="p-2.5 text-neutral-400 border border-ice-300 rounded-card"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {showAdd && <AddClientModal onClose={() => setShowAdd(false)} onAdded={handleAddChild} />}
      {messageTarget && (
        <MessageParentModal
          coachPlayerId={messageTarget.id}
          parentName={messageTarget.parent_name}
          onClose={() => setMessageTarget(null)}
        />
      )}
    </div>
  )
}
