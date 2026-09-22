import { useState } from 'react'
import { X } from 'lucide-react'
import { apiRequest } from '../api/client'

// В каких группах состоит ученик (можно в нескольких).
export default function PlayerGroupsModal({ player, groups, onSaved, onClose }) {
  const [selected, setSelected] = useState(new Set(player.group_ids))
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)

  function toggle(id) {
    const next = new Set(selected)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setSelected(next)
  }

  async function save() {
    setBusy(true)
    setError(null)
    try {
      await apiRequest(`/coaches/me/players/${player.id}/groups`, {
        method: 'PUT',
        body: { group_ids: [...selected] },
      })
      await onSaved()
      onClose()
    } catch (err) {
      setError(err.detail || 'Не получилось сохранить')
      setBusy(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-rink-900/40 z-30 flex items-end sm:items-center justify-center">
      <div className="bg-white rounded-t-2xl sm:rounded-card w-full sm:max-w-sm p-5 pb-8 sm:pb-5 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-1">
          <h2 className="font-semibold text-lg">Группы ученика</h2>
          <button onClick={onClose} aria-label="Закрыть" className="p-1 text-neutral-400">
            <X className="w-5 h-5" />
          </button>
        </div>
        <p className="text-sm text-neutral-500 mb-4">{player.player_name}</p>

        {groups.length === 0 ? (
          <p className="text-sm text-neutral-500 py-3">
            Групп пока нет. Создайте их кнопкой «Группы» на экране учеников.
          </p>
        ) : (
          <div className="space-y-2">
            {groups.map((g) => (
              <label key={g.id} className="flex items-center gap-3 p-3 rounded-card border border-ice-300">
                <input
                  type="checkbox"
                  checked={selected.has(g.id)}
                  onChange={() => toggle(g.id)}
                  className="w-4 h-4"
                />
                <span className="text-sm font-medium">{g.name}</span>
              </label>
            ))}
          </div>
        )}

        {error && <p className="text-action text-sm mt-3">{error}</p>}
        {groups.length > 0 && (
          <button onClick={save} disabled={busy} className="btn-primary w-full mt-4">
            {busy ? 'Сохраняем…' : 'Сохранить'}
          </button>
        )}
      </div>
    </div>
  )
}
