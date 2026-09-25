import { useState } from 'react'
import { apiRequest } from '../api/client'
import ModalShell from './ModalShell'

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
    <ModalShell
      title="Группы ученика"
      onClose={onClose}
      footer={
        groups.length > 0 && (
          <>
            {error && <p className="text-action text-sm mb-3">{error}</p>}
            <button onClick={save} disabled={busy} className="btn-primary w-full">
              {busy ? 'Сохраняем…' : 'Сохранить'}
            </button>
          </>
        )
      }
    >
      <p className="text-sm text-neutral-500 -mt-1">{player.player_name}</p>

      {groups.length === 0 ? (
        <p className="text-sm text-neutral-500 py-3">
          Групп пока нет. Создайте их кнопкой «Группы» на экране учеников.
        </p>
      ) : (
        <div className="space-y-2">
          {groups.map((g) => (
            <label key={g.id} className="flex items-center gap-3 p-3 rounded-card border border-ice-300">
              <input type="checkbox" checked={selected.has(g.id)} onChange={() => toggle(g.id)} className="w-4 h-4" />
              <span className="text-sm font-medium">{g.name}</span>
            </label>
          ))}
        </div>
      )}

      {groups.length === 0 && error && <p className="text-action text-sm">{error}</p>}
    </ModalShell>
  )
}
