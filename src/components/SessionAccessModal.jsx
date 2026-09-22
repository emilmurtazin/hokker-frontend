import { useState } from 'react'
import { X } from 'lucide-react'
import { apiRequest } from '../api/client'
import GroupChips from './GroupChips'

// Кому доступна закрытая тренировка: всем ученикам или только выбранным группам.
export default function SessionAccessModal({ session, groups, onSaved, onClose }) {
  const [selected, setSelected] = useState((session.groups || []).map((g) => g.id))
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)

  async function save() {
    setBusy(true)
    setError(null)
    try {
      await apiRequest(`/sessions/${session.id}/groups`, { method: 'PUT', body: { group_ids: selected } })
      await onSaved()
      onClose()
    } catch (err) {
      setError(err.detail || 'Не получилось сохранить')
      setBusy(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-rink-900/40 z-30 flex items-end sm:items-center justify-center">
      <div className="bg-white rounded-t-2xl sm:rounded-card w-full sm:max-w-sm p-5 pb-8 sm:pb-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-lg">Кому доступна тренировка</h2>
          <button onClick={onClose} aria-label="Закрыть" className="p-1 text-neutral-400">
            <X className="w-5 h-5" />
          </button>
        </div>
        <GroupChips groups={groups} selectedIds={selected} onChange={setSelected} />
        <p className="text-xs text-neutral-400 mt-2">
          {selected.length === 0
            ? 'Записаться смогут все ваши ученики. Уже записанные останутся в списке.'
            : 'Записаться смогут ученики выбранных групп. Уже записанные останутся в списке.'}
        </p>
        {error && <p className="text-action text-sm mt-3">{error}</p>}
        <button onClick={save} disabled={busy} className="btn-primary w-full mt-4">
          {busy ? 'Сохраняем…' : 'Сохранить'}
        </button>
      </div>
    </div>
  )
}
