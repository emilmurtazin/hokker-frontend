import { useState } from 'react'
import { apiRequest } from '../api/client'
import GroupChips from './GroupChips'
import ModalShell from './ModalShell'

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
    <ModalShell
      title="Кому доступна тренировка"
      onClose={onClose}
      footer={
        <>
          {error && <p className="text-action text-sm mb-3">{error}</p>}
          <button onClick={save} disabled={busy} className="btn-primary w-full">
            {busy ? 'Сохраняем…' : 'Сохранить'}
          </button>
        </>
      }
    >
      <GroupChips groups={groups} selectedIds={selected} onChange={setSelected} />
      <p className="text-xs text-neutral-400">
        {selected.length === 0
          ? 'Записаться смогут все ваши ученики. Уже записанные останутся в списке.'
          : 'Записаться смогут ученики выбранных групп. Уже записанные останутся в списке.'}
      </p>
    </ModalShell>
  )
}
